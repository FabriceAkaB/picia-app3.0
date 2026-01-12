import db from '@/lib/db';
import { notFound } from 'next/navigation';
import PlayerPageClient from './PlayerPageClient';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: Promise<{ id: string, playerId: string }> }) {
    const { id: matchId, playerId } = await params;

    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId) as any;
    const cluster = db.prepare("SELECT * FROM clusters WHERE id = ? AND decision = 'approved'").get(playerId) as any;

    if (!match || match.status !== 'published' || !cluster) {
        notFound();
    }

    let faceIds: string[] = [];
    try {
        faceIds = JSON.parse(cluster.coverFaceIds || '[]');
    } catch (e) { }

    if (faceIds.length === 0) {
        const fallbackFaces = db.prepare("SELECT id FROM faces WHERE clusterId = ? ORDER BY blurScore DESC LIMIT 3").all(playerId) as { id: string }[];
        faceIds = fallbackFaces.map(f => f.id);
    }

    const previewPhotos = faceIds.slice(0, 3);

    return (
        <PlayerPageClient
            matchId={matchId}
            playerId={playerId}
            matchTitle={match.title}
            previewPhotos={previewPhotos}
        />
    );
}
