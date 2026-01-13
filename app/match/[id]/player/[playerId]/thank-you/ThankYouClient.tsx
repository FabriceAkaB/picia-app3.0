'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type Props = {
    matchId: string;
    playerId: string;
    matchTitle: string;
    previewPhotos: string[];
};

export default function ThankYouPage({ matchId, playerId, matchTitle, previewPhotos }: Props) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    return (
        <div className="page-container">
            <Navbar />

            <main className="container">
                {/* Header */}
                <header className="header">
                    <div className="check-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h1>Merci pour ton achat</h1>
                    <p className="subtitle">{matchTitle}</p>
                    <p className="status-text">Ton pack est en cours de préparation.</p>
                </header>

                {/* CTA - Centered button */}
                <section className="cta-section">
                    <Link href={`/match/${matchId}/player/${playerId}/tracking`} className="cta-button">
                        Suivre l'avancement de mon pack
                    </Link>
                </section>

                {/* Preview Photos Available Now */}
                <section className="section">
                    <h2>Tes photos preview disponibles maintenant</h2>
                    <p className="section-desc">Tu peux déjà télécharger ces aperçus en attendant ton pack complet.</p>

                    <div className="preview-grid">
                        {previewPhotos.map((photoId, idx) => (
                            <div key={photoId} className="preview-card">
                                <img
                                    src={`/api/public/previews/${matchId}/${playerId}/${photoId}`}
                                    alt={`Photo ${idx + 1}`}
                                    onClick={() => setSelectedPhoto(photoId)}
                                />
                                <a
                                    href={`/api/public/previews/${matchId}/${playerId}/${photoId}`}
                                    download={`preview-${idx + 1}.jpg`}
                                    className="download-btn"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" x2="12" y1="15" y2="3" />
                                    </svg>
                                    Télécharger
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Lightbox */}
            {selectedPhoto && (
                <div className="lightbox" onClick={() => setSelectedPhoto(null)}>
                    <button className="lightbox-close">×</button>
                    <img src={`/api/public/previews/${matchId}/${playerId}/${selectedPhoto}`} alt="Photo agrandie" />
                </div>
            )}

            <style jsx>{`
                .page-container {
                    min-height: 100vh;
                    background: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 24px 4rem 24px;
                }

                .header {
                    text-align: center;
                    padding: 2rem 0 2rem 0;
                }
                .check-icon {
                    width: 80px;
                    height: 80px;
                    background: #f0fdf4;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem auto;
                    color: #22c55e;
                }
                .header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111;
                    margin: 0 0 0.5rem 0;
                }
                .subtitle {
                    font-size: 1rem;
                    color: #666;
                    margin: 0 0 1rem 0;
                }
                .status-text {
                    font-size: 0.95rem;
                    color: #86868b;
                    margin: 0;
                    padding: 12px 20px;
                    background: #f5f5f7;
                    border-radius: 8px;
                    display: inline-block;
                }

                .cta-section {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .cta-button {
                    display: inline-block;
                    padding: 16px 40px;
                    background: #111;
                    color: #fff;
                    text-decoration: none;
                    font-size: 1rem;
                    font-weight: 600;
                    border-radius: 12px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
                }
                .cta-button:hover {
                    background: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                }
                .cta-button:active {
                    transform: translateY(0);
                }

                .section {
                    margin-bottom: 3rem;
                }
                .section h2 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #111;
                    margin: 0 0 0.5rem 0;
                }
                .section-desc {
                    font-size: 0.9rem;
                    color: #86868b;
                    margin: 0 0 1.5rem 0;
                }

                .preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }
                .preview-card {
                    background: #f5f5f7;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .preview-card img {
                    width: 100%;
                    aspect-ratio: 3/4;
                    object-fit: cover;
                    cursor: pointer;
                    display: block;
                }
                .download-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px;
                    background: #fff;
                    color: #111;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    border-top: 1px solid #eee;
                }
                .download-btn:hover {
                    background: #111;
                    color: #fff;
                }

                .lightbox {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    cursor: pointer;
                }
                .lightbox img {
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain;
                    border-radius: 8px;
                }
                .lightbox-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
