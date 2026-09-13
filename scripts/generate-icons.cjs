// Regenerates web and Android icons from the full-bleed, centered raster logo in
// static/logo/fit-m8-logo-black.png.
// Re-run this after replacing that source image. Requires `sharp` (devDependency).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SOURCE_IMAGE = path.join(ROOT, "static", "logo", "fit-m8-logo-green-white.png");

async function render(size, outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await sharp(SOURCE_IMAGE).resize(size, size).png().toFile(outPath);
    console.log("wrote", path.relative(ROOT, outPath));
}

async function main() {
    const iconsDir = path.join(ROOT, "static", "icons");

    await render(192, path.join(iconsDir, "icon-192.png"));
    await render(512, path.join(iconsDir, "icon-512.png"));
    await render(192, path.join(iconsDir, "icon-192-maskable.png"));
    await render(512, path.join(iconsDir, "icon-512-maskable.png"));

    // Favicon (rendered larger than displayed size for crisp downscaling by the browser).
    await render(96, path.join(ROOT, "static", "favicon.png"));

    const androidResDir = path.join(ROOT, "app", "src", "main", "res");
    if (!fs.existsSync(androidResDir)) return;

    const androidSizes = [
        { density: "mdpi", notification: 24, splash: 300, launcher: 48, maskable: 82 },
        { density: "hdpi", notification: 36, splash: 450, launcher: 72, maskable: 123 },
        { density: "xhdpi", notification: 48, splash: 600, launcher: 96, maskable: 164 },
        { density: "xxhdpi", notification: 72, splash: 900, launcher: 144, maskable: 246 },
        { density: "xxxhdpi", notification: 96, splash: 1200, launcher: 192, maskable: 328 },
    ];

    for (const sizes of androidSizes) {
        const drawableDir = path.join(androidResDir, `drawable-${sizes.density}`);
        const mipmapDir = path.join(androidResDir, `mipmap-${sizes.density}`);
        await render(sizes.notification, path.join(drawableDir, "ic_notification_icon.png"));
        await render(sizes.splash, path.join(drawableDir, "splash.png"));
        await render(sizes.launcher, path.join(mipmapDir, "ic_launcher.png"));
        await render(sizes.maskable, path.join(mipmapDir, "ic_maskable.png"));
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
