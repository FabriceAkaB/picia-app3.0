const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function createSample() {
    const dir = path.join(process.cwd(), 'sample-data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    console.log('Generating 50 sample images...');
    const zip = new AdmZip();

    for (let i = 1; i <= 50; i++) {
        // Generate random color image
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);

        const buffer = await sharp({
            create: {
                width: 600,
                height: 400,
                channels: 3,
                background: { r, g, b }
            }
        })
            .composite([{
                input: Buffer.from(`<svg><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-size="100" fill="white">#${i}</text></svg>`),
                top: 0,
                left: 0
            }]) // simple text overlay using SVG
            .jpeg()
            .toBuffer();

        zip.addFile(`photo_${i}.jpg`, buffer);
    }

    zip.writeZip(path.join(dir, 'sample_photos.zip'));
    console.log('Created sample_photos.zip in sample-data/');
}

createSample();
