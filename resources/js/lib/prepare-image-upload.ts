/** Réduit / convertit les photos caméra avant envoi (limite PHP, HEIC iPhone, gros zoom). */
const OPTIMIZE_SIZE_THRESHOLD_BYTES = 1024 * 1024; // 1 Mo
const SMALL_FILE_SKIP_BYTES = 400 * 1024; // 400 Ko — JPEG déjà léger
const MAX_DIMENSION = 2040;
const JPEG_QUALITY = 0.82;

function isImageFile(file: File): boolean {
    if (file.type.startsWith('image/')) {
        return true;
    }

    return /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name);
}

function isHeicLike(file: File): boolean {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    return (
        type.includes('heic') ||
        type.includes('heif') ||
        name.endsWith('.heic') ||
        name.endsWith('.heif')
    );
}

function shouldOptimize(file: File, width: number, height: number): boolean {
    const maxSide = Math.max(width, height);

    if (isHeicLike(file)) {
        return true;
    }

    if (maxSide > MAX_DIMENSION) {
        return true;
    }

    if (file.size > OPTIMIZE_SIZE_THRESHOLD_BYTES) {
        return true;
    }

    return false;
}

async function encodeAsJpeg(
    bitmap: ImageBitmap,
    width: number,
    height: number,
): Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', JPEG_QUALITY);
    });
}

/**
 * Redimensionne et convertit en JPEG si nécessaire (caméra, HEIC, photos > 1 Mo).
 */
export async function prepareImageForUpload(file: File): Promise<File> {
    if (!isImageFile(file)) {
        return file;
    }

    try {
        const bitmap = await createImageBitmap(file);
        const maxSide = Math.max(bitmap.width, bitmap.height);
        const heic = isHeicLike(file);

        const skip =
            !heic &&
            !shouldOptimize(file, bitmap.width, bitmap.height) &&
            file.size <= SMALL_FILE_SKIP_BYTES &&
            (file.type === 'image/jpeg' || file.type === 'image/jpg');

        if (skip) {
            bitmap.close();
            return file;
        }

        const scale = Math.min(1, MAX_DIMENSION / maxSide);
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));

        const blob = await encodeAsJpeg(bitmap, width, height);
        bitmap.close();

        if (!blob) {
            return file;
        }

        const mustUseOutput = heic || maxSide > MAX_DIMENSION || file.size > OPTIMIZE_SIZE_THRESHOLD_BYTES;

        if (!mustUseOutput && blob.size >= file.size) {
            return file;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';

        return new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    } catch {
        return file;
    }
}
