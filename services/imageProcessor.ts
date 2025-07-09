import * as tf from "@tensorflow/tfjs";

export interface ImageProcessingOptions {
  inputFile: File | Blob;
  outputFormat?: "jpeg" | "png" | "webp";
  quality?: number; // 0-100
  resize?: { width: number; height: number };
  filters?: ImageFilter[];
  maintainAspectRatio?: boolean;
}

export interface ImageFilter {
  type:
    | "blur"
    | "sharpen"
    | "brightness"
    | "contrast"
    | "saturation"
    | "hue"
    | "sepia"
    | "grayscale"
    | "vintage"
    | "noise";
  intensity?: number; // 0-100
  params?: Record<string, any>;
}

export interface BackgroundRemovalOptions {
  model: "basic" | "advanced" | "person" | "object";
  threshold: number; // 0-1
  featherEdges: boolean;
  featherRadius: number;
}

export interface ImageUpscaleOptions {
  scale: number; // 2, 4, 8
  model: "bicubic" | "ai" | "lanczos";
  preserveDetails: boolean;
}

export interface FaceDetectionResult {
  faces: {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    landmarks?: { x: number; y: number }[];
  }[];
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private segmentationModel: tf.GraphModel | null = null;
  private faceDetectionModel: tf.GraphModel | null = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    this.loadModels();
  }

  // تحميل النماذج
  private async loadModels(): Promise<void> {
    try {
      // تحميل نموذج تقسيم الخلفية
      this.segmentationModel = await tf.loadGraphModel(
        "/models/selfie_segmentation/model.json",
      );

      // تحميل نموذج اكتشاف الوجوه
      this.faceDetectionModel = await tf.loadGraphModel(
        "/models/face_detection/model.json",
      );
    } catch (error) {
      console.warn("تعذر تحميل نماذج الذكاء الاصطناعي:", error);
    }
  }

  // تحميل صورة إلى Canvas
  private async loadImageToCanvas(
    file: File | Blob,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // تطبيق مرشحات على الصورة
  async applyFilters(file: File | Blob, filters: ImageFilter[]): Promise<Blob> {
    const img = await this.loadImageToCanvas(file);
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    this.ctx.drawImage(img, 0, 0);
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    for (const filter of filters) {
      this.applyFilter(data, filter, img.width, img.height);
    }

    this.ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/png");
    });
  }

  // تطبيق مرشح واحد
  private applyFilter(
    data: Uint8ClampedArray,
    filter: ImageFilter,
    width: number,
    height: number,
  ): void {
    const intensity = filter.intensity || 50;

    switch (filter.type) {
      case "brightness":
        this.adjustBrightness(data, (intensity - 50) * 2);
        break;
      case "contrast":
        this.adjustContrast(data, 1 + (intensity - 50) / 50);
        break;
      case "saturation":
        this.adjustSaturation(data, intensity / 50);
        break;
      case "hue":
        this.adjustHue(data, intensity * 3.6); // 0-360 degrees
        break;
      case "sepia":
        this.applySepia(data);
        break;
      case "grayscale":
        this.applyGrayscale(data);
        break;
      case "blur":
        this.applyBoxBlur(data, width, height, Math.floor(intensity / 10));
        break;
      case "sharpen":
        this.applySharpen(data, width, height, intensity / 100);
        break;
      case "vintage":
        this.applyVintage(data);
        break;
      case "noise":
        this.addNoise(data, intensity);
        break;
    }
  }

  // تعديل السطوع
  private adjustBrightness(data: Uint8ClampedArray, amount: number): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + amount)); // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + amount)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + amount)); // B
    }
  }

  // تعديل التباين
  private adjustContrast(data: Uint8ClampedArray, factor: number): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, (data[i] - 128) * factor + 128));
      data[i + 1] = Math.max(
        0,
        Math.min(255, (data[i + 1] - 128) * factor + 128),
      );
      data[i + 2] = Math.max(
        0,
        Math.min(255, (data[i + 2] - 128) * factor + 128),
      );
    }
  }

  // تعديل التشبع
  private adjustSaturation(data: Uint8ClampedArray, factor: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;

      data[i] = Math.max(0, Math.min(255, gray + (r - gray) * factor));
      data[i + 1] = Math.max(0, Math.min(255, gray + (g - gray) * factor));
      data[i + 2] = Math.max(0, Math.min(255, gray + (b - gray) * factor));
    }
  }

  // تعديل الصبغة
  private adjustHue(data: Uint8ClampedArray, angle: number): void {
    const cosA = Math.cos((angle * Math.PI) / 180);
    const sinA = Math.sin((angle * Math.PI) / 180);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // تحويل RGB إلى HSV ثم تعديل H
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      if (delta === 0) continue;

      let h = 0;
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;

      h = (h * 60 + angle) % 360;
      if (h < 0) h += 360;

      const s = delta / max;
      const v = max / 255;

      // تحويل HSV إلى RGB
      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;

      let rNew = 0,
        gNew = 0,
        bNew = 0;

      if (h < 60) {
        rNew = c;
        gNew = x;
        bNew = 0;
      } else if (h < 120) {
        rNew = x;
        gNew = c;
        bNew = 0;
      } else if (h < 180) {
        rNew = 0;
        gNew = c;
        bNew = x;
      } else if (h < 240) {
        rNew = 0;
        gNew = x;
        bNew = c;
      } else if (h < 300) {
        rNew = x;
        gNew = 0;
        bNew = c;
      } else {
        rNew = c;
        gNew = 0;
        bNew = x;
      }

      data[i] = Math.round((rNew + m) * 255);
      data[i + 1] = Math.round((gNew + m) * 255);
      data[i + 2] = Math.round((bNew + m) * 255);
    }
  }

  // تطبيق فلتر السيبيا
  private applySepia(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  }

  // تطبيق المقياس الرمادي
  private applyGrayscale(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  // تطبيق الضبابية
  private applyBoxBlur(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number,
  ): void {
    if (radius <= 0) return;

    const original = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = Math.max(0, Math.min(width - 1, x + dx));
            const ny = Math.max(0, Math.min(height - 1, y + dy));
            const idx = (ny * width + nx) * 4;

            r += original[idx];
            g += original[idx + 1];
            b += original[idx + 2];
            count++;
          }
        }

        const idx = (y * width + x) * 4;
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
      }
    }
  }

  // تطبيق الحدة
  private applySharpen(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    intensity: number,
  ): void {
    const kernel = [
      0,
      -intensity,
      0,
      -intensity,
      1 + 4 * intensity,
      -intensity,
      0,
      -intensity,
      0,
    ];

    this.applyConvolution(data, width, height, kernel, 3);
  }

  // تطبيق الفلتر القديم
  private applyVintage(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // تطبيق منحنى لوني قديم
      data[i] = Math.min(255, r * 1.1 + 30);
      data[i + 1] = Math.min(255, g * 0.9 + 10);
      data[i + 2] = Math.min(255, b * 0.8);
    }
  }

  // إضافة ضوضاء
  private addNoise(data: Uint8ClampedArray, intensity: number): void {
    const amount = intensity * 2.55;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  // تطبيق الحمل الدوري (Convolution)
  private applyConvolution(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    kernel: number[],
    kernelSize: number,
  ): void {
    const original = new Uint8ClampedArray(data);
    const half = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const nx = Math.max(0, Math.min(width - 1, x + kx - half));
            const ny = Math.max(0, Math.min(height - 1, y + ky - half));
            const idx = (ny * width + nx) * 4;
            const weight = kernel[ky * kernelSize + kx];

            r += original[idx] * weight;
            g += original[idx + 1] * weight;
            b += original[idx + 2] * weight;
          }
        }

        const idx = (y * width + x) * 4;
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }
  }

  // إزالة الخلفية بالذكاء الاصطناعي
  async removeBackground(
    file: File | Blob,
    options: BackgroundRemovalOptions,
  ): Promise<Blob> {
    const img = await this.loadImageToCanvas(file);
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    this.ctx.drawImage(img, 0, 0);

    if (!this.segmentationModel) {
      // استخدم طريقة مبسطة إذا لم يكن النموذج متاحاً
      return this.removeBackgroundBasic(file, options);
    }

    // تحضير الصورة للنموذج
    const tensor = tf.browser
      .fromPixels(this.canvas)
      .resizeNearestNeighbor([256, 256])
      .toFloat()
      .div(255.0)
      .expandDims(0);

    // تشغيل النموذج
    const predictions = this.segmentationModel.predict(tensor) as tf.Tensor;
    const mask = await predictions.data();

    // تطبيق القناع
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelIndex = Math.floor(i / 4);
      const maskValue = mask[pixelIndex % mask.length];

      if (maskValue < options.threshold) {
        imageData.data[i + 3] = 0; // جعل البكسل شفافاً
      } else if (options.featherEdges) {
        // تطبيق تدرج على الحواف
        const alpha = Math.min(255, maskValue * 255);
        imageData.data[i + 3] = alpha;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // ت��ظيف الذاكرة
    tensor.dispose();
    predictions.dispose();

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/png");
    });
  }

  // إزالة الخلفية بطريقة أساسية
  private async removeBackgroundBasic(
    file: File | Blob,
    options: BackgroundRemovalOptions,
  ): Promise<Blob> {
    const img = await this.loadImageToCanvas(file);
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    this.ctx.drawImage(img, 0, 0);
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // إزالة بناءً على اللون المهيمن في الزوايا
    const corners = [
      [0, 0],
      [img.width - 1, 0],
      [0, img.height - 1],
      [img.width - 1, img.height - 1],
    ];

    const bgColors = corners.map(([x, y]) => {
      const idx = (y * img.width + x) * 4;
      return [data[idx], data[idx + 1], data[idx + 2]];
    });

    const avgBgColor = [
      Math.round(bgColors.reduce((sum, color) => sum + color[0], 0) / 4),
      Math.round(bgColors.reduce((sum, color) => sum + color[1], 0) / 4),
      Math.round(bgColors.reduce((sum, color) => sum + color[2], 0) / 4),
    ];

    const tolerance = 50;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const distance = Math.sqrt(
        Math.pow(r - avgBgColor[0], 2) +
          Math.pow(g - avgBgColor[1], 2) +
          Math.pow(b - avgBgColor[2], 2),
      );

      if (distance < tolerance) {
        data[i + 3] = 0; // شفاف
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/png");
    });
  }

  // تكبير الصورة بالذكاء الاصطناعي
  async upscaleImage(
    file: File | Blob,
    options: ImageUpscaleOptions,
  ): Promise<Blob> {
    const img = await this.loadImageToCanvas(file);
    const newWidth = img.width * options.scale;
    const newHeight = img.height * options.scale;

    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    if (options.model === "bicubic" || options.model === "lanczos") {
      // استخدم تكبير تقليدي
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = "high";
      this.ctx.drawImage(img, 0, 0, newWidth, newHeight);
    } else {
      // TODO: تطبيق تكبير بالذكاء الاصطناعي
      // يحتاج لنموذج super-resolution
      this.ctx.drawImage(img, 0, 0, newWidth, newHeight);
    }

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/png");
    });
  }

  // اكتشاف الوجوه
  async detectFaces(file: File | Blob): Promise<FaceDetectionResult> {
    const img = await this.loadImageToCanvas(file);
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    this.ctx.drawImage(img, 0, 0);

    if (!this.faceDetectionModel) {
      // استخدم تقنية أساسية إذا لم يكن النموذج متاحاً
      return { faces: [] };
    }

    try {
      // تحضير الصورة للنموذج
      const tensor = tf.browser
        .fromPixels(this.canvas)
        .resizeNearestNeighbor([320, 320])
        .toFloat()
        .div(255.0)
        .expandDims(0);

      // تشغيل النموذج
      const predictions = this.faceDetectionModel.predict(tensor) as tf.Tensor;
      const results = await predictions.data();

      // تحليل النتائج
      const faces = [];
      // TODO: تحليل نتائج النموذج وتحويلها إلى إحداثيات

      // تنظيف الذاكرة
      tensor.dispose();
      predictions.dispose();

      return { faces };
    } catch (error) {
      console.error("خطأ في اكتشاف الوجوه:", error);
      return { faces: [] };
    }
  }

  // تبديل الوجوه
  async swapFaces(
    sourceFile: File | Blob,
    targetFile: File | Blob,
    faceIndex: number = 0,
  ): Promise<Blob> {
    // TODO: تطبيق تبديل الوجوه
    // يحتاج لنموذج face swapping متقدم

    const sourceImg = await this.loadImageToCanvas(sourceFile);
    this.canvas.width = sourceImg.width;
    this.canvas.height = sourceImg.height;
    this.ctx.drawImage(sourceImg, 0, 0);

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/png");
    });
  }

  // قص مخصص
  async customCutout(
    file: File | Blob,
    path: { x: number; y: number }[],
  ): Promise<Blob> {
    const img = await this.loadImageToCanvas(file);
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    this.ctx.drawImage(img, 0, 0);

    // إنشاء قناع بناءً على المسار
    this.ctx.globalCompositeOperation = "destination-in";
    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(path[i].x, path[i].y);
    }

    this.ctx.closePath();
    this.ctx.fill();

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/png");
    });
  }

  // تحويل النص إلى صورة
  async textToImage(
    text: string,
    options: {
      width: number;
      height: number;
      fontSize: number;
      fontFamily: string;
      color: string;
      backgroundColor: string;
      style?: "realistic" | "artistic" | "cartoon";
    },
  ): Promise<Blob> {
    // TODO: تطبيق text-to-image بالذكاء الاصطناعي
    // حالياً سنستخدم Canvas لإنشاء نص بسيط

    this.canvas.width = options.width;
    this.canvas.height = options.height;

    // خلفية
    this.ctx.fillStyle = options.backgroundColor;
    this.ctx.fillRect(0, 0, options.width, options.height);

    // نص
    this.ctx.fillStyle = options.color;
    this.ctx.font = `${options.fontSize}px ${options.fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // تقسيم النص لعدة أسطر
    const lines = this.wrapText(text, options.width - 40);
    const lineHeight = options.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = (options.height - totalHeight) / 2 + options.fontSize / 2;

    lines.forEach((line, index) => {
      this.ctx.fillText(line, options.width / 2, startY + index * lineHeight);
    });

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/png");
    });
  }

  // تقسيم النص لعدة أسطر
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  // تغيير حجم الصورة
  async resizeImage(
    file: File | Blob,
    width: number,
    height: number,
    maintainAspectRatio: boolean = true,
  ): Promise<Blob> {
    const img = await this.loadImageToCanvas(file);

    let newWidth = width;
    let newHeight = height;

    if (maintainAspectRatio) {
      const aspectRatio = img.width / img.height;
      if (width / height > aspectRatio) {
        newWidth = height * aspectRatio;
      } else {
        newHeight = width / aspectRatio;
      }
    }

    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
    this.ctx.drawImage(img, 0, 0, newWidth, newHeight);

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, "image/jpeg", 0.9);
    });
  }

  // تحويل تنسيق الصورة
  async convertFormat(
    file: File | Blob,
    format: "jpeg" | "png" | "webp",
    quality: number = 0.9,
  ): Promise<Blob> {
    const img = await this.loadImageToCanvas(file);
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    this.ctx.drawImage(img, 0, 0);

    const mimeType = `image/${format}`;

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve as BlobCallback, mimeType, quality);
    });
  }

  // ضغط الصورة
  async compressImage(
    file: File | Blob,
    quality: number,
    maxWidth?: number,
    maxHeight?: number,
  ): Promise<Blob> {
    let processedFile = file;

    // تغيير الحجم أولاً إذا كان مطلوباً
    if (maxWidth || maxHeight) {
      const img = await this.loadImageToCanvas(file);
      const targetWidth = maxWidth || img.width;
      const targetHeight = maxHeight || img.height;
      processedFile = await this.resizeImage(
        file,
        targetWidth,
        targetHeight,
        true,
      );
    }

    // ضغط الجودة
    return this.convertFormat(processedFile, "jpeg", quality / 100);
  }

  // تنظيف الموارد
  cleanup(): void {
    // تنظيف النماذج
    if (this.segmentationModel) {
      this.segmentationModel.dispose();
    }
    if (this.faceDetectionModel) {
      this.faceDetectionModel.dispose();
    }
  }
}

// إنشاء مثيل مشترك
export const imageProcessor = new ImageProcessor();
