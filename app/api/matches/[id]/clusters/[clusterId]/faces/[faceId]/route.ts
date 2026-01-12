import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string, clusterId: string, faceId: string }> }
) {
    const { id: matchId, clusterId, faceId } = await params;

    // Unlink face from cluster (set clusterId to null or 'rejected')
    // User asked to "Enlever" -> implies it's not in THIS cluster.

    const res = db.prepare('UPDATE faces SET clusterId = NULL WHERE id = ? AND clusterId = ? AND matchId = ?').run(faceId, clusterId, matchId);

    if (res.changes > 0) {
        // Update cluster cache
        const allFaces = db.prepare('SELECT id FROM faces WHERE clusterId = ? AND matchId = ?').all(clusterId, matchId) as { id: string }[];
        const faceIds = allFaces.map(f => f.id);
        db.prepare('UPDATE clusters SET photoIds = ? WHERE id = ?').run(JSON.stringify(faceIds), clusterId);

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Face not found in cluster' }, { status: 404 });
}
