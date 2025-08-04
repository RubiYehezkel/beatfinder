interface Colors {
  [key: string]: number;
}

export function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to get 2D context'));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colors: Colors = {};

      const ignoreLightColorThreshold = 200; // Lower threshold to ignore light colors
      const greyRangeThreshold = 30; // Range within which RGB values are considered grey

      // Define an area of interest (e.g., the central part of the image)
      const areaOfInterest = {
        startX: canvas.width * 0.25,
        startY: canvas.height * 0.25,
        endX: canvas.width * 0.75,
        endY: canvas.height * 0.75,
      };

      for (let y = areaOfInterest.startY; y < areaOfInterest.endY; y++) {
        for (let x = areaOfInterest.startX; x < areaOfInterest.endX; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];

          // Skip very light colors
          if (
            r > ignoreLightColorThreshold &&
            g > ignoreLightColorThreshold &&
            b > ignoreLightColorThreshold
          )
            continue;

          // Skip greyish colors
          if (
            Math.abs(r - g) < greyRangeThreshold &&
            Math.abs(g - b) < greyRangeThreshold &&
            Math.abs(b - r) < greyRangeThreshold
          )
            continue;

          // Group similar colors
          const color = `${Math.round(r / 10) * 10},${
            Math.round(g / 10) * 10
          },${Math.round(b / 10) * 10}`;
          if (!colors[color]) {
            colors[color] = 1;
          } else {
            colors[color]++;
          }
        }
      }

      // Find the most dominant color
      let maxCount = 0;
      let dominantColor = '';
      for (const color in colors) {
        if (colors.hasOwnProperty(color)) {
          if (colors[color] > maxCount) {
            maxCount = colors[color];
            dominantColor = color;
          }
        }
      }

      resolve(dominantColor);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = imageUrl;
  });
}
