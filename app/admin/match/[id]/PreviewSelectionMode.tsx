'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Face = {
    id: string;
    photoId: string;
    blurScore: number;
    faceCountInImage: number;
    embedding?: string;
};

type Cluster = {
    id: string;
    decision: string;
    coverFaceIds?: string;
};

type Props = {
    matchId: string;
    clusters: Cluster[];
    onComplete: () => void;
    onExit: () => void;
};

export default function PreviewSelectionMode({ matchId, clusters, onComplete, onExit }: Props) {
    const approvedClusters = clusters.filter(c => c.decision === 'approved');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [faces, setFaces] = useState<Face[]>([]);
    const [selectedCovers, setSelectedCovers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullScreenPhoto, setFullScreenPhoto] = useState<string | null>(null);
    const [galleryMode, setGalleryMode] = useState(false);

    const currentCluster = approvedClusters[currentIndex];
    const isLastCluster = currentIndex === approvedClusters.length - 1;

    useEffect(() => {
        if (!currentCluster) return;
        loadClusterFaces(currentCluster.id);
    }, [currentIndex, currentCluster]);

    const loadClusterFaces = async (clusterId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/matches/${matchId}/clusters/${clusterId}/faces`);
            const data = await res.json();

            // Deduplicate by photoId
            const bestByPhoto = new Map<string, Face>();
            for (const face of data) {
                const existing = bestByPhoto.get(face.photoId);
                if (!existing || face.blurScore > existing.blurScore) {
                    bestByPhoto.set(face.photoId, face);
                }
            }
            const uniqueFaces = Array.from(bestByPhoto.values());
            setFaces(uniqueFaces);

            // Load existing selection if any
            const cluster = approvedClusters[currentIndex];
            if (cluster.coverFaceIds) {
                try {
                    const saved = JSON.parse(cluster.coverFaceIds);
                    setSelectedCovers(saved);
                } catch (e) {
                    autoSuggest(uniqueFaces);
                }
            } else {
                autoSuggest(uniqueFaces);
            }
        } finally {
            setLoading(false);
        }
    };

    const autoSuggest = (facesData: Face[]) => {
        const facesWithEmb = facesData.map(f => ({
            ...f,
            embeddingArray: f.embedding ? JSON.parse(f.embedding) as number[] : null
        }));

        const sortedByQuality = [...facesWithEmb].sort((a, b) => {
            const countDiff = a.faceCountInImage - b.faceCountInImage;
            if (countDiff !== 0) return countDiff;
            return b.blurScore - a.blurScore;
        });

        const DIVERSITY_THRESHOLD = 0.5;
        const picked: typeof facesWithEmb = [];

        for (const candidate of sortedByQuality) {
            if (picked.length >= 3) break;
            if (!candidate.embeddingArray) continue;

            let isDiverse = true;
            for (const selected of picked) {
                if (!selected.embeddingArray) continue;
                const dist = euclideanDistance(candidate.embeddingArray, selected.embeddingArray);
                if (dist < DIVERSITY_THRESHOLD) {
                    isDiverse = false;
                    break;
                }
            }

            if (isDiverse) picked.push(candidate);
        }

        setSelectedCovers(picked.map(p => p.id));
    };

    const euclideanDistance = (a: number[], b: number[]): number => {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += (a[i] - b[i]) ** 2;
        }
        return Math.sqrt(sum);
    };

    const toggleSelection = (faceId: string) => {
        if (selectedCovers.includes(faceId)) {
            // Remove from selection
            setSelectedCovers(selectedCovers.filter(id => id !== faceId));
        } else {
            if (selectedCovers.length < 3) {
                // Add normally
                setSelectedCovers([...selectedCovers, faceId]);
            } else {
                // Replace the first (oldest) selected photo with the new one
                setSelectedCovers([...selectedCovers.slice(1), faceId]);
            }
        }
    };

    const rejectCluster = async () => {
        if (!confirm('Rejeter ce joueur ? Il sera masqué de la publication.')) return;

        setSaving(true);
        try {
            await fetch(`/api/clusters/${currentCluster.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision: 'rejected' })
            });

            // Move to next or complete
            if (currentIndex < approvedClusters.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onComplete();
            }
        } catch (err) {
            alert('Erreur lors du rejet');
        } finally {
            setSaving(false);
        }
    };

    const saveAndNext = async () => {
        if (selectedCovers.length === 0) {
            alert('Sélectionnez au moins 1 photo');
            return;
        }

        setSaving(true);
        try {
            await fetch(`/api/clusters/${currentCluster.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coverFaceIds: selectedCovers })
            });

            if (isLastCluster) {
                onComplete();
            } else {
                setCurrentIndex(currentIndex + 1);
            }
        } catch (err) {
            alert('Erreur de sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (approvedClusters.length === 0) {
        return (
            <div style={overlayStyle}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <h2>Aucun joueur validé</h2>
                    <p>Validez au moins un cluster avant de sélectionner les previews.</p>
                    <button onClick={onExit} className="btn btn-primary">Retour</button>
                </div>
            </div>
        );
    }

    return (
        <div style={overlayStyle}>
            {/* Full-Screen Photo Viewer */}
            {fullScreenPhoto && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.98)',
                        zIndex: 1001,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => setFullScreenPhoto(null)}
                >
                    <img
                        src={`/api/matches/${matchId}/photos/${fullScreenPhoto}/preview`}
                        style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '8px' }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: '30px',
                        color: 'white',
                        fontSize: '1.1rem',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px'
                    }}>
                        Cliquez pour fermer
                    </div>
                </div>
            )}

            <div style={containerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                            Joueur {currentIndex + 1} / {approvedClusters.length}
                        </h2>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Sélectionnez 3 photos pour le preview public
                        </p>
                    </div>
                    <button onClick={onExit} className="btn btn-outline">✕ Quitter</button>
                </div>

                {/* Selected Previews (Large) */}
                <div style={previewSectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>
                            Photos Sélectionnées ({selectedCovers.length}/3)
                        </h3>
                        <button
                            onClick={() => setGalleryMode(true)}
                            className="btn"
                            style={{ background: '#8b5cf6', color: 'white' }}
                        >
                            🖼️ Voir Galerie Complète
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', minHeight: '150px', alignItems: 'center' }}>
                        {selectedCovers.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cliquez sur les photos ci-dessous pour sélectionner</p>
                        ) : (
                            selectedCovers.map((faceId, idx) => {
                                const face = faces.find(f => f.id === faceId);
                                if (!face) return null;
                                return (
                                    <div key={faceId} style={{ position: 'relative', width: '150px' }}>
                                        <div style={{
                                            position: 'absolute', top: '-8px', left: '-8px',
                                            background: '#3b82f6', color: 'white',
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', zIndex: 10, fontSize: '0.85rem'
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <img
                                            src={`/api/matches/${matchId}/photos/${face.photoId}/preview`}
                                            style={{ width: '100%', borderRadius: '6px', border: '2px solid #3b82f6', cursor: 'pointer' }}
                                            onClick={() => toggleSelection(faceId)}
                                            onContextMenu={(e) => { e.preventDefault(); setFullScreenPhoto(face.photoId); }}
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFullScreenPhoto(face.photoId); }}
                                            style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                right: '4px',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                padding: '3px 6px',
                                                fontSize: '0.65rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🔍
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* All Photos Grid */}
                <div style={gridSectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Toutes les photos ({faces.length})</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setGalleryMode(!galleryMode)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.85rem' }}
                            >
                                {galleryMode ? '👤 Voir Visages' : '🖼️ Voir Photos Complètes'}
                            </button>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                Clic = Sélectionner | Clic droit = Voir en grand
                            </p>
                        </div>
                    </div>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', padding: '0.5rem' }}>
                            {faces.map(face => {
                                const isSelected = selectedCovers.includes(face.id);
                                const selectionIndex = selectedCovers.indexOf(face.id);
                                return (
                                    <div
                                        key={face.id}
                                        style={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            opacity: isSelected ? 1 : 0.7,
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => toggleSelection(face.id)}
                                        onContextMenu={(e) => { e.preventDefault(); setFullScreenPhoto(face.photoId); }}
                                    >
                                        <img
                                            src={galleryMode
                                                ? `/api/matches/${matchId}/photos/${face.photoId}/preview`
                                                : `/api/matches/${matchId}/faces/${face.id}/preview`
                                            }
                                            style={{
                                                width: '100%',
                                                height: galleryMode ? 'auto' : '120px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                border: isSelected ? '3px solid #3b82f6' : '2px solid #334155'
                                            }}
                                        />
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: '3px', left: '3px',
                                                background: '#3b82f6', color: 'white',
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', fontSize: '0.8rem'
                                            }}>
                                                {selectionIndex + 1}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div style={footerStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                            className="btn btn-outline"
                            style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
                        >
                            ← Précédent
                        </button>

                        <button
                            onClick={rejectCluster}
                            className="btn"
                            style={{ background: '#ef4444', color: 'white' }}
                            disabled={saving}
                        >
                            ❌ Rejeter Joueur
                        </button>
                    </div>

                    <button onClick={() => autoSuggest(faces)} className="btn btn-outline">
                        🔄 Auto-suggestion
                    </button>

                    <button
                        onClick={saveAndNext}
                        disabled={saving || selectedCovers.length === 0}
                        className="btn btn-success"
                        style={{ minWidth: '200px' }}
                    >
                        {saving ? 'Sauvegarde...' : isLastCluster ? '✅ Terminer' : 'Valider & Suivant →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.95)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
};

const containerStyle: React.CSSProperties = {
    background: '#1e293b',
    width: '100%',
    maxWidth: '1400px',
    height: '95vh',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#0f172a',
    flexShrink: 0
};

const previewSectionStyle: React.CSSProperties = {
    padding: '1rem 2rem',
    borderBottom: '1px solid #334155',
    background: '#0f172a',
    flexShrink: 0
};

const gridSectionStyle: React.CSSProperties = {
    padding: '1.5rem 2rem',
    flex: 1,
    overflowY: 'auto',
    minHeight: 0
};

const footerStyle: React.CSSProperties = {
    padding: '1.5rem 2rem',
    borderTop: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#0f172a',
    flexShrink: 0
};
