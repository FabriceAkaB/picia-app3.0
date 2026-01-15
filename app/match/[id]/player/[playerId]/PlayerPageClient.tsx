'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

type Props = {
    matchId: string;
    playerId: string;
    matchTitle: string;
    previewPhotos: string[];
};

export default function PlayerPageClient({ matchId, playerId, matchTitle, previewPhotos }: Props) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const router = useRouter();

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
                    {/* Left Column: Gallery */}
                    <div className="gallery-section">
                        <div className="main-image-container">
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

                            {previewPhotos.length > 1 && (
                                <button className="arrow-btn arrow-right" onClick={goToNext}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            )}

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
                        {/* Header */}
                        <div className="product-card">
                            <span className="match-category">PACK PHOTOS DE MATCH</span>
                            <h1 className="product-title">{matchTitle}</h1>

                            <div className="price-section">
                                <span className="amount">49$</span>
                                <p className="vat-text">Livraison sous 24-48h après achat</p>
                            </div>

                            <button
                                className="cta-button"
                                onClick={() => router.push(`/match/${matchId}/player/${playerId}/thank-you`)}
                            >
                                Acheter mon pack
                            </button>

                            <div className="guarantee-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <span>Paiement sécurisé via Stripe</span>
                            </div>
                        </div>

                        {/* Ce que tu obtiens */}
                        <div className="features-card">
                            <h3>Ce que tu obtiens</h3>
                            <ul className="features-list">
                                <li>
                                    <div className="icon-wrap">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                                    </div>
                                    <div>
                                        <strong>Minimum 100 photos de toi</strong>
                                        <p>Toutes les photos où tu apparais, souvent plus que 100</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrap">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                    </div>
                                    <div>
                                        <strong>10 photos mises en avant</strong>
                                        <p>Une sélection des images les plus fortes et les plus nettes.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrap">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    </div>
                                    <div>
                                        <strong>Les 3 photos preview disponibles dès l'achat</strong>
                                        <p>Pour posté rapidement sur les réseaux sociaux</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrap">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    </div>
                                    <div>
                                        <strong>Livraison rapide</strong>
                                        <p>Ton pack est disponible sous 24 à 48 heures après l'achat.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* En savoir plus (collapsible) */}
                        <div className="details-card">
                            <button
                                className="details-toggle"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                <span>En savoir plus</span>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {showDetails && (
                                <div className="details-content">
                                    <div className="detail-block">
                                        <h4>À propos des photos</h4>
                                        <p>Les photos incluses dans le pack sont toutes les images exploitables où tu apparais pendant le match. Certaines sont des photos d'action prises sur le vif : elles ne sont pas toutes parfaitement cadrées ou artistiques, mais elles font partie du déroulement réel du match et racontent ton histoire sur le terrain.</p>
                                    </div>

                                    <div className="detail-block">
                                        <h4>À propos des 10 photos mises en avant</h4>
                                        <p>Les photos mises en avant sont sélectionnées pour leur qualité, leur netteté et leur impact visuel. Elles représentent les meilleurs moments capturés pendant le match.</p>
                                    </div>

                                    <div className="detail-block">
                                        <h4>À propos des aperçus</h4>
                                        <p>Les photos visibles avant l'achat sont des aperçus protégés par watermark. Après l'achat, toutes les photos du pack sont accessibles sans watermark.</p>
                                    </div>

                                    <div className="detail-block">
                                        <h4>Accès et utilisation</h4>
                                        <p>L'accès au pack est personnel et privé. Les photos sont destinées à un usage personnel (souvenirs, partage privé, réseaux sociaux).</p>
                                    </div>

                                    <div className="detail-block">
                                        <h4>Et si je ne me trouve pas ?</h4>
                                        <p>Si tu ne te reconnais pas dans les aperçus ou si tu penses que certaines photos te concernant sont manquantes, tu peux contacter le support afin que l'on vérifie.</p>
                                    </div>
                                </div>
                            )}
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
                        grid-template-columns: 1.2fr 1fr;
                        gap: 3rem;
                    }
                    .gallery-section {
                        position: sticky;
                        top: 80px;
                        align-self: start;
                    }
                }

                /* Gallery */
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
                }
                .thumbnail-btn img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Product Details */
                .product-details {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .product-card, .features-card, .details-card {
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(20px);
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }
                .match-category {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    color: #86868b;
                    letter-spacing: 1.5px;
                    font-weight: 600;
                }
                .product-title {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #1d1d1f;
                    margin: 8px 0 0 0;
                    letter-spacing: -0.02em;
                }
                .price-section {
                    margin: 20px 0;
                    padding: 16px 0;
                    border-top: 1px solid rgba(0,0,0,0.06);
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                }
                .amount {
                    font-size: 2.4rem;
                    font-weight: 700;
                    color: #1d1d1f;
                }
                .vat-text {
                    margin: 6px 0 0 0;
                    font-size: 0.85rem;
                    color: #86868b;
                }
                .cta-button {
                    display: block;
                    text-align: center;
                    text-decoration: none;
                    width: 100%;
                    padding: 14px 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    background: #111;
                    color: #fff;
                    border: 1px solid #1d1d1f;
                    border-radius: 6px;
                    cursor: pointer;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }
                .cta-button:hover {
                    background: #222;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                    border-color: #333;
                }
                .cta-button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .guarantee-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 14px;
                    font-size: 0.8rem;
                    color: #86868b;
                }

                /* Features Card */
                .features-card h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    color: #1d1d1f;
                }
                .features-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .features-list li {
                    display: flex;
                    gap: 14px;
                    align-items: flex-start;
                }
                .icon-wrap {
                    flex-shrink: 0;
                    width: 36px;
                    height: 36px;
                    background: #f0f0f2;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1d1d1f;
                }
                .features-list li strong {
                    display: block;
                    font-size: 0.9rem;
                    color: #1d1d1f;
                    margin-bottom: 2px;
                }
                .features-list li p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #86868b;
                    line-height: 1.4;
                }

                /* Details Card */
                .details-toggle {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1d1d1f;
                    padding: 0;
                }
                .details-content {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .detail-block h4 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #1d1d1f;
                    margin: 0 0 6px 0;
                }
                .detail-block p {
                    font-size: 0.85rem;
                    color: #6e6e73;
                    line-height: 1.5;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
