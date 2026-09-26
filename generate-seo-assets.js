/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAllSeoAssets() {
  const width = 1200;
  const height = 630;
  const publicDir = path.join(__dirname, 'public');
  const appDir = path.join(__dirname, 'app');

  console.log('Generating high-res SEO assets for Madar Electronics...');

  // 1. Check logo
  const logoPath = path.join(publicDir, 'logo.webp');
  let logoBuffer;
  if (fs.existsSync(logoPath)) {
    logoBuffer = await sharp(logoPath)
      .resize({ height: 250, width: 800, fit: 'inside' })
      .toFormat('png')
      .toBuffer();
  } else {
    console.error('logo.webp not found at:', logoPath);
    return;
  }

  const logoMeta = await sharp(logoBuffer).metadata();

  // SVG background
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#021c1e" />
          <stop offset="40%" stop-color="#04454A" />
          <stop offset="100%" stop-color="#08666f" />
        </linearGradient>
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="30" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background Gradient -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

      <!-- Glowing ambient orbs -->
      <circle cx="1080" cy="90" r="320" fill="#0da2c0" opacity="0.22" filter="url(#glow)" />
      <circle cx="90" cy="540" r="260" fill="#0889A2" opacity="0.18" filter="url(#glow)" />
      <circle cx="600" cy="315" r="400" fill="#ffffff" opacity="0.02" />

      <!-- Top Badge Pill -->
      <g transform="translate(380, 48)">
        <rect width="440" height="42" rx="21" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.5" />
        <text x="220" y="27" font-family="'Cairo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#FDE047" text-anchor="middle" direction="rtl">⭐ المتجر الأول للأجهزة الإلكترونية بالتقسيط المريح</text>
      </g>

      <!-- Main Glass Card Container -->
      <rect x="70" y="115" width="1060" height="440" rx="24" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" filter="url(#cardShadow)" />

      <!-- White Inner Backdrop behind logo for crystal clear clarity -->
      <rect x="250" y="145" width="700" height="250" rx="20" fill="rgba(255, 255, 255, 0.95)" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1" filter="url(#cardShadow)" />

      <!-- Bottom Tagline & Features in 3 Badges -->
      <!-- Feature 1 -->
      <g transform="translate(130, 470)">
        <rect width="280" height="54" rx="16" fill="rgba(0, 0, 0, 0.35)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
        <text x="140" y="34" font-family="'Cairo', system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#FFFFFF" text-anchor="middle" direction="rtl">🚚 توصيل سريع لكافة المناطق</text>
      </g>

      <!-- Feature 2 -->
      <g transform="translate(460, 470)">
        <rect width="280" height="54" rx="16" fill="rgba(0, 0, 0, 0.35)" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5" />
        <text x="140" y="34" font-family="'Cairo', system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#38BDF8" text-anchor="middle" direction="rtl">💳 تقسيط مريح وبدون فوائد</text>
      </g>

      <!-- Feature 3 -->
      <g transform="translate(790, 470)">
        <rect width="280" height="54" rx="16" fill="rgba(0, 0, 0, 0.35)" stroke="rgba(74, 222, 128, 0.35)" stroke-width="1.5" />
        <text x="140" y="34" font-family="'Cairo', system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#4ADE80" text-anchor="middle" direction="rtl">🛡️ منتجات أصلية وضمان معتمد</text>
      </g>

      <!-- Official Domain URL Footer -->
      <text x="600" y="598" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="600" fill="rgba(255, 255, 255, 0.75)" text-anchor="middle" letter-spacing="1.5">https://madarelectronic.com</text>
    </svg>
  `);

  const logoLeft = Math.round(250 + (700 - logoMeta.width) / 2);
  const logoTop = Math.round(145 + (250 - logoMeta.height) / 2);

  const ogPngPath = path.join(publicDir, 'og-image.png');
  const ogJpgPath = path.join(publicDir, 'og-image.jpg');
  const appOgPath = path.join(appDir, 'opengraph-image.png');
  const appTwitterPath = path.join(appDir, 'twitter-image.png');

  await sharp(svgOverlay)
    .composite([
      {
        input: logoBuffer,
        top: logoTop,
        left: logoLeft,
      }
    ])
    .png({ quality: 95 })
    .toFile(ogPngPath);

  console.log('Created:', ogPngPath);

  await sharp(ogPngPath)
    .jpeg({ quality: 90 })
    .toFile(ogJpgPath);

  console.log('Created:', ogJpgPath);

  fs.copyFileSync(ogPngPath, appOgPath);
  fs.copyFileSync(ogPngPath, appTwitterPath);
  console.log('Copied to app/opengraph-image.png and app/twitter-image.png');

  // Also generate standard icon files if needed
  const manifest512Path = path.join(publicDir, 'web-app-manifest-512x512.png');
  if (fs.existsSync(manifest512Path)) {
    await sharp(manifest512Path).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
    await sharp(manifest512Path).resize(32, 32).toFile(path.join(publicDir, 'favicon-32x32.png'));
    await sharp(manifest512Path).resize(16, 16).toFile(path.join(publicDir, 'favicon-16x16.png'));
    await sharp(manifest512Path).resize(192, 192).toFile(path.join(publicDir, 'android-chrome-192x192.png'));
    await sharp(manifest512Path).resize(512, 512).toFile(path.join(publicDir, 'android-chrome-512x512.png'));
    console.log('Created standard favicon and apple-touch-icon sizes');
  }

  console.log('All SEO image assets successfully generated!');
}

generateAllSeoAssets().catch(err => {
  console.error('Error generating SEO assets:', err);
  process.exit(1);
});
