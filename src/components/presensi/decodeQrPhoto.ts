import { BrowserQRCodeReader } from '@zxing/browser';

/** Reads a phone photo at bounded resolutions, then looks closer at the center.
 * @param url - Object URL of the selected photo.
 * @returns The text encoded in the QR.
 */
export async function decodeQrPhoto(url: string) {
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  const drawing = canvas.getContext('2d', { willReadFrequently: true });
  if (drawing === null) {
    throw new Error('Canvas unavailable');
  }
  const reader = new BrowserQRCodeReader();
  for (const [fraction, limit] of [
    [1, 1000],
    [1, 2200],
    [0.5, 1440],
    [0.25, 1440],
  ] as const) {
    const width = image.naturalWidth * fraction;
    const height = image.naturalHeight * fraction;
    const scale = Math.min(1, limit / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    drawing.drawImage(
      image,
      (image.naturalWidth - width) / 2,
      (image.naturalHeight - height) / 2,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    try {
      return reader.decodeFromCanvas(canvas).getText();
    } catch {
      // A small or distant QR may need more pixels or a tighter crop.
    }
  }
  throw new Error('Unreadable QR photo');
}
