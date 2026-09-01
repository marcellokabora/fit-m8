// Regenerates static/icons/*.png and static/favicon.png from the raster logo in
// static/logo/fit-m8-green.jpg. That source is already full-bleed/centered artwork, so this
// just resizes it as-is - no cropping, recoloring, or recentering.
// Re-run this after replacing that source image. Requires `sharp` (devDependency).
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC_JPG = path.join(ROOT, "static", "logo", "fit-m8-green.jpg");

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
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
