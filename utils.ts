export function generateFileName(
  pattern: string,
  extension: string = "webm",
): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "-"); // HH-mm-ss

  let fileName = pattern
    .replace(/\[DATE\]/g, date)
    .replace(/\[TIME\]/g, time)
    .replace(/\[DATETIME\]/g, `${date}_${time}`);

  // Sanitize filename to remove invalid characters
  fileName = fileName.replace(/[<>:"/\\|?*]/g, "_");

  // Prevent empty filenames
  if (!fileName.trim()) {
    fileName = `KNOUX-REC-${date}_${time}`;
  }

  return `${fileName}.${extension}`;
}

// تنسيق الوقت للعرض
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// تنسيق حجم الملف
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// تحويل Blob إلى Base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// تحو��ل Base64 إلى Blob
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// حفظ الملف محلياً
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// التحقق من دعم المتصفح
export function checkBrowserSupport(): {
  webrtc: boolean;
  mediaRecorder: boolean;
  webWorkers: boolean;
  webAssembly: boolean;
  offscreenCanvas: boolean;
} {
  return {
    webrtc: !!(
      navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
    ),
    mediaRecorder: !!window.MediaRecorder,
    webWorkers: !!window.Worker,
    webAssembly: !!window.WebAssembly,
    offscreenCanvas: !!window.OffscreenCanvas,
  };
}

// تقدير مساحة التخزين المتاحة
export async function getStorageQuota(): Promise<{
  quota: number;
  usage: number;
}> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota || 0,
      usage: estimate.usage || 0,
    };
  }
  return { quota: 0, usage: 0 };
}

// تنظيف عناوين URL
export function cleanupBlobUrls(urls: string[]): void {
  urls.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
}

// إنشاء thumbnail من الفيديو
export function createVideoThumbnail(
  file: File | Blob,
  time: number = 1,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("لا يمكن إنشاء canvas context"));
      return;
    }

    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    });

    video.addEventListener("seeked", () => {
      ctx.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
      URL.revokeObjectURL(video.src);
      resolve(thumbnail);
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("خطأ في تحميل الفيديو"));
    });

    video.src = URL.createObjectURL(file);
    video.currentTime = time;
  });
}

// تحديد نوع الملف
export function getFileType(
  file: File | Blob,
): "video" | "audio" | "image" | "unknown" {
  const type = file.type;

  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("image/")) return "image";

  return "unknown";
}

// إنشاء معرف فريد
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// التحقق من صحة إعدادات التسجيل
export function validateRecordingSettings(settings: any): boolean {
  const required = ["recordScreen", "recordMic", "videoQuality", "fps"];
  return required.every((key) => key in settings);
}

// حساب معدل البت المطلوب
export function calculateBitrate(quality: string, fps: number): number {
  const baseRates = {
    "480p": 1000000, // 1 Mbps
    "720p": 2500000, // 2.5 Mbps
    "1080p": 5000000, // 5 Mbps
    "1440p": 8000000, // 8 Mbps
    "4k": 15000000, // 15 Mbps
  };

  const base =
    baseRates[quality as keyof typeof baseRates] || baseRates["1080p"];
  const fpsMultiplier = fps > 30 ? 1.5 : 1.0;

  return Math.round(base * fpsMultiplier);
}

// تحسين إعدادات الأداء
export function optimizePerformanceSettings(systemInfo: any): any {
  const { cpuCores, memory, gpu } = systemInfo;

  let recommendedSettings = {
    videoQuality: "1080p",
    fps: 30,
    gameMode: false,
  };

  // تعديل بناءً على موارد النظام
  if (cpuCores >= 8 && memory >= 16) {
    recommendedSettings.videoQuality = "1440p";
    recommendedSettings.fps = 60;
    recommendedSettings.gameMode = true;
  } else if (cpuCores >= 4 && memory >= 8) {
    recommendedSettings.fps = 60;
  } else if (cpuCores < 4 || memory < 4) {
    recommendedSettings.videoQuality = "720p";
    recommendedSettings.fps = 30;
  }

  return recommendedSettings;
}
