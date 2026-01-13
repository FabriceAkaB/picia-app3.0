import db from '@/lib/db';
import { notFound } from 'next/navigation';
import PackClient from './PackClient';

export const dynamic = 'force-dynamic';

export default async function PackPage({ params }: { params: Promise<{ id: string, playerId: string }> }) {
    const { id: matchId, playerId } = await params;

    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId) as any;
    const cluster = db.prepare("SELECT * FROM clusters WHERE id = ?").get(playerId) as any;

    if (!match || !cluster) {
        notFound();
    }

    // Get featured photos (cover faces)
    let featuredIds: string[] = [];
    try {
        featuredIds = JSON.parse(cluster.coverFaceIds || '[]');
    } catch (e) { }

    // Get all photos for this player
    const allFaces = db.prepare("SELECT id FROM faces WHERE clusterId = ? ORDER BY blurScore DESC").all(playerId) as { id: string }[];
    const allPhotoIds = allFaces.map(f => f.id);

    // If no featured, take top 10
    if (featuredIds.length === 0) {
        featuredIds = allPhotoIds.slice(0, 10);
    }

    return (
        <PackClient
            matchId={matchId}
            playerId={playerId}
            matchTitle={match.title}
            featuredPhotos={featuredIds}
            allPhotos={allPhotoIds}
        />
    );
}
