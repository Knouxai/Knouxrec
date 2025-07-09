// KNOUX REC - Advanced Screenshot Service
// خدمة لقطات الشاشة المتقدمة مع دعم جميع المتصفحات

export interface ScreenshotOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number; // 0.0 - 1.0 for JPEG/WebP
  includeAudio?: boolean;
  captureMode?: "screen" | "window" | "tab" | "region";
  filename?: string;
  timestamp?: boolean;
  watermark?: boolean;
}

export interface ScreenshotResult {
  success: boolean;
  blob?: Blob;
  dataUrl?: string;
  filename?: string;
  size?: number;
  dimensions?: { width: number; height: number };
  timestamp?: Date;
  error?: string;
}

export class ScreenshotService {
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private video: HTMLVideoElement;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!;
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.playsInline = true;
  }

  // التقاط لقطة شاشة بطرق متعددة
  async captureScreenshot(
    options: ScreenshotOptions = {},
  ): Promise<ScreenshotResult> {
    const {
      format = "png",
      quality = 0.92,
      captureMode = "screen",
      filename,
      timestamp = true,
      watermark = true,
    } = options;

    try {
      // تحديد نوع الالتقاط
      let captureStream: MediaStream;

      switch (captureMode) {
        case "screen":
          captureStream = await this.captureScreen();
          break;
        case "window":
          captureStream = await this.captureWindow();
          break;
        case "tab":
          captureStream = await this.captureTab();
          break;
        case "region":
          return await this.captureRegion(options);
        default:
          captureStream = await this.captureScreen();
      }

      const result = await this.processScreenshot(captureStream, {
        format,
        quality,
        filename,
        timestamp,
        watermark,
      });

      // إيقاف البث
      captureStream.getTracks().forEach((track) => track.stop());

      return result;
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "فشل في التقاط لقطة الشاشة",
      };
    }
  }

  // التقاط الشاشة الكاملة
  private async captureScreen(): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: "screen" as any,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
    } catch (error) {
      // Fallback للمتصفحات القديمة
      return await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
    }
  }

  // التقاط نافذة محددة
  private async captureWindow(): Promise<MediaStream> {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: "window" as any,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
  }

  // التقاط تبويب محدد
  private async captureTab(): Promise<MediaStream> {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: "tab" as any,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
  }

  // التقاط منطقة محددة (باستخدام واجهة تفاعلية)
  private async captureRegion(
    options: ScreenshotOptions,
  ): Promise<ScreenshotResult> {
    try {
      // التقاط الشاشة الكاملة أولاً
      const fullScreenStream = await this.captureScreen();
      const fullScreenResult = await this.processScreenshot(fullScreenStream, {
        format: "png",
        quality: 1.0,
        timestamp: false,
        watermark: false,
      });

      fullScreenStream.getTracks().forEach((track) => track.stop());

      if (!fullScreenResult.success || !fullScreenResult.dataUrl) {
        throw new Error("فشل في التقاط الشاشة الكاملة");
      }

      // فتح واجهة تحديد المنطقة
      const selectedRegion = await this.showRegionSelector(
        fullScreenResult.dataUrl,
      );

      if (!selectedRegion) {
        return { success: false, error: "تم إلغاء تحديد المنطقة" };
      }

      // قص الم��طقة المحددة
      const croppedResult = await this.cropImage(
        fullScreenResult.dataUrl,
        selectedRegion,
        options,
      );

      return croppedResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل في التقاط المنطقة",
      };
    }
  }

  // معالجة لقطة الشاشة
  private async processScreenshot(
    stream: MediaStream,
    options: {
      format: string;
      quality: number;
      filename?: string;
      timestamp: boolean;
      watermark: boolean;
    },
  ): Promise<ScreenshotResult> {
    return new Promise((resolve) => {
      this.video.srcObject = stream;

      this.video.onloadedmetadata = () => {
        this.video.play();

        // انتظار تحميل الإطار الأول
        setTimeout(() => {
          try {
            // إعداد Canvas بناءً على أبعاد الفيديو
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            // رسم الإطار الحالي
            this.context.drawImage(this.video, 0, 0);

            // إضافة العلامة المائية إذا كانت مطلوبة
            if (options.watermark) {
              this.addWatermark();
            }

            // إضافة الطابع الزمني إذا كان مطلوباً
            if (options.timestamp) {
              this.addTimestamp();
            }

            // تحويل إلى Blob
            this.canvas.toBlob(
              (blob) => {
                if (blob) {
                  const timestamp = new Date();
                  const filename =
                    options.filename ||
                    this.generateFilename(options.format, timestamp);

                  resolve({
                    success: true,
                    blob,
                    dataUrl: this.canvas.toDataURL(
                      `image/${options.format}`,
                      options.quality,
                    ),
                    filename,
                    size: blob.size,
                    dimensions: {
                      width: this.canvas.width,
                      height: this.canvas.height,
                    },
                    timestamp,
                  });
                } else {
                  resolve({
                    success: false,
                    error: "فشل في تحويل لقطة الشاشة",
                  });
                }
              },
              `image/${options.format}`,
              options.quality,
            );
          } catch (error) {
            resolve({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "خطأ في معالجة لقطة الشاشة",
            });
          }
        }, 100);
      };

      this.video.onerror = () => {
        resolve({
          success: false,
          error: "فشل في تحميل الفيديو",
        });
      };
    });
  }

  // إضافة العلامة المائية
  private addWatermark(): void {
    const ctx = this.context;
    const canvas = this.canvas;

    // حفظ الحالة الحالية
    ctx.save();

    // إعداد العلامة المائية
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "rgba(139, 92, 246, 0.8)"; // knoux-purple
    ctx.font = "bold 24px Orbitron, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";

    // إضافة خلفية للنص
    const text = "KNOUX REC";
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 30;
    const padding = 10;

    const x = canvas.width - padding;
    const y = canvas.height - padding;

    // رسم خلفية النص
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(
      x - textWidth - padding,
      y - textHeight,
      textWidth + padding * 2,
      textHeight + padding,
    );

    // رسم النص
    ctx.fillStyle = "rgba(139, 92, 246, 1)";
    ctx.fillText(text, x - padding, y);

    // استعادة الحالة
    ctx.restore();
  }

  // إضافة الطابع الزمني
  private addTimestamp(): void {
    const ctx = this.context;
    const now = new Date();
    const timestamp = now.toLocaleString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = "16px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const padding = 10;
    const textMetrics = ctx.measureText(timestamp);
    const textWidth = textMetrics.width;
    const textHeight = 20;

    // رسم خلفية الطابع الزمني
    ctx.fillRect(
      padding,
      padding,
      textWidth + padding * 2,
      textHeight + padding,
    );

    // رسم الطابع الزمني
    ctx.fillStyle = "rgba(0, 217, 255, 1)"; // knoux-neon
    ctx.fillText(timestamp, padding * 2, padding * 2);

    ctx.restore();
  }

  // توليد اسم الملف
  private generateFilename(format: string, timestamp: Date): string {
    const dateStr = timestamp.toISOString().slice(0, 19).replace(/[:.]/g, "-");
    return `KNOUX-Screenshot-${dateStr}.${format}`;
  }

  // عرض واجهة تحديد المنطقة
  private showRegionSelector(
    imageDataUrl: string,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return new Promise((resolve) => {
      // إنشاء overlay مؤقت
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.3);
        z-index: 10000;
        cursor: crosshair;
      `;

      const img = document.createElement("img");
      img.src = imageDataUrl;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
      `;

      const selectionBox = document.createElement("div");
      selectionBox.style.cssText = `
        position: absolute;
        border: 2px solid #06FFA5;
        background: rgba(6, 255, 165, 0.1);
        display: none;
        pointer-events: none;
      `;

      overlay.appendChild(img);
      overlay.appendChild(selectionBox);
      document.body.appendChild(overlay);

      let isSelecting = false;
      let startX = 0,
        startY = 0;

      const handleMouseDown = (e: MouseEvent) => {
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        selectionBox.style.display = "block";
        selectionBox.style.left = startX + "px";
        selectionBox.style.top = startY + "px";
        selectionBox.style.width = "0px";
        selectionBox.style.height = "0px";
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isSelecting) return;

        const currentX = e.clientX;
        const currentY = e.clientY;
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);

        selectionBox.style.left = left + "px";
        selectionBox.style.top = top + "px";
        selectionBox.style.width = width + "px";
        selectionBox.style.height = height + "px";
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (!isSelecting) return;
        isSelecting = false;

        const endX = e.clientX;
        const endY = e.clientY;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        document.body.removeChild(overlay);

        if (width > 10 && height > 10) {
          // تحويل إحداثيات المتصفح إلى إحداثيات الصورة
          const imgRect = img.getBoundingClientRect();
          const scaleX = img.naturalWidth / imgRect.width;
          const scaleY = img.naturalHeight / imgRect.height;

          resolve({
            x: Math.min(startX, endX) * scaleX,
            y: Math.min(startY, endY) * scaleY,
            width: width * scaleX,
            height: height * scaleY,
          });
        } else {
          resolve(null);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          document.body.removeChild(overlay);
          resolve(null);
        }
      };

      overlay.addEventListener("mousedown", handleMouseDown);
      overlay.addEventListener("mousemove", handleMouseMove);
      overlay.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("keydown", handleKeyDown);

      // إضافة تعليمات
      const instructions = document.createElement("div");
      instructions.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        font-family: 'Rajdhani', sans-serif;
        font-size: 16px;
        z-index: 10001;
      `;
      instructions.textContent = "اسحب لتحديد المنطقة المطلوبة • ESC للإلغاء";
      overlay.appendChild(instructions);
    });
  }

  // قص الصورة حسب المنطقة المحددة
  private async cropImage(
    imageDataUrl: string,
    region: { x: number; y: number; width: number; height: number },
    options: ScreenshotOptions,
  ): Promise<ScreenshotResult> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cropCanvas = document.createElement("canvas");
        const cropCtx = cropCanvas.getContext("2d")!;

        cropCanvas.width = region.width;
        cropCanvas.height = region.height;

        cropCtx.drawImage(
          img,
          region.x,
          region.y,
          region.width,
          region.height,
          0,
          0,
          region.width,
          region.height,
        );

        // إضافة العلامة المائية والطابع الزمني للمنطقة المقصوصة
        if (options.watermark) {
          this.addWatermarkToCanvas(cropCtx, cropCanvas);
        }
        if (options.timestamp) {
          this.addTimestampToCanvas(cropCtx, cropCanvas);
        }

        cropCanvas.toBlob(
          (blob) => {
            if (blob) {
              const timestamp = new Date();
              const filename =
                options.filename ||
                this.generateFilename(options.format || "png", timestamp);

              resolve({
                success: true,
                blob,
                dataUrl: cropCanvas.toDataURL(
                  `image/${options.format || "png"}`,
                  options.quality || 0.92,
                ),
                filename,
                size: blob.size,
                dimensions: {
                  width: cropCanvas.width,
                  height: cropCanvas.height,
                },
                timestamp,
              });
            } else {
              resolve({
                success: false,
                error: "فشل في قص الصورة",
              });
            }
          },
          `image/${options.format || "png"}`,
          options.quality || 0.92,
        );
      };

      img.onerror = () => {
        resolve({
          success: false,
          error: "فشل في تحميل الصورة للقص",
        });
      };

      img.src = imageDataUrl;
    });
  }

  // إضافة العلامة المائية لcanvas مخصص
  private addWatermarkToCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "rgba(139, 92, 246, 0.8)";
    ctx.font = "bold 16px Orbitron, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";

    const text = "KNOUX REC";
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const padding = 8;

    const x = canvas.width - padding;
    const y = canvas.height - padding;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x - textWidth - padding, y - 20, textWidth + padding * 2, 25);

    ctx.fillStyle = "rgba(139, 92, 246, 1)";
    ctx.fillText(text, x - padding, y);

    ctx.restore();
  }

  // إضافة الطابع الزمني لcanvas مخصص
  private addTimestampToCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ): void {
    const now = new Date();
    const timestamp = now.toLocaleString("ar-SA");

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const padding = 8;
    const textMetrics = ctx.measureText(timestamp);
    const textWidth = textMetrics.width;

    ctx.fillRect(padding, padding, textWidth + padding * 2, 18);
    ctx.fillStyle = "rgba(0, 217, 255, 1)";
    ctx.fillText(timestamp, padding * 2, padding * 2);

    ctx.restore();
  }

  // تحميل لقطة الشاشة
  async downloadScreenshot(result: ScreenshotResult): Promise<boolean> {
    if (!result.success || !result.blob || !result.filename) {
      return false;
    }

    try {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Download failed:", error);
      return false;
    }
  }

  // نسخ لقطة الشاشة للحافظة
  async copyToClipboard(result: ScreenshotResult): Promise<boolean> {
    if (!result.success || !result.blob) {
      return false;
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [result.blob.type]: result.blob,
        }),
      ]);
      return true;
    } catch (error) {
      console.error("Copy to clipboard failed:", error);
      return false;
    }
  }

  // تنظيف الموارد
  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}

// إنشاء مثيل واحد للخدمة
export const screenshotService = new ScreenshotService();
