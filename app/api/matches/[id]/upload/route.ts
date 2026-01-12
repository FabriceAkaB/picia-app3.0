import { NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { createJob, updateProgress, completeJob, failJob } from '@/lib/uploadQueue';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.name.endsWith('.zip')) {
            return NextResponse.json({ error: 'Only ZIP files are supported' }, { status: 400 });
        }

        // Save ZIP to temp location first (streaming to avoid memory issues)
        const tempDir = path.join(process.cwd(), 'data/temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const tempZipPath = path.join(tempDir, `${matchId}_${Date.now()}.zip`);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(tempZipPath, buffer);

        // Start background processing
        processZipInBackground(matchId, tempZipPath);

        return NextResponse.json({
            message: 'Upload started, processing in background',
            matchId
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function processZipInBackground(matchId: string, zipPath: string) {
    try {
        const rawDir = path.join(process.cwd(), `data/matches/${matchId}/raw`);
        const previewDir = path.join(process.cwd(), `data/matches/${matchId}/preview`);

        if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });
        if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();

        // Count valid images first
        const validEntries = zipEntries.filter(entry => {
            if (entry.isDirectory || entry.entryName.startsWith('__MACOSX') || entry.name.startsWith('.')) return false;
            return entry.name.match(/\.(jpg|jpeg|png|webp)$/i);
        });

        const total = validEntries.length;
        createJob(matchId, total);

        const insertPhoto = db.prepare('INSERT INTO photos (id, matchId, filePath, previewPath) VALUES (?, ?, ?, ?)');
        let processed = 0;

        // Process images one by one to avoid memory spikes
        for (const entry of validEntries) {
            try {
                const photoId = uuidv4();
                const rawPath = path.join(rawDir, entry.name);
                const previewFilename = `${path.basename(entry.name, path.extname(entry.name))}_preview.jpg`;
                const previewPath = path.join(previewDir, previewFilename);

                // Save raw
                fs.writeFileSync(rawPath, entry.getData());

                // Generate preview
                await sharp(rawPath)
                    .resize({ width: 400 })
                    .jpeg({ quality: 80 })
                    .toFile(previewPath);

                // Insert to DB
                insertPhoto.run(photoId, matchId, rawPath, previewPath);

                processed++;
                updateProgress(matchId, processed);

                // Small delay every 100 images to avoid blocking event loop
                if (processed % 100 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            } catch (err) {
                console.error(`Failed to process ${entry.name}:`, err);
                // Continue with next image even if one fails
            }
        }

        completeJob(matchId);

        // Cleanup temp ZIP
        fs.unlinkSync(zipPath);

        console.log(`✅ Completed processing ${processed}/${total} photos for match ${matchId}`);
    } catch (error: any) {
        console.error('Background processing error:', error);
        failJob(matchId, error.message);

        // Cleanup on error
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }
    }
}
