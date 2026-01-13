'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';

type Props = {
    matchId: string;
    playerId: string;
    matchTitle: string;
    featuredPhotos: string[];
    allPhotos: string[];
};

export default function PackClient({ matchId, playerId, matchTitle, featuredPhotos, allPhotos }: Props) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'featured' | 'all'>('featured');

    const currentPhotos = activeTab === 'featured' ? featuredPhotos : allPhotos;

    const openLightbox = (photoId: string) => {
        const idx = currentPhotos.indexOf(photoId);
        setSelectedPhotoIndex(idx >= 0 ? idx : 0);
    };

    const closeLightbox = () => setSelectedPhotoIndex(null);

    const goToPrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedPhotoIndex === null) return;
        setSelectedPhotoIndex(selectedPhotoIndex === 0 ? currentPhotos.length - 1 : selectedPhotoIndex - 1);
    }, [selectedPhotoIndex, currentPhotos.length]);

    const goToNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedPhotoIndex === null) return;
        setSelectedPhotoIndex(selectedPhotoIndex === currentPhotos.length - 1 ? 0 : selectedPhotoIndex + 1);
    }, [selectedPhotoIndex, currentPhotos.length]);

    return (
        <div className="page-container">
            <Navbar />

            <main className="container">
                {/* Header */}
                <header className="header">
                    <div className="status-badge">Pack prêt</div>
                    <h1>{matchTitle}</h1>
                    <p className="photo-count">{allPhotos.length} photos • {featuredPhotos.length} mises en avant</p>
                </header>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'featured' ? 'active' : ''}`}
                        onClick={() => setActiveTab('featured')}
                    >
                        Mises en avant ({featuredPhotos.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Toutes les photos ({allPhotos.length})
                    </button>
                </div>

                {/* Photo Grid */}
                <section className="gallery">
                    {activeTab === 'featured' ? (
                        <div className="featured-grid">
                            {featuredPhotos.map((photoId, idx) => (
                                <div key={photoId} className="photo-card featured">
                                    <img
                                        src={`/api/public/previews/${matchId}/${playerId}/${photoId}`}
                                        alt={`Photo ${idx + 1}`}
                                        onClick={() => openLightbox(photoId)}
                                    />
                                    <div className="photo-actions">
                                        <button onClick={() => openLightbox(photoId)} className="action-btn">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" /></svg>
                                        </button>
                                        <a
                                            href={`/api/public/previews/${matchId}/${playerId}/${photoId}`}
                                            download={`photo-${idx + 1}.jpg`}
                                            className="action-btn"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="all-grid">
                            {allPhotos.map((photoId, idx) => (
                                <div key={photoId} className="photo-card">
                                    <img
                                        src={`/api/public/previews/${matchId}/${playerId}/${photoId}`}
                                        alt={`Photo ${idx + 1}`}
                                        onClick={() => openLightbox(photoId)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Download All */}
                <section className="download-section">
                    <button className="download-all-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        Télécharger tout le pack
                    </button>
                </section>
            </main>

            {/* Lightbox with Navigation */}
            {selectedPhotoIndex !== null && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>×</button>

                    {/* Left Arrow */}
                    <button className="lightbox-arrow lightbox-arrow-left" onClick={goToPrev}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <img
                        src={`/api/public/previews/${matchId}/${playerId}/${currentPhotos[selectedPhotoIndex]}`}
                        alt="Photo agrandie"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Right Arrow */}
                    <button className="lightbox-arrow lightbox-arrow-right" onClick={goToNext}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>

                    {/* Counter */}
                    <div className="lightbox-counter">
                        {selectedPhotoIndex + 1} / {currentPhotos.length}
                    </div>

                    <a
                        href={`/api/public/previews/${matchId}/${playerId}/${currentPhotos[selectedPhotoIndex]}`}
                        download="photo.jpg"
                        className="lightbox-download"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        Télécharger
                    </a>
                </div>
            )}

            <style jsx>{`
                .page-container {
                    min-height: 100vh;
                    background: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem 24px 4rem 24px;
                }

                .header {
                    text-align: center;
                    padding: 2rem 0 3rem 0;
                }
                .status-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    background: #f0fdf4;
                    color: #16a34a;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 20px;
                    margin-bottom: 1rem;
                }
                .header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111;
                    margin: 0 0 0.5rem 0;
                }
                .photo-count {
                    font-size: 1rem;
                    color: #86868b;
                    margin: 0;
                }

                .tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #e5e5e5;
                    padding-bottom: 0;
                }
                .tab {
                    padding: 12px 20px;
                    background: none;
                    border: none;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #86868b;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -1px;
                    transition: all 0.2s;
                }
                .tab:hover {
                    color: #111;
                }
                .tab.active {
                    color: #111;
                    border-bottom-color: #111;
                }

                .gallery {
                    margin-bottom: 3rem;
                }
                .featured-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                .all-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 12px;
                }
                .photo-card {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #f5f5f7;
                }
                .photo-card img {
                    width: 100%;
                    aspect-ratio: 3/4;
                    object-fit: cover;
                    display: block;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .photo-card:hover img {
                    transform: scale(1.02);
                }
                .photo-card.featured {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }
                .photo-actions {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    display: flex;
                    gap: 8px;
                }
                .action-btn {
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(10px);
                    border: none;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #111;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .action-btn:hover {
                    background: #fff;
                    transform: scale(1.1);
                }

                .download-section {
                    text-align: center;
                }
                .download-all-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 18px 36px;
                    background: #111;
                    color: #fff;
                    border: none;
                    font-size: 1rem;
                    font-weight: 600;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
                }
                .download-all-btn:hover {
                    background: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                }

                .lightbox {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.95);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    cursor: pointer;
                }
                .lightbox img {
                    max-width: 80%;
                    max-height: 75%;
                    object-fit: contain;
                    border-radius: 8px;
                    cursor: default;
                }
                .lightbox-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 28px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .lightbox-close:hover {
                    background: rgba(255,255,255,0.2);
                }
                .lightbox-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 56px;
                    height: 56px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .lightbox-arrow:hover {
                    background: rgba(255,255,255,0.25);
                    transform: translateY(-50%) scale(1.05);
                }
                .lightbox-arrow-left {
                    left: 24px;
                }
                .lightbox-arrow-right {
                    right: 24px;
                }
                .lightbox-counter {
                    position: absolute;
                    top: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.6);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .lightbox-download {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 20px;
                    padding: 14px 28px;
                    background: #fff;
                    color: #111;
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 600;
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .lightbox-download:hover {
                    background: #f5f5f5;
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
}
