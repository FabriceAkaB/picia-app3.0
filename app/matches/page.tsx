import db from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function MatchesPage({ searchParams }: { searchParams?: { q?: string } }) {
    const supportEmail = 'support@picia.sport';
    const query = (searchParams?.q ?? '').trim();
    const hasQuery = query.length > 0;
    const matches = hasQuery
        ? db.prepare("SELECT * FROM matches WHERE status = 'published' AND (title LIKE ? OR date LIKE ?) ORDER BY createdAt DESC").all(`%${query}%`, `%${query}%`) as any[]
        : db.prepare("SELECT * FROM matches WHERE status = 'published' ORDER BY createdAt DESC").all() as any[];

    return (
        <div className="public-shell">
            <Navbar />

            <header className="public-hero public-hero--compact">
                <div className="public-container">
                    <div className="public-hero-copy fade-up" style={{ animationDelay: '80ms' }}>
                        <h1 className="public-title">Tous les matchs</h1>
                        <p className="public-subtitle">
                            {hasQuery ? `Resultats pour "${query}"` : 'Explorez les galeries officielles, retrouvez votre equipe et partagez vos meilleurs moments.'}
                        </p>
                    </div>
                </div>
            </header>

            <main className="public-container">
                <section id="gallery" className="public-section">
                    <div className="public-section-header">
                        <span className="public-pill">{matches.length} matchs</span>
                    </div>

                    {matches.length === 0 ? (
                        <div className="public-empty">
                            <p>Aucun match publie pour le moment.</p>
                        </div>
                    ) : (
                        <div className="public-grid">
                            {matches.map((match, index) => (
                                <Link
                                    href={`/match/${match.id}`}
                                    key={match.id}
                                    className="public-card fade-up"
                                    style={{ animationDelay: `${index * 60}ms` }}
                                >
                                    <div className="public-card-media">
                                        <span className="public-card-icon">⚽️</span>
                                        <span className="public-card-badge">Publie</span>
                                    </div>
                                    <div className="public-card-body">
                                        <h3 className="public-card-title">{match.title}</h3>
                                        <p className="public-card-meta">{match.date}</p>
                                        <span className="public-card-link">Voir les photos &rarr;</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="public-support-actions fade-up">
                        <details className="public-support">
                            <summary className="public-support-summary">Je ne trouve pas mon match</summary>
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
                                        Nom du match
                                        <input name="match" type="text" placeholder="Match recherche" />
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
                </section>
            </main>
        </div>
    );
}
