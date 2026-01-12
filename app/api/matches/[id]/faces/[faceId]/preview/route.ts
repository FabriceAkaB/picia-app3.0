import { NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string, faceId: string }> }
) {
    const { id, faceId } = await params;

    const face = db.prepare('SELECT filePath FROM faces WHERE id = ? AND matchId = ?').get(faceId, id) as { filePath: string } | undefined;

    if (!face || !fs.existsSync(face.filePath)) {
        return NextResponse.json({ error: 'Face not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(face.filePath);

    return new NextResponse(imageBuffer, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
