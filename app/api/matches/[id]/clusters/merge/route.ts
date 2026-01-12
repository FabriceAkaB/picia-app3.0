import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;
    const { sourceClusterIds, targetClusterId } = await request.json(); // targetClusterId is optional, if not provided, take first source as target

    if (!sourceClusterIds || !Array.isArray(sourceClusterIds) || sourceClusterIds.length < 2) {
        return NextResponse.json({ error: 'Need at least 2 clusters to merge' }, { status: 400 });
    }

    const targetId = targetClusterId || sourceClusterIds[0];
    const sourcesToRemove = sourceClusterIds.filter(id => id !== targetId);

    if (sourcesToRemove.length === 0) {
        return NextResponse.json({ message: 'Nothing to merge' });
    }

    // Transaction
    const mergeTx = db.transaction(() => {
        // 1. Move faces to target
        const moveStmt = db.prepare('UPDATE faces SET clusterId = ? WHERE clusterId = ? AND matchId = ?');
        for (const srcId of sourcesToRemove) {
            moveStmt.run(targetId, srcId, matchId);
        }

        // 2. Delete source clusters
        const delStmt = db.prepare('DELETE FROM clusters WHERE id = ?');
        for (const srcId of sourcesToRemove) {
            delStmt.run(srcId);
        }

        // 3. Update target cluster 'photoIds' cache (list of faces)
        // We should re-fetch all faces for target and sort them (by default creation or whatever)
        // Ideally we would trigger a re-centroid calculation but for now just concat list
        const allFaces = db.prepare('SELECT id FROM faces WHERE clusterId = ? AND matchId = ?').all(targetId, matchId) as { id: string }[];
        const faceIds = allFaces.map(f => f.id);

        db.prepare('UPDATE clusters SET photoIds = ? WHERE id = ?').run(JSON.stringify(faceIds), targetId);
    });

    try {
        mergeTx();
        return NextResponse.json({ success: true, targetId });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Merge failed' }, { status: 500 });
    }
}
