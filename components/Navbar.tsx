'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    // Determine back link based on current path
    const getBackLink = () => {
        if (pathname.includes('/player/')) {
            const matchId = pathname.split('/match/')[1]?.split('/')[0];
            return `/match/${matchId}`;
        } else if (pathname.includes('/match/')) {
            return '/matches';
        }
        return null;
    };

    const backLink = getBackLink();

    return (
        <nav style={{
            height: '56px',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 24px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Left: Back Arrow */}
                <div style={{ width: '80px' }}>
                    {backLink && (
                        <Link href={backLink} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            color: '#333',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}>
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Center: Logo */}
                <Link href="/matches" className="font-logo" style={{
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    letterSpacing: '3px',
                    color: '#111',
                    textDecoration: 'none',
                    fontFamily: '"Manrope", var(--font-manrope), sans-serif'
                }}>
                    ANOBLE
                </Link>

                {/* Right: Spacer */}
                <div style={{ width: '80px' }}></div>
            </div>
        </nav>
    );
}
