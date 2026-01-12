import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);

    if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
}
