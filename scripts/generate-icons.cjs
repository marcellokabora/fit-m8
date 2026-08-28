// Regenerates static/icons/*.png, static/favicon.png and static/og-image.png from the
// raster logo in static/fit-m8.jpg (goat/animal mark, orange lines on near-black bg).
// Re-run this after replacing that source image. Requires `sharp` (devDependency).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC_JPG = path.join(ROOT, "static", "fit-m8.jpg");

const BG = { r: 0x1a, g: 0x10, b: 0x06 }; // --color-bg
const FG_THRESHOLD = 40; // pixels darker than this (per channel) are treated as background
const FG_HUE_MARGIN = 30; // require R meaningfully above B so gray JPEG artifacts aren't mistaken for the orange mark

// The mark is orange (high R, low B); the near-black background sometimes contains a faint
// gray compression speck that's bright enough to clear FG_THRESHOLD but isn't part of the
// artwork. Checking R-B rules those specks out so they can't skew the content bounding box.
function isForeground(r, g, b) {
    return r > FG_THRESHOLD && r - b > FG_HUE_MARGIN;
}

// The source jpg's own near-black background isn't an exact match for --color-bg, and the
// artwork isn't centered in the 1024x1024 canvas, so: crop to the actual content bounds,
// recolor its background field to the exact brand color, then re-center on each icon canvas.
async function loadContent() {
    const { data, info } = await sharp(SRC_JPG).raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            const i = (y * width + x) * channels;
            if (isForeground(data[i], data[i + 1], data[i + 2])) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    const pad = 20;
    const left = Math.max(0, minX - pad);
    const top = Math.max(0, minY - pad);
    const cropW = Math.min(width - left, maxX - minX + pad * 2);
    const cropH = Math.min(height - top, maxY - minY + pad * 2);

    const { data: cropData, info: cropInfo } = await sharp(SRC_JPG)
        .extract({ left, top, width: cropW, height: cropH })
        .raw()
        .toBuffer({ resolveWithObject: true });

    // Recolor everything that isn't the orange mark to the exact brand color.
    for (let i = 0; i < cropData.length; i += cropInfo.channels) {
        if (!isForeground(cropData[i], cropData[i + 1], cropData[i + 2])) {
            cropData[i] = BG.r;
            cropData[i + 1] = BG.g;
            cropData[i + 2] = BG.b;
        }
    }

    return { buffer: cropData, width: cropInfo.width, height: cropInfo.height, channels: cropInfo.channels };
}

// padding may be negative to intentionally bleed the artwork past the canvas edge (it's
// rendered on an oversized canvas first, then center-cropped back down to `size`).
async function canvasWithContent({ content, size, padding }) {
    const box = size - padding * 2;
    const scale = Math.min(box / content.width, box / content.height);
    const rw = Math.round(content.width * scale);
    const rh = Math.round(content.height * scale);
    const resized = await sharp(content.buffer, {
        raw: { width: content.width, height: content.height, channels: content.channels }
    })
        .resize(rw, rh)
        .png()
        .toBuffer();

    const canvasSize = Math.max(size, rw, rh);
    const big = await sharp({
        create: { width: canvasSize, height: canvasSize, channels: 3, background: BG }
    })
        .composite([{ input: resized, gravity: "center" }])
        .png()
        .toBuffer();

    const offset = Math.round((canvasSize - size) / 2);
    return sharp(big).extract({ left: offset, top: offset, width: size, height: size });
}

async function render(pipeline, outPath) {
    await pipeline.png().toFile(outPath);
    console.log("wrote", path.relative(ROOT, outPath));
}

async function main() {
    const content = await loadContent();
    const iconsDir = path.join(ROOT, "static", "icons");

    // Regular ("any") icons - light padding so the mark reads clearly at small sizes.
    await render(await canvasWithContent({ content, size: 192, padding: 20 }), path.join(iconsDir, "icon-192.png"));
    await render(await canvasWithContent({ content, size: 512, padding: 54 }), path.join(iconsDir, "icon-512.png"));

    // Maskable icons: negative padding so the mark bleeds past the safe-zone circle and gets
    // cut off at the extremities (head, legs) the same way on every side, instead of floating
    // with visible margin on one side and touching the edge on another.
    await render(await canvasWithContent({ content, size: 192, padding: -15 }), path.join(iconsDir, "icon-192-maskable.png"));
    await render(await canvasWithContent({ content, size: 512, padding: -40 }), path.join(iconsDir, "icon-512-maskable.png"));

    // Favicon (rendered larger than displayed size for crisp downscaling by the browser).
    await render(await canvasWithContent({ content, size: 96, padding: 10 }), path.join(ROOT, "static", "favicon.png"));

    // Open Graph / Twitter card image for link previews and SEO.
    const ogW = 1200;
    const ogH = 630;
    const logoBox = ogH - 160;
    const scale = Math.min(logoBox / content.width, logoBox / content.height);
    const logoPng = await sharp(content.buffer, {
        raw: { width: content.width, height: content.height, channels: content.channels }
    })
        .resize(Math.round(content.width * scale), Math.round(content.height * scale))
        .png()
        .toBuffer();
    const logoMeta = await sharp(logoPng).metadata();
    const textSvg = `<svg width="${ogW}" height="${ogH}" xmlns="http://www.w3.org/2000/svg">
  <text x="${ogW / 2}" y="${ogH - 70}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="64" fill="#f97316" letter-spacing="4">FIT-M8</text>
</svg>`;

    await render(
        sharp({ create: { width: ogW, height: ogH, channels: 3, background: BG } }).composite([
            {
                input: logoPng,
                top: Math.round((ogH - 160 - logoMeta.height) / 2) + 20,
                left: Math.round((ogW - logoMeta.width) / 2)
            },
            { input: Buffer.from(textSvg), top: 0, left: 0 }
        ]),
        path.join(ROOT, "static", "og-image.png")
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
