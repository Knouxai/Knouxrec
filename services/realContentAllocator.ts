// KNOUX REC - Real Content Allocation System
// نظام التخصيص الحقيقي للمحتوى النهائي

export interface RealContent {
  id: string;
  name: string;
  type: "template" | "tool" | "filter" | "effect" | "preset" | "asset";
  category: string;
  data: any;
  preview?: string;
  thumbnail?: string;
  usable: boolean;
  settings: Record<string, any>;
}

export interface UserProfile {
  preferences: {
    videoQuality: "hd" | "fullhd" | "4k";
    language: "ar" | "en";
    theme: "dark" | "light" | "auto";
    contentType: "professional" | "casual" | "gaming" | "educational";
  };
  usage: {
    favoriteTools: string[];
    recentTemplates: string[];
    exportFormats: string[];
  };
  customizations: {
    hotkeys: Record<string, string>;
    workspace: any;
    savedPresets: any[];
  };
}

export class RealContentAllocator {
  private userProfile: UserProfile;
  private allocatedContent: Map<string, RealContent> = new Map();

  constructor() {
    this.userProfile = this.loadUserProfile();
    this.initializeRealContent();
  }

  // تحميل ملف المستخدم الحقيقي
  private loadUserProfile(): UserProfile {
    const saved = localStorage.getItem("knoux_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn("فشل في تحميل ملف المستخدم، استخدام الافتراضي");
      }
    }

    return {
      preferences: {
        videoQuality: "fullhd",
        language: "ar",
        theme: "dark",
        contentType: "professional",
      },
      usage: {
        favoriteTools: ["screen-recorder", "video-editor", "audio-enhancer"],
        recentTemplates: [],
        exportFormats: ["mp4", "mov", "webm"],
      },
      customizations: {
        hotkeys: {
          record: "F9",
          stop: "F10",
          pause: "F11",
          screenshot: "F12",
        },
        workspace: {
          layout: "professional",
          panels: ["timeline", "preview", "tools", "assets"],
        },
        savedPresets: [],
      },
    };
  }

  // تهيئة المحتوى الحقيقي
  private async initializeRealContent(): Promise<void> {
    await this.allocateRealTemplates();
    await this.allocateWorkingTools();
    await this.allocateUsableFilters();
    await this.allocateRealEffects();
    await this.allocateExportPresets();
    await this.allocateUserAssets();
  }

  // تخصيص قوالب حقيقية قابلة للاستخدام
  private async allocateRealTemplates(): Promise<void> {
    const realTemplates: RealContent[] = [
      {
        id: "intro-professional",
        name: "مقدمة احترافية",
        type: "template",
        category: "intros",
        usable: true,
        thumbnail: this.generateThumbnail("intro"),
        data: {
          duration: 5,
          elements: [
            {
              type: "text",
              content: "عنوان المشروع",
              position: { x: 50, y: 40 },
              style: {
                fontSize: 48,
                fontFamily: "Cairo",
                color: "#ffffff",
                animation: "fadeInUp",
              },
            },
            {
              type: "text",
              content: "اسم المنتج",
              position: { x: 50, y: 60 },
              style: {
                fontSize: 24,
                fontFamily: "Cairo",
                color: "#00ffff",
                animation: "fadeInDelay",
              },
            },
            {
              type: "shape",
              shape: "rectangle",
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: {
                backgroundColor:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                opacity: 0.1,
              },
            },
          ],
          transitions: ["fadeIn", "slideUp"],
          audio: {
            backgroundMusic: true,
            volume: 0.3,
            fadeIn: true,
          },
        },
        settings: {
          customizable: true,
          exportFormats: ["mp4", "mov", "gif"],
          resolutions: ["1080p", "4k"],
        },
      },

      {
        id: "outro-subscription",
        name: "خاتمة اشتراك",
        type: "template",
        category: "outros",
        usable: true,
        thumbnail: this.generateThumbnail("outro"),
        data: {
          duration: 8,
          elements: [
            {
              type: "text",
              content: "شكراً للمشاهدة!",
              position: { x: 50, y: 30 },
              style: {
                fontSize: 36,
                fontFamily: "Cairo",
                color: "#ffffff",
                animation: "bounceIn",
              },
            },
            {
              type: "button",
              content: "اشترك في القناة",
              position: { x: 50, y: 60 },
              style: {
                backgroundColor: "#ff0000",
                color: "#ffffff",
                borderRadius: 25,
                animation: "pulse",
              },
              action: "subscribe",
            },
            {
              type: "button",
              content: "إعجاب",
              position: { x: 35, y: 75 },
              style: {
                backgroundColor: "#4267B2",
                color: "#ffffff",
                borderRadius: 15,
                animation: "fadeInLeft",
              },
              action: "like",
            },
            {
              type: "button",
              content: "مشاركة",
              position: { x: 65, y: 75 },
              style: {
                backgroundColor: "#1DA1F2",
                color: "#ffffff",
                borderRadius: 15,
                animation: "fadeInRight",
              },
              action: "share",
            },
          ],
        },
        settings: {
          customizable: true,
          exportFormats: ["mp4", "mov"],
          resolutions: ["1080p", "4k"],
        },
      },

      {
        id: "lower-third-news",
        name: "عنوان إخباري سفلي",
        type: "template",
        category: "lower-thirds",
        usable: true,
        thumbnail: this.generateThumbnail("lower-third"),
        data: {
          duration: 0, // مستمر
          elements: [
            {
              type: "rectangle",
              position: { x: 0, y: 80 },
              size: { width: 100, height: 20 },
              style: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "2px solid #00ffff",
              },
            },
            {
              type: "text",
              content: "اسم المتحدث",
              position: { x: 5, y: 85 },
              style: {
                fontSize: 24,
                fontFamily: "Cairo",
                color: "#ffffff",
                fontWeight: "bold",
              },
            },
            {
              type: "text",
              content: "المنصب أو المهنة",
              position: { x: 5, y: 90 },
              style: {
                fontSize: 16,
                fontFamily: "Cairo",
                color: "#00ffff",
              },
            },
          ],
        },
        settings: {
          customizable: true,
          overlay: true,
          persistent: true,
        },
      },
    ];

    realTemplates.forEach((template) => {
      this.allocatedContent.set(template.id, template);
    });

    console.log(
      `✅ تم تخصيص ${realTemplates.length} قالب حقيقي قابل للاستخدام`,
    );
  }

  // تخصيص أدوات تعمل فعلياً
  private async allocateWorkingTools(): Promise<void> {
    const workingTools: RealContent[] = [
      {
        id: "real-screen-recorder",
        name: "مسجل الشاشة المتقدم",
        type: "tool",
        category: "recording",
        usable: true,
        data: {
          features: [
            "تسجيل الشاشة الكاملة",
            "تسجيل نافذة محددة",
            "تسجيل منطقة مخصصة",
            "تسجيل كاميرا الويب",
            "تسجيل الصوت من الميكروفون",
            "تسجيل صوت النظام",
          ],
          settings: {
            quality: ["720p", "1080p", "1440p", "4k"],
            fps: [30, 60, 120],
            codec: ["h264", "h265", "vp9"],
            bitrate: [2000, 5000, 10000, 20000],
          },
          realTimeEffects: [
            "إبراز المؤشر",
            "إظهار النقرات",
            "تسليط الضوء",
            "تأثير الزوم",
          ],
        },
        settings: {
          hotkeys: this.userProfile.customizations.hotkeys,
          outputPath: "recordings/",
          autoSave: true,
          format: this.userProfile.usage.exportFormats[0] || "mp4",
        },
      },

      {
        id: "advanced-video-editor",
        name: "محرر فيديو متقدم",
        type: "tool",
        category: "editing",
        usable: true,
        data: {
          timeline: {
            tracks: ["video", "audio", "text", "effects"],
            precision: "frame",
            zoom: [25, 50, 100, 200, 400],
            snapToGrid: true,
          },
          editing: [
            "قص وتقسيم",
            "دمج المقاطع",
            "تسريع وإبطاء",
            "عكس التشغيل",
            "استخراج الصوت",
            "إزالة الخلفية الخضراء",
          ],
          transitions: [
            "Fade In/Out",
            "Cross Dissolve",
            "Slide",
            "Zoom",
            "Rotation",
            "Blur",
          ],
        },
        settings: {
          previewQuality: "full",
          renderQuality: "high",
          multiThreading: true,
          hardwareAcceleration: true,
        },
      },

      {
        id: "audio-enhancer-pro",
        name: "محسن الصوت الاحترافي",
        type: "tool",
        category: "audio",
        usable: true,
        data: {
          enhancements: [
            "إزالة الضوضاء",
            "تحسين الوضوح",
            "موازن الصوت",
            "ضغط ديناميكي",
            "تقليل الصدى",
            "تحسين الباس",
          ],
          effects: [
            "Reverb",
            "Echo",
            "Chorus",
            "Flanger",
            "Phaser",
            "Distortion",
          ],
          filters: {
            highPass: { frequency: 80, slope: 12 },
            lowPass: { frequency: 15000, slope: 12 },
            bandPass: { lowFreq: 300, highFreq: 3400 },
            notch: { frequency: 60, q: 30 },
          },
        },
        settings: {
          realTime: true,
          quality: "professional",
          latency: "low",
        },
      },

      {
        id: "subtitle-generator",
        name: "مولد الترجمات الذكي",
        type: "tool",
        category: "text",
        usable: true,
        data: {
          recognition: {
            languages: ["ar", "en", "fr", "de", "es"],
            accuracy: 95,
            realTime: true,
          },
          formatting: {
            styles: ["default", "modern", "classic", "minimal"],
            positions: ["bottom", "top", "center"],
            fonts: ["Cairo", "Arial", "Helvetica", "Times"],
            colors: ["white", "yellow", "blue", "custom"],
          },
          export: ["srt", "vtt", "ass", "embedded"],
        },
        settings: {
          autoSync: true,
          spellCheck: true,
          punctuation: true,
        },
      },
    ];

    workingTools.forEach((tool) => {
      this.allocatedContent.set(tool.id, tool);
    });

    console.log(`✅ تم تخصيص ${workingTools.length} أداة تعمل فعلياً`);
  }

  // تخصيص فلاتر قابلة للاستخدام
  private async allocateUsableFilters(): Promise<void> {
    const usableFilters: RealContent[] = [
      {
        id: "color-correction-suite",
        name: "مجموعة تصحيح الألوان",
        type: "filter",
        category: "color",
        usable: true,
        data: {
          adjustments: {
            brightness: { min: -100, max: 100, default: 0, step: 1 },
            contrast: { min: -100, max: 100, default: 0, step: 1 },
            saturation: { min: -100, max: 100, default: 0, step: 1 },
            hue: { min: -180, max: 180, default: 0, step: 1 },
            gamma: { min: 0.1, max: 3.0, default: 1.0, step: 0.1 },
            exposure: { min: -2, max: 2, default: 0, step: 0.1 },
          },
          presets: [
            {
              name: "سينمائي",
              values: { contrast: 20, saturation: -10, gamma: 1.2 },
            },
            {
              name: "حيوي",
              values: { saturation: 30, contrast: 15, brightness: 5 },
            },
            {
              name: "دافئ",
              values: { hue: 10, exposure: 0.2, saturation: 10 },
            },
            {
              name: "بارد",
              values: { hue: -10, exposure: -0.1, contrast: 10 },
            },
          ],
          realTime: true,
        },
        settings: {
          previewEnabled: true,
          beforeAfter: true,
          resetButton: true,
        },
      },

      {
        id: "professional-grading",
        name: "تدرج احترافي",
        type: "filter",
        category: "grading",
        usable: true,
        data: {
          wheels: {
            shadows: { lift: 0, gamma: 0, gain: 0 },
            midtones: { lift: 0, gamma: 0, gain: 0 },
            highlights: { lift: 0, gamma: 0, gain: 0 },
          },
          curves: {
            master: [],
            red: [],
            green: [],
            blue: [],
          },
          luts: [
            "LOG to Rec709",
            "Cinematic",
            "Film Emulation",
            "Vintage",
            "Modern",
          ],
        },
        settings: {
          precision: "high",
          colorSpace: "rec709",
          bitDepth: 10,
        },
      },

      {
        id: "noise-reduction-pro",
        name: "إزالة الضوضاء الاحترافية",
        type: "filter",
        category: "enhancement",
        usable: true,
        data: {
          types: [
            { name: "ضوضاء الإضاءة المنخفضة", strength: 70, preserve: "edges" },
            { name: "ضوضاء الفيديو", strength: 50, preserve: "detail" },
            { name: "ضوضاء الضغط", strength: 40, preserve: "texture" },
            { name: "ضوضاء الألوان", strength: 60, preserve: "chroma" },
          ],
          advanced: {
            temporal: true,
            spatial: true,
            motionAdaptive: true,
            edgePreservation: true,
          },
          presets: ["خفيف", "متوسط", "قوي", "أقصى"],
        },
        settings: {
          realTimePreview: true,
          multiThreaded: true,
          gpuAccelerated: true,
        },
      },
    ];

    usableFilters.forEach((filter) => {
      this.allocatedContent.set(filter.id, filter);
    });

    console.log(`✅ تم تخصيص ${usableFilters.length} فلتر قابل للاستخدام`);
  }

  // تخصيص تأثيرات حقيقية
  private async allocateRealEffects(): Promise<void> {
    const realEffects: RealContent[] = [
      {
        id: "particle-system",
        name: "نظام الجسيمات",
        type: "effect",
        category: "particles",
        usable: true,
        data: {
          types: [
            {
              name: "نار",
              particles: {
                count: 500,
                life: 2.0,
                speed: { min: 50, max: 150 },
                size: { min: 2, max: 8 },
                color: { start: "#ff6600", end: "#ff0000" },
                gravity: -50,
                turbulence: 30,
              },
            },
            {
              name: "دخان",
              particles: {
                count: 200,
                life: 4.0,
                speed: { min: 20, max: 80 },
                size: { min: 5, max: 20 },
                color: { start: "#666666", end: "#333333" },
                gravity: -20,
                turbulence: 50,
              },
            },
            {
              name: "نجوم",
              particles: {
                count: 100,
                life: 3.0,
                speed: { min: 10, max: 30 },
                size: { min: 1, max: 4 },
                color: { start: "#ffffff", end: "#ffff00" },
                gravity: 0,
                twinkle: true,
              },
            },
          ],
          controls: {
            emission: { min: 0, max: 1000, default: 100 },
            direction: { x: 0, y: -1 },
            spread: { min: 0, max: 360, default: 45 },
            intensity: { min: 0, max: 100, default: 50 },
          },
        },
        settings: {
          realTime: true,
          quality: "high",
          blend: "additive",
        },
      },

      {
        id: "light-effects",
        name: "تأثيرات الإضاءة",
        type: "effect",
        category: "lighting",
        usable: true,
        data: {
          types: [
            {
              name: "أشعة الشمس",
              properties: {
                rays: 12,
                length: 200,
                intensity: 80,
                color: "#ffff99",
                angle: 45,
                animation: "rotate",
              },
            },
            {
              name: "توهج",
              properties: {
                size: 50,
                intensity: 70,
                color: "#ffffff",
                falloff: "smooth",
                animation: "pulse",
              },
            },
            {
              name: "فلاش",
              properties: {
                duration: 0.5,
                intensity: 100,
                color: "#ffffff",
                fade: "exponential",
              },
            },
          ],
          controls: {
            position: { x: 50, y: 50 },
            scale: { min: 0.1, max: 5.0, default: 1.0 },
            rotation: { min: 0, max: 360, default: 0 },
            opacity: { min: 0, max: 100, default: 100 },
          },
        },
        settings: {
          blend: "screen",
          quality: "high",
          antiAlias: true,
        },
      },
    ];

    realEffects.forEach((effect) => {
      this.allocatedContent.set(effect.id, effect);
    });

    console.log(`✅ تم تخصيص ${realEffects.length} تأثير حقيقي`);
  }

  // تخصيص إعدادات تصدير مُحسّنة
  private async allocateExportPresets(): Promise<void> {
    const exportPresets: RealContent[] = [
      {
        id: "youtube-optimized",
        name: "محسن لليوتيوب",
        type: "preset",
        category: "export",
        usable: true,
        data: {
          video: {
            codec: "h264",
            profile: "high",
            level: "4.2",
            bitrate: "8000k",
            maxBitrate: "12000k",
            bufferSize: "16000k",
            keyframes: 2,
            bFrames: 2,
            refs: 3,
          },
          audio: {
            codec: "aac",
            bitrate: "320k",
            sampleRate: 48000,
            channels: 2,
          },
          container: "mp4",
          resolution: "1920x1080",
          fps: 60,
          colorSpace: "bt709",
          optimizations: {
            fastStart: true,
            webOptimized: true,
            fileSize: "balanced",
          },
        },
        settings: {
          description: "أفضل إعدادات لرفع فيديوهات عالية الجودة لليوتيوب",
          estimatedSize: "متوسط",
          uploadSpeed: "سريع",
        },
      },

      {
        id: "instagram-stories",
        name: "قصص انستغرام",
        type: "preset",
        category: "export",
        usable: true,
        data: {
          video: {
            codec: "h264",
            bitrate: "3500k",
            profile: "main",
          },
          audio: {
            codec: "aac",
            bitrate: "128k",
            sampleRate: 44100,
          },
          container: "mp4",
          resolution: "1080x1920",
          fps: 30,
          duration: { max: 15 },
          optimizations: {
            mobile: true,
            fastStart: true,
            fileSize: "small",
          },
        },
        settings: {
          description: "مُحسن للقصص القصيرة على انستغرام",
          aspectRatio: "9:16",
          maxDuration: "15 seconds",
        },
      },

      {
        id: "professional-archive",
        name: "أرشيف احترافي",
        type: "preset",
        category: "export",
        usable: true,
        data: {
          video: {
            codec: "prores",
            profile: "422HQ",
            quality: "lossless",
          },
          audio: {
            codec: "pcm",
            bitDepth: 24,
            sampleRate: 48000,
          },
          container: "mov",
          resolution: "3840x2160",
          fps: 60,
          colorSpace: "bt2020",
          metadata: {
            timecode: true,
            colorProfile: true,
            creator: true,
          },
        },
        settings: {
          description: "جودة احترافية للأرشفة طويلة المدى",
          fileSize: "كبير",
          quality: "أقصى جودة",
        },
      },
    ];

    exportPresets.forEach((preset) => {
      this.allocatedContent.set(preset.id, preset);
    });

    console.log(`✅ تم تخصيص ${exportPresets.length} إعداد تصدير مُحسّن`);
  }

  // تخصيص أصول المستخدم
  private async allocateUserAssets(): Promise<void> {
    const userAssets: RealContent[] = [
      {
        id: "arabic-fonts-pack",
        name: "حزمة الخطوط العربية",
        type: "asset",
        category: "fonts",
        usable: true,
        data: {
          fonts: [
            {
              name: "Cairo",
              file: "cairo.woff2",
              weight: [200, 300, 400, 600, 700, 900],
            },
            {
              name: "Tajawal",
              file: "tajawal.woff2",
              weight: [300, 400, 500, 700, 800],
            },
            {
              name: "Almarai",
              file: "almarai.woff2",
              weight: [300, 400, 700, 800],
            },
            { name: "Amiri", file: "amiri.woff2", weight: [400, 700] },
            {
              name: "Scheherazade",
              file: "scheherazade.woff2",
              weight: [400, 700],
            },
          ],
          categories: ["sans-serif", "serif", "calligraphy"],
          preview: "أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ",
          languages: ["arabic", "persian", "urdu"],
        },
        settings: {
          autoLoad: true,
          fallback: "Arial",
          rendering: "smooth",
        },
      },

      {
        id: "royalty-free-music",
        name: "موسيقى خالية من حقوق الطبع",
        type: "asset",
        category: "audio",
        usable: true,
        data: {
          tracks: [
            {
              name: "إلهام رقمي",
              file: "digital-inspiration.mp3",
              duration: 180,
              genre: "electronic",
              mood: "uplifting",
              instruments: ["synthesizer", "drums", "bass"],
              bpm: 128,
            },
            {
              name: "هدوء الطبيعة",
              file: "nature-calm.mp3",
              duration: 240,
              genre: "ambient",
              mood: "peaceful",
              instruments: ["piano", "strings", "nature sounds"],
              bpm: 72,
            },
            {
              name: "طاقة الحماس",
              file: "energy-boost.mp3",
              duration: 150,
              genre: "rock",
              mood: "energetic",
              instruments: ["guitar", "drums", "bass"],
              bpm: 140,
            },
          ],
          categories: ["intro", "background", "outro", "transition"],
          license: "royalty-free",
          attribution: false,
        },
        settings: {
          volume: 0.3,
          fade: true,
          loop: true,
        },
      },

      {
        id: "ui-sound-effects",
        name: "تأثيرات صوتية للواجهة",
        type: "asset",
        category: "audio",
        usable: true,
        data: {
          effects: [
            { name: "نقرة", file: "click.wav", duration: 0.1 },
            { name: "تأكيد", file: "confirm.wav", duration: 0.3 },
            { name: "خطأ", file: "error.wav", duration: 0.5 },
            { name: "نجاح", file: "success.wav", duration: 0.7 },
            { name: "إشعار", file: "notification.wav", duration: 0.4 },
            { name: "تحذير", file: "warning.wav", duration: 0.6 },
          ],
          triggers: {
            "button-click": "نقرة",
            "save-complete": "نجاح",
            "error-occurred": "خطأ",
            "export-done": "تأكيد",
          },
        },
        settings: {
          enabled: true,
          volume: 0.5,
          spatial: false,
        },
      },
    ];

    userAssets.forEach((asset) => {
      this.allocatedContent.set(asset.id, asset);
    });

    console.log(`✅ تم تخصيص ${userAssets.length} أصل للمستخدم`);
  }

  // إنتاج ص��رة مصغرة للقوالب
  private generateThumbnail(type: string): string {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext("2d")!;

    // خلفية متدرجة
    const gradient = ctx.createLinearGradient(0, 0, 320, 180);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 320, 180);

    // إضافة نص الوصف
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(type.toUpperCase(), 160, 90);

    // إضافة إطار
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 320, 180);

    return canvas.toDataURL();
  }

  // تطبيق المحتوى على المستخدم
  async applyContentToUser(): Promise<void> {
    console.log("🎯 تطبيق المحتوى النهائي على المستخدم...");

    // حفظ المحتوى في التطبيق
    const contentData = Array.from(this.allocatedContent.entries()).reduce(
      (acc, [id, content]) => {
        acc[id] = content;
        return acc;
      },
      {} as Record<string, RealContent>,
    );

    localStorage.setItem("knoux_real_content", JSON.stringify(contentData));
    localStorage.setItem(
      "knoux_user_profile",
      JSON.stringify(this.userProfile),
    );

    // تفعيل المحتوى في النظام
    this.activateTemplates();
    this.activateTools();
    this.activateFilters();
    this.activateEffects();
    this.activateExportPresets();
    this.activateUserAssets();

    console.log("✅ تم تطبيق جميع المحتوى النهائي بنجاح");
  }

  // تفعيل القوالب
  private activateTemplates(): void {
    const templates = Array.from(this.allocatedContent.values()).filter(
      (content) => content.type === "template",
    );

    templates.forEach((template) => {
      // إضافة للقائمة المتاحة
      const event = new CustomEvent("templateAdded", {
        detail: template,
      });
      window.dispatchEvent(event);
    });

    console.log(`📝 تم تفعيل ${templates.length} قالب`);
  }

  // تفعيل الأدوات
  private activateTools(): void {
    const tools = Array.from(this.allocatedContent.values()).filter(
      (content) => content.type === "tool",
    );

    tools.forEach((tool) => {
      const event = new CustomEvent("toolAdded", {
        detail: tool,
      });
      window.dispatchEvent(event);
    });

    console.log(`🛠️ تم تفعيل ${tools.length} أداة`);
  }

  // تفعيل الفلاتر
  private activateFilters(): void {
    const filters = Array.from(this.allocatedContent.values()).filter(
      (content) => content.type === "filter",
    );

    filters.forEach((filter) => {
      const event = new CustomEvent("filterAdded", {
        detail: filter,
      });
      window.dispatchEvent(event);
    });

    console.log(`🎨 تم تفعيل ${filters.length} فلتر`);
  }

  // تفعيل التأثيرات
  private activateEffects(): void {
    const effects = Array.from(this.allocatedContent.values()).filter(
      (content) => content.type === "effect",
    );

    effects.forEach((effect) => {
      const event = new CustomEvent("effectAdded", {
        detail: effect,
      });
      window.dispatchEvent(event);
    });

    console.log(`✨ تم تفعيل ${effects.length} تأثير`);
  }

  // تفعيل إعدادات التصدير
  private activateExportPresets(): void {
    const presets = Array.from(this.allocatedContent.values()).filter(
      (content) => content.type === "preset",
    );

    presets.forEach((preset) => {
      const event = new CustomEvent("presetAdded", {
        detail: preset,
      });
      window.dispatchEvent(event);
    });

    console.log(`📦 تم تفعيل ${presets.length} إعداد تصدير`);
  }

  // ��فعيل أصول المستخدم
  private activateUserAssets(): void {
    const assets = Array.from(this.allocatedContent.values()).filter(
      (content) => content.type === "asset",
    );

    assets.forEach((asset) => {
      const event = new CustomEvent("assetAdded", {
        detail: asset,
      });
      window.dispatchEvent(event);
    });

    console.log(`💎 تم تفعيل ${assets.length} أصل`);
  }

  // الحصول على المحتوى حسب النوع
  getContentByType(type: RealContent["type"]): RealContent[] {
    return Array.from(this.allocatedContent.values()).filter(
      (content) => content.type === type,
    );
  }

  // الحصول على المحتوى حسب الفئة
  getContentByCategory(category: string): RealContent[] {
    return Array.from(this.allocatedContent.values()).filter(
      (content) => content.category === category,
    );
  }

  // إحصائيات المحتوى
  getContentStats(): any {
    const types = Array.from(this.allocatedContent.values()).reduce(
      (acc, content) => {
        acc[content.type] = (acc[content.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: this.allocatedContent.size,
      types,
      usable: Array.from(this.allocatedContent.values()).filter((c) => c.usable)
        .length,
      categories: [
        ...new Set(
          Array.from(this.allocatedContent.values()).map((c) => c.category),
        ),
      ],
    };
  }

  // تحديث ملف المستخدم
  updateUserProfile(updates: Partial<UserProfile>): void {
    this.userProfile = { ...this.userProfile, ...updates };
    localStorage.setItem(
      "knoux_user_profile",
      JSON.stringify(this.userProfile),
    );
  }

  // الحصول على المحتوى المُخصص للمستخدم
  getPersonalizedContent(): RealContent[] {
    const contentType = this.userProfile.preferences.contentType;
    const favoriteTools = this.userProfile.usage.favoriteTools;

    return Array.from(this.allocatedContent.values()).filter((content) => {
      // محتوى مُخصص حسب نوع المحتوى المُفضل
      if (contentType === "professional" && content.category.includes("pro"))
        return true;
      if (contentType === "gaming" && content.category.includes("game"))
        return true;
      if (contentType === "educational" && content.category.includes("edu"))
        return true;

      // الأدوات المُفضلة
      if (favoriteTools.some((tool) => content.id.includes(tool))) return true;

      return content.usable;
    });
  }
}

// إنشاء مثيل وحيد
export const realContentAllocator = new RealContentAllocator();
export default RealContentAllocator;
