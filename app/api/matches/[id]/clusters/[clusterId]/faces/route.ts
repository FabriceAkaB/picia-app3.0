import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string, clusterId: string }> }
) {
    const { id: matchId, clusterId } = await params;

    // Retrieve all faces for this cluster with metrics
    const faces = db.prepare('SELECT * FROM faces WHERE clusterId = ? AND matchId = ?').all(clusterId, matchId);

    return NextResponse.json(faces);
}
