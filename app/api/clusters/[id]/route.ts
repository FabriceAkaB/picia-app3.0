import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { decision, coverFaceIds } = await request.json();

    const updates = [];
    const values = [];

    if (decision) {
        if (!['pending', 'approved', 'rejected', 'needs_review'].includes(decision)) {
            return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
        }
        updates.push('decision = ?');
        values.push(decision);
    }

    if (coverFaceIds) {
        if (!Array.isArray(coverFaceIds)) {
            return NextResponse.json({ error: 'coverFaceIds must be an array' }, { status: 400 });
        }
        updates.push('coverFaceIds = ?');
        values.push(JSON.stringify(coverFaceIds));
    }

    if (updates.length === 0) {
        return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE clusters SET ${updates.join(', ')} WHERE id = ?`;

    const res = db.prepare(sql).run(...values);

    if (res.changes === 0) {
        return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
