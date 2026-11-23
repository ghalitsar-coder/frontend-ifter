import { BrowserQRCodeReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';

function* photoRegions(width: number, height: number) {
  for (const [fraction, limit] of [
    [1, 1000],
    [1, 2200],
    [0.5, 1440],
    [0.25, 1440],
  ] as const) {
    if (limit === 2200 && Math.max(width, height) <= 1000) {
      continue;
    }
    const w = width * fraction;
    const h = height * fraction;
    yield { x: (width - w) / 2, y: (height - h) / 2, w, h, limit };
  }
  // Overlap adjacent crops so a small QR straddling a tile edge can still fit.
  const w = Math.max(1, Math.floor(width * 0.4));
  const h = Math.max(1, Math.floor(height * 0.5));
  for (const v of [0.5, 0, 1]) {
    for (const u of [0, 1, 0.5]) {
      yield { x: Math.floor((width - w) * u), y: Math.floor((height - h) * v), w, h, limit: 1664 };
    }
  }
}

/** Reads a phone photo at bounded resolutions, including QR codes near its edges.
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
  const reader = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, true]]));
  for (const region of photoRegions(image.naturalWidth, image.naturalHeight)) {
    const scale = Math.min(1, region.limit / Math.max(region.w, region.h));
    canvas.width = Math.max(1, Math.round(region.w * scale));
    canvas.height = Math.max(1, Math.round(region.h * scale));
    drawing.drawImage(
      image,
      region.x,
      region.y,
      region.w,
      region.h,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    try {
      return reader.decodeFromCanvas(canvas).getText();
    } catch {
      // Let the phone paint and process input between synchronous decoder attempts.
      // eslint-disable-next-line no-await-in-loop, promise/avoid-new -- scan one crop at a time and yield even on older mobile browsers
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });
    }
  }
  throw new Error('Unreadable QR photo');
}
