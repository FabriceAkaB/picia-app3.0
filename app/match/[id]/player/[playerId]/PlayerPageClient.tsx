'use client';

import Link from 'next/link';
import { useState } from 'react';

type Props = {
    matchId: string;
    playerId: string;
    matchTitle: string;
    previewPhotos: string[];
};

export default function PlayerPageClient({ matchId, playerId, matchTitle, previewPhotos }: Props) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    return (
        <div className="page-container">
            {/* Navbar Simplified */}
            <nav className="navbar">
                <div className="container nav-content">
                    <Link href={`/match/${matchId}`} className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        <span>Retour aux résultats</span>
                    </Link>
                    <div className="brand">PICIA SPORT</div>
                </div>
            </nav>

            <main className="container main-content">
                <div className="product-grid">
                    {/* Left Column: Gallery */}
                    <div className="gallery-section">
                        <div className="main-image-container">
                            <img
                                src={`/api/public/previews/${matchId}/${playerId}/${previewPhotos[selectedPhotoIndex]}`}
                                alt="Aperçu principal"
                                className="main-image"
                            />
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
                        <div className="product-header">
                            <h2 className="match-category">PHOTOS DE MATCH</h2>
                            <h1 className="product-title">Pack Numérique Complet - {matchTitle}</h1>
                            <div className="product-meta">
                                <span className="badge">Format Digital</span>
                                <span className="separator">•</span>
                                <span className="meta-text">Haute Résolution</span>
                            </div>
                        </div>

                        <div className="price-section">
                            <div className="price-row">
                                <span className="currency">€</span>
                                <span className="amount">15</span>
                                <span className="zeros">.00</span>
                            </div>
                            <p className="vat-text">TVA incluse. Livraison immédiate par email.</p>
                        </div>

                        {/* Buy Box */}
                        <div className="buy-box">
                            <button className="cta-button primary">
                                Acheter le pack maintenant
                            </button>
                            <div className="guarantee-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <span>Paiement 100% sécurisé via Stripe</span>
                            </div>
                        </div>

                        <div className="features-list">
                            <h3>Ce qui est inclus :</h3>
                            <ul>
                                <li>
                                    <div className="icon-box">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 8h.01" /><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16" /><path d="m20 15-4-4L6 21" /></svg>
                                    </div>
                                    <div className="feature-text">
                                        <strong>Toutes vos photos</strong>
                                        <p>Accès illimité à l'intégralité de vos photos détectées.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-box">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    </div>
                                    <div className="feature-text">
                                        <strong>Téléchargement Immédiat</strong>
                                        <p>Recevez un lien sécurisé juste après le paiement.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-box">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                    </div>
                                    <div className="feature-text">
                                        <strong>Qualité Maximale</strong>
                                        <p>Fichiers originaux HD sans filigrane.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .page-container {
                    min-height: 100vh;
                    background-color: #feba; /* Fallback */
                    background-color: #ffffff;
                    color: #0F1111;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                /* Navbar */
                .navbar {
                    height: 60px;
                    background: #131921;
                    color: white;
                    display: flex;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .nav-content {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: #fff;
                    text-decoration: none;
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                .back-link:hover {
                    text-decoration: underline;
                    opacity: 1;
                }
                .brand {
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                /* Product Grid Layout */
                .product-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    padding-bottom: 4rem;
                }

                @media (min-width: 1024px) {
                    .product-grid {
                        grid-template-columns: 1.2fr 1fr; /* Image takes slightly more space or equal */
                        gap: 4rem;
                    }
                    .gallery-section {
                        position: sticky;
                        top: 2rem;
                        align-self: start;
                    }
                }

                /* Gallery */
                .gallery-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .main-image-container {
                    width: 100%;
                    aspect-ratio: 3/4; /* Vertical sport photos usually */
                    background: #f7f7f7;
                    border-radius: 8px; /* Slightly softer */
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e5e5e5;
                }
                .main-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                
                .thumbnails-list {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 5px;
                }
                .thumbnail-btn {
                    width: 80px;
                    height: 80px;
                    border: 2px solid transparent;
                    border-radius: 6px;
                    overflow: hidden;
                    cursor: pointer;
                    background: none;
                    padding: 0;
                    opacity: 0.7;
                    transition: all 0.2s;
                }
                .thumbnail-btn:hover {
                    opacity: 1;
                }
                .thumbnail-btn.active {
                    border-color: #e77600; /* Amazon-like highlight color or brand color */
                    border-color: #111;
                    opacity: 1;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .thumbnail-btn img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Product Details */
                .product-details {
                    padding-top: 1rem;
                }
                .match-category {
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    color: #565959;
                    margin: 0 0 0.5rem 0;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }
                .product-title {
                    font-size: 2rem;
                    line-height: 1.2;
                    font-weight: 600;
                    color: #0F1111;
                    margin: 0 0 1rem 0;
                }
                .product-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    color: #565959;
                }
                .badge {
                    background: #1f2937;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 500;
                    font-size: 0.8rem;
                }

                /* Price */
                .price-section {
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #e5e5e5;
                    padding-bottom: 1.5rem;
                }
                .price-row {
                    display: flex;
                    align-items: flex-start;
                    line-height: 1;
                    color: #B12704; /* Classic e-commerce price color or brand color */
                    color: #111;
                }
                .currency {
                    font-size: 1rem;
                    margin-top: 0.3em;
                    font-weight: 500;
                }
                .amount {
                    font-size: 2.5rem;
                    font-weight: 700;
                }
                .zeros {
                    font-size: 1rem;
                    margin-top: 0.3em;
                    font-weight: 500;
                }
                .vat-text {
                    margin: 0.5rem 0 0 0;
                    font-size: 0.9rem;
                    color: #565959;
                }

                /* Buy Box */
                .buy-box {
                    background: #fff;
                    border: 1px solid #d5d9d9;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 2px 5px rgba(213,217,217,0.5);
                }
                .cta-button {
                    width: 100%;
                    padding: 14px 20px;
                    font-size: 1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 25px; /* Pill shape standard in modern ui */
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }
                .cta-button.primary {
                    background: #FFD814; /* Amazon yellow hint */
                    background: #111;
                    color: #fff;
                }
                .cta-button.primary:hover {
                    background: #F7CA00;
                    background: #333;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .guarantee-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 1rem;
                    font-size: 0.85rem;
                    color: #565959;
                }

                /* Features List */
                .features-list h3 {
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }
                .features-list ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .features-list li {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .icon-box {
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    background: #f0f2f5;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #111;
                }
                .feature-text strong {
                    display: block;
                    color: #0F1111;
                    margin-bottom: 2px;
                    font-size: 0.95rem;
                }
                .feature-text p {
                    margin: 0;
                    color: #565959;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
}
