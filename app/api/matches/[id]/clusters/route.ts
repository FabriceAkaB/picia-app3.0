import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;

    const clusters = db.prepare('SELECT * FROM clusters WHERE matchId = ?').all(matchId);
    return NextResponse.json(clusters);
}
