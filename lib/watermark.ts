import sharp from 'sharp';
import path from 'path';

export async function createWatermarkedPreview(inputPath: string): Promise<Buffer> {
    const width = 800;
    const text = 'PREVIEW - SAMPLE';

    // Create an SVG buffer for the watermark text
    const svgImage = `
    <svg width="${width}" height="${width}" viewBox="0 0 ${width} ${width}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { fill: rgba(255, 255, 255, 0.5); font-size: 60px; font-weight: bold; transform-box: fill-box; transform-origin: center; transform: rotate(-45deg); text-anchor: middle; dominant-baseline: middle; }
      </style>
      <text x="50%" y="50%" class="title">${text}</text>
    </svg>
    `;

    const svgBuffer = Buffer.from(svgImage);

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Resize and composite
        return await image
            .resize({ width: width, withoutEnlargement: true })
            .composite([{
                input: svgBuffer,
                gravity: 'center',
                blend: 'over'
            }])
            .jpeg({ quality: 70 })
            .toBuffer();
    } catch (error) {
        console.error('Error creating watermark:', error);
        throw error;
    }
}
