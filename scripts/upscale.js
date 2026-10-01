import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), '_backup_original_images');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'gallery');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Exact specifications for each image
const imageConfigs = [
  {
    source: 'IMG-20241205-WA0039.jpeg',
    outBase: 'tribal-maori-01',
    crop: null, // Full image
    targetWidth: 1080,
    sharpen: { sigma: 1.1, m1: 0.9, m2: 2.2 },
    saturation: 1.02
  },
  {
    source: 'IMG-20241205-WA0041.jpeg',
    outBase: 'tribal-maori-02',
    crop: null,
    targetWidth: 1080,
    sharpen: { sigma: 1.1, m1: 0.9, m2: 2.2 },
    saturation: 1.02
  },
  {
    source: 'IMG-20241205-WA0043.jpeg',
    outBase: 'tribal-maori-03',
    crop: null,
    targetWidth: 1080,
    sharpen: { sigma: 1.1, m1: 0.9, m2: 2.2 },
    saturation: 1.02
  },
  {
    source: 'IMG_20240601_130624579.jpg',
    outBase: 'realismo-sirena-01',
    crop: null,
    targetWidth: 1080,
    sharpen: { sigma: 1.2, m1: 0.8, m2: 2.0 },
    saturation: 1.05
  },
  {
    source: 'Screenshot_20230411-135612.png',
    outBase: 'realismo-buho-01',
    // Crop status bar & FB controls: content is y: 154 to 746
    crop: { left: 0, top: 154, width: 413, height: 592 },
    targetWidth: 1080,
    sharpen: { sigma: 1.2, m1: 1.0, m2: 2.5 },
    saturation: 1.08
  },
  {
    source: 'Screenshot_20230411-135626.png',
    outBase: 'realismo-tigre-01',
    // Crop status bar & FB controls
    crop: { left: 0, top: 250, width: 413, height: 400 },
    targetWidth: 1200,
    sharpen: { sigma: 1.2, m1: 1.0, m2: 2.5 },
    saturation: 1.05
  },
  {
    source: 'Screenshot_20230713-180007-022.png',
    outBase: 'grabado-sol-luna-01',
    // Crop Google Photos bottom UI buttons
    crop: { left: 0, top: 0, width: 601, height: 640 },
    targetWidth: 1200,
    sharpen: { sigma: 1.1, m1: 0.9, m2: 2.0 },
    saturation: 1.03
  },
  {
    source: 'Screenshot_20230713-180646-571.png',
    outBase: 'color-galaxia-01',
    // Crop bottom black bar (y: 0 to 753)
    crop: { left: 0, top: 0, width: 720, height: 753 },
    targetWidth: 1200,
    sharpen: { sigma: 1.1, m1: 0.8, m2: 2.0 },
    saturation: 1.12 // Enhance vibrant galaxy colors!
  },
  {
    source: 'Screenshot_20230713-180702-959.png',
    outBase: 'realismo-dark-01',
    // Crop bottom black bar (y: 0 to 770)
    crop: { left: 0, top: 0, width: 720, height: 770 },
    targetWidth: 1200,
    sharpen: { sigma: 1.2, m1: 1.0, m2: 2.4 },
    saturation: 1.02
  },
  {
    source: 'Screenshot_20230713-180718-725.png',
    outBase: 'realismo-jaguar-01',
    crop: null, // Full image
    targetWidth: 1080,
    sharpen: { sigma: 1.2, m1: 0.9, m2: 2.2 },
    saturation: 1.02
  },
  {
    source: 'FB_IMG_1709073232565.jpg',
    outBase: 'realismo-abeja-01',
    crop: null, // Full image 720x701
    targetWidth: 1200,
    sharpen: { sigma: 1.1, m1: 0.8, m2: 2.0 },
    saturation: 1.02
  },
  {
    source: 'WhatsApp Image 2026-10-01 at 10.47.39.jpeg',
    outBase: 'biomecanico-cyber-01',
    crop: null, // Already high-res 1097x1599
    targetWidth: 1400,
    sharpen: { sigma: 1.1, m1: 0.8, m2: 2.0 },
    saturation: 1.04
  },
  {
    source: 'WhatsApp Image 2026-10-01 at 15.56.53.jpeg',
    outBase: 'color-craneo-demonio-01',
    crop: { left: 0, top: 0, width: 720, height: 728 },
    targetWidth: 1200,
    sharpen: { sigma: 1.1, m1: 0.9, m2: 2.2 },
    saturation: 1.08
  }
];

async function runUpscale() {
  console.log('🚀 Starting Super-Resolution & Optimization Pipeline...');
  console.log(`📁 Source: ${BACKUP_DIR}`);
  console.log(`📁 Destination: ${OUTPUT_DIR}\n`);

  for (const config of imageConfigs) {
    const srcPath = path.join(BACKUP_DIR, config.source);
    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️ Source not found: ${config.source}`);
      continue;
    }

    let pipeline = sharp(srcPath).rotate(); // Auto-rotate if EXIF orientation

    if (config.crop) {
      pipeline = pipeline.extract(config.crop);
    }

    // Upscale with Lanczos3 resampling
    pipeline = pipeline.resize({
      width: config.targetWidth,
      fit: 'inside',
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false
    });

    // Sharpen needle details
    if (config.sharpen) {
      pipeline = pipeline.sharpen(config.sharpen);
    }

    // Tone & saturation enhancement
    if (config.saturation) {
      pipeline = pipeline.modulate({ saturation: config.saturation });
    }

    const outJpg = path.join(OUTPUT_DIR, `${config.outBase}.jpg`);
    const outWebp = path.join(OUTPUT_DIR, `${config.outBase}.webp`);

    // Save as high-quality WebP
    await pipeline
      .clone()
      .webp({ quality: 92, effort: 6 })
      .toFile(outWebp);

    // Save as high-quality JPG (mozjpeg)
    await pipeline
      .clone()
      .jpeg({ quality: 94, mozjpeg: true })
      .toFile(outJpg);

    const srcStat = fs.statSync(srcPath);
    const webpStat = fs.statSync(outWebp);
    const jpgStat = fs.statSync(outJpg);
    const meta = await sharp(outWebp).metadata();

    console.log(`✅ [${config.outBase}]`);
    console.log(`   Dimension: ${meta.width}x${meta.height}`);
    console.log(`   Original: ${(srcStat.size / 1024).toFixed(1)} KB`);
    console.log(`   Upscaled WebP: ${(webpStat.size / 1024).toFixed(1)} KB`);
    console.log(`   Upscaled JPG: ${(jpgStat.size / 1024).toFixed(1)} KB\n`);
  }

  console.log('✨ All 12 master images upscaled and generated in public/gallery/!');
}

runUpscale().catch(err => {
  console.error('❌ Pipeline error:', err);
  process.exit(1);
});
