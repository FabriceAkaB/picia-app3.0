import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const matches = db.prepare('SELECT * FROM matches ORDER BY createdAt DESC').all();
    return NextResponse.json(matches);
}

export async function POST(request: Request) {
    const { title, date } = await request.json();
    const id = uuidv4();

    db.prepare('INSERT INTO matches (id, title, date, status) VALUES (?, ?, ?, ?)').run(
        id,
        title,
        date,
        'imported'
    );

    return NextResponse.json({ id, title, date, status: 'imported' });
}
