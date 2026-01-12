import { NextResponse } from 'next/server';
import { getJob } from '@/lib/uploadQueue';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;

    const job = getJob(matchId);

    if (!job) {
        return NextResponse.json({ status: 'not_found' }, { status: 404 });
    }

    return NextResponse.json(job);
}
