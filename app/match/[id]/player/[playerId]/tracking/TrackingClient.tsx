'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type Props = {
    matchId: string;
    playerId: string;
    matchTitle: string;
};

export default function TrackingClient({ matchId, playerId, matchTitle }: Props) {
    const router = useRouter();
    const steps = [
        { label: 'Achat confirmé', done: true },
        { label: 'Sélection des photos', done: false, active: true },
        { label: 'Finalisation du pack', done: false },
        { label: 'Livraison', done: false }
    ];

    return (
        <div className="page-container">
            <Navbar />

            <main className="container">
                {/* Header */}
                <header className="header">
                    <h1>Préparation de ton pack</h1>
                    <p className="subtitle">{matchTitle}</p>
                </header>

                {/* Status Message */}
                <section className="status-section">
                    <div className="status-card">
                        <div className="status-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <p className="status-title">Ton pack est en cours de préparation</p>
                            <p className="status-desc">Il sera prêt dans 24 à 48 heures.</p>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="timeline-section">
                    <h2>Avancement</h2>
                    <div className="timeline">
                        {steps.map((step, idx) => (
                            <div key={idx} className={`timeline-step ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                                <div className="step-indicator">
                                    {step.done ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Demo CTA */}
                <section className="cta-section">
                    <p className="cta-text">Curieux de voir à quoi ressemblera ton pack ?</p>
                    <button
                        className="cta-button"
                        onClick={() => router.push(`/match/${matchId}/player/${playerId}/pack`)}
                    >
                        Voir à quoi ressemblera mon pack final
                    </button>
                </section>

                {/* Back Link */}
                <section className="back-section">
                    <Link href={`/match/${matchId}/player/${playerId}/thank-you`} className="back-link">
                        ← Revenir à mes photos preview
                    </Link>
                </section>
            </main>

            <style jsx>{`
                .page-container {
                    min-height: 100vh;
                    background: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 2rem 24px 4rem 24px;
                }

                .header {
                    text-align: center;
                    padding: 2rem 0;
                }
                .header h1 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #111;
                    margin: 0 0 0.5rem 0;
                }
                .subtitle {
                    font-size: 1rem;
                    color: #86868b;
                    margin: 0;
                }

                .status-section {
                    margin-bottom: 3rem;
                }
                .status-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    border-radius: 12px;
                }
                .status-icon {
                    flex-shrink: 0;
                    color: #f59e0b;
                }
                .status-title {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #92400e;
                    margin: 0 0 4px 0;
                }
                .status-desc {
                    font-size: 0.9rem;
                    color: #b45309;
                    margin: 0;
                }

                .timeline-section {
                    margin-bottom: 3rem;
                }
                .timeline-section h2 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #111;
                    margin: 0 0 1.5rem 0;
                }
                .timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }
                .timeline-step {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 0;
                    border-left: 2px solid #e5e5e5;
                    margin-left: 11px;
                    padding-left: 24px;
                    position: relative;
                }
                .timeline-step:first-child {
                    padding-top: 0;
                }
                .timeline-step:last-child {
                    padding-bottom: 0;
                    border-left-color: transparent;
                }
                .timeline-step.done {
                    border-left-color: #22c55e;
                }
                .step-indicator {
                    position: absolute;
                    left: -12px;
                    width: 24px;
                    height: 24px;
                    background: #e5e5e5;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #86868b;
                }
                .timeline-step.done .step-indicator {
                    background: #22c55e;
                    color: white;
                }
                .timeline-step.active .step-indicator {
                    background: #111;
                    color: white;
                }
                .step-label {
                    font-size: 0.95rem;
                    color: #86868b;
                }
                .timeline-step.done .step-label {
                    color: #111;
                }
                .timeline-step.active .step-label {
                    color: #111;
                    font-weight: 500;
                }

                .cta-section {
                    text-align: center;
                    padding: 2rem;
                    background: #f5f5f7;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                }
                .cta-text {
                    font-size: 0.95rem;
                    color: #86868b;
                    margin: 0 0 1rem 0;
                }
                .cta-button {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #111;
                    color: #fff;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: 6px;
                    border: 1px solid #1d1d1f;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .cta-button:hover {
                    background: #222;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                    border-color: #333;
                }

                .back-section {
                    text-align: center;
                }
                .back-link {
                    color: #86868b;
                    text-decoration: none;
                    font-size: 0.9rem;
                }
                .back-link:hover {
                    color: #111;
                }
            `}</style>
        </div>
    );
}
