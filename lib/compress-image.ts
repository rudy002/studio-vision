// Compression côté navigateur avant upload vers R2 :
// redimensionne à 2000 px max et ré-encode en JPEG qualité 85 %.
// Une photo de téléphone de 4-8 Mo descend ainsi à ~200-400 Ko.

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;
// En dessous de ce poids et des dimensions max, l'original est conservé tel quel
const SKIP_BELOW_BYTES = 500 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    // 'from-image' applique la rotation EXIF (photos de téléphone prises en portrait)
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));

    if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );

    // Échec d'encodage ou résultat plus lourd que l'original → on garde l'original
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    // Format non décodable par le navigateur → upload de l'original
    return file;
  }
}
