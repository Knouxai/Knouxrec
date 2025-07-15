interface WarpPoint {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  influence: number;
}

interface TransformMatrix {
  a: number; // scale x
  b: number; // skew x
  c: number; // skew y
  d: number; // scale y
  e: number; // translate x
  f: number; // translate y
}

interface WarpGrid {
  rows: number;
  cols: number;
  points: Array<Array<{ x: number; y: number }>>;
  controlPoints: Array<Array<{ x: number; y: number }>>;
}

interface PerspectiveTransform {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

class ImageWarpingService {
  private static instance: ImageWarpingService;

  static getInstance(): ImageWarpingService {
    if (!ImageWarpingService.instance) {
      ImageWarpingService.instance = new ImageWarpingService();
    }
    return ImageWarpingService.instance;
  }

  // Create a warp grid for mesh transformation
  createWarpGrid(
    width: number,
    height: number,
    rows: number = 10,
    cols: number = 10,
  ): WarpGrid {
    const grid: WarpGrid = {
      rows,
      cols,
      points: [],
      controlPoints: [],
    };

    const stepX = width / (cols - 1);
    const stepY = height / (rows - 1);

    for (let row = 0; row < rows; row++) {
      grid.points[row] = [];
      grid.controlPoints[row] = [];

      for (let col = 0; col < cols; col++) {
        const x = col * stepX;
        const y = row * stepY;

        grid.points[row][col] = { x, y };
        grid.controlPoints[row][col] = { x, y }; // Initially same as grid points
      }
    }

    return grid;
  }

  // Apply mesh warp transformation
  applyMeshWarp(imageData: ImageData, grid: WarpGrid): ImageData {
    const { width, height } = imageData;
    const resultData = new ImageData(width, height);
    const sourceData = imageData.data;
    const targetData = resultData.data;

    // Initialize target with transparent pixels
    for (let i = 0; i < targetData.length; i += 4) {
      targetData[i + 3] = 0; // Alpha = 0 (transparent)
    }

    const cellWidth = width / (grid.cols - 1);
    const cellHeight = height / (grid.rows - 1);

    // Process each grid cell
    for (let row = 0; row < grid.rows - 1; row++) {
      for (let col = 0; col < grid.cols - 1; col++) {
        // Get the four corners of the current cell
        const topLeft = grid.controlPoints[row][col];
        const topRight = grid.controlPoints[row][col + 1];
        const bottomLeft = grid.controlPoints[row + 1][col];
        const bottomRight = grid.controlPoints[row + 1][col + 1];

        // Original cell corners
        const origTopLeft = grid.points[row][col];
        const origTopRight = grid.points[row][col + 1];
        const origBottomLeft = grid.points[row + 1][col];
        const origBottomRight = grid.points[row + 1][col + 1];

        // Transform this cell
        this.transformQuadrilateral(
          sourceData,
          targetData,
          width,
          height,
          origTopLeft,
          origTopRight,
          origBottomLeft,
          origBottomRight,
          topLeft,
          topRight,
          bottomLeft,
          bottomRight,
        );
      }
    }

    return resultData;
  }

  // Transform a quadrilateral region
  private transformQuadrilateral(
    sourceData: Uint8ClampedArray,
    targetData: Uint8ClampedArray,
    width: number,
    height: number,
    srcTL: { x: number; y: number },
    srcTR: { x: number; y: number },
    srcBL: { x: number; y: number },
    srcBR: { x: number; y: number },
    dstTL: { x: number; y: number },
    dstTR: { x: number; y: number },
    dstBL: { x: number; y: number },
    dstBR: { x: number; y: number },
  ) {
    // Sample the destination quadrilateral
    const samples = 20; // Number of samples per edge

    for (let u = 0; u <= samples; u++) {
      for (let v = 0; v <= samples; v++) {
        const uNorm = u / samples;
        const vNorm = v / samples;

        // Bilinear interpolation in destination space
        const dstX = this.bilinearInterpolate(
          dstTL.x,
          dstTR.x,
          dstBL.x,
          dstBR.x,
          uNorm,
          vNorm,
        );
        const dstY = this.bilinearInterpolate(
          dstTL.y,
          dstTR.y,
          dstBL.y,
          dstBR.y,
          uNorm,
          vNorm,
        );

        // Corresponding point in source space
        const srcX = this.bilinearInterpolate(
          srcTL.x,
          srcTR.x,
          srcBL.x,
          srcBR.x,
          uNorm,
          vNorm,
        );
        const srcY = this.bilinearInterpolate(
          srcTL.y,
          srcTR.y,
          srcBL.y,
          srcBR.y,
          uNorm,
          vNorm,
        );

        // Sample and set pixel
        this.sampleAndSetPixel(
          sourceData,
          targetData,
          width,
          height,
          srcX,
          srcY,
          Math.round(dstX),
          Math.round(dstY),
        );
      }
    }
  }

  // Bilinear interpolation
  private bilinearInterpolate(
    tl: number,
    tr: number,
    bl: number,
    br: number,
    u: number,
    v: number,
  ): number {
    const top = tl * (1 - u) + tr * u;
    const bottom = bl * (1 - u) + br * u;
    return top * (1 - v) + bottom * v;
  }

  // Sample pixel from source and set in target
  private sampleAndSetPixel(
    sourceData: Uint8ClampedArray,
    targetData: Uint8ClampedArray,
    width: number,
    height: number,
    srcX: number,
    srcY: number,
    dstX: number,
    dstY: number,
  ) {
    if (dstX < 0 || dstX >= width || dstY < 0 || dstY >= height) return;
    if (srcX < 0 || srcX >= width || srcY < 0 || srcY >= height) return;

    // Bilinear sampling from source
    const x1 = Math.floor(srcX);
    const y1 = Math.floor(srcY);
    const x2 = Math.min(x1 + 1, width - 1);
    const y2 = Math.min(y1 + 1, height - 1);

    const fx = srcX - x1;
    const fy = srcY - y1;

    const idx1 = (y1 * width + x1) * 4;
    const idx2 = (y1 * width + x2) * 4;
    const idx3 = (y2 * width + x1) * 4;
    const idx4 = (y2 * width + x2) * 4;

    const dstIdx = (dstY * width + dstX) * 4;

    for (let c = 0; c < 4; c++) {
      const top = sourceData[idx1 + c] * (1 - fx) + sourceData[idx2 + c] * fx;
      const bottom =
        sourceData[idx3 + c] * (1 - fx) + sourceData[idx4 + c] * fx;
      const value = top * (1 - fy) + bottom * fy;

      targetData[dstIdx + c] = Math.round(value);
    }
  }

  // Apply perspective transformation
  applyPerspectiveTransform(
    imageData: ImageData,
    transform: PerspectiveTransform,
  ): ImageData {
    const { width, height } = imageData;
    const resultData = new ImageData(width, height);

    // Calculate perspective transformation matrix
    const matrix = this.calculatePerspectiveMatrix(
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: height },
      { x: width, y: height },
      transform.topLeft,
      transform.topRight,
      transform.bottomLeft,
      transform.bottomRight,
    );

    // Apply transformation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sourcePoint = this.applyPerspectiveMatrix(matrix, { x, y });

        if (
          sourcePoint.x >= 0 &&
          sourcePoint.x < width &&
          sourcePoint.y >= 0 &&
          sourcePoint.y < height
        ) {
          const pixel = this.samplePixelBilinear(
            imageData,
            sourcePoint.x,
            sourcePoint.y,
          );
          const targetIdx = (y * width + x) * 4;

          resultData.data[targetIdx] = pixel.r;
          resultData.data[targetIdx + 1] = pixel.g;
          resultData.data[targetIdx + 2] = pixel.b;
          resultData.data[targetIdx + 3] = pixel.a;
        }
      }
    }

    return resultData;
  }

  // Calculate perspective transformation matrix
  private calculatePerspectiveMatrix(
    srcTL: { x: number; y: number },
    srcTR: { x: number; y: number },
    srcBL: { x: number; y: number },
    srcBR: { x: number; y: number },
    dstTL: { x: number; y: number },
    dstTR: { x: number; y: number },
    dstBL: { x: number; y: number },
    dstBR: { x: number; y: number },
  ): number[][] {
    // This is a simplified 2D transformation matrix
    // In practice, you'd use a proper 3x3 homogeneous transformation matrix
    const scaleX = (dstTR.x - dstTL.x) / (srcTR.x - srcTL.x);
    const scaleY = (dstBL.y - dstTL.y) / (srcBL.y - srcTL.y);
    const translateX = dstTL.x - srcTL.x * scaleX;
    const translateY = dstTL.y - srcTL.y * scaleY;

    return [
      [scaleX, 0, translateX],
      [0, scaleY, translateY],
      [0, 0, 1],
    ];
  }

  // Apply perspective matrix to a point
  private applyPerspectiveMatrix(
    matrix: number[][],
    point: { x: number; y: number },
  ): { x: number; y: number } {
    const x = matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2];
    const y = matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2];
    const w = matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2];

    return { x: x / w, y: y / w };
  }

  // Apply bulge/pinch effect
  applyBulgeEffect(
    imageData: ImageData,
    centerX: number,
    centerY: number,
    radius: number,
    strength: number,
  ): ImageData {
    const { width, height } = imageData;
    const resultData = new ImageData(width, height);
    resultData.data.set(imageData.data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius && distance > 0) {
          const factor = Math.pow(Math.sin((Math.PI * distance) / radius), 2);
          const scaleFactor = 1 + strength * factor;

          const sourceX = centerX + dx / scaleFactor;
          const sourceY = centerY + dy / scaleFactor;

          if (
            sourceX >= 0 &&
            sourceX < width &&
            sourceY >= 0 &&
            sourceY < height
          ) {
            const pixel = this.samplePixelBilinear(imageData, sourceX, sourceY);
            const targetIdx = (y * width + x) * 4;

            resultData.data[targetIdx] = pixel.r;
            resultData.data[targetIdx + 1] = pixel.g;
            resultData.data[targetIdx + 2] = pixel.b;
            resultData.data[targetIdx + 3] = pixel.a;
          }
        }
      }
    }

    return resultData;
  }

  // Apply twist/swirl effect
  applyTwistEffect(
    imageData: ImageData,
    centerX: number,
    centerY: number,
    radius: number,
    angle: number,
  ): ImageData {
    const { width, height } = imageData;
    const resultData = new ImageData(width, height);
    resultData.data.set(imageData.data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius && distance > 0) {
          const factor = 1 - distance / radius;
          const twistAngle = angle * factor * factor;

          const cos = Math.cos(twistAngle);
          const sin = Math.sin(twistAngle);

          const sourceX = centerX + dx * cos - dy * sin;
          const sourceY = centerY + dx * sin + dy * cos;

          if (
            sourceX >= 0 &&
            sourceX < width &&
            sourceY >= 0 &&
            sourceY < height
          ) {
            const pixel = this.samplePixelBilinear(imageData, sourceX, sourceY);
            const targetIdx = (y * width + x) * 4;

            resultData.data[targetIdx] = pixel.r;
            resultData.data[targetIdx + 1] = pixel.g;
            resultData.data[targetIdx + 2] = pixel.b;
            resultData.data[targetIdx + 3] = pixel.a;
          }
        }
      }
    }

    return resultData;
  }

  // Apply ripple effect
  applyRippleEffect(
    imageData: ImageData,
    centerX: number,
    centerY: number,
    amplitude: number,
    frequency: number,
    phase: number = 0,
  ): ImageData {
    const { width, height } = imageData;
    const resultData = new ImageData(width, height);
    resultData.data.set(imageData.data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const ripple = Math.sin(distance * frequency + phase) * amplitude;
        const factor = distance > 0 ? (distance + ripple) / distance : 1;

        const sourceX = centerX + dx * factor;
        const sourceY = centerY + dy * factor;

        if (
          sourceX >= 0 &&
          sourceX < width &&
          sourceY >= 0 &&
          sourceY < height
        ) {
          const pixel = this.samplePixelBilinear(imageData, sourceX, sourceY);
          const targetIdx = (y * width + x) * 4;

          resultData.data[targetIdx] = pixel.r;
          resultData.data[targetIdx + 1] = pixel.g;
          resultData.data[targetIdx + 2] = pixel.b;
          resultData.data[targetIdx + 3] = pixel.a;
        }
      }
    }

    return resultData;
  }

  // Apply fisheye effect
  applyFisheyeEffect(imageData: ImageData, strength: number): ImageData {
    const { width, height } = imageData;
    const resultData = new ImageData(width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x - centerX) / maxRadius;
        const dy = (y - centerY) / maxRadius;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 1) {
          const factor = Math.pow(distance, strength);
          const sourceX = centerX + dx * factor * maxRadius;
          const sourceY = centerY + dy * factor * maxRadius;

          if (
            sourceX >= 0 &&
            sourceX < width &&
            sourceY >= 0 &&
            sourceY < height
          ) {
            const pixel = this.samplePixelBilinear(imageData, sourceX, sourceY);
            const targetIdx = (y * width + x) * 4;

            resultData.data[targetIdx] = pixel.r;
            resultData.data[targetIdx + 1] = pixel.g;
            resultData.data[targetIdx + 2] = pixel.b;
            resultData.data[targetIdx + 3] = pixel.a;
          }
        } else {
          // Outside the circle, keep original pixel
          const sourceIdx = (y * width + x) * 4;
          const targetIdx = sourceIdx;

          resultData.data[targetIdx] = imageData.data[sourceIdx];
          resultData.data[targetIdx + 1] = imageData.data[sourceIdx + 1];
          resultData.data[targetIdx + 2] = imageData.data[sourceIdx + 2];
          resultData.data[targetIdx + 3] = imageData.data[sourceIdx + 3];
        }
      }
    }

    return resultData;
  }

  // Apply barrel/pincushion distortion
  applyBarrelDistortion(
    imageData: ImageData,
    k1: number,
    k2: number = 0,
  ): ImageData {
    const { width, height } = imageData;
    const resultData = new ImageData(width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(centerX, centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x - centerX) / maxRadius;
        const dy = (y - centerY) / maxRadius;
        const r2 = dx * dx + dy * dy;
        const r4 = r2 * r2;

        const distortion = 1 + k1 * r2 + k2 * r4;

        const sourceX = centerX + dx * distortion * maxRadius;
        const sourceY = centerY + dy * distortion * maxRadius;

        if (
          sourceX >= 0 &&
          sourceX < width &&
          sourceY >= 0 &&
          sourceY < height
        ) {
          const pixel = this.samplePixelBilinear(imageData, sourceX, sourceY);
          const targetIdx = (y * width + x) * 4;

          resultData.data[targetIdx] = pixel.r;
          resultData.data[targetIdx + 1] = pixel.g;
          resultData.data[targetIdx + 2] = pixel.b;
          resultData.data[targetIdx + 3] = pixel.a;
        }
      }
    }

    return resultData;
  }

  // Utility: Sample pixel with bilinear interpolation
  private samplePixelBilinear(
    imageData: ImageData,
    x: number,
    y: number,
  ): { r: number; g: number; b: number; a: number } {
    const { width, height, data } = imageData;

    if (x < 0 || x >= width || y < 0 || y >= height) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }

    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, width - 1);
    const y2 = Math.min(y1 + 1, height - 1);

    const fx = x - x1;
    const fy = y - y1;

    const idx1 = (y1 * width + x1) * 4;
    const idx2 = (y1 * width + x2) * 4;
    const idx3 = (y2 * width + x1) * 4;
    const idx4 = (y2 * width + x2) * 4;

    const result = { r: 0, g: 0, b: 0, a: 0 };

    for (let c = 0; c < 4; c++) {
      const top = data[idx1 + c] * (1 - fx) + data[idx2 + c] * fx;
      const bottom = data[idx3 + c] * (1 - fx) + data[idx4 + c] * fx;
      const value = top * (1 - fy) + bottom * fy;

      if (c === 0) result.r = Math.round(value);
      else if (c === 1) result.g = Math.round(value);
      else if (c === 2) result.b = Math.round(value);
      else result.a = Math.round(value);
    }

    return result;
  }

  // Create morphing animation between two images
  createMorphFrames(
    imageA: ImageData,
    imageB: ImageData,
    steps: number = 10,
  ): ImageData[] {
    const frames: ImageData[] = [];

    for (let i = 0; i <= steps; i++) {
      const alpha = i / steps;
      const frame = this.blendImages(imageA, imageB, alpha);
      frames.push(frame);
    }

    return frames;
  }

  // Blend two images
  private blendImages(
    imageA: ImageData,
    imageB: ImageData,
    alpha: number,
  ): ImageData {
    const result = new ImageData(imageA.width, imageA.height);
    const dataA = imageA.data;
    const dataB = imageB.data;
    const resultData = result.data;

    for (let i = 0; i < dataA.length; i++) {
      resultData[i] = Math.round(dataA[i] * (1 - alpha) + dataB[i] * alpha);
    }

    return result;
  }
}

export default ImageWarpingService;
export type { WarpPoint, TransformMatrix, WarpGrid, PerspectiveTransform };
