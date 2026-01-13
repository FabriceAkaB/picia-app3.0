import db from '@/lib/db';
import { notFound } from 'next/navigation';
import PlayerCard from './PlayerCard';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function PublicMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(id) as any;

    if (!match || match.status !== 'published') {
        notFound();
    }

    const clusters = db.prepare("SELECT * FROM clusters WHERE matchId = ? AND decision = 'approved'").all(id) as any[];
    const playersLabel = clusters.length === 1 ? '1 joueur identifie' : `${clusters.length} joueurs identifies`;
    const supportEmail = 'support@picia.sport';

    return (
        <div className="public-shell">
            <Navbar />

            <header className="public-hero public-hero--compact" id="featured">
                <div className="public-container">
                    <div className="public-hero-copy fade-up" style={{ animationDelay: '80ms' }}>
                        <h1 className="public-title">{match.title}</h1>
                        <p className="public-subtitle">
                            {match.date} • {playersLabel}
                        </p>
                    </div>
                </div>
            </header>

            <main className="public-container">
                <section id="gallery" className="public-section">
                    <div className="public-section-header">
                        <span className="public-pill">{clusters.length} joueurs</span>
                    </div>

                    {clusters.length === 0 ? (
                        <div className="public-empty">
                            <p>En attente de photos...</p>
                        </div>
                    ) : (
                        <div className="public-grid">
                            {clusters.map((cluster, index) => {
                                let faceIds: string[] = [];
                                try {
                                    faceIds = JSON.parse(cluster.coverFaceIds || '[]');
                                } catch (e) { }

                                if (faceIds.length === 0) {
                                    const fallbackFaces = db.prepare("SELECT id FROM faces WHERE clusterId = ? ORDER BY blurScore DESC LIMIT 1").all(cluster.id) as { id: string }[];
                                    faceIds = fallbackFaces.map(f => f.id);
                                }

                                const mainFaceId = faceIds[0];
                                if (!mainFaceId) return null;

                                return (
                                    <div key={cluster.id} className="fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                                        <PlayerCard
                                            matchId={id}
                                            clusterId={cluster.id}
                                            faceId={mainFaceId}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            <section className="public-section">
                <div className="public-container">
                    <div className="public-support-actions fade-up">
                        <details className="public-support">
                            <summary className="public-support-summary">Je ne trouve pas mon pack</summary>
                            <form
                                className="public-support-form"
                                action={`mailto:${supportEmail}`}
                                method="post"
                                encType="text/plain"
                            >
                                <div className="public-support-grid">
                                    <label className="public-support-field">
                                        Nom complet
                                        <input name="nom" type="text" placeholder="Votre nom" required />
                                    </label>
                                    <label className="public-support-field">
                                        Email
                                        <input name="email" type="email" placeholder="vous@email.com" required />
                                    </label>
                                    <label className="public-support-field">
                                        Equipe ou club
                                        <input name="equipe" type="text" placeholder="Nom de l'equipe" />
                                    </label>
                                    <label className="public-support-field">
                                        Match
                                        <input name="match" type="text" value={match.title} readOnly />
                                    </label>
                                </div>
                                <label className="public-support-field">
                                    Message
                                    <textarea name="message" rows={4} placeholder="Dites nous comment vous aider..." required />
                                </label>
                                <button type="submit" className="public-support-submit">
                                    Envoyer la demande
                                </button>
                            </form>
                        </details>
                    </div>
                </div>
            </section>
        </div>
    );
}
