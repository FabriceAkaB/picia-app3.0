import sys
import sqlite3
import json
import os
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import hdbscan
import uuid
import shutil
import warnings

warnings.filterwarnings("ignore")

def compute_blur_score(image):
    # Variance of Laplacian
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def main():
    if len(sys.argv) < 3:
        print("Usage: python cluster_faces.py <db_path> <match_id>")
        sys.exit(1)

    db_path = sys.argv[1]
    match_id = sys.argv[2]
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Initializing InsightFace (CPU)...")
    app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=0, det_size=(640, 640))

    cursor.execute("SELECT id, filePath FROM photos WHERE matchId = ?", (match_id,))
    photos = cursor.fetchall()

    if not photos:
        print("No photos found.")
        conn.close()
        sys.exit(0)

    print(f"Processing {len(photos)} photos...")

    faces_dir = os.path.join(os.path.dirname(db_path), 'matches', match_id, 'faces')
    if os.path.exists(faces_dir):
        shutil.rmtree(faces_dir)
    os.makedirs(faces_dir, exist_ok=True)

    all_faces = [] 
    
    # Pre-pass: Detect faces and store raw info to count faces per image
    # We process image by image
    
    for p_id, p_path in photos:
        if not os.path.exists(p_path):
            continue
        
        img = cv2.imread(p_path)
        if img is None:
            continue

        faces = app.get(img)
        
        # Valid faces in this image
        valid_faces_in_img = []

        for face in faces:
            bbox = face.bbox.astype(int)
            w = bbox[2] - bbox[0]
            # h = bbox[3] - bbox[1] # unused
            
            if face.det_score < 0.75 or w < 50: # Slightly relaxed for detection, strict for usage
                continue
            
            valid_faces_in_img.append(face)

        face_count = len(valid_faces_in_img)

        for face in valid_faces_in_img:
            # Crop Alignment
            from insightface.utils import face_align
            align_crop = face_align.norm_crop(img, landmark=face.kps, image_size=112)
            
            face_id = str(uuid.uuid4())
            crop_filename = f"{face_id}.jpg"
            crop_path = os.path.join(faces_dir, crop_filename)
            cv2.imwrite(crop_path, align_crop)
            
            # Blur score on the crop (face focus)
            blur = compute_blur_score(align_crop)

            # Normalize embedding
            emb = face.embedding
            norm = np.linalg.norm(emb)
            if norm > 0:
                emb = emb / norm

            all_faces.append({
                'face_id': face_id,
                'photo_id': p_id,
                'embedding': emb,
                'bbox': face.bbox.astype(int).tolist(),
                'score': float(face.det_score),
                'crop_path': crop_path,
                'blur_score': float(blur),
                'face_count': face_count
            })

    print(f"Detected {len(all_faces)} valid faces.")

    if not all_faces:
        conn.close()
        sys.exit(0)

    # Clustering
    embeddings = np.array([f['embedding'] for f in all_faces])
    
    # Use Agglomerative Clustering instead of HDBSCAN
    # This is better for merging varied poses/angles of the same person
    # - distance_threshold: Higher = more aggressive merging. For normalized ArcFace embeddings:
    #   - 0.6 = strict (same pose only)
    #   - 0.8 = moderate (some pose variation)
    #   - 1.0 = permissive (significant pose variation)
    #   - 1.2 = very permissive (matches across most angles)
    # - linkage='average': Uses average distance between all pairs, smooths out outliers
    from sklearn.cluster import AgglomerativeClustering
    
    clustering = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=1.0,  # Permissive threshold for pose variation
        metric='euclidean',
        linkage='average'
    )
    labels = clustering.fit_predict(embeddings)
    
    print(f"Agglomerative Clustering produced {len(set(labels))} clusters")

    # Clear old results
    cursor.execute("DELETE FROM faces WHERE matchId = ?", (match_id,))
    cursor.execute("DELETE FROM clusters WHERE matchId = ?", (match_id,))

    # Insert Faces
    for idx, face in enumerate(all_faces):
        label = labels[idx]
        face['cluster_label'] = int(label)
        
        cursor.execute("""
            INSERT INTO faces (id, matchId, photoId, clusterId, filePath, bbox, score, embedding, blurScore, faceCountInImage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            face['face_id'],
            match_id,
            face['photo_id'],
            str(label),
            face['crop_path'],
            json.dumps(face['bbox']),
            face['score'],
            json.dumps(face['embedding'].tolist()),
            face['blur_score'],
            face['face_count']
        ))

    # Create Clusters
    clusters = {}
    for idx, label in enumerate(labels):
        if label not in clusters: clusters[label] = []
        clusters[label].append(idx)

    generated_count = 0
    for label, face_indices in clusters.items():
        if label == -1: continue # Skip noise cluster creation

        cluster_embeddings = embeddings[face_indices]
        centroid = np.mean(cluster_embeddings, axis=0)
        centroid = centroid / np.linalg.norm(centroid)

        # Sort faces: 
        # Primary: Distance to centroid
        # But maybe we want best quality first? The UI will choose best photos. 
        # For general list, centroid distance is good to see consistency.
        
        distances = []
        for f_idx in face_indices:
            dist = np.linalg.norm(all_faces[f_idx]['embedding'] - centroid)
            distances.append((dist, all_faces[f_idx]))

        distances.sort(key=lambda x: x[0])
        sorted_face_ids = [x[1]['face_id'] for x in distances]

        cluster_uuid = str(uuid.uuid4())
        
        # Link faces to real cluster ID
        for f_id in sorted_face_ids:
             cursor.execute("UPDATE faces SET clusterId = ? WHERE id = ?", (cluster_uuid, f_id))

        cursor.execute("""
            INSERT INTO clusters (id, matchId, photoIds, decision)
            VALUES (?, ?, ?, 'pending')
        """, (cluster_uuid, match_id, json.dumps(sorted_face_ids)))
        
        generated_count += 1

    conn.commit()
    conn.close()
    print(f"Clustering complete. Created {generated_count} clusters.")

if __name__ == "__main__":
    main()
