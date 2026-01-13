import db from '@/lib/db';
import { notFound } from 'next/navigation';
import TrackingClient from './TrackingClient';

export const dynamic = 'force-dynamic';

export default async function TrackingPage({ params }: { params: Promise<{ id: string, playerId: string }> }) {
    const { id: matchId, playerId } = await params;

    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId) as any;
    const cluster = db.prepare("SELECT * FROM clusters WHERE id = ?").get(playerId) as any;

    if (!match || !cluster) {
        notFound();
    }

    return (
        <TrackingClient
            matchId={matchId}
            playerId={playerId}
            matchTitle={match.title}
        />
    );
}
