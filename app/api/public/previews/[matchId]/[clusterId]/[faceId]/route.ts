import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const PREVIEWS_DIR = path.join(process.cwd(), 'data/previews');

export async function GET(
    request: Request,
    { params }: { params: Promise<{ matchId: string, clusterId: string, faceId: string }> }
) {
    const { matchId, clusterId, faceId } = await params;

    // Safety check path traversal?
    // IDs are usually UUIDs, but let's be careful.
    if (matchId.includes('..') || clusterId.includes('..') || faceId.includes('..')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const filePath = path.join(PREVIEWS_DIR, matchId, clusterId, `${faceId}.jpg`);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(filePath);

    return new NextResponse(imageBuffer, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
