import { BrowserQRCodeReader } from '@zxing/browser';

export class StaffQrVideoReader extends BrowserQRCodeReader {
  private readonly center = document.createElement('canvas');

  override decodeFromCanvas(frame: HTMLCanvasElement) {
    try {
      return super.decodeFromCanvas(frame);
    } catch (error) {
      // The on-screen guide centers the QR. Exclude its surroundings on a second pass.
      const side = Math.floor(Math.min(frame.width, frame.height) / 2);
      const drawing = this.center.getContext('2d', { willReadFrequently: true });
      if (!side || drawing === null) {
        throw error;
      }
      if (this.center.width !== side || this.center.height !== side) {
        this.center.width = side;
        this.center.height = side;
      }
      drawing.drawImage(
        frame,
        (frame.width - side) / 2,
        (frame.height - side) / 2,
        side,
        side,
        0,
        0,
        side,
        side,
      );
      return super.decodeFromCanvas(this.center);
    }
  }
}
