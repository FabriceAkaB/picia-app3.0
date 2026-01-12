import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;

    // Clean existing clusters for this match
    db.prepare('DELETE FROM clusters WHERE matchId = ?').run(matchId);

    // Get all photos check
    const photos = db.prepare('SELECT id FROM photos WHERE matchId = ?').all(matchId);
    if (photos.length === 0) {
        return NextResponse.json({ error: 'No photos to cluster' }, { status: 400 });
    }

    // We will call the python script to perform clustering
    // The script writes directly to the DB for efficiency
    const scriptPath = path.join(process.cwd(), 'scripts/cluster_faces.py');
    const dbPath = path.join(process.cwd(), 'data/picia.db');
    const pythonPath = path.join(process.cwd(), 'venv/bin/python');

    return new Promise((resolve) => {
        // Spawn python process
        const pythonProcess = spawn(pythonPath, [scriptPath, dbPath, matchId]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
            console.log(`[Python] ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
            console.error(`[Python API] ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python script failed', errorData);
                resolve(NextResponse.json({ error: 'Clustering failed', details: errorData }, { status: 500 }));
                return;
            }

            // Fetch the newly created clusters to return them
            const clusters = db.prepare('SELECT * FROM clusters WHERE matchId = ?').all(matchId);
            resolve(NextResponse.json({
                message: 'Clustering complete',
                count: clusters.length,
                clusters: clusters
            }));
        });
    });
}
