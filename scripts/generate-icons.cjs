// Regenerates static/icons/*.png, static/favicon.png and static/og-image.png from the
// raster logo in static/fit-m8-v2.jpg. That source is already full-bleed/centered
// artwork, so this just resizes it as-is - no cropping, recoloring, or recentering.
// Re-run this after replacing that source image. Requires `sharp` (devDependency).
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC_JPG = path.join(ROOT, "static", "fit-m8-v2.jpg");
const BG = { r: 0x1a, g: 0x10, b: 0x06 }; // --color-bg

async function render(size, outPath) {
    await sharp(SRC_JPG).resize(size, size).png().toFile(outPath);
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

    // Open Graph / Twitter card image for link previews and SEO.
    const ogW = 1200;
    const ogH = 630;
    const logoBox = ogH - 160;
    const logoPng = await sharp(SRC_JPG).resize(logoBox, logoBox).png().toBuffer();
    const textSvg = `<svg width="${ogW}" height="${ogH}" xmlns="http://www.w3.org/2000/svg">
  <text x="${ogW / 2}" y="${ogH - 70}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="64" fill="#f97316" letter-spacing="4">FIT-M8</text>
</svg>`;

    await sharp({ create: { width: ogW, height: ogH, channels: 3, background: BG } })
        .composite([
            { input: logoPng, top: Math.round((ogH - 160 - logoBox) / 2) + 20, left: Math.round((ogW - logoBox) / 2) },
            { input: Buffer.from(textSvg), top: 0, left: 0 }
        ])
        .png()
        .toFile(path.join(ROOT, "static", "og-image.png"));
    console.log("wrote", path.relative(ROOT, path.join(ROOT, "static", "og-image.png")));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
