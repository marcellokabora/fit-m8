// Client-side image resize/compression so uploads stay small regardless of the source photo size.

import type { Gender } from './types';

// Stock portraits shown in place of a missing profile photo, picked deterministically per user.
const FEMALE_FALLBACK_PHOTOS = [
    'https://images.unsplash.com/photo-1686753767461-35673e3dfa77?q=80&w=687&auto=format',
    'https://images.unsplash.com/photo-1779862766057-0929f1b077f4?q=80&w=1470&auto=format',
    'https://images.unsplash.com/photo-1565133259541-6c75cef7551e?auto=format',
    'https://plus.unsplash.com/premium_photo-1719607034984-d097cec0a36d?q=80&w=687&auto=format',
    'https://images.unsplash.com/photo-1587085132849-60e76ff03ffe?q=80&w=687&auto=format',
    'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1026&auto=format',
    'https://plus.unsplash.com/premium_photo-1664352957776-db31192974f1?q=80&w=686&auto=format',
    'https://images.unsplash.com/photo-1677368744545-c5a4d7de7225?q=80&w=687&auto=format',
    'https://images.unsplash.com/photo-1609540204874-3f48f851636c?q=80&w=764&auto=format',
    'https://plus.unsplash.com/premium_photo-1661302905558-c2ab3431968c?q=80&w=687&auto=format'
];

const MALE_FALLBACK_PHOTOS = [
    'https://images.unsplash.com/photo-1521138054413-5a47d349b7af?q=80&w=736&auto=format',
    'https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?q=80&w=1470&auto=format',
    'https://images.unsplash.com/photo-1593055497705-59a84c5928b2?q=80&w=687&auto=format',
    'https://plus.unsplash.com/premium_photo-1722859256646-1db0b4150f88?q=80&w=1576&auto=format',
    'https://images.unsplash.com/photo-1758922769578-68c5ba000d87?q=80&w=687&auto=format',
    'https://images.unsplash.com/photo-1723236900134-63561e5832b3?q=80&w=687&auto=format',
    'https://images.unsplash.com/photo-1562552052-f6dda78e2a4d?w=500&auto=format',
    'https://images.unsplash.com/photo-1601025678763-e8f5835995db?q=80&w=687&auto=format',
    'https://images.unsplash.com/photo-1640117227173-b6970c105b1e?q=80&w=765&auto=format',
    'https://images.unsplash.com/photo-1569970287880-b421ed294ab7?q=80&w=1471&auto=format'
];

// Same uid always maps to the same stock photo, so a given profile doesn't visually change between renders.
export function getFallbackPhotoURL(uid: string, gender: Gender | ''): string {
    const pool = gender === 'male' ? MALE_FALLBACK_PHOTOS : FEMALE_FALLBACK_PHOTOS;
    let hash = 0;
    for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
    return pool[hash % pool.length];
}

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
