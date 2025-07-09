import { useState, useRef, useCallback, useEffect } from "react";
import RecordRTC, { StereoAudioRecorder, MediaStreamRecorder } from "recordrtc";
import {
  screenshotService,
  ScreenshotOptions,
  ScreenshotResult,
} from "../services/screenshotService";

export interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  recordingBlob: Blob | null;
  error: string | null;
  isInitialized: boolean;
  devices: MediaDeviceInfo[];
  currentDevice: string | null;
  recordingQuality: "low" | "medium" | "high" | "ultra";
  includeAudio: boolean;
  includeMicrophone: boolean;
  frameRate: number;
  bitRate: number;
}

export interface RecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  initialize: () => Promise<void>;
  setRecordingQuality: (quality: RecorderState["recordingQuality"]) => void;
  setIncludeAudio: (include: boolean) => void;
  setIncludeMicrophone: (include: boolean) => void;
  setDevice: (deviceId: string) => void;
  setFrameRate: (fps: number) => void;
  setBitRate: (bitrate: number) => void;
  downloadRecording: () => void;
  clearRecording: () => void;
  takeScreenshot: (options?: ScreenshotOptions) => Promise<ScreenshotResult>;
  startWebcamRecording: () => Promise<void>;
  recordSpecificWindow: () => Promise<void>;
  recordSelectedArea: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Promise<void>;
}

export interface UseRecorderReturn {
  state: RecorderState;
  actions: RecorderActions;
}

const QUALITY_SETTINGS = {
  low: { width: 1280, height: 720, bitRate: 2500000, frameRate: 15 },
  medium: { width: 1920, height: 1080, bitRate: 5000000, frameRate: 30 },
  high: { width: 2560, height: 1440, bitRate: 8000000, frameRate: 30 },
  ultra: { width: 3840, height: 2160, bitRate: 15000000, frameRate: 60 },
};

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    recordingBlob: null,
    error: null,
    isInitialized: false,
    devices: [],
    currentDevice: null,
    recordingQuality: "high",
    includeAudio: true,
    includeMicrophone: false,
    frameRate: 30,
    bitRate: 8000000,
  });

  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // تحديث الوقت
  const updateTimer = useCallback(() => {
    const now = Date.now();
    const elapsed = Math.floor(
      (now - startTimeRef.current - pausedTimeRef.current) / 1000,
    );
    setState((prev) => ({ ...prev, recordingTime: elapsed }));
  }, []);

  // تهيئة النظام
  const initialize = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // التحقق من دعم المتصفح
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("المتصفح لا يدعم تسجيل الشاشة");
      }

      // الحصول على الأجهزة المتاحة
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      setState((prev) => ({
        ...prev,
        devices: videoDevices,
        currentDevice: videoDevices[0]?.deviceId || null,
        isInitialized: true,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "خطأ في التهيئة",
        isInitialized: false,
      }));
    }
  }, []);

  // إنشاء تدفق الوسائط
  const createMediaStream = useCallback(
    async (type: "screen" | "webcam" | "window" = "screen") => {
      const qualitySettings = QUALITY_SETTINGS[state.recordingQuality];

      let videoStream: MediaStream;

      if (type === "screen") {
        // تسجيل الشاشة
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: qualitySettings.width,
            height: qualitySettings.height,
            frameRate: state.frameRate,
            cursor: "always",
          },
          audio: state.includeAudio,
        });
      } else if (type === "webcam") {
        // تسجيل الكاميرا
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: state.currentDevice
              ? { exact: state.currentDevice }
              : undefined,
            width: qualitySettings.width,
            height: qualitySettings.height,
            frameRate: state.frameRate,
          },
          audio: state.includeMicrophone,
        });
      } else {
        // تسجيل نافذة محددة
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: qualitySettings.width,
            height: qualitySettings.height,
            frameRate: state.frameRate,
            cursor: "always",
          },
          audio: state.includeAudio,
        });
      }

      // إضافة الميكروفون إذا كان مطلوباً
      if (state.includeMicrophone && type === "screen") {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const audioContext = new AudioContext();
          const dest = audioContext.createMediaStreamDestination();

          // دمج الصوت من الشاشة والميكروفون
          const videoAudioSource =
            audioContext.createMediaStreamSource(videoStream);
          const micAudioSource =
            audioContext.createMediaStreamSource(micStream);

          videoAudioSource.connect(dest);
          micAudioSource.connect(dest);

          // استبدال المسار الصوتي
          const audioTrack = dest.stream.getAudioTracks()[0];
          videoStream.removeTrack(videoStream.getAudioTracks()[0]);
          videoStream.addTrack(audioTrack);
        } catch (micError) {
          console.warn("تعذر إضافة الميكروفون:", micError);
        }
      }

      return videoStream;
    },
    [
      state.recordingQuality,
      state.includeAudio,
      state.includeMicrophone,
      state.currentDevice,
      state.frameRate,
    ],
  );

  // بدء التسجيل
  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const stream = await createMediaStream("screen");
      streamRef.current = stream;

      // إعداد RecordRTC
      const options = {
        type: "video",
        mimeType: "video/webm;codecs=vp9",
        bitsPerSecond: state.bitRate,
        videoBitsPerSecond: state.bitRate,
        audioBitsPerSecond: 128000,
        frameInterval: 1000 / state.frameRate,
        quality: 10,
        canvas: {
          width: QUALITY_SETTINGS[state.recordingQuality].width,
          height: QUALITY_SETTINGS[state.recordingQuality].height,
        },
      };

      recorderRef.current = new RecordRTC(stream, options);
      recorderRef.current.startRecording();

      // بدء العداد
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      timerRef.current = setInterval(updateTimer, 1000);

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        recordingBlob: null,
      }));

      // مراقبة إغلاق التطبيق
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopRecording();
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "خطأ في بدء التسجيل",
      }));
    }
  }, [
    createMediaStream,
    state.bitRate,
    state.frameRate,
    state.recordingQuality,
    updateTimer,
  ]);

  // إيقاف التسجيل
  const stopRecording = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (!recorderRef.current || !state.isRecording) {
        resolve();
        return;
      }

      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current!.getBlob();

        // إيقاف التدفق
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // إيقاف العداد
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          recordingBlob: blob,
        }));

        resolve();
      });
    });
  }, [state.isRecording]);

  // إيقاف مؤقت
  const pauseRecording = useCallback(() => {
    if (!recorderRef.current || !state.isRecording || state.isPaused) return;

    recorderRef.current.pauseRecording();
    pausedTimeRef.current += Date.now() - startTimeRef.current;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState((prev) => ({ ...prev, isPaused: true }));
  }, [state.isRecording, state.isPaused]);

  // استكمال التسجيل
  const resumeRecording = useCallback(() => {
    if (!recorderRef.current || !state.isRecording || !state.isPaused) return;

    recorderRef.current.resumeRecording();
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(updateTimer, 1000);

    setState((prev) => ({ ...prev, isPaused: false }));
  }, [state.isRecording, state.isPaused, updateTimer]);

  // تنزيل التسجيل
  const downloadRecording = useCallback(() => {
    if (!state.recordingBlob) return;

    const url = URL.createObjectURL(state.recordingBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.recordingBlob]);

  // مسح التسجيل
  const clearRecording = useCallback(() => {
    setState((prev) => ({
      ...prev,
      recordingBlob: null,
      recordingTime: 0,
      error: null,
    }));
  }, []);

  // أخذ لقطة شاشة باستخدام الخدمة المتقدمة
  const takeScreenshot = useCallback(
    async (options?: ScreenshotOptions): Promise<ScreenshotResult> => {
      console.log("📸 Taking advanced screenshot...");

      try {
        // إعداد خيارات Screenshot الافتراضية
        const screenshotOptions: ScreenshotOptions = {
          format: "png",
          quality: 0.95,
          captureMode: "screen",
          timestamp: true,
          watermark: true,
          ...options,
        };

        // التقاط لقطة الشاشة
        const result =
          await screenshotService.captureScreenshot(screenshotOptions);

        if (result.success) {
          console.log("✅ Screenshot captured successfully:", result.filename);

          // تحميل لقطة الشاشة تلقائياً
          const downloaded = await screenshotService.downloadScreenshot(result);

          if (downloaded) {
            console.log("📥 Screenshot downloaded successfully");

            // محاولة نسخ لقطة الشاشة للحافظة أيضاً
            try {
              await screenshotService.copyToClipboard(result);
              console.log("📋 Screenshot copied to clipboard");
            } catch (error) {
              console.warn("Failed to copy to clipboard:", error);
            }
          } else {
            console.error("❌ Failed to download screenshot");
          }

          return result;
        } else {
          console.error("❌ Screenshot capture failed:", result.error);
          return result;
        }
      } catch (error) {
        console.error("Screenshot error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "فشل في التقاط لقطة الشاشة",
        };
      }
    },
    [],
  );

  // تسجيل الكاميرا
  const startWebcamRecording = useCallback(async () => {
    try {
      const stream = await createMediaStream("webcam");
      streamRef.current = stream;

      const options = {
        type: "video",
        mimeType: "video/webm;codecs=vp9",
        bitsPerSecond: state.bitRate,
      };

      recorderRef.current = new RecordRTC(stream, options);
      recorderRef.current.startRecording();

      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      timerRef.current = setInterval(updateTimer, 1000);

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        recordingBlob: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "خطأ في تسجيل الكاميرا",
      }));
    }
  }, [createMediaStream, state.bitRate, updateTimer]);

  // تسجيل نافذة محددة
  const recordSpecificWindow = useCallback(async () => {
    try {
      const stream = await createMediaStream("window");
      streamRef.current = stream;

      const options = {
        type: "video",
        mimeType: "video/webm;codecs=vp9",
        bitsPerSecond: state.bitRate,
      };

      recorderRef.current = new RecordRTC(stream, options);
      recorderRef.current.startRecording();

      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      timerRef.current = setInterval(updateTimer, 1000);

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        recordingBlob: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "خطأ في تسجيل النافذة",
      }));
    }
  }, [createMediaStream, state.bitRate, updateTimer]);

  // تسجيل منطقة محددة
  const recordSelectedArea = useCallback(
    async (x: number, y: number, width: number, height: number) => {
      try {
        // هذه الميزة تتطلب مكتبة إضافية أو تطبيق desktop
        console.log("تسجيل منطقة محددة:", { x, y, width, height });
        // TODO: تطبيق تسجيل منطقة محددة
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "خطأ في تسجيل المنطقة المحددة",
        }));
      }
    },
    [],
  );

  // إعدادات الجودة
  const setRecordingQuality = useCallback(
    (quality: RecorderState["recordingQuality"]) => {
      setState((prev) => ({ ...prev, recordingQuality: quality }));
    },
    [],
  );

  const setIncludeAudio = useCallback((include: boolean) => {
    setState((prev) => ({ ...prev, includeAudio: include }));
  }, []);

  const setIncludeMicrophone = useCallback((include: boolean) => {
    setState((prev) => ({ ...prev, includeMicrophone: include }));
  }, []);

  const setDevice = useCallback((deviceId: string) => {
    setState((prev) => ({ ...prev, currentDevice: deviceId }));
  }, []);

  const setFrameRate = useCallback((fps: number) => {
    setState((prev) => ({ ...prev, frameRate: fps }));
  }, []);

  const setBitRate = useCallback((bitrate: number) => {
    setState((prev) => ({ ...prev, bitRate: bitrate }));
  }, []);

  // تنظيف الموارد عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      // تنظيف خدمة Screenshot
      screenshotService.cleanup();
    };
  }, []);

  // تهيئة تلقائية
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    state,
    actions: {
      startRecording,
      stopRecording,
      pauseRecording,
      resumeRecording,
      initialize,
      setRecordingQuality,
      setIncludeAudio,
      setIncludeMicrophone,
      setDevice,
      setFrameRate,
      setBitRate,
      downloadRecording,
      clearRecording,
      takeScreenshot,
      startWebcamRecording,
      recordSpecificWindow,
      recordSelectedArea,
    },
  };
}
