import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export interface VideoProcessingOptions {
  inputFile: File | Blob;
  outputFormat?: "mp4" | "webm" | "avi" | "mov" | "gif";
  quality?: "low" | "medium" | "high" | "ultra";
  resolution?: { width: number; height: number };
  frameRate?: number;
  bitRate?: number;
  startTime?: number;
  duration?: number;
  filters?: VideoFilter[];
}

export interface VideoFilter {
  type:
    | "blur"
    | "brightness"
    | "contrast"
    | "saturation"
    | "hue"
    | "noise"
    | "sharpen"
    | "vintage"
    | "sepia"
    | "grayscale";
  intensity?: number;
  params?: Record<string, any>;
}

export interface VideoTransition {
  type: "fade" | "slide" | "zoom" | "rotate" | "dissolve" | "wipe";
  duration: number;
  direction?: "left" | "right" | "up" | "down";
}

export interface VideoStabilizationOptions {
  intensity: number; // 0-100
  smoothness: number; // 0-100
  maxShift: number; // pixels
  maxAngle: number; // degrees
}

export class VideoProcessor {
  private ffmpeg: FFmpeg;
  private isLoaded = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  // تحميل FFmpeg
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

      await this.ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });

      this.isLoaded = true;
    } catch (error) {
      throw new Error(`فشل في تحميل معالج الفيديو: ${error}`);
    }
  }

  // تحويل تنسيق الفيديو
  async convertFormat(file: File | Blob, outputFormat: string): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = `output.${outputFormat}`;

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    const codecMap = {
      mp4: ["-c:v", "libx264", "-c:a", "aac"],
      webm: ["-c:v", "libvpx-vp9", "-c:a", "libopus"],
      avi: ["-c:v", "libx264", "-c:a", "mp3"],
      mov: ["-c:v", "libx264", "-c:a", "aac"],
      gif: [
        "-vf",
        "fps=10,scale=320:-1:flags=lanczos,palettegen=reserve_transparent=0",
      ],
    };

    const codec = codecMap[outputFormat as keyof typeof codecMap] || [
      "-c",
      "copy",
    ];

    await this.ffmpeg.exec(["-i", inputName, ...codec, outputName]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: `video/${outputFormat}` });
  }

  // ضغط الفيديو
  async compressVideo(
    file: File | Blob,
    quality: "low" | "medium" | "high" | "ultra",
  ): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "compressed.mp4";

    const qualitySettings = {
      low: { crf: 28, scale: "640:360", bitrate: "500k" },
      medium: { crf: 23, scale: "1280:720", bitrate: "1500k" },
      high: { crf: 18, scale: "1920:1080", bitrate: "3000k" },
      ultra: { crf: 15, scale: "2560:1440", bitrate: "6000k" },
    };

    const settings = qualitySettings[quality];

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-c:v",
      "libx264",
      "-crf",
      settings.crf.toString(),
      "-vf",
      `scale=${settings.scale}`,
      "-b:v",
      settings.bitrate,
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // قص الفيديو
  async trimVideo(
    file: File | Blob,
    startTime: number,
    duration: number,
  ): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "trimmed.mp4";

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-c",
      "copy",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // دمج مقاطع الفيديو
  async mergeVideos(files: (File | Blob)[]): Promise<Blob> {
    await this.initialize();

    // كتابة الملفات
    const inputFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fileName = `input${i}.mp4`;
      await this.ffmpeg.writeFile(fileName, await fetchFile(files[i]));
      inputFiles.push(fileName);
    }

    // إنشاء ملف القائمة
    const listContent = inputFiles.map((file) => `file '${file}'`).join("\n");
    await this.ffmpeg.writeFile(
      "list.txt",
      new TextEncoder().encode(listContent),
    );

    const outputName = "merged.mp4";

    await this.ffmpeg.exec([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "list.txt",
      "-c",
      "copy",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // إضافة مرشحات الفيديو
  async applyFilters(file: File | Blob, filters: VideoFilter[]): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "filtered.mp4";

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    const filterStrings: string[] = [];

    filters.forEach((filter) => {
      switch (filter.type) {
        case "blur":
          filterStrings.push(`gblur=sigma=${filter.intensity || 1}`);
          break;
        case "brightness":
          filterStrings.push(`eq=brightness=${(filter.intensity || 0) / 100}`);
          break;
        case "contrast":
          filterStrings.push(
            `eq=contrast=${1 + (filter.intensity || 0) / 100}`,
          );
          break;
        case "saturation":
          filterStrings.push(
            `eq=saturation=${1 + (filter.intensity || 0) / 100}`,
          );
          break;
        case "hue":
          filterStrings.push(`hue=h=${filter.intensity || 0}`);
          break;
        case "noise":
          filterStrings.push(`noise=alls=${filter.intensity || 10}:allf=t`);
          break;
        case "sharpen":
          filterStrings.push(
            `unsharp=5:5:${(filter.intensity || 50) / 50}:5:5:0`,
          );
          break;
        case "vintage":
          filterStrings.push("curves=vintage");
          break;
        case "sepia":
          filterStrings.push(
            "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131",
          );
          break;
        case "grayscale":
          filterStrings.push("hue=s=0");
          break;
      }
    });

    const filterChain = filterStrings.join(",");

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      filterChain,
      "-c:a",
      "copy",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // تثبيت الفيديو
  async stabilizeVideo(
    file: File | Blob,
    options: VideoStabilizationOptions,
  ): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "stabilized.mp4";

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    // مرحلة التحليل
    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `vidstabdetect=stepsize=6:shakiness=${options.intensity / 10}:accuracy=15`,
      "-f",
      "null",
      "-",
    ]);

    // مرحلة التطبيق
    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `vidstabtransform=smoothing=${options.smoothness}:maxshift=${options.maxShift}:maxangle=${(options.maxAngle * Math.PI) / 180}`,
      "-c:a",
      "copy",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // إضافة انتقالات بين المقاطع
  async addTransitions(
    files: (File | Blob)[],
    transitions: VideoTransition[],
  ): Promise<Blob> {
    await this.initialize();

    // إعداد الملفات
    const inputFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fileName = `input${i}.mp4`;
      await this.ffmpeg.writeFile(fileName, await fetchFile(files[i]));
      inputFiles.push(fileName);
    }

    let filterComplex = "";
    let inputs = "";

    // بناء الفلتر المعقد للانتقالات
    for (let i = 0; i < inputFiles.length; i++) {
      inputs += `-i ${inputFiles[i]} `;

      if (i < transitions.length) {
        const transition = transitions[i];
        const duration = transition.duration;

        switch (transition.type) {
          case "fade":
            filterComplex += `[${i}:v][${i + 1}:v]xfade=transition=fade:duration=${duration}:offset=0[v${i}]; `;
            break;
          case "slide":
            const direction =
              transition.direction === "left"
                ? "slideleft"
                : transition.direction === "right"
                  ? "slideright"
                  : transition.direction === "up"
                    ? "slideup"
                    : "slidedown";
            filterComplex += `[${i}:v][${i + 1}:v]xfade=transition=${direction}:duration=${duration}:offset=0[v${i}]; `;
            break;
          case "dissolve":
            filterComplex += `[${i}:v][${i + 1}:v]xfade=transition=dissolve:duration=${duration}:offset=0[v${i}]; `;
            break;
        }
      }
    }

    const outputName = "transitions.mp4";

    await this.ffmpeg.exec([
      ...inputs.trim().split(" "),
      "-filter_complex",
      filterComplex,
      "-map",
      `[v${files.length - 2}]`,
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // إنشاء GIF من الفيديو
  async videoToGif(
    file: File | Blob,
    startTime: number = 0,
    duration: number = 3,
  ): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "output.gif";

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-vf",
      "fps=10,scale=320:-1:flags=lanczos",
      "-y",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "image/gif" });
  }

  // إضافة نص إلى الفيديو
  async addTextOverlay(
    file: File | Blob,
    text: string,
    position: { x: number; y: number },
    duration?: number,
  ): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "text_overlay.mp4";

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    const textFilter = duration
      ? `drawtext=text='${text}':x=${position.x}:y=${position.y}:fontsize=24:fontcolor=white:enable='between(t,0,${duration})'`
      : `drawtext=text='${text}':x=${position.x}:y=${position.y}:fontsize=24:fontcolor=white`;

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      textFilter,
      "-c:a",
      "copy",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // استخراج إطارات من الفيديو
  async extractFrames(file: File | Blob, fps: number = 1): Promise<Blob[]> {
    await this.initialize();

    const inputName = "input.webm";
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `fps=${fps}`,
      "frame_%03d.png",
    ]);

    const frames: Blob[] = [];
    let frameIndex = 1;

    try {
      while (true) {
        const frameData = await this.ffmpeg.readFile(
          `frame_${frameIndex.toString().padStart(3, "0")}.png`,
        );
        frames.push(new Blob([frameData], { type: "image/png" }));
        frameIndex++;
      }
    } catch {
      // انتهاء الإطارات
    }

    return frames;
  }

  // تسريع أو إبطاء الفيديو
  async changeSpeed(file: File | Blob, speed: number): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "speed_changed.mp4";

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `setpts=${1 / speed}*PTS`,
      "-af",
      `atempo=${speed}`,
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // تدوير الفيديو
  async rotateVideo(file: File | Blob, angle: number): Promise<Blob> {
    await this.initialize();

    const inputName = "input.webm";
    const outputName = "rotated.mp4";

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    let rotateFilter: string;
    switch (angle) {
      case 90:
        rotateFilter = "transpose=1";
        break;
      case 180:
        rotateFilter = "transpose=2,transpose=2";
        break;
      case 270:
        rotateFilter = "transpose=2";
        break;
      default:
        rotateFilter = `rotate=${(angle * Math.PI) / 180}`;
    }

    await this.ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      rotateFilter,
      "-c:a",
      "copy",
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: "video/mp4" });
  }

  // الحصول على معلومات الفيديو
  async getVideoInfo(file: File | Blob): Promise<any> {
    await this.initialize();

    const inputName = "input.webm";
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    const info = await this.ffmpeg.exec(["-i", inputName, "-f", "null", "-"]);
    return info;
  }

  // تنظيف الذاكرة
  cleanup(): void {
    // تنظيف الملف��ت المؤقتة
    this.ffmpeg.terminate();
  }
}

// إنشاء مثيل مشترك
export const videoProcessor = new VideoProcessor();
