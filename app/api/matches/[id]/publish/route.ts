import { NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import fs from 'fs';
import { createWatermarkedPreview } from '@/lib/watermark';

const PREVIEWS_DIR = path.join(process.cwd(), 'data/previews');

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;

    // 1. Update status
    const update = db.prepare("UPDATE matches SET status = 'published' WHERE id = ?").run(matchId);

    if (update.changes === 0) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // 2. Get Approved Clusters
    const clusters = db.prepare("SELECT * FROM clusters WHERE matchId = ? AND decision = 'approved'").all(matchId) as { id: string, coverFaceIds: string, photoIds: string }[];

    console.log(`Publishing match ${matchId}: Processing ${clusters.length} clusters...`);

    // Prepare directories
    const matchPreviewDir = path.join(PREVIEWS_DIR, matchId);
    if (!fs.existsSync(matchPreviewDir)) {
        fs.mkdirSync(matchPreviewDir, { recursive: true });
    }

    // 3. Generate Watermarked Previews
    let processedCount = 0;
    let imagesGenerated = 0;

    for (const cluster of clusters) {
        console.log(`Processing cluster ${cluster.id}...`);
        const clusterDir = path.join(matchPreviewDir, cluster.id);
        if (!fs.existsSync(clusterDir)) {
            fs.mkdirSync(clusterDir, { recursive: true });
        }

        let faceIdsToProcess: string[] = [];

        if (cluster.coverFaceIds) {
            try {
                faceIdsToProcess = JSON.parse(cluster.coverFaceIds);
                console.log(`  Using saved covers: ${faceIdsToProcess.join(', ')}`);
            } catch (e) {
                console.error("Error parsing coverFaceIds", e);
            }
        }

        // Fallback: if no covers selected, take top 3 faces from the cluster (by blurScore if possible)
        if (!faceIdsToProcess || faceIdsToProcess.length === 0) {
            // Need to query faces for this cluster
            const faces = db.prepare("SELECT id FROM faces WHERE clusterId = ? ORDER BY blurScore DESC LIMIT 3").all(cluster.id) as { id: string }[];
            faceIdsToProcess = faces.map(f => f.id);
            console.log(`  No covers saved, using fallback: ${faceIdsToProcess.join(', ')}`);

            // Persist this fallback choice so public page shows the same ones
            db.prepare("UPDATE clusters SET coverFaceIds = ? WHERE id = ?").run(JSON.stringify(faceIdsToProcess), cluster.id);
        }

        // Limit to 3 max
        faceIdsToProcess = faceIdsToProcess.slice(0, 3);

        for (const fId of faceIdsToProcess) {
            // Retrieve original photo path
            // Face -> Photo -> FilePath
            const faceData = db.prepare(`
                SELECT photos.filePath 
                FROM faces 
                JOIN photos ON faces.photoId = photos.id 
                WHERE faces.id = ?
             `).get(fId) as { filePath: string } | undefined;

            if (faceData) {
                if (!fs.existsSync(faceData.filePath)) {
                    console.warn(`  File not found: ${faceData.filePath}`);
                    continue;
                }
                const destPath = path.join(clusterDir, `${fId}.jpg`);
                // Only generate if not exists? Or overwrite to ensure freshness?
                // Overwrite ensures user changes (like different watermark) apply.
                try {
                    console.log(`  Generating watermark for ${fId}...`);
                    const buffer = await createWatermarkedPreview(faceData.filePath);
                    fs.writeFileSync(destPath, buffer);
                    imagesGenerated++;
                } catch (err: any) {
                    console.error(`  ❌ Failed to watermark face ${fId}:`, err.message);
                }
            } else {
                console.warn(`  No face data found for id ${fId}`);
            }
        }
        processedCount++;
    }

    console.log(`Publish complete. Generated ${imagesGenerated} images for ${processedCount} clusters.`);
    return NextResponse.json({ success: true, processedCount, imagesGenerated });
}
