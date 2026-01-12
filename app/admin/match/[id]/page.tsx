'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClusterOverlay from './ClusterOverlay';
import PreviewSelectionMode from './PreviewSelectionMode';

export default function MatchDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const matchId = params.id;

    const [match, setMatch] = useState<any>(null);
    const [clusters, setClusters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ processed: number; total: number } | null>(null);

    const [selectedClusters, setSelectedClusters] = useState<Set<string>>(new Set());
    const [viewingCluster, setViewingCluster] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        fetchMatch();
        fetchClusters();
    }, [matchId]);

    const fetchMatch = () => fetch(`/api/matches/${matchId}`).then(res => res.json()).then(setMatch);
    const fetchClusters = () => fetch(`/api/matches/${matchId}/clusters`).then(res => res.json()).then(data => {
        setClusters(data);
        setLoading(false);
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        setUploadProgress(null);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const res = await fetch(`/api/matches/${matchId}/upload`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                // Start polling for progress
                const pollInterval = setInterval(async () => {
                    const progressRes = await fetch(`/api/matches/${matchId}/upload-progress`);
                    if (progressRes.ok) {
                        const job = await progressRes.json();

                        if (job.status === 'not_found') {
                            clearInterval(pollInterval);
                            return;
                        }

                        setUploadProgress({ processed: job.processed, total: job.total });

                        if (job.status === 'completed') {
                            clearInterval(pollInterval);
                            setUploading(false);
                            setUploadProgress(null);
                            alert(`✅ Upload terminé ! ${job.total} photos importées.`);
                        } else if (job.status === 'error') {
                            clearInterval(pollInterval);
                            setUploading(false);
                            setUploadProgress(null);
                            alert('❌ Erreur: ' + job.error);
                        }
                    }
                }, 1000); // Poll every second
            } else {
                const err = await res.json();
                alert('Erreur upload: ' + err.error);
                setUploading(false);
            }
        } catch (err) {
            alert('Erreur upload');
            console.error(err);
            setUploading(false);
        } finally {
            e.target.value = '';
        }
    };

    const publishMatch = async () => {
        const approvedCount = clusters.filter(c => c.decision === 'approved').length;
        if (approvedCount === 0) {
            alert("⚠️ Aucun cluster n'est validé (approved). Cliquez sur le bouton Vert 'Valider' sur au moins un joueur avant de publier.");
            return;
        }

        if (!confirm(`Publier ce match ? Cela générera les aperçus pour les ${approvedCount} joueurs validés.`)) return;
        setPublishing(true);
        try {
            const res = await fetch(`/api/matches/${matchId}/publish`, { method: 'POST' });
            if (res.ok) {
                alert('Match publié avec succès !');
                fetchMatch();
            } else {
                alert('Erreur lors de la publication');
            }
        } finally {
            setPublishing(false);
        }
    };

    const generateClusters = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/matches/${matchId}/generate-clusters`, { method: 'POST' });
            if (res.ok) {
                fetchClusters();
            } else {
                alert('Erreur lors de la génération');
            }
        } finally {
            setGenerating(false);
        }
    };

    const updateDecision = async (clusterId: string, decision: string) => {
        setClusters(clusters.map(c => c.id === clusterId ? { ...c, decision } : c));
        await fetch(`/api/clusters/${clusterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision })
        });
    };

    // New Fusion Logic
    const toggleSelect = (id: string) => {
        const next = new Set(selectedClusters);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedClusters(next);
    };

    const mergeClusters = async () => {
        const ids = Array.from(selectedClusters);
        if (ids.length < 2) return;
        if (!confirm(`Fusionner ces ${ids.length} clusters ?`)) return;

        const res = await fetch(`/api/matches/${matchId}/clusters/merge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceClusterIds: ids })
        });

        if (res.ok) {
            setSelectedClusters(new Set());
            fetchClusters();
        } else {
            alert('Fusion échouée');
        }
    };

    if (loading) return <div className="container">Chargement...</div>;
    if (!match) return <div className="container">Match non trouvé</div>;

    // Preview Selection Mode (Full Screen)
    if (previewMode) {
        return (
            <PreviewSelectionMode
                matchId={matchId}
                clusters={clusters}
                onComplete={() => {
                    setPreviewMode(false);
                    fetchClusters();
                    // Show completion dialog
                    if (confirm('✅ Tous les previews sont prêts !\n\nVoulez-vous publier le match maintenant ?')) {
                        publishMatch();
                    }
                }}
                onExit={() => setPreviewMode(false)}
            />
        );
    }

    return (
        <div className="container">
            {viewingCluster && (
                <ClusterOverlay
                    matchId={matchId}
                    clusterId={viewingCluster}
                    onClose={() => setViewingCluster(null)}
                    onRefresh={fetchClusters}
                />
            )}

            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin/matches" style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', display: 'inline-block' }}>&larr; Retour à la liste</Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <h1 className="heading" style={{ margin: 0 }}>{match.title}</h1>
                    <span className="badge" style={{ background: '#334155', padding: '0.5rem 1rem', borderRadius: '4px', textTransform: 'capitalize' }}>{match.status}</span>
                </div>
                <p style={{ color: '#94a3b8' }}>{match.date}</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', position: 'sticky', top: '10px', zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label className="btn btn-primary" style={{ cursor: uploading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                            {uploading ? '...' : '1. Importer (Zip)'}
                            <input type="file" accept=".zip" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                        </label>
                        <button onClick={generateClusters} className="btn btn-warning" disabled={generating || uploading}>
                            {generating ? 'IA...' : '2. Clusters (IA)'}
                        </button>

                        {clusters.filter(c => c.decision === 'approved').length > 0 && (
                            <button
                                onClick={() => setPreviewMode(true)}
                                className="btn"
                                style={{ background: '#8b5cf6', color: 'white' }}
                                disabled={uploading || generating}
                            >
                                📸 Mode Sélection Previews
                            </button>
                        )}

                        <button onClick={publishMatch} className="btn btn-success" disabled={publishing || generating || uploading}>
                            {publishing ? 'Publication...' : match.status === 'published' ? `🔄 Mettre à jour (${clusters.filter(c => c.decision === 'approved').length} validés)` : `3. Publier (${clusters.filter(c => c.decision === 'approved').length} validés)`}
                        </button>

                        {match.status === 'published' && (
                            <Link href={`/match/${matchId}`} target="_blank" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                🌍 Voir Page Publique
                            </Link>
                        )}
                    </div>

                    {uploadProgress && (
                        <div style={{ flex: 1, maxWidth: '300px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                Import en cours: {uploadProgress.processed} / {uploadProgress.total} photos ({Math.round((uploadProgress.processed / uploadProgress.total) * 100)}%)
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(uploadProgress.processed / uploadProgress.total) * 100}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>
                    )}

                    {selectedClusters.size >= 2 ? (
                        <button onClick={mergeClusters} className="btn btn-primary" style={{ background: '#8b5cf6', color: 'white' }}>
                            🔗 Fusionner sélection ({selectedClusters.size})
                        </button>
                    ) : (
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Sélectionnez plusieurs clusters pour fusionner</div>
                    )}
                </div>
            </div>

            <h2 className="subheading">Clusters ({clusters.length})</h2>

            <div className="grid">
                {clusters.map(cluster => {
                    const isSelected = selectedClusters.has(cluster.id);
                    return (
                        <div key={cluster.id} className="card" style={{
                            borderColor: isSelected ? '#8b5cf6' :
                                cluster.decision === 'approved' ? 'var(--success)' :
                                    cluster.decision === 'rejected' ? 'var(--danger)' :
                                        cluster.decision === 'needs_review' ? 'var(--warning)' : 'var(--border)',
                            borderWidth: isSelected ? '3px' : '2px',
                            position: 'relative',
                            transition: 'border-color 0.2s'
                        }}>
                            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(cluster.id)}
                                    style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: cluster.decision === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                                        cluster.decision === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                                            cluster.decision === 'needs_review' ? 'rgba(245, 158, 11, 0.2)' : '#334155',
                                    color: cluster.decision === 'approved' ? 'var(--success)' :
                                        cluster.decision === 'rejected' ? 'var(--danger)' :
                                            cluster.decision === 'needs_review' ? 'var(--warning)' : '#e2e8f0',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold'
                                }}>
                                    {cluster.decision.replace('_', ' ')}
                                </div>
                            </div>

                            {/* Preview Grid - Click to Open Overlay */}
                            <div
                                onClick={() => setViewingCluster(cluster.id)}
                                title="Cliquez pour voir toutes les photos et gérer"
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}
                            >
                                {JSON.parse(cluster.photoIds).slice(0, 10).map((photoId: string) => (
                                    <div key={photoId} style={{ aspectRatio: '1', background: '#020617', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img
                                            src={`/api/matches/${matchId}/faces/${photoId}/preview`}
                                            alt="preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                                {JSON.parse(cluster.photoIds).length > 10 && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#334155', borderRadius: '4px', fontSize: '0.9rem', aspectRatio: '1' }}>
                                        +{JSON.parse(cluster.photoIds).length - 10}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                <button onClick={() => updateDecision(cluster.id, 'approved')} className={`btn ${cluster.decision === 'approved' ? 'btn-success' : 'btn-outline'}`}>✓</button>
                                <button onClick={() => updateDecision(cluster.id, 'rejected')} className={`btn ${cluster.decision === 'rejected' ? 'btn-danger' : 'btn-outline'}`}>✕</button>
                                <button onClick={() => updateDecision(cluster.id, 'needs_review')} className={`btn ${cluster.decision === 'needs_review' ? 'btn-warning' : 'btn-outline'}`}>?</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
