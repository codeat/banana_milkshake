/**
 * Copyright 2026 Google LLC
 */

import pica from 'pica';

const picaResizer = pica();

/**
 * Crops an image to a target size using a "cover" strategy and resizes it using pica.
 * @param base64Image The source image as a base64 string.
 * @param targetWidth The target width in pixels.
 * @param targetHeight The target height in pixels.
 * @return A promise that resolves to the cropped image URL and original dimensions.
 */
export function cropImageToSize(
  base64Image: string,
  targetWidth: number,
  targetHeight: number
): Promise<{
  croppedImageUrl: string;
  originalWidth: number;
  originalHeight: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate "cover" strategy
      const imgRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;

      let sx: number;
      let sy: number;
      let sWidth: number;
      let sHeight: number;

      if (imgRatio > targetRatio) {
        // Image is wider than target
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        // Image is taller than target
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      // Create temporary canvas for cropped source
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = sWidth;
      tempCanvas.height = sHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        reject(new Error('Could not get temporary canvas context'));
        return;
      }

      // Draw cropped portion to temporary canvas
      tempCtx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        sWidth,
        sHeight
      );

      // Use pica to resize to target canvas
      picaResizer.resize(tempCanvas, canvas, { filter: 'lanczos3' })
        .then(() => {
          resolve({
            croppedImageUrl: canvas.toDataURL('image/png'),
            originalWidth: img.width,
            originalHeight: img.height,
          });
        })
        .catch((err: Error) => {
          reject(new Error(`Failed to resize image with pica: ${err.message}`));
        });
    };
    img.onerror = () => reject(new Error('Failed to load image for cropping'));
    img.src = base64Image;
  });
}
