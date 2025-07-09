// KNOUX REC - Local AI Models Mapping
// ربط القوالب والأدوات بالنماذج المحلية 100%

export interface LocalAIMapping {
  templates: TemplateAIMapping;
  toolbox: ToolboxAIMapping;
}

export interface TemplateAIMapping {
  [templateId: string]: {
    primaryModel: string;
    supportingModels: string[];
    capabilities: string[];
    memoryUsage: string;
    loadTime: string;
  };
}

export interface ToolboxAIMapping {
  [toolId: string]: {
    primaryModel: string;
    supportingModels: string[];
    processingTime: string;
    memoryUsage: string;
    category: "video" | "audio" | "image" | "text" | "ai";
  };
}

// 🧩 ربط القوالب بالنماذج المحلية
export const templateAIMapping: TemplateAIMapping = {
  "for-you": {
    primaryModel: "llama2",
    supportingModels: ["gpt4all", "yolo"],
    capabilities: [
      "user_behavior_analysis",
      "content_recommendation",
      "personalization",
      "smart_categorization",
    ],
    memoryUsage: "3.5GB",
    loadTime: "4.2s",
  },

  education: {
    primaryModel: "llama2",
    supportingModels: ["gpt4all", "whisper"],
    capabilities: [
      "content_organization",
      "slide_structuring",
      "learning_assistance",
      "educational_analysis",
    ],
    memoryUsage: "3.6GB",
    loadTime: "4.5s",
  },

  birthday: {
    primaryModel: "stable_diffusion",
    supportingModels: ["animatediff", "videocrafter"],
    capabilities: [
      "celebration_effects",
      "party_animations",
      "festive_overlays",
      "confetti_generation",
    ],
    memoryUsage: "5.3GB",
    loadTime: "9.3s",
  },

  festival: {
    primaryModel: "stable_diffusion",
    supportingModels: ["animatediff", "videocrafter"],
    capabilities: [
      "cultural_animations",
      "seasonal_effects",
      "traditional_motions",
      "holiday_themes",
    ],
    memoryUsage: "5.3GB",
    loadTime: "9.3s",
  },

  intro: {
    primaryModel: "videocrafter",
    supportingModels: ["animatediff", "stable_diffusion"],
    capabilities: [
      "logo_animation",
      "brand_reveal",
      "text_animations",
      "professional_intros",
    ],
    memoryUsage: "7.0GB",
    loadTime: "11.3s",
  },

  outro: {
    primaryModel: "videocrafter",
    supportingModels: ["stable_diffusion", "gpt4all"],
    capabilities: [
      "closing_animations",
      "credit_rolls",
      "call_to_action",
      "fade_out_effects",
    ],
    memoryUsage: "6.7GB",
    loadTime: "10.8s",
  },

  vlog: {
    primaryModel: "yolo",
    supportingModels: ["whisper", "modnet", "real_esrgan"],
    capabilities: [
      "content_analysis",
      "scene_detection",
      "background_removal",
      "audio_enhancement",
    ],
    memoryUsage: "315MB",
    loadTime: "3.4s",
  },

  wedding: {
    primaryModel: "real_esrgan",
    supportingModels: ["modnet", "stable_diffusion"],
    capabilities: [
      "photo_enhancement",
      "video_stabilization",
      "romantic_effects",
      "quality_improvement",
    ],
    memoryUsage: "330MB",
    loadTime: "3.6s",
  },

  news: {
    primaryModel: "whisper",
    supportingModels: ["gpt4all", "llama2", "bark_tts"],
    capabilities: [
      "script_generation",
      "language_translation",
      "voice_synthesis",
      "news_formatting",
    ],
    memoryUsage: "3.7GB",
    loadTime: "6.3s",
  },

  business: {
    primaryModel: "bark_tts",
    supportingModels: ["gpt4all", "llama2"],
    capabilities: [
      "professional_voice_over",
      "marketing_copy",
      "presentation_enhancement",
      "corporate_branding",
    ],
    memoryUsage: "300MB",
    loadTime: "4.7s",
  },
};

// 🛠️ ربط أدوات Toolbox بالنماذج المحلية
export const toolboxAIMapping: ToolboxAIMapping = {
  // 🎬 أدوات الفيديو
  "ai-effects": {
    primaryModel: "yolo",
    supportingModels: ["stable_diffusion", "animatediff"],
    processingTime: "15-30s",
    memoryUsage: "2.5GB",
    category: "video",
  },

  "ai-animation": {
    primaryModel: "animatediff",
    supportingModels: ["stable_diffusion"],
    processingTime: "20-45s",
    memoryUsage: "5.3GB",
    category: "video",
  },

  "ai-transition": {
    primaryModel: "scenecut",
    supportingModels: ["yolo"],
    processingTime: "2-5s",
    memoryUsage: "50MB",
    category: "video",
  },

  "video-translator": {
    primaryModel: "whisper",
    supportingModels: ["m2m100", "bark_tts"],
    processingTime: "1-2x duration",
    memoryUsage: "505MB",
    category: "video",
  },

  "ai-shorts": {
    primaryModel: "yolo",
    supportingModels: ["whisper", "scenecut"],
    processingTime: "5-15s",
    memoryUsage: "130MB",
    category: "video",
  },

  "image-to-video": {
    primaryModel: "videocrafter",
    supportingModels: ["animatediff"],
    processingTime: "30-60s",
    memoryUsage: "4.2GB",
    category: "video",
  },

  "text-to-video": {
    primaryModel: "videocrafter",
    supportingModels: ["gpt4all", "stable_diffusion"],
    processingTime: "45-90s",
    memoryUsage: "7.7GB",
    category: "video",
  },

  "ai-video-generator": {
    primaryModel: "videocrafter",
    supportingModels: ["gpt4all"],
    processingTime: "60-120s",
    memoryUsage: "4.2GB",
    category: "video",
  },

  stabilization: {
    primaryModel: "yolo",
    supportingModels: [],
    processingTime: "1-3s",
    memoryUsage: "80MB",
    category: "video",
  },

  "ai-background-remover": {
    primaryModel: "modnet",
    supportingModels: ["u2net"],
    processingTime: "100-300ms/frame",
    memoryUsage: "275MB",
    category: "video",
  },

  "blur-background": {
    primaryModel: "modnet",
    supportingModels: [],
    processingTime: "50-150ms/frame",
    memoryUsage: "180MB",
    category: "video",
  },

  "face-swap": {
    primaryModel: "simswap",
    supportingModels: ["yolo"],
    processingTime: "3-8s/face",
    memoryUsage: "320MB",
    category: "video",
  },

  "ai-shorts": {
    primaryModel: "yolo",
    supportingModels: ["whisper", "gpt4all"],
    processingTime: "5-15s",
    memoryUsage: "210MB",
    category: "video",
  },

  "text-based-editing": {
    primaryModel: "whisper",
    supportingModels: ["gpt4all"],
    processingTime: "3-10s",
    memoryUsage: "205MB",
    category: "video",
  },

  // 🎵 أدوات الصوت
  "vocal-remover": {
    primaryModel: "spleeter",
    supportingModels: [],
    processingTime: "0.3x duration",
    memoryUsage: "150MB",
    category: "audio",
  },

  "voice-change": {
    primaryModel: "sovits",
    supportingModels: [],
    processingTime: "1.5x duration",
    memoryUsage: "220MB",
    category: "audio",
  },

  "noise-reduction": {
    primaryModel: "rnnoise",
    supportingModels: [],
    processingTime: "0.05x duration",
    memoryUsage: "15MB",
    category: "audio",
  },

  "beat-detection": {
    primaryModel: "beat_detector",
    supportingModels: [],
    processingTime: "0.2x duration",
    memoryUsage: "25MB",
    category: "audio",
  },

  tts: {
    primaryModel: "bark_tts",
    supportingModels: [],
    processingTime: "1.5s/sentence",
    memoryUsage: "180MB",
    category: "audio",
  },

  stt: {
    primaryModel: "whisper",
    supportingModels: [],
    processingTime: "real-time",
    memoryUsage: "85MB",
    category: "audio",
  },

  "split-subtitles": {
    primaryModel: "whisper",
    supportingModels: ["gpt4all"],
    processingTime: "real-time",
    memoryUsage: "205MB",
    category: "audio",
  },

  // 🖼️ أدوات الصور
  "photo-enhancer": {
    primaryModel: "real_esrgan",
    supportingModels: [],
    processingTime: "2-5s",
    memoryUsage: "150MB",
    category: "image",
  },

  "auto-removal": {
    primaryModel: "u2net",
    supportingModels: ["sam"],
    processingTime: "200-500ms",
    memoryUsage: "190MB",
    category: "image",
  },

  "custom-cutout": {
    primaryModel: "sam",
    supportingModels: [],
    processingTime: "500ms-3s",
    memoryUsage: "650MB",
    category: "image",
  },

  "text-to-image": {
    primaryModel: "stable_diffusion",
    supportingModels: [],
    processingTime: "15-30s",
    memoryUsage: "2.5GB",
    category: "image",
  },

  "image-upscaler": {
    primaryModel: "real_esrgan",
    supportingModels: [],
    processingTime: "2-5s",
    memoryUsage: "150MB",
    category: "image",
  },

  // 📝 أدوات النص والذكاء الاصطناعي
  "ai-copywriting": {
    primaryModel: "gpt4all",
    supportingModels: ["llama2"],
    processingTime: "2-5s",
    memoryUsage: "3.6GB",
    category: "text",
  },

  "subtitle-generation": {
    primaryModel: "whisper",
    supportingModels: ["gpt4all"],
    processingTime: "real-time",
    memoryUsage: "205MB",
    category: "text",
  },

  "ai-avatar": {
    primaryModel: "sadtalker",
    supportingModels: ["whisper", "bark_tts"],
    processingTime: "3s/second",
    memoryUsage: "580MB",
    category: "ai",
  },

  "singing-face": {
    primaryModel: "sadtalker",
    supportingModels: ["wav2lip", "beat_detector"],
    processingTime: "2-4s/second",
    memoryUsage: "860MB",
    category: "ai",
  },

  "screen-recorder": {
    primaryModel: "yolo",
    supportingModels: [],
    processingTime: "real-time",
    memoryUsage: "45MB",
    category: "video",
  },

  "video-downloader": {
    primaryModel: "yolo",
    supportingModels: [],
    processingTime: "network-dependent",
    memoryUsage: "10MB",
    category: "video",
  },

  "audio-extractor": {
    primaryModel: "spleeter",
    supportingModels: [],
    processingTime: "0.1x duration",
    memoryUsage: "50MB",
    category: "audio",
  },
};

// 🔧 دوال مساعدة لإدارة النماذج
export class LocalAIManager {
  private loadedModels: Set<string> = new Set();
  private modelLoadTimes: Map<string, number> = new Map();

  // تحميل النماذج المطلوبة لقالب معين
  async loadTemplateModels(templateId: string): Promise<boolean> {
    const mapping = templateAIMapping[templateId];
    if (!mapping) {
      console.error(`🚫 Template ${templateId} not found in mapping`);
      return false;
    }

    console.log(`🎨 Loading models for template: ${templateId}`);
    console.log(`📦 Primary model: ${mapping.primaryModel}`);
    console.log(`🔧 Supporting models: ${mapping.supportingModels.join(", ")}`);

    try {
      // تحميل النموذج الأساسي أولاً
      await this.loadModel(mapping.primaryModel);

      // تحميل النماذج المساعدة
      for (const model of mapping.supportingModels) {
        await this.loadModel(model);
      }

      console.log(`✅ Template ${templateId} models loaded successfully`);
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to load models for template ${templateId}:`,
        error,
      );
      return false;
    }
  }

  // تحميل النماذج المطلوبة لأداة معينة
  async loadToolModels(toolId: string): Promise<boolean> {
    const mapping = toolboxAIMapping[toolId];
    if (!mapping) {
      console.error(`🚫 Tool ${toolId} not found in mapping`);
      return false;
    }

    console.log(`🛠️ Loading models for tool: ${toolId}`);
    console.log(`📦 Primary model: ${mapping.primaryModel}`);
    console.log(`🔧 Supporting models: ${mapping.supportingModels.join(", ")}`);

    try {
      // تحميل النموذج الأساسي
      await this.loadModel(mapping.primaryModel);

      // تحميل النماذج المساعدة
      for (const model of mapping.supportingModels) {
        await this.loadModel(model);
      }

      console.log(`✅ Tool ${toolId} models loaded successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load models for tool ${toolId}:`, error);
      return false;
    }
  }

  // تحميل نموذج واحد
  private async loadModel(modelName: string): Promise<void> {
    if (this.loadedModels.has(modelName)) {
      console.log(`ℹ️ Model ${modelName} already loaded`);
      return;
    }

    const startTime = performance.now();
    console.log(`⏳ Loading model: ${modelName}...`);

    try {
      // محاكاة تحميل النموذج (في التطبيق الحقيقي، يتم التحميل من offlineAI)
      const { offlineAI } = await import("./offlineAI");
      await offlineAI.loadModel(modelName);

      const loadTime = performance.now() - startTime;
      this.modelLoadTimes.set(modelName, loadTime);
      this.loadedModels.add(modelName);

      console.log(`✅ Model ${modelName} loaded in ${loadTime.toFixed(2)}ms`);
    } catch (error) {
      console.error(`❌ Failed to load model ${modelName}:`, error);
      throw error;
    }
  }

  // الحصول على معلومات الاستخدام
  getUsageInfo(templateId?: string, toolId?: string): any {
    if (templateId) {
      const mapping = templateAIMapping[templateId];
      return {
        type: "template",
        id: templateId,
        models: [mapping.primaryModel, ...mapping.supportingModels],
        memoryUsage: mapping.memoryUsage,
        loadTime: mapping.loadTime,
        capabilities: mapping.capabilities,
      };
    }

    if (toolId) {
      const mapping = toolboxAIMapping[toolId];
      return {
        type: "tool",
        id: toolId,
        models: [mapping.primaryModel, ...mapping.supportingModels],
        memoryUsage: mapping.memoryUsage,
        processingTime: mapping.processingTime,
        category: mapping.category,
      };
    }

    return {
      loadedModels: Array.from(this.loadedModels),
      loadTimes: Object.fromEntries(this.modelLoadTimes),
      totalMemoryUsage: this.calculateTotalMemoryUsage(),
    };
  }

  // حساب إجمالي استهلاك الذاكرة
  private calculateTotalMemoryUsage(): string {
    let totalMB = 0;

    // أحجام النماذج بالميجابايت
    const modelSizes: Record<string, number> = {
      gpt4all: 120,
      llama2: 3584, // 3.5GB
      whisper: 85,
      stable_diffusion: 2560, // 2.5GB
      real_esrgan: 150,
      u2net: 95,
      modnet: 180,
      sam: 650,
      videocrafter: 4300, // 4.2GB
      animatediff: 2867, // 2.8GB
      simswap: 320,
      yolo: 45,
      bark_tts: 180,
      spleeter: 150,
      sovits: 220,
      sadtalker: 580,
    };

    for (const modelName of this.loadedModels) {
      totalMB += modelSizes[modelName] || 0;
    }

    if (totalMB > 1024) {
      return `${(totalMB / 1024).toFixed(1)}GB`;
    }
    return `${totalMB}MB`;
  }

  // إلغاء تحميل نماذج غير مستخدمة
  async unloadUnusedModels(
    activeTemplate?: string,
    activeTool?: string,
  ): Promise<void> {
    const requiredModels = new Set<string>();

    // إضافة نماذج القالب النشط
    if (activeTemplate && templateAIMapping[activeTemplate]) {
      const mapping = templateAIMapping[activeTemplate];
      requiredModels.add(mapping.primaryModel);
      mapping.supportingModels.forEach((model) => requiredModels.add(model));
    }

    // إضافة نماذج الأداة النشطة
    if (activeTool && toolboxAIMapping[activeTool]) {
      const mapping = toolboxAIMapping[activeTool];
      requiredModels.add(mapping.primaryModel);
      mapping.supportingModels.forEach((model) => requiredModels.add(model));
    }

    // إلغاء تحميل النماذج غير المطلوبة
    for (const modelName of this.loadedModels) {
      if (!requiredModels.has(modelName)) {
        console.log(`🗑️ Unloading unused model: ${modelName}`);
        this.loadedModels.delete(modelName);
        this.modelLoadTimes.delete(modelName);
      }
    }
  }

  // الحصول على إحصائيات الأداء
  getPerformanceStats(): any {
    return {
      loadedModelsCount: this.loadedModels.size,
      totalMemoryUsage: this.calculateTotalMemoryUsage(),
      averageLoadTime: this.calculateAverageLoadTime(),
      modelLoadTimes: Object.fromEntries(this.modelLoadTimes),
    };
  }

  private calculateAverageLoadTime(): number {
    if (this.modelLoadTimes.size === 0) return 0;

    const total = Array.from(this.modelLoadTimes.values()).reduce(
      (a, b) => a + b,
      0,
    );
    return total / this.modelLoadTimes.size;
  }
}

// إنشاء مثيل مشترك
export const localAIManager = new LocalAIManager();

// تصدير الواجهات والأنواع
export type { LocalAIMapping, TemplateAIMapping, ToolboxAIMapping };
