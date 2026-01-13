'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

type Props = {
    matchId: string;
    playerId: string;
    matchTitle: string;
    previewPhotos: string[];
};

export default function PlayerPageClient({ matchId, playerId, matchTitle, previewPhotos }: Props) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    const goToPrev = () => {
        setSelectedPhotoIndex((prev) => (prev === 0 ? previewPhotos.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setSelectedPhotoIndex((prev) => (prev === previewPhotos.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="page-container">
            <Navbar />

            <main className="container main-content">
                <div className="product-grid">
                    {/* Left Column: Gallery with Arrows */}
                    <div className="gallery-section">
                        <div className="main-image-container">
                            {/* Left Arrow */}
                            {previewPhotos.length > 1 && (
                                <button className="arrow-btn arrow-left" onClick={goToPrev}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                            )}

                            <img
                                src={`/api/public/previews/${matchId}/${playerId}/${previewPhotos[selectedPhotoIndex]}`}
                                alt="Aperçu principal"
                                className="main-image"
                            />

                            {/* Right Arrow */}
                            {previewPhotos.length > 1 && (
                                <button className="arrow-btn arrow-right" onClick={goToNext}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            )}

                            {/* Photo counter */}
                            <div className="photo-counter">
                                {selectedPhotoIndex + 1} / {previewPhotos.length}
                            </div>
                        </div>

                        <div className="thumbnails-list">
                            {previewPhotos.map((photoId, idx) => (
                                <button
                                    key={photoId}
                                    className={`thumbnail-btn ${selectedPhotoIndex === idx ? 'active' : ''}`}
                                    onClick={() => setSelectedPhotoIndex(idx)}
                                >
                                    <img
                                        src={`/api/public/previews/${matchId}/${playerId}/${photoId}`}
                                        alt={`Vue ${idx + 1}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Product Details */}
                    <div className="product-details">
                        <div className="product-card">
                            <div className="product-header">
                                <span className="match-category">PHOTOS DE MATCH</span>
                                <h1 className="product-title">Pack Numérique Complet</h1>
                                <p className="match-name">{matchTitle}</p>
                            </div>

                            <div className="price-section">
                                <div className="price-row">
                                    <span className="amount">15€</span>
                                </div>
                                <p className="vat-text">TVA incluse • Livraison immédiate</p>
                            </div>

                            <button className="cta-button">
                                Acheter le pack
                            </button>

                            <div className="guarantee-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <span>Paiement sécurisé via Stripe</span>
                            </div>
                        </div>

                        <div className="features-card">
                            <h3>Ce qui est inclus</h3>
                            <ul>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    <span>Toutes vos photos en haute définition</span>
                                </li>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    <span>Téléchargement immédiat après paiement</span>
                                </li>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    <span>Fichiers originaux sans filigrane</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .page-container {
                    min-height: 100vh;
                    background: #f5f5f7;
                    color: #1d1d1f;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .main-content {
                    padding: 2rem 24px 4rem 24px;
                }

                .product-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }

                @media (min-width: 900px) {
                    .product-grid {
                        grid-template-columns: 1.3fr 1fr;
                        gap: 3rem;
                    }
                    .gallery-section {
                        position: sticky;
                        top: 80px;
                        align-self: start;
                    }
                }

                .gallery-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .main-image-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 3/4;
                    background: #fff;
                    border-radius: 16px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }
                .main-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .arrow-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(10px);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                    z-index: 10;
                }
                .arrow-btn:hover {
                    background: #fff;
                    transform: translateY(-50%) scale(1.05);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                }
                .arrow-left { left: 12px; }
                .arrow-right { right: 12px; }

                .photo-counter {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.6);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .thumbnails-list {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding: 4px;
                }
                .thumbnail-btn {
                    flex-shrink: 0;
                    width: 72px;
                    height: 72px;
                    border: 2px solid transparent;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    background: #fff;
                    padding: 0;
                    opacity: 0.6;
                    transition: all 0.2s;
                }
                .thumbnail-btn:hover { opacity: 1; }
                .thumbnail-btn.active {
                    border-color: #111;
                    opacity: 1;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                }
                .thumbnail-btn img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-details {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .product-card {
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                }

                .match-category {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #86868b;
                    letter-spacing: 1px;
                    font-weight: 600;
                }
                .product-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1d1d1f;
                    margin: 8px 0 4px 0;
                    letter-spacing: -0.02em;
                }
                .match-name {
                    font-size: 1rem;
                    color: #86868b;
                    margin: 0;
                }

                .price-section {
                    margin: 24px 0;
                    padding: 20px 0;
                    border-top: 1px solid rgba(0,0,0,0.06);
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                }
                .amount {
                    font-size: 2.2rem;
                    font-weight: 700;
                    color: #1d1d1f;
                }
                .vat-text {
                    margin: 8px 0 0 0;
                    font-size: 0.85rem;
                    color: #86868b;
                }

                .cta-button {
                    width: 100%;
                    padding: 16px 24px;
                    font-size: 1rem;
                    font-weight: 600;
                    background: #111;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cta-button:hover {
                    background: #333;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                }

                .guarantee-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 16px;
                    font-size: 0.8rem;
                    color: #86868b;
                }

                .features-card {
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                }
                .features-card h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    color: #1d1d1f;
                }
                .features-card ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .features-card li {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.9rem;
                    color: #1d1d1f;
                }
                .features-card li svg {
                    flex-shrink: 0;
                    color: #34c759;
                }
            `}</style>
        </div>
    );
}
