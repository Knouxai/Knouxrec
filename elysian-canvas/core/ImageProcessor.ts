export interface ProcessingOptions {
  quality: number;
  format: "webp" | "jpeg" | "png";
  enableGPU: boolean;
  preserveAspectRatio: boolean;
}

export interface TransformOptions {
  rotation: number;
  scale: { x: number; y: number };
  translation: { x: number; y: number };
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface FilterOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  noise: number;
  vignette: number;
}

export class ImageProcessor {
  private static instance: ImageProcessor;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: OffscreenCanvas | null = null;
  private webglContext: WebGLRenderingContext | null = null;

  private constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
    this.initializeWebGL();
  }

  public static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  private initializeWebGL(): void {
    try {
      this.webglContext =
        this.canvas.getContext("webgl") ||
        (this.canvas.getContext("experimental-webgl") as WebGLRenderingContext);

      if (this.webglContext) {
        console.log("WebGL initialized for GPU acceleration");
      }
    } catch (error) {
      console.warn("WebGL not available, falling back to 2D canvas");
    }
  }

  public async loadImage(
    source: string | File | HTMLImageElement,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;

      if (typeof source === "string") {
        img.src = source;
      } else if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      } else {
        resolve(source);
      }
    });
  }

  public resize(
    img: HTMLImageElement,
    width: number,
    height: number,
    options: Partial<ProcessingOptions> = {},
  ): HTMLCanvasElement {
    const opts = { preserveAspectRatio: true, ...options };

    let targetWidth = width;
    let targetHeight = height;

    if (opts.preserveAspectRatio) {
      const aspectRatio = img.width / img.height;
      if (width / height > aspectRatio) {
        targetWidth = height * aspectRatio;
      } else {
        targetHeight = width / aspectRatio;
      }
    }

    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;

    // Enable high-quality image smoothing
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";

    this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return this.canvas;
  }

  public crop(
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
  ): HTMLCanvasElement {
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

    return this.canvas;
  }

  public transform(
    img: HTMLImageElement,
    options: TransformOptions,
  ): HTMLCanvasElement {
    const { rotation, scale, translation, flipHorizontal, flipVertical } =
      options;

    this.canvas.width = img.width * Math.abs(scale.x);
    this.canvas.height = img.height * Math.abs(scale.y);

    this.ctx.save();

    // Move to center for transformations
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    // Apply transformations
    if (rotation !== 0) {
      this.ctx.rotate((rotation * Math.PI) / 180);
    }

    this.ctx.scale(
      flipHorizontal ? -scale.x : scale.x,
      flipVertical ? -scale.y : scale.y,
    );

    this.ctx.translate(translation.x, translation.y);

    // Draw image centered
    this.ctx.drawImage(img, -img.width / 2, -img.height / 2);

    this.ctx.restore();

    return this.canvas;
  }

  public applyFilters(
    img: HTMLImageElement,
    filters: Partial<FilterOptions>,
  ): HTMLCanvasElement {
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    // Build CSS filter string
    const filterParts: string[] = [];

    if (filters.brightness !== undefined && filters.brightness !== 100) {
      filterParts.push(`brightness(${filters.brightness}%)`);
    }

    if (filters.contrast !== undefined && filters.contrast !== 100) {
      filterParts.push(`contrast(${filters.contrast}%)`);
    }

    if (filters.saturation !== undefined && filters.saturation !== 100) {
      filterParts.push(`saturate(${filters.saturation}%)`);
    }

    if (filters.hue !== undefined && filters.hue !== 0) {
      filterParts.push(`hue-rotate(${filters.hue}deg)`);
    }

    if (filters.blur !== undefined && filters.blur > 0) {
      filterParts.push(`blur(${filters.blur}px)`);
    }

    this.ctx.filter = filterParts.join(" ");
    this.ctx.drawImage(img, 0, 0);
    this.ctx.filter = "none";

    // Apply custom filters that require pixel manipulation
    if (filters.sharpen || filters.noise || filters.vignette) {
      this.applyPixelFilters(filters);
    }

    return this.canvas;
  }

  private applyPixelFilters(filters: Partial<FilterOptions>): void {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
    const data = imageData.data;

    // Apply sharpening
    if (filters.sharpen && filters.sharpen > 0) {
      this.applySharpenFilter(imageData, filters.sharpen);
    }

    // Apply noise
    if (filters.noise && filters.noise > 0) {
      this.applyNoiseFilter(data, filters.noise);
    }

    // Apply vignette
    if (filters.vignette && filters.vignette > 0) {
      this.applyVignetteFilter(
        data,
        imageData.width,
        imageData.height,
        filters.vignette,
      );
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private applySharpenFilter(imageData: ImageData, intensity: number): void {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Unsharp mask kernel
    const kernel = [
      0,
      -intensity / 4,
      0,
      -intensity / 4,
      1 + intensity,
      -intensity / 4,
      0,
      -intensity / 4,
      0,
    ];

    const newData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          // RGB channels only
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * kernel[kernelIdx];
            }
          }
          newData[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    imageData.data.set(newData);
  }

  private applyNoiseFilter(data: Uint8ClampedArray, intensity: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity * 2;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  private applyVignetteFilter(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    intensity: number,
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
        );
        const vignette = 1 - ((distance / maxDistance) * intensity) / 100;
        const factor = Math.max(0, Math.min(1, vignette));

        const idx = (y * width + x) * 4;
        data[idx] *= factor; // Red
        data[idx + 1] *= factor; // Green
        data[idx + 2] *= factor; // Blue
      }
    }
  }

  public blend(
    baseImg: HTMLImageElement,
    overlayImg: HTMLImageElement,
    blendMode: GlobalCompositeOperation,
    opacity: number = 1,
  ): HTMLCanvasElement {
    this.canvas.width = baseImg.width;
    this.canvas.height = baseImg.height;

    // Draw base image
    this.ctx.drawImage(baseImg, 0, 0);

    // Set blend mode and opacity
    this.ctx.globalCompositeOperation = blendMode;
    this.ctx.globalAlpha = opacity;

    // Draw overlay
    this.ctx.drawImage(overlayImg, 0, 0, baseImg.width, baseImg.height);

    // Reset context
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.globalAlpha = 1;

    return this.canvas;
  }

  public createThumbnail(
    img: HTMLImageElement,
    size: number = 200,
    quality: number = 0.8,
  ): string {
    const aspectRatio = img.width / img.height;
    let thumbWidth = size;
    let thumbHeight = size;

    if (aspectRatio > 1) {
      thumbHeight = size / aspectRatio;
    } else {
      thumbWidth = size * aspectRatio;
    }

    const thumbnailCanvas = document.createElement("canvas");
    const thumbnailCtx = thumbnailCanvas.getContext("2d")!;

    thumbnailCanvas.width = thumbWidth;
    thumbnailCanvas.height = thumbHeight;

    thumbnailCtx.imageSmoothingEnabled = true;
    thumbnailCtx.imageSmoothingQuality = "high";

    thumbnailCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

    return thumbnailCanvas.toDataURL("image/jpeg", quality);
  }

  public async optimizeForWeb(
    img: HTMLImageElement,
    options: Partial<ProcessingOptions> = {},
  ): Promise<Blob> {
    const opts = {
      quality: 0.85,
      format: "webp" as const,
      enableGPU: true,
      ...options,
    };

    // Resize if too large
    let processedCanvas = this.canvas;
    if (img.width > 2048 || img.height > 2048) {
      const scale = Math.min(2048 / img.width, 2048 / img.height);
      processedCanvas = this.resize(img, img.width * scale, img.height * scale);
    } else {
      processedCanvas.width = img.width;
      processedCanvas.height = img.height;
      this.ctx.drawImage(img, 0, 0);
    }

    return new Promise((resolve) => {
      processedCanvas.toBlob(
        (blob) => resolve(blob!),
        `image/${opts.format}`,
        opts.quality,
      );
    });
  }

  public getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  public putImageData(imageData: ImageData): void {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
  }

  public exportCanvas(
    format: string = "image/png",
    quality: number = 1,
  ): string {
    return this.canvas.toDataURL(format, quality);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export const imageProcessor = ImageProcessor.getInstance();
