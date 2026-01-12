'use client';

import { useState, useEffect, useRef } from 'react';

type Face = {
    id: string;
    filePath: string;
    previewPath?: string;
    blurScore: number;
    faceCountInImage: number;
    score: number;
    photoId: string;
    embedding?: string;
};

type Props = {
    matchId: string;
    clusterId: string;
    onClose: () => void;
    onRefresh: () => void;
};

function euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

export default function ClusterOverlay({ matchId, clusterId, onClose, onRefresh }: Props) {
    const [faces, setFaces] = useState<Face[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedForCover, setSelectedForCover] = useState<string[]>([]);
    const [removing, setRemoving] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Hold-to-preview state
    const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
    const holdTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetch(`/api/matches/${matchId}/clusters/${clusterId}/faces`)
            .then(res => res.json())
            .then(data => {
                // Deduplicate: keep only the best face (highest blurScore) per unique photoId
                const rawFaces = data as Face[];
                const bestByPhoto = new Map<string, Face>();
                for (const face of rawFaces) {
                    const existing = bestByPhoto.get(face.photoId);
                    if (!existing || face.blurScore > existing.blurScore) {
                        bestByPhoto.set(face.photoId, face);
                    }
                }
                const uniqueFaces = Array.from(bestByPhoto.values());

                console.log(`Deduplication: ${rawFaces.length} faces → ${uniqueFaces.length} unique photos`);

                setFaces(uniqueFaces);
                setLoading(false);
                suggestBestShots(uniqueFaces);
            });
    }, [matchId, clusterId]);

    const suggestBestShots = (data: Face[]) => {
        const facesWithEmb = data.map(f => ({
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

            if (isDiverse) {
                picked.push(candidate);
            }
        }

        setSelectedForCover(picked.map(p => p.id));
    };

    // Toggle selection for manual editing
    const toggleSelection = (faceId: string) => {
        // Don't toggle if we just finished a hold-preview
        if (wasHolding.current) {
            wasHolding.current = false;
            return;
        }

        if (selectedForCover.includes(faceId)) {
            setSelectedForCover(selectedForCover.filter(id => id !== faceId));
        } else {
            if (selectedForCover.length < 3) {
                setSelectedForCover([...selectedForCover, faceId]);
            } else {
                alert('Maximum 3 photos. Retirez-en une d\'abord.');
            }
        }
    };

    // Hold-to-preview handlers
    const wasHolding = useRef(false);

    const handleMouseDown = (photoId: string) => {
        wasHolding.current = false;
        holdTimeout.current = setTimeout(() => {
            wasHolding.current = true;
            setPreviewPhotoId(photoId);
        }, 400);
    };

    const handleMouseUp = () => {
        // Just clear the timeout, don't close preview
        if (holdTimeout.current) {
            clearTimeout(holdTimeout.current);
            holdTimeout.current = null;
        }
    };

    const closePreview = () => {
        setPreviewPhotoId(null);
    };

    const removeFace = async (faceId: string) => {
        if (!confirm('Retirer cette photo du cluster ?')) return;
        setRemoving(faceId);
        await fetch(`/api/matches/${matchId}/clusters/${clusterId}/faces/${faceId}`, { method: 'DELETE' });
        setFaces(faces.filter(f => f.id !== faceId));
        setSelectedForCover(selectedForCover.filter(id => id !== faceId));
        setRemoving(null);
        onRefresh();
    };

    // Persist selection
    const saveSelection = async () => {
        if (selectedForCover.length === 0) {
            alert('Sélectionnez au moins une photo.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/clusters/${clusterId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coverFaceIds: selectedForCover })
            });

            if (res.ok) {
                alert('Sélection sauvegardée !');
                onRefresh(); // Refresh parent to potentially reflect change (if parent shows top 3)
            } else {
                alert('Erreur lors de la sauvegarde');
            }
        } catch (err) {
            console.error(err);
            alert('Erreur réseau');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={overlayStyle}>Chargement...</div>;

    return (
        <div style={overlayStyle}>
            {/* Full-size preview overlay - click anywhere to close */}
            {previewPhotoId && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.95)', zIndex: 1001,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={closePreview}
                >
                    <img
                        src={`/api/matches/${matchId}/photos/${previewPhotoId}/preview`}
                        style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '8px', pointerEvents: 'none' }}
                    />
                    <div style={{ position: 'absolute', bottom: '30px', color: 'white', fontSize: '1.1rem', background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                        Cliquez n'importe où pour fermer
                    </div>
                </div>
            )}

            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2>Détail Cluster</h2>
                    <button onClick={onClose} className="btn btn-outline">Fermer</button>
                </div>

                <div style={{ marginBottom: '2rem', background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0 }}>🌟 Best Shots Sélectionnés ({selectedForCover.length}/3)</h3>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        Cliquez sur une photo ci-dessous pour l'ajouter/retirer de la sélection.
                        <br /><strong>Maintenez appuyé</strong> sur une photo pour la voir en grand.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', minHeight: '150px', alignItems: 'flex-start' }}>
                        {selectedForCover.length === 0 && (
                            <p style={{ color: '#f87171' }}>Aucune photo sélectionnée. Cliquez ci-dessous pour en ajouter.</p>
                        )}
                        {selectedForCover.map((fid, idx) => {
                            const f = faces.find(x => x.id === fid);
                            if (!f) return null;
                            return (
                                <div
                                    key={fid}
                                    style={{ position: 'relative', width: '200px', flexShrink: 0, cursor: 'pointer' }}
                                    onClick={() => toggleSelection(fid)}
                                    onMouseDown={() => handleMouseDown(f.photoId)}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchStart={() => handleMouseDown(f.photoId)}
                                    onTouchEnd={handleMouseUp}
                                >
                                    <div style={{
                                        position: 'absolute', top: '-8px', left: '-8px',
                                        background: '#3b82f6', color: 'white',
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '0.9rem', zIndex: 10
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <img
                                        src={`/api/matches/${matchId}/photos/${f.photoId}/preview`}
                                        style={{ width: '100%', borderRadius: '8px', border: '3px solid var(--success)' }}
                                        draggable={false}
                                    />
                                    <div style={{
                                        position: 'absolute', bottom: '5px', right: '5px',
                                        background: 'rgba(239,68,68,0.9)', color: 'white',
                                        borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem'
                                    }}>
                                        Cliquez pour retirer
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <button className="btn btn-success" onClick={saveSelection} disabled={saving}>
                            {saving ? 'Sauvegarde...' : '✓ Valider et Sauvegarder'}
                        </button>
                        <button className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={() => suggestBestShots(faces)} disabled={saving}>🔄 Auto-suggestion</button>
                    </div>
                </div>

                <h3>Toutes les photos du cluster ({faces.length})</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                    Cliquez pour ajouter au Top 3 · Maintenez pour agrandir
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                    {faces.map(face => {
                        const isSelected = selectedForCover.includes(face.id);
                        const selectionIndex = selectedForCover.indexOf(face.id);
                        return (
                            <div
                                key={face.id}
                                style={{
                                    position: 'relative',
                                    opacity: removing === face.id ? 0.5 : 1,
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s',
                                }}
                                onClick={() => toggleSelection(face.id)}
                                onMouseDown={() => handleMouseDown(face.photoId)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={() => handleMouseDown(face.photoId)}
                                onTouchEnd={handleMouseUp}
                            >
                                <img
                                    src={`/api/matches/${matchId}/faces/${face.id}/preview`}
                                    style={{
                                        width: '100%',
                                        borderRadius: '6px',
                                        border: isSelected ? '3px solid var(--success)' : '2px solid #334155',
                                        boxShadow: isSelected ? '0 0 10px rgba(16,185,129,0.5)' : 'none'
                                    }}
                                    draggable={false}
                                />
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute', top: '3px', left: '3px',
                                        background: 'var(--success)', color: 'white',
                                        width: '22px', height: '22px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '0.75rem'
                                    }}>
                                        {selectionIndex + 1}
                                    </div>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFace(face.id); }}
                                    style={{
                                        position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white',
                                        border: 'none', borderRadius: '0 6px 0 6px', cursor: 'pointer',
                                        width: '22px', height: '22px', fontSize: '0.9rem', lineHeight: '1'
                                    }}
                                    title="Retirer du cluster"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', zIndex: 999,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '1rem'
};

const modalStyle: React.CSSProperties = {
    background: '#1e293b', width: '100%', maxWidth: '1100px', maxHeight: '95vh',
    overflowY: 'auto', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'
};
