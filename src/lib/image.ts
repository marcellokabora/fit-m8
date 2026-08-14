// Client-side image resize/compression so uploads stay small regardless of the source photo size.

export interface CompressImageOptions {
    maxDimension?: number;
    initialQuality?: number;
    maxBytes?: number;
    mimeType?: string;
}

export async function compressImage(file: File, options: CompressImageOptions = {}): Promise<Blob> {
    const {
        maxDimension = 1024,
        initialQuality = 0.85,
        maxBytes = 1.5 * 1024 * 1024,
        mimeType = 'image/jpeg'
    } = options;

    const bitmap = await createImageBitmap(file);
    try {
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Your browser can't process images");
        ctx.drawImage(bitmap, 0, 0, width, height);

        let quality = initialQuality;
        let blob = await canvasToBlob(canvas, mimeType, quality);
        // Step quality down until the file fits the target size, so huge source photos never get rejected.
        while (blob.size > maxBytes && quality > 0.35) {
            quality -= 0.15;
            blob = await canvasToBlob(canvas, mimeType, quality);
        }
        return blob;
    } finally {
        bitmap.close();
    }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed'))), type, quality);
    });
}
