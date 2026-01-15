'use client';

import Link from 'next/link';
import { useState } from 'react';

type Props = {
    matchId: string;
    clusterId: string;
    faceId: string;
};

export default function PlayerCard({ matchId, clusterId, faceId }: Props) {
    const [isHovered, setIsHovered] = useState(false);
    const [imgError, setImgError] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'relative',
                borderRadius: '18px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 18px 32px rgba(15, 23, 42, 0.18)' : '0 6px 16px rgba(15, 23, 42, 0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            <Link
                href={`/match/${matchId}/player/${clusterId}`}
                style={{
                    textDecoration: 'none',
                    display: 'block',
                    width: '100%',
                    height: '100%'
                }}
            >
                <div style={{
                    aspectRatio: '3/4',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)', // Much whiter gradient
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {imgError ? (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9ca3af' // Darker grey (gray-400) to ensure visibility
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ overflow: 'visible' }}>
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" x2="12.01" y1="17" y2="17" />
                            </svg>
                        </div>
                    ) : (
                        <img
                            src={`/api/public/previews/${matchId}/${clusterId}/${faceId}`}
                            alt="Aperçu pack"
                            onError={() => setImgError(true)}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 1
                            }}
                        />
                    )}

                    {/* Hover Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        top: 0,
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.4))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        zIndex: 2
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#0b1220',
                            padding: '10px 18px',
                            borderRadius: '999px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transform: isHovered ? 'scale(1)' : 'scale(0.9)',
                            transition: 'transform 0.2s'
                        }}>
                            Voir mon pack
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
