import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ANDROID_RES_DIR = 'android/app/src/main/res';
const PUBLIC_ICONS_DIR = 'public/icons';

const mipmapSizes = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 },
];

const splashSizes = [
  { name: 'mdpi', width: 320, height: 480 },
  { name: 'hdpi', width: 480, height: 800 },
  { name: 'xhdpi', width: 720, height: 1280 },
  { name: 'xxhdpi', width: 960, height: 1600 },
  { name: 'xxxhdpi', width: 1280, height: 1920 },
];

const landSplashSizes = [
  { name: 'mdpi', width: 480, height: 320 },
  { name: 'hdpi', width: 800, height: 480 },
  { name: 'xhdpi', width: 1280, height: 720 },
  { name: 'xxhdpi', width: 1600, height: 960 },
  { name: 'xxxhdpi', width: 1920, height: 1280 },
];

async function generateIcons() {
  console.log('开始生成 Android 图标...');
  
  const iconSvg = join(PUBLIC_ICONS_DIR, 'icon.svg');
  const iconPng = join(PUBLIC_ICONS_DIR, 'icon-512.png');
  
  for (const { name, size } of mipmapSizes) {
    const mipmapDir = join(ANDROID_RES_DIR, `mipmap-${name}`);
    if (!existsSync(mipmapDir)) {
      mkdirSync(mipmapDir, { recursive: true });
    }
    
    const foregroundDir = join(ANDROID_RES_DIR, `mipmap-${name}`);
    if (!existsSync(foregroundDir)) {
      mkdirSync(foregroundDir, { recursive: true });
    }
    
    try {
      await sharp(iconPng)
        .resize(size, size)
        .png()
        .toFile(join(mipmapDir, 'ic_launcher.png'));
      
      await sharp(iconPng)
        .resize(size, size)
        .png()
        .toFile(join(mipmapDir, 'ic_launcher_round.png'));
      
      await sharp(iconPng)
        .resize(Math.round(size * 0.67), Math.round(size * 0.67))
        .extend({
          top: Math.round(size * 0.17),
          bottom: Math.round(size * 0.17),
          left: Math.round(size * 0.17),
          right: Math.round(size * 0.17),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(join(foregroundDir, 'ic_launcher_foreground.png'));
      
      console.log(`  ✓ mipmap-${name} (${size}x${size})`);
    } catch (err) {
      console.error(`  ✗ mipmap-${name} 失败:`, err.message);
    }
  }
}

async function generateSplashScreens() {
  console.log('开始生成启动页...');
  
  const iconPng = join(PUBLIC_ICONS_DIR, 'icon-512.png');
  
  const whiteIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <g fill="white">
      <rect x="80" y="80" width="120" height="120" rx="20"/>
      <rect x="312" y="80" width="120" height="120" rx="20"/>
      <rect x="80" y="312" width="120" height="120" rx="20"/>
      <rect x="120" y="120" width="40" height="40" rx="8" fill="#4f46e5"/>
      <rect x="352" y="120" width="40" height="40" rx="8" fill="#4f46e5"/>
      <rect x="120" y="352" width="40" height="40" rx="8" fill="#4f46e5"/>
      <rect x="240" y="80" width="32" height="32" rx="4"/>
      <rect x="240" y="144" width="32" height="32" rx="4"/>
      <rect x="80" y="240" width="32" height="32" rx="4"/>
      <rect x="144" y="240" width="32" height="32" rx="4"/>
      <rect x="240" y="240" width="32" height="32" rx="4"/>
      <rect x="304" y="240" width="32" height="32" rx="4"/>
      <rect x="240" y="304" width="32" height="32" rx="4"/>
      <rect x="304" y="304" width="32" height="32" rx="4"/>
      <rect x="368" y="304" width="32" height="32" rx="4"/>
      <rect x="304" y="368" width="32" height="32" rx="4"/>
      <rect x="368" y="368" width="64" height="64" rx="12"/>
    </g>
  </svg>`;
  
  for (const { name, width, height } of splashSizes) {
    const drawableDir = join(ANDROID_RES_DIR, `drawable-port-${name}`);
    if (!existsSync(drawableDir)) {
      mkdirSync(drawableDir, { recursive: true });
    }
    
    try {
      const iconSize = Math.min(width, height) * 0.5;
      const iconX = (width - iconSize) / 2;
      const iconY = (height - iconSize) / 2;
      
      const iconResized = await sharp(Buffer.from(whiteIconSvg))
        .resize(Math.round(iconSize), Math.round(iconSize))
        .toBuffer();
      
      const gradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4f46e5"/>
            <stop offset="100%" style="stop-color:#ec4899"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>`;
      
      const gradientBuffer = await sharp(Buffer.from(gradientSvg))
        .resize(width, height)
        .png()
        .toBuffer();
      
      await sharp(gradientBuffer)
        .composite([{
          input: iconResized,
          left: Math.round(iconX),
          top: Math.round(iconY)
        }])
        .png()
        .toFile(join(drawableDir, 'splash.png'));
      
      console.log(`  ✓ drawable-port-${name} (${width}x${height})`);
    } catch (err) {
      console.error(`  ✗ drawable-port-${name} 失败:`, err.message);
    }
  }
  
  for (const { name, width, height } of landSplashSizes) {
    const drawableDir = join(ANDROID_RES_DIR, `drawable-land-${name}`);
    if (!existsSync(drawableDir)) {
      mkdirSync(drawableDir, { recursive: true });
    }
    
    try {
      const iconSize = Math.min(width, height) * 0.5;
      const iconX = (width - iconSize) / 2;
      const iconY = (height - iconSize) / 2;
      
      const iconResized = await sharp(Buffer.from(whiteIconSvg))
        .resize(Math.round(iconSize), Math.round(iconSize))
        .toBuffer();
      
      const gradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4f46e5"/>
            <stop offset="100%" style="stop-color:#ec4899"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>`;
      
      const gradientBuffer = await sharp(Buffer.from(gradientSvg))
        .resize(width, height)
        .png()
        .toBuffer();
      
      await sharp(gradientBuffer)
        .composite([{
          input: iconResized,
          left: Math.round(iconX),
          top: Math.round(iconY)
        }])
        .png()
        .toFile(join(drawableDir, 'splash.png'));
      
      console.log(`  ✓ drawable-land-${name} (${width}x${height})`);
    } catch (err) {
      console.error(`  ✗ drawable-land-${name} 失败:`, err.message);
    }
  }
}

async function main() {
  console.log('=== Android 图标和启动页生成器 ===\n');
  
  await generateIcons();
  console.log('');
  await generateSplashScreens();
  
  console.log('\n✅ 完成！');
}

main().catch(console.error);
