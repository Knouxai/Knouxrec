interface FilterOptions {
  intensity: number;
  radius?: number;
  threshold?: number;
  color?: string;
}

interface BlendMode {
  id: string;
  name: string;
  operation: GlobalCompositeOperation;
}

interface ConvolutionKernel {
  name: string;
  kernel: number[];
  divisor: number;
  offset: number;
}

class CanvasEffectsService {
  private static instance: CanvasEffectsService;

  static getInstance(): CanvasEffectsService {
    if (!CanvasEffectsService.instance) {
      CanvasEffectsService.instance = new CanvasEffectsService();
    }
    return CanvasEffectsService.instance;
  }

  // Convolution kernels for various effects
  private kernels: Record<string, ConvolutionKernel> = {
    blur: {
      name: "Gaussian Blur",
      kernel: [1, 2, 1, 2, 4, 2, 1, 2, 1],
      divisor: 16,
      offset: 0,
    },
    sharpen: {
      name: "Sharpen",
      kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      divisor: 1,
      offset: 0,
    },
    edge: {
      name: "Edge Detection",
      kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
      divisor: 1,
      offset: 0,
    },
    emboss: {
      name: "Emboss",
      kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
      divisor: 1,
      offset: 128,
    },
    outline: {
      name: "Outline",
      kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
      divisor: 1,
      offset: 0,
    },
  };

  // Blend modes for layer effects
  private blendModes: BlendMode[] = [
    { id: "normal", name: "Normal", operation: "source-over" },
    { id: "multiply", name: "Multiply", operation: "multiply" },
    { id: "screen", name: "Screen", operation: "screen" },
    { id: "overlay", name: "Overlay", operation: "overlay" },
    { id: "soft-light", name: "Soft Light", operation: "soft-light" },
    { id: "hard-light", name: "Hard Light", operation: "hard-light" },
    { id: "color-dodge", name: "Color Dodge", operation: "color-dodge" },
    { id: "color-burn", name: "Color Burn", operation: "color-burn" },
    { id: "darken", name: "Darken", operation: "darken" },
    { id: "lighten", name: "Lighten", operation: "lighten" },
    { id: "difference", name: "Difference", operation: "difference" },
    { id: "exclusion", name: "Exclusion", operation: "exclusion" },
  ];

  // Apply brightness adjustment
  applyBrightness(imageData: ImageData, intensity: number): ImageData {
    const data = imageData.data;
    const adjustment = (intensity - 50) * 5; // Convert 0-100 to adjustment value

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + adjustment)); // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment)); // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment)); // Blue
    }

    return imageData;
  }

  // Apply contrast adjustment
  applyContrast(imageData: ImageData, intensity: number): ImageData {
    const data = imageData.data;
    const contrast = intensity / 50; // Convert 0-100 to 0-2 range
    const factor =
      (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(
        0,
        Math.min(255, factor * (data[i + 1] - 128) + 128),
      );
      data[i + 2] = Math.max(
        0,
        Math.min(255, factor * (data[i + 2] - 128) + 128),
      );
    }

    return imageData;
  }

  // Apply saturation adjustment
  applySaturation(imageData: ImageData, intensity: number): ImageData {
    const data = imageData.data;
    const saturation = intensity / 50; // Convert 0-100 to 0-2 range

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

      data[i] = Math.max(
        0,
        Math.min(255, gray + saturation * (data[i] - gray)),
      );
      data[i + 1] = Math.max(
        0,
        Math.min(255, gray + saturation * (data[i + 1] - gray)),
      );
      data[i + 2] = Math.max(
        0,
        Math.min(255, gray + saturation * (data[i + 2] - gray)),
      );
    }

    return imageData;
  }

  // Apply hue shift
  applyHueShift(imageData: ImageData, degrees: number): ImageData {
    const data = imageData.data;
    const hueShift = (degrees % 360) / 360;

    for (let i = 0; i < data.length; i += 4) {
      const [h, s, l] = this.rgbToHsl(data[i], data[i + 1], data[i + 2]);
      const newH = (h + hueShift) % 1;
      const [r, g, b] = this.hslToRgb(newH, s, l);

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    return imageData;
  }

  // Apply convolution filter
  applyConvolution(imageData: ImageData, kernelName: string): ImageData {
    const kernel = this.kernels[kernelName];
    if (!kernel) return imageData;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0,
          g = 0,
          b = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = (y + ky) * width + (x + kx);
            const weight = kernel.kernel[(ky + 1) * 3 + (kx + 1)];

            r += data[px * 4] * weight;
            g += data[px * 4 + 1] * weight;
            b += data[px * 4 + 2] * weight;
          }
        }

        const px = y * width + x;
        newData[px * 4] = Math.max(
          0,
          Math.min(255, r / kernel.divisor + kernel.offset),
        );
        newData[px * 4 + 1] = Math.max(
          0,
          Math.min(255, g / kernel.divisor + kernel.offset),
        );
        newData[px * 4 + 2] = Math.max(
          0,
          Math.min(255, b / kernel.divisor + kernel.offset),
        );
      }
    }

    return new ImageData(newData, width, height);
  }

  // Apply gaussian blur
  applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
    if (radius <= 0) return imageData;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Create Gaussian kernel
    const kernel = this.createGaussianKernel(radius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);

    // Horizontal pass
    const tempData = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0,
          weightSum = 0;

        for (let i = 0; i < kernelSize; i++) {
          const px = Math.max(0, Math.min(width - 1, x + i - halfKernel));
          const weight = kernel[i];
          const idx = (y * width + px) * 4;

          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
          a += data[idx + 3] * weight;
          weightSum += weight;
        }

        const idx = (y * width + x) * 4;
        tempData[idx] = r / weightSum;
        tempData[idx + 1] = g / weightSum;
        tempData[idx + 2] = b / weightSum;
        tempData[idx + 3] = a / weightSum;
      }
    }

    // Vertical pass
    const resultData = new Uint8ClampedArray(data);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0,
          weightSum = 0;

        for (let i = 0; i < kernelSize; i++) {
          const py = Math.max(0, Math.min(height - 1, y + i - halfKernel));
          const weight = kernel[i];
          const idx = (py * width + x) * 4;

          r += tempData[idx] * weight;
          g += tempData[idx + 1] * weight;
          b += tempData[idx + 2] * weight;
          a += tempData[idx + 3] * weight;
          weightSum += weight;
        }

        const idx = (y * width + x) * 4;
        resultData[idx] = r / weightSum;
        resultData[idx + 1] = g / weightSum;
        resultData[idx + 2] = b / weightSum;
        resultData[idx + 3] = a / weightSum;
      }
    }

    return new ImageData(resultData, width, height);
  }

  // Apply noise reduction
  applyNoiseReduction(imageData: ImageData, intensity: number): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);
    const threshold = intensity * 2.55; // Convert 0-100 to 0-255

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const px = (y * width + x) * 4;

        // Get surrounding pixels
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const npx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push([data[npx], data[npx + 1], data[npx + 2]]);
          }
        }

        // Calculate median for each channel
        for (let channel = 0; channel < 3; channel++) {
          const values = neighbors.map((n) => n[channel]).sort((a, b) => a - b);
          const median = values[4]; // Middle value of 9 pixels
          const current = data[px + channel];

          // Apply noise reduction if difference is within threshold
          if (Math.abs(current - median) < threshold) {
            newData[px + channel] = median;
          } else {
            newData[px + channel] = current;
          }
        }
      }
    }

    return new ImageData(newData, width, height);
  }

  // Apply skin smoothing effect
  applySkinSmoothing(imageData: ImageData, intensity: number): ImageData {
    // First apply light gaussian blur
    let result = this.applyGaussianBlur(imageData, intensity * 0.1);

    // Then apply noise reduction
    result = this.applyNoiseReduction(result, intensity * 0.5);

    // Finally blend with original for natural look
    return this.blendImageData(imageData, result, intensity / 100);
  }

  // Apply vintage film effect
  applyVintageEffect(imageData: ImageData, intensity: number): ImageData {
    const data = imageData.data;
    const strength = intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
      // Sepia tone
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const sepiaR =
        (r * 0.393 + g * 0.769 + b * 0.189) * strength + r * (1 - strength);
      const sepiaG =
        (r * 0.349 + g * 0.686 + b * 0.168) * strength + g * (1 - strength);
      const sepiaB =
        (r * 0.272 + g * 0.534 + b * 0.131) * strength + b * (1 - strength);

      // Add film grain noise
      const noise = (Math.random() - 0.5) * strength * 20;

      data[i] = Math.max(0, Math.min(255, sepiaR + noise));
      data[i + 1] = Math.max(0, Math.min(255, sepiaG + noise));
      data[i + 2] = Math.max(0, Math.min(255, sepiaB + noise));

      // Reduce opacity slightly for aged look
      data[i + 3] = Math.max(200, data[i + 3]);
    }

    return imageData;
  }

  // Apply HDR-like tone mapping
  applyHDREffect(imageData: ImageData, intensity: number): ImageData {
    const data = imageData.data;
    const strength = intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      // Apply tone mapping
      const hdrR = r / (1 + r * strength);
      const hdrG = g / (1 + g * strength);
      const hdrB = b / (1 + b * strength);

      // Enhance local contrast
      const luminance = 0.299 * hdrR + 0.587 * hdrG + 0.114 * hdrB;
      const contrast = 1 + strength * 0.5;

      data[i] = Math.max(
        0,
        Math.min(255, (hdrR * contrast + luminance * (1 - contrast)) * 255),
      );
      data[i + 1] = Math.max(
        0,
        Math.min(255, (hdrG * contrast + luminance * (1 - contrast)) * 255),
      );
      data[i + 2] = Math.max(
        0,
        Math.min(255, (hdrB * contrast + luminance * (1 - contrast)) * 255),
      );
    }

    return imageData;
  }

  // Blend two image data objects
  blendImageData(
    base: ImageData,
    overlay: ImageData,
    opacity: number,
  ): ImageData {
    const result = new ImageData(base.width, base.height);
    const baseData = base.data;
    const overlayData = overlay.data;
    const resultData = result.data;

    for (let i = 0; i < baseData.length; i += 4) {
      resultData[i] = baseData[i] * (1 - opacity) + overlayData[i] * opacity;
      resultData[i + 1] =
        baseData[i + 1] * (1 - opacity) + overlayData[i + 1] * opacity;
      resultData[i + 2] =
        baseData[i + 2] * (1 - opacity) + overlayData[i + 2] * opacity;
      resultData[i + 3] = baseData[i + 3];
    }

    return result;
  }

  // Utility: Create Gaussian kernel
  private createGaussianKernel(radius: number): number[] {
    const size = radius * 2 + 1;
    const kernel = new Array(size);
    const sigma = radius / 3;
    const twoSigmaSquare = 2 * sigma * sigma;
    let sum = 0;

    for (let i = 0; i < size; i++) {
      const x = i - radius;
      kernel[i] = Math.exp((-x * x) / twoSigmaSquare);
      sum += kernel[i];
    }

    // Normalize kernel
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }

    return kernel;
  }

  // Utility: RGB to HSL conversion
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;

    if (diff === 0) {
      return [0, 0, l];
    }

    const s = l > 0.5 ? diff / (2 - sum) : diff / sum;

    let h: number;
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
      default:
        h = 0;
    }

    return [h, s, l];
  }

  // Utility: HSL to RGB conversion
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
      const gray = Math.round(l * 255);
      return [gray, gray, gray];
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Get available blend modes
  getBlendModes(): BlendMode[] {
    return this.blendModes;
  }

  // Get available convolution kernels
  getConvolutionKernels(): string[] {
    return Object.keys(this.kernels);
  }

  // Apply batch effects
  applyBatchEffects(
    imageData: ImageData,
    effects: Array<{ type: string; options: FilterOptions }>,
  ): ImageData {
    let result = imageData;

    for (const effect of effects) {
      switch (effect.type) {
        case "brightness":
          result = this.applyBrightness(result, effect.options.intensity);
          break;
        case "contrast":
          result = this.applyContrast(result, effect.options.intensity);
          break;
        case "saturation":
          result = this.applySaturation(result, effect.options.intensity);
          break;
        case "hue":
          result = this.applyHueShift(result, effect.options.intensity);
          break;
        case "blur":
          result = this.applyGaussianBlur(result, effect.options.radius || 1);
          break;
        case "sharpen":
          result = this.applyConvolution(result, "sharpen");
          break;
        case "skin-smooth":
          result = this.applySkinSmoothing(result, effect.options.intensity);
          break;
        case "vintage":
          result = this.applyVintageEffect(result, effect.options.intensity);
          break;
        case "hdr":
          result = this.applyHDREffect(result, effect.options.intensity);
          break;
        case "noise-reduction":
          result = this.applyNoiseReduction(result, effect.options.intensity);
          break;
      }
    }

    return result;
  }
}

export default CanvasEffectsService;
export type { FilterOptions, BlendMode, ConvolutionKernel };
