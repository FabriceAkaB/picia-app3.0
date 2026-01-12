'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MatchesPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // New match form
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetch('/api/matches')
            .then(res => res.json())
            .then(data => {
                setMatches(data);
                setLoading(false);
            });
    }, []);

    const createMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        const res = await fetch('/api/matches', {
            method: 'POST',
            body: JSON.stringify({ title, date }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            const newMatch = await res.json();
            setMatches([newMatch, ...matches]);
            setTitle('');
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="heading">Matches</h1>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 className="subheading">Créer un Match</h2>
                <form onSubmit={createMatch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: U15 Laval vs Longueuil"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Créer</button>
                </form>
            </div>

            <div className="grid grid-cols-3">
                {loading ? <p>Chargement...</p> : matches.map(match => (
                    <Link href={`/admin/match/${match.id}`} key={match.id} className="card" style={{ display: 'block', transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="badge" style={{
                                background: match.status === 'published' ? 'var(--success)' : '#334155',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                textTransform: 'capitalize'
                            }}>
                                {match.status}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{match.date}</span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{match.title}</h3>
                    </Link>
                ))}
                {!loading && matches.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>Aucun match trouvé.</p>}
            </div>
        </div>
    );
}
