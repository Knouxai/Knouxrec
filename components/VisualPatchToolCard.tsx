import * as tf from "@tensorflow/tfjs";
import { videoProcessor } from "./videoProcessor"; // تأكد من وجود هذا الملف
import { audioProcessor } from "./audioProcessor"; // تأكد من وجود هذا الملف
import { imageProcessor } from "./imageProcessor"; // تأكد من وجود هذا الملف
import { enhancedModelManager, LoadingProgress } from "./enhancedModelManager"; // تأكد من وجود هذا الملف
import { enhancedErrorHandler } from "./enhancedErrorHandler"; // تأكد من وجود هذا الملف

/**
 * 1. واجهة AIProcessingTask معززة لمعلومات المستخدم وإدارة المهام.
 * تتضمن معلومات تفصيلية عن المهمة، حالتها، تقدمها، وحتى ملاحظات المستخدم.
 */
export interface AIProcessingTask {
  id: string;
  type: "video" | "audio" | "image" | "text";
  operation: string; // اسم العملية مثل "text_to_video", "background_removal"
  status: "pending" | "processing" | "completed" | "error" | "cancelled";
  progress: number; // 0-100%
  input: File | Blob | string; // يمكن أن يكون ملف، كائن ثنائي كبير، أو نص
  output?: Blob | string; // الناتج يمكن أن يكون كائن ثنائي كبير أو نص
  error?: string; // رسالة الخطأ في حال الفشل
  credits: number; // عدد النقاط المطلوبة للمهمة
  estimatedTime: number; // بالثواني، تقدير أولي لوقت المعالجة
  startTime?: number; // وقت بدء المعالجة (Timestamp)
  endTime?: number; // وقت انتهاء المعالجة (Timestamp)
  displayName: string; // اسم عرض للمهمة (مثال: "تحويل صوت إلى نص")
  description?: string; // وصف تفصيلي للمهمة
  thumbnail?: string; // رابط صورة مصغرة للمدخل (إذا كان صورة/فيديو)
  userFeedback?: "satisfied" | "dissatisfied" | "none"; // ملاحظات المستخدم على النتيجة
  cancellable: boolean; // هل يمكن إلغاء المهمة
  onProgress?: (progress: number) => void; // دالة رد اتصال لتحديث التقدم
  onComplete?: (task: AIProcessingTask) => void; // دالة رد اتصال عند الانتهاء
  onError?: (task: AIProcessingTask, error: string) => void; // دالة رد اتصال عند الخطأ
  options?: AIProcessingOptions; // خيارات إضافية خاصة بالمهمة
}

/**
 * 2. واجهة AIModel لتعريف النماذج.
 * تم توسيعها لتشمل URL لتحميل مباشر وأيضاً نوع الترجمة.
 */
export interface AIModel {
  name: string;
  type:
    | "segmentation"
    | "detection"
    | "generation"
    | "enhancement"
    | "analysis"
    | "translation" // أضيف نوع "translation"
    | "utility"; // للنماذج المساعدة مثل RNNoise, Beat Detector
  size: number; // MB
  loaded: boolean; // هل تم تحميل النموذج؟
  model?: tf.GraphModel | tf.LayersModel; // كائن النموذج المحمّل
  version: string;
  url: string; // URL للتحميل المباشر للنموذج
  description: string; // وصف موجز للنموذج
}

/**
 * 3. واجهة CreditSystem لنظام النقاط.
 * توضح مستويات النقاط الحرة والمدفوعة والمستوى الحالي للمستخدم.
 */
export interface CreditSystem {
  free: number; // نقاط المستوى المجاني
  pro: number; // نقاط المستوى الاحترافي
  enterprise: number; // نقاط مستوى الشركات
  current: number; // النقاط المتاحة حالياً للمستخدم
  tier: "free" | "pro" | "enterprise"; // مستوى اشتراك المستخدم
}

/**
 * 4. واجهة AIProcessingOptions لخيارات المعالجة المتقدمة.
 * تسمح بتمرير خيارات مخصصة لكل عملية.
 */
export interface AIProcessingOptions {
  [key: string]: any; // يتيح أي خاصية بأي نوع
}

/**
 * 5. الصف الرئيسي OfflineAI لإدارة كل عمليات الذكاء الاصطناعي.
 * يتضمن إدارة النماذج، قائمة الانتظار، نظام النقاط، ومعالجة الأخطاء.
 */
export class OfflineAI {
  private models: Map<string, AIModel> = new Map();
  private processingQueue: AIProcessingTask[] = [];
  private isProcessing = false; // لتجنب معالجة مهام متعددة في نفس الوقت
  private creditSystem: CreditSystem = {
    free: 100,
    pro: 1000,
    enterprise: 10000,
    current: 100, // يمكن تحميلها من localStorage أو API
    tier: "free",
  };
  // لتخزين دوال رد الاتصال لتقدم التحميل
  private progressCallbacks: Map<string, Array<(progress: LoadingProgress) => void>> = new Map();
  // لتخزين دوال رد الاتصال لتقدم المهام الفردية
  private taskProgressCallbacks: Map<string, Array<(progress: number) => void>> = new Map();

  constructor() {
    this.initializeModels();
    this.startProcessingQueue();
    this.setupEnhancedFeatures();
  }

  /**
   * إعداد الميزات المحسنة: ربط معالج الأخطاء وإعداد حد الذاكرة.
   */
  private setupEnhancedFeatures(): void {
    // ربط معالج الأخطاء لتسجيل الأخطاء والتعامل معها بشكل مركزي
    enhancedErrorHandler.onError("offlineAI", (report) => {
      console.error(
        `🚨 خطأ عام في نظام OfflineAI. النموذج: ${report.context.modelName || "غير معروف"}، الخطأ:`,
        report.error,
        report.details,
      );
      // يمكن هنا إطلاق حدث أو عرض إشعار للمستخدم
    });

    // إعداد حد الذاكرة لـ TensorFlow.js من الإعدادات المحفوظة
    const savedSettings = localStorage.getItem("knoux_model_settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        enhancedModelManager.setMemoryLimit(settings.memoryLimit || 4096); // الافتراضي 4GB
      } catch (error) {
        console.warn("⚠️ فشل في تحميل الإعدادات المحفوظة للذاكرة:", error);
      }
    }
    console.log("🛠️ تم إعداد الميزات المحسنة.");
  }

  /**
   * تهيئة النماذج المتاحة.
   * تم إضافة وصف موجز (description) لكل نموذج و URL للتحميل.
   */
  private async initializeModels(): Promise<void> {
    const modelDefinitions = [
      // نماذج توليد (Generation)
      { name: "gpt4all", type: "generation" as const, size: 120, version: "1.0.0", url: "/models/gpt4all/model.json", description: "نموذج لغوي كبير لتوليد النصوص." },
      { name: "llama2", type: "generation" as const, size: 3584, version: "7B-Chat", url: "/models/llama2/model.json", description: "نموذج لغوي كبير مفتوح المصدر للمحادثات." },
      { name: "stable_diffusion", type: "generation" as const, size: 2560, version: "1.5.0", url: "/models/stable_diffusion/model.json", description: "توليد صور فنية من النصوص." },
      { name: "videocrafter", type: "generation" as const, size: 4300, version: "1.0.0", url: "/models/videocrafter/model.json", description: "توليد مقاطع فيديو عالية الجودة." },
      { name: "animatediff", type: "generation" as const, size: 2867, version: "1.0.0", url: "/models/animatediff/model.json", description: "تحويل الصور إلى رسوم متحركة." },
      { name: "simswap", type: "generation" as const, size: 320, version: "1.0.0", url: "/models/simswap/model.json", description: "تبديل الوجوه في الصور والفيديوهات." },
      { name: "bark_tts", type: "generation" as const, size: 180, version: "1.0.0", url: "/models/bark_tts/model.json", description: "تحويل النص إلى كلام طبيعي." },
      { name: "sovits", type: "generation" as const, size: 220, version: "4.0", url: "/models/sovits/model.json", description: "تغيير الصوت وتقليد الأصوات." },
      { name: "sadtalker", type: "generation" as const, size: 580, version: "1.0.0", url: "/models/sadtalker/model.json", description: "تحريك الوجوه من الصور الثابتة باستخدام الصوت." },
      { name: "wav2lip", type: "generation" as const, size: 280, version: "1.0.0", url: "/models/wav2lip/model.json", description: "مزامنة الشفاه مع الصوت في الفيديو." },
      { name: "text_generation", type: "generation" as const, size: 100, version: "1.0.0", url: "/models/text_generation/model.json", description: "نموذج عام لتوليد النصوص الإبداعية." },

      // نماذج تحليل (Analysis)
      { name: "whisper", type: "analysis" as const, size: 85, version: "1.0.0", url: "/models/whisper/model.json", description: "تحويل الكلام إلى نص بدقة عالية." },
      { name: "scenecut", type: "analysis" as const, size: 50, version: "1.0.0", url: "/models/scenecut/model.json", description: "تحليل الفيديو لاكتشاف المشاهد الرئيسية." },
      { name: "spleeter", type: "analysis" as const, size: 150, version: "2-stems", url: "/models/spleeter/model.json", description: "فصل الصوت إلى مقاطع صوتية (غناء، آلات)." },
      { name: "beat_detector", type: "analysis" as const, size: 25, version: "1.0.0", url: "/models/beat_detector/model.json", description: "الكشف عن إيقاعات الموسيقى." },
      { name: "sentiment_analysis", type: "analysis" as const, size: 30, version: "1.0.0", url: "/models/sentiment_analysis/model.json", description: "تحليل المشاعر في النصوص." },

      // نماذج تحسين (Enhancement)
      { name: "real_esrgan", type: "enhancement" as const, size: 150, version: "2.0.0", url: "/models/real_esrgan/model.json", description: "تحسين جودة الصور وتكبيرها." },
      { name: "rnnoise", type: "enhancement" as const, size: 15, version: "1.0.0", url: "/models/rnnoise/model.json", description: "تقليل الضوضاء من الملفات الصوتية." },
      { name: "super_resolution", type: "enhancement" as const, size: 100, version: "1.0.0", url: "/models/super_resolution/model.json", description: "تكبير الصور مع الحفاظ على التفاصيل." },
      { name: "style_transfer", type: "enhancement" as const, size: 100, version: "1.0.0", url: "/models/style_transfer/model.json", description: "تطبيق أنماط فنية على الصور." },

      // نماذج تجزئة (Segmentation)
      { name: "u2net", type: "segmentation" as const, size: 95, version: "1.0.0", url: "/models/u2net/model.json", description: "إزالة الخلفيات من الصور بدقة." },
      { name: "modnet", type: "segmentation" as const, size: 180, version: "1.0.0", url: "/models/modnet/model.json", description: "تجزئة الصورة وإزالة الخلفية." },
      { name: "sam", type: "segmentation" as const, size: 650, version: "1.0.0", url: "/models/sam/model.json", description: "نموذج تجزئة أي شيء في الصور." },
      { name: "selfie_segmentation", type: "segmentation" as const, size: 15, version: "1.0.0", url: "/models/selfie_segmentation/model.json", description: "تجزئة الأشخاص في الصور والفيديوهات." },

      // نماذج كشف (Detection)
      { name: "yolo", type: "detection" as const, size: 45, version: "8.0.0", url: "/models/yolo/model.json", description: "الكشف عن الكائنات في الصور والفيديوهات." },
      { name: "face_detection", type: "detection" as const, size: 10, version: "1.0.0", url: "/models/face_detection/model.json", description: "الكشف عن الوجوه في الصور والفيديوهات." },

      // نماذج ترجمة (Translation)
      { name: "m2m100", type: "translation" as const, size: 420, version: "418M", url: "/models/m2m100/model.json", description: "ترجمة النصوص والصوت بين لغات متعددة." },
    ];

    for (const modelDef of modelDefinitions) {
      this.models.set(modelDef.name, {
        ...modelDef,
        loaded: false,
      });
    }
    console.log(`✨ تم تهيئة ${this.models.size} نموذجًا من نماذج الذكاء الاصطناعي.`);
  }

  /**
   * تحميل نموذج محدد مع نظام إعادة المحاولة وتحديث التقدم.
   * @param modelName اسم النموذج المراد تحميله.
   * @returns Promise<boolean> يشير إلى ما إذا كان التحميل ناجحًا.
   */
  public async loadModel(modelName: string): Promise<boolean> {
    const modelInfo = this.models.get(modelName);
    if (!modelInfo) {
      console.error(`❌ النموذج "${modelName}" غير موجود في التعريفات.`);
      return false;
    }
    if (modelInfo.loaded) {
      console.log(`✅ النموذج "${modelName}" محمل بالفعل.`);
      return true;
    }

    console.log(`⏳ بدء تحميل النموذج: ${modelName}. يرجى الانتظار...`);
    try {
      // استخدام enhancedModelManager للتحميل مع إعادة المحاولة وتحديثات التقدم
      const success = await enhancedModelManager.loadModelWithRetry(
        modelName,
        3, // عدد مرات إعادة المحاولة
        (progress) => {
          // إرسال تحديثات التقدم إلى أي مستمعين لهذا النموذج
          this.emitProgress(modelName, progress);
        },
        modelInfo.url // تمرير الـ URL للنموذج
      );

      if (success) {
        const loadedModel = enhancedModelManager.getModel(modelName);
        if (loadedModel) {
          modelInfo.model = loadedModel;
          modelInfo.loaded = true;
          this.models.set(modelName, modelInfo); // تحديث الخريطة
          console.log(`✅ تم تحميل نموذج ${modelName} بنجاح!`);
          return true;
        }
      }
      console.warn(`❌ فشل تحميل نموذج ${modelName}.`);
      return false;
    } catch (error) {
      // معالجة الخطأ باستخدام النظام المحسن
      await enhancedErrorHandler.handleModelLoadingError(
        error as Error,
        modelName,
        { stage: "loading" },
      );
      console.error(`❌ خطأ أثناء تحميل نموذج ${modelName}:`, error);
      return false;
    }
  }

  /**
   * إلغاء تحميل نموذج محدد لتحرير الذاكرة.
   * @param modelName اسم النموذج المراد إلغاء تحميله.
   * @returns Promise<boolean> يشير إلى ما إذا كان إلغاء التحميل ناجحًا.
   */
  public async unloadModel(modelName: string): Promise<boolean> {
    const modelInfo = this.models.get(modelName);
    if (!modelInfo || !modelInfo.loaded) {
      console.warn(`⚠️ النموذج "${modelName}" غير محمل لإلغاء تحميله.`);
      return false;
    }
    try {
      enhancedModelManager.unloadModel(modelName);
      modelInfo.loaded = false;
      modelInfo.model = undefined; // إزالة مرجع النموذج المحمّل
      this.models.set(modelName, modelInfo); // تحديث الخريطة
      console.log(`🗑️ تم إلغاء تحميل نموذج ${modelName} بنجاح.`);
      return true;
    } catch (error) {
      console.error(`❌ خطأ أثناء إلغاء تحميل نموذج ${modelName}:`, error);
      return false;
    }
  }

  /**
   * الحصول على معلومات نموذج محدد.
   * @param modelName اسم النموذج.
   * @returns AIModel | undefined معلومات النموذج.
   */
  public getModelInfo(modelName: string): AIModel | undefined {
    return this.models.get(modelName);
  }

  /**
   * الحصول على قائمة بجميع النماذج المتاحة.
   * @returns AIModel[] مصفوفة من كائنات AIModel.
   */
  public getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  /**
   * الحصول على تقدم التحميل لنموذج معين.
   * @param modelName اسم النموذج.
   * @returns LoadingProgress | null معلومات التقدم، أو null إذا لم يكن النموذج قيد التحميل.
   */
  public getLoadingProgress(modelName: string): LoadingProgress | null {
    return enhancedModelManager.getLoadingProgress(modelName);
  }

  /**
   * تسجيل دالة رد اتصال لتتبع تقدم تحميل نموذج معين.
   * @param modelName اسم النموذج.
   * @param callback دالة رد الاتصال التي تستقبل LoadingProgress.
   */
  public onLoadingProgress(modelName: string, callback: (progress: LoadingProgress) => void): void {
    if (!this.progressCallbacks.has(modelName)) {
      this.progressCallbacks.set(modelName, []);
    }
    this.progressCallbacks.get(modelName)?.push(callback);
    // أيضا تسجيلها في enhancedModelManager لضمان تلقي التحديثات
    enhancedModelManager.onProgress(modelName, callback);
  }

  /**
   * إلغاء تسجيل دالة رد اتصال لتقدم تحميل نموذج معين.
   * @param modelName اسم النموذج.
   * @param callback دالة رد الاتصال (اختياري، لإلغاء دالة محددة).
   */
  public offLoadingProgress(modelName: string, callback?: (progress: LoadingProgress) => void): void {
    const callbacks = this.progressCallbacks.get(modelName);
    if (callbacks) {
      if (callback) {
        // إزالة دالة رد اتصال محددة
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        // إزالة جميع دوال رد الاتصال لهذا النموذج
        this.progressCallbacks.delete(modelName);
      }
    }
    enhancedModelManager.offProgress(modelName, callback); // إزالة من enhancedModelManager
  }

  /**
   * إصدار تحديثات التقدم لدوال رد الاتصال المسجلة.
   * @param modelName اسم النموذج.
   * @param progress كائن LoadingProgress.
   */
  private emitProgress(modelName: string, progress: LoadingProgress): void {
    this.progressCallbacks.get(modelName)?.forEach(callback => callback(progress));
  }

  /**
   * تسجيل دالة رد اتصال لتتبع تقدم مهمة معالجة معينة.
   * @param taskId معرف المهمة.
   * @param callback دالة رد الاتصال التي تستقبل النسبة المئوية للتقدم.
   */
  public onTaskProgress(taskId: string, callback: (progress: number) => void): void {
    if (!this.taskProgressCallbacks.has(taskId)) {
      this.taskProgressCallbacks.set(taskId, []);
    }
    this.taskProgressCallbacks.get(taskId)?.push(callback);
  }

  /**
   * إلغاء تسجيل دالة رد اتصال لتقدم مهمة معالجة معينة.
   * @param taskId معرف المهمة.
   * @param callback دالة رد الاتصال (اختياري، لإلغاء دالة محددة).
   */
  public offTaskProgress(taskId: string, callback?: (progress: number) => void): void {
    const callbacks = this.taskProgressCallbacks.get(taskId);
    if (callbacks) {
      if (callback) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        this.taskProgressCallbacks.delete(taskId);
      }
    }
  }

  /**
   * إصدار تحديثات التقدم لمهمة معالجة معينة.
   * @param taskId معرف المهمة.
   * @param progress النسبة المئوية للتقدم (0-100).
   */
  private emitTaskProgress(taskId: string, progress: number): void {
    this.taskProgressCallbacks.get(taskId)?.forEach(callback => callback(progress));
  }

  /**
   * إضافة مهمة جديدة إلى قائمة الانتظار.
   * @param task تفاصيل المهمة.
   * @returns Promise<string> معرف المهمة الفريد.
   * @throws Error إذا كانت النقاط غير كافية.
   */
  public async addTask(
    task: Omit<AIProcessingTask, "id" | "status" | "progress" | "estimatedTime" | "startTime" | "endTime" | "thumbnail" | "userFeedback" | "cancellable"> & { displayName: string; description?: string; options?: AIProcessingOptions; },
  ): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // تقدير وقت المعالجة استنادًا إلى نوع المهمة وحجم النموذج (تقريبي)
    let estimatedTime = 10; // افتراضي 10 ثوانٍ
    // البحث عن النموذج المرتبط بالعملية لتقدير الوقت
    const modelInfo = this.models.get(task.operation.split('_')[0]) || this.models.get(task.operation);
    if (modelInfo) {
      // تقدير أكثر دقة: 0.1 ثانية لكل ميجابايت من النموذج كحد أدنى، بحد أقصى 60 ثانية
      estimatedTime = Math.min(60, Math.ceil(modelInfo.size * 0.1));
    }

    // تحديد ما إذا كانت المهمة قابلة للإلغاء
    const cancellable = true; // يمكن جعل بعض المهام غير قابلة للإلغاء حسب التعقيد

    const fullTask: AIProcessingTask = {
      ...task,
      id: taskId,
      status: "pending",
      progress: 0,
      estimatedTime: estimatedTime,
      cancellable: cancellable,
      // يمكن إضافة `thumbnail` هنا إذا كان `input` يمكن تحويله إلى صورة مصغرة
    };

    // التحقق من النقاط قبل إضافة المهمة
    if (this.creditSystem.current < task.credits) {
      throw new Error("نقاطك غير كافية لتنفيذ هذه المهمة. يرجى الترقية أو شراء المزيد من النقاط.");
    }

    this.processingQueue.push(fullTask);
    console.log(`✅ تمت إضافة المهمة "${fullTask.displayName}" بنجاح إلى قائمة الانتظار (ID: ${taskId}).`);
    // هنا يمكن إطلاق حدث لتحديث واجهة المستخدم بأن مهمة جديدة قد أضيفت
    return taskId;
  }

  /**
   * إلغاء مهمة معلقة أو قيد المعالجة.
   * @param taskId معرف المهمة المراد إلغاؤها.
   * @returns boolean يشير إلى ما إذا تم إلغاء المهمة بنجاح.
   */
  public cancelTask(taskId: string): boolean {
    const taskIndex = this.processingQueue.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.warn(`⚠️ المهمة ${taskId} غير موجودة في قائمة الانتظار.`);
      return false;
    }

    const task = this.processingQueue[taskIndex];
    if (task.status === "processing" && !task.cancellable) {
      console.warn(`⚠️ المهمة ${taskId} قيد المعالجة ولا يمكن إلغاؤها.`);
      return false;
    }

    if (task.status === "completed" || task.status === "error" || task.status === "cancelled") {
      console.warn(`⚠️ المهمة ${taskId} انتهت بالفعل (الحالة: ${task.status}).`);
      return false;
    }

    task.status = "cancelled";
    task.error = "المهمة ألغيت بواسطة المستخدم.";
    task.endTime = Date.now();
    this.processingQueue.splice(taskIndex, 1); // إزالة المهمة الملغاة
    // إعادة النقاط إذا كانت المهمة قيد المعالجة (تم خصمها بالفعل)
    if (task.startTime && !task.endTime) { // إذا بدأت ولم تنتهِ
        this.creditSystem.current += task.credits;
        console.log(`🔄 تم إرجاع ${task.credits} نقطة للمستخدم بعد إلغاء المهمة.`);
    }
    console.log(`🚫 تم إلغاء المهمة "${task.displayName}" (ID: ${taskId}).`);
    if (task.onError) {
      task.onError(task, task.error);
    }
    this.offTaskProgress(taskId); // إزالة مستمعي التقدم
    return true;
  }

  /**
   * الحصول على حالة مهمة معينة.
   * @param taskId معرف المهمة.
   * @returns AIProcessingTask | undefined معلومات المهمة.
   */
  public getTaskStatus(taskId: string): AIProcessingTask | undefined {
    // البحث في قائمة الانتظار والمهام المكتملة حديثًا (إذا تم الاحتفاظ بسجل)
    return this.processingQueue.find(t => t.id === taskId);
  }

  /**
   * بدء معالجة المهام في قائمة الانتظار بشكل متسلسل.
   */
  private async startProcessingQueue(): Promise<void> {
    // استخدام setInterval للتحقق بشكل دوري من وجود مهام جديدة
    setInterval(async () => {
      if (this.isProcessing || this.processingQueue.length === 0) {
        return;
      }

      this.isProcessing = true;
      const task = this.processingQueue[0]; // خذ المهمة الأولى، ولا تزيلها إلا بعد اكتمالها
      task.startTime = Date.now(); // تسجيل وقت البدء
      task.status = "processing";
      console.log(`⚡️ بدء معالجة المهمة: "${task.displayName}" (ID: ${task.id})`);

      try {
        await this.processTask(task);
        if (task.status !== "cancelled") { // تأكد أن المهمة لم يتم إلغاؤها أثناء المعالجة
          task.status = "completed";
          task.progress = 100;
          task.endTime = Date.now();
          console.log(`🎉 اكتملت المهمة "${task.displayName}" بنجاح!`);
          if (task.onComplete) {
            task.onComplete(task);
          }
        }
      } catch (error) {
        if (task.status !== "cancelled") { // إذا لم يتم إلغاؤها يدوياً
          task.status = "error";
          task.error = error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء المعالجة.";
          task.endTime = Date.now();
          // إرجاع النقاط في حالة الخطأ
          this.creditSystem.current += task.credits;
          console.error(`❌ خطأ في معالجة المهمة "${task.displayName}":`, task.error);
          if (task.onError) {
            task.onError(task, task.error);
          }
        }
      } finally {
        // إزالة المهمة من قائمة الانتظار بغض النظر عن النتيجة (نجاح/خطأ/إلغاء)
        this.processingQueue.shift();
        this.isProcessing = false;
        this.offTaskProgress(task.id); // إزالة مستمعي التقدم الخاصة بالمهمة المكتملة/الفاشلة
        // تحديث حالة نظام النقاط في واجهة المستخدم (يمكن إطلاق حدث هنا)
      }
    }, 1000); // تحقق كل ثانية
  }

  /**
   * معالجة مهمة واحدة: خصم النقاط، محاكاة التقدم، واستدعاء المعالج الصحيح.
   * @param task المهمة المراد معالجتها.
   * @throws Error إذا كانت العملية غير مدعومة أو حدث خطأ أثناء المعالجة.
   */
  private async processTask(task: AIProcessingTask): Promise<void> {
    // خصم النقاط فقط عند بدء المعالجة الفعلية
    this.creditSystem.current -= task.credits;
    console.log(`💳 تم خصم ${task.credits} نقطة. النقاط المتبقية: ${this.creditSystem.current}`);

    // محاكاة التقدم (يمكن استبدالها بتقدم حقيقي من النماذج)
    const totalSteps = 100; // 100 خطوة للتقدم
    for (let i = 0; i <= totalSteps; i++) {
      if (task.status === "cancelled") {
        console.log(`✋ المهمة ${task.id} تم إلغاؤها أثناء المعالجة.`);
        throw new Error("المهمة ألغيت."); // رمي خطأ للخروج من المعالجة
      }
      task.progress = Math.min(100, Math.floor((i / totalSteps) * 99)); // نترك 1% للاكتمال النهائي
      this.emitTaskProgress(task.id, task.progress); // تحديث التقدم عبر رد الاتصال
      await new Promise(resolve => setTimeout(resolve, (task.estimatedTime * 1000) / totalSteps)); // توزيع الوقت على الخطوات
    }

    // استدعاء المعالجات الحقيقية بناءً على نوع المهمة
    try {
      switch (task.type) {
        case "video":
          await this.processVideoTask(task);
          break;
        case "audio":
          await this.processAudioTask(task);
          break;
        case "image":
          await this.processImageTask(task);
          break;
        case "text":
          await this.processTextTask(task);
          break;
        default:
          throw new Error(`نوع مهمة غير مدعوم: ${task.type}`);
      }
    } catch (opError) {
      // التعامل مع الأخطاء التي تحدث داخل دالة المعالجة الخاصة بالنوع
      await enhancedErrorHandler.handleProcessingError(
        opError as Error,
        task.operation,
        task.id,
        { taskType: task.type, inputSize: (task.input as Blob)?.size || (task.input as string)?.length || 0 }
      );
      throw opError; // إعادة رمي الخطأ ليتم التعامل معه بواسطة startProcessingQueue
    }
  }

  /**
   * 6. معالجات المهام المتخصصة (فيديو، صوت، صورة، نص).
   * كل دالة تستدعي النموذج أو المعالج المناسب.
   */

  // معالجة مهام الفيديو
  private async processVideoTask(task: AIProcessingTask): Promise<void> {
    const videoFile = task.input as File | Blob;

    // تحديث الوصف التلقائي للمهمة قبل بدء العملية الفعلية
    switch (task.operation) {
      case "ai_effects":
        task.description = "تطبيق تأثيرات ذكاء اصطناعي احترافية على الفيديو.";
        await this.loadModel("style_transfer"); // مثال
        task.output = await this.applyAIEffects(videoFile);
        break;
      case "ai_animation":
        task.description = "تحويل الفيديو أو الصورة إلى رسوم متحركة مذهلة.";
        await this.loadModel("animatediff");
        task.output = await this.generateAnimation(videoFile);
        break;
      case "ai_transition":
        task.description = "إضافة انتقالات ذكية وسلسة بين مقاطع الفيديو.";
        await this.loadModel("videocrafter");
        task.output = await this.generateTransition(videoFile);
        break;
      case "image_to_video":
        task.description = "تحويل صورتك الثابتة إلى مقطع فيديو حيوي.";
        await this.loadModel("videocrafter");
        task.output = await this.imageToVideo(videoFile);
        break;
      case "text_to_video":
        task.description = "إنشاء فيديو كامل من نص، مثالي للمحتوى التعليمي.";
        await this.loadModel("videocrafter");
        task.output = await this.textToVideo(task.input as string);
        break;
      case "ai_video_generator":
        task.description = "توليد فيديو بالكامل باستخدام الذكاء الاصطناعي من وصف نصي.";
        await this.loadModel("videocrafter");
        task.output = await this.generateVideo(task.input as string);
        break;
      case "stabilization":
        task.description = "تثبيت لقطات الفيديو المهتزة للحصول على نتائج احترافية.";
        // قد لا تحتاج هذه العملية لنموذج AI محدد، بل تعتمد على خوارزميات معالجة الفيديو
        task.output = await this.stabilizeVideo(videoFile);
        break;
      case "background_removal":
        task.description = "إزالة خلفية الفيديو تلقائيًا مع الحفاظ على الشفافية.";
        await this.loadModel("selfie_segmentation");
        task.output = await this.removeVideoBackground(videoFile);
        break;
      case "blur_background":
        task.description = "تمويه خلفية الفيديو لتركيز الانتباه على العنصر الرئيسي.";
        await this.loadModel("selfie_segmentation");
        task.output = await this.blurVideoBackground(videoFile);
        break;
      case "face_swap":
        task.description = "تبديل الوجوه في الفيديو بذكاء للحصول على تأثيرات مسلية.";
        await this.loadModel("simswap");
        task.output = await this.swapVideoFaces(videoFile);
        break;
      case "ai_shorts":
        task.description = "إنشاء مقاطع فيديو قصيرة وجذابة تلقائيًا لمشاركتها.";
        await this.loadModel("scenecut");
        task.output = await this.generateShorts(videoFile);
        break;
      case "text_based_editing":
        task.description = "تحرير الفيديو عن طريق تحرير النص المستخرج منه.";
        await this.loadModel("whisper");
        task.output = await this.textBasedEditing(
          videoFile,
          task.input as string, // يفترض أن هذا هو النص المحرر
        );
        break;
      case "subtitle_generation_from_video":
        task.description = "إنشاء ترجمات تلقائية لمقاطع الفيديو مباشرة من الصوت.";
        await this.loadModel("whisper");
        // يجب أن يكون المدخل هنا هو ملف الفيديو، وسيتم استخراج الصوت أولاً
        const videoAudio = await videoProcessor.extractAudio(videoFile);
        task.output = await this.speechToText(videoAudio); // استخدام نفس دالة تحويل الصوت لنص
        break;
      default:
        throw enhancedErrorHandler.createError(
          new Error(`عملية فيديو غير مدعومة: ${task.operation}`),
          "processVideoTask",
          { operation: task.operation, taskId: task.id }
        );
    }
  }

  // معالجة مهام الصوت
  private async processAudioTask(task: AIProcessingTask): Promise<void> {
    const audioFile = task.input as File | Blob;

    switch (task.operation) {
      case "vocal_remover":
        task.description = "عزل الصوت البشري عن الموسيقى أو المؤثرات الصوتية.";
        await this.loadModel("spleeter");
        task.output = await audioProcessor.removeVocals(audioFile);
        break;
      case "voice_change":
        task.description = "تغيير صوتك إلى نبرات أو شخصيات مختلفة.";
        await this.loadModel("sovits");
        task.output = await this.changeVoice(audioFile);
        break;
      case "noise_reduction":
        task.description = "تقليل الضوضاء الخلفية وتحسين وضوح الصوت.";
        await this.loadModel("rnnoise");
        task.output = await this.reduceNoise(audioFile);
        break;
      case "beat_detection":
        task.description = "الكشف عن إيقاعات الموسيقى وتوقيتاتها بدقة.";
        await this.loadModel("beat_detector");
        const beats = await audioProcessor.detectBeats(audioFile);
        task.output = new Blob([JSON.stringify(beats, null, 2)], {
          type: "application/json",
        });
        break;
      case "speech_to_text":
        task.description = "تحويل الكلام المنطوق إلى نص مكتوب.";
        await this.loadModel("whisper");
        const text = await this.speechToText(audioFile);
        task.output = text;
        break;
      case "text_to_speech":
        task.description = "تحويل النص المكتوب إلى كلام طبيعي.";
        await this.loadModel("bark_tts");
        task.output = await this.textToSpeech(task.input as string);
        break;
      case "audio_translation":
        task.description = "ترجمة المحتوى الصوتي إلى لغة أخرى.";
        await this.loadModel("m2m100");
        // input هنا يمكن أن يكون اللغة المستهدفة أو كائن خيارات
        task.output = await this.translateAudio(audioFile, task.input as string);
        break;
      default:
        throw enhancedErrorHandler.createError(
          new Error(`عملية صوت غير مدعومة: ${task.operation}`),
          "processAudioTask",
          { operation: task.operation, taskId: task.id }
        );
    }
  }

  // معالجة مهام الصور
  private async processImageTask(task: AIProcessingTask): Promise<void> {
    const imageFile = task.input as File | Blob;

    switch (task.operation) {
      case "background_removal":
        task.description = "إزالة خلفية الصورة بدقة واحترافية.";
        await this.loadModel("u2net"); // أو modnet
        task.output = await this.removeImageBackground(imageFile);
        break;
      case "photo_enhancer":
        task.description = "تحسين جودة الصور تلقائيًا، وإضافة تفاصيل ووضوح.";
        await this.loadModel("real_esrgan"); // أو super_resolution
        task.output = await this.enhancePhoto(imageFile);
        break;
      case "custom_cutout":
        task.description = "قص عناصر محددة من الصورة بمرونة ودقة.";
        await this.loadModel("sam"); // SAM يعتبر ممتازًا للقص المخصص
        task.output = await this.customCutout(imageFile);
        break;
      case "text_to_image":
        task.description = "توليد صور إبداعية من وصف نصي.";
        await this.loadModel("stable_diffusion");
        task.output = await this.textToImage(task.input as string);
        break;
      case "image_upscaler":
        task.description = "تكبير حجم الصور دون فقدان الجودة.";
        await this.loadModel("super_resolution"); // نموذج خاص بالتكبير
        task.output = await this.upscaleImage(imageFile);
        break;
      case "style_transfer":
        task.description = "تطبيق أنماط فنية على صورك لتحويلها إلى تحف فنية.";
        await this.loadModel("style_transfer");
        task.output = await this.transferStyle(imageFile);
        break;
      case "face_detection_image":
        task.description = "الكشف عن الوجوه في الصورة وتحديد مواقعها.";
        await this.loadModel("face_detection");
        const faces = await imageProcessor.detectFaces(imageFile);
        task.output = new Blob([JSON.stringify(faces, null, 2)], { type: "application/json" });
        break;
      case "object_detection_image":
        task.description = "الكشف عن الكائنات المختلفة في الصورة.";
        await this.loadModel("yolo");
        const objects = await imageProcessor.detectObjects(imageFile);
        task.output = new Blob([JSON.stringify(objects, null, 2)], { type: "application/json" });
        break;
      default:
        throw enhancedErrorHandler.createError(
          new Error(`عملية صورة غير مدعومة: ${task.operation}`),
          "processImageTask",
          { operation: task.operation, taskId: task.id }
        );
    }
  }

  // معالجة مهام النص
  private async processTextTask(task: AIProcessingTask): Promise<void> {
    const textInput = task.input as string;

    switch (task.operation) {
      case "ai_copywriting":
        task.description = "توليد نصوص إعلانية وتسويقية جذابة.";
        await this.loadModel("text_generation"); // أو gpt4all
        task.output = await this.generateCopy(textInput, task.displayName);
        break;
      case "text_analysis":
        task.description = "تحليل عميق للنصوص لاستخلاص المشاعر والكلمات المفتاحية.";
        await this.loadModel("sentiment_analysis");
        const analysis = await this.analyzeText(textInput);
        task.output = JSON.stringify(analysis, null, 2);
        break;
      case "subtitle_generation":
        task.description = "إنشاء ترجمات تلقائية لمقاطع الفيديو من النصوص (SRT/VTT).";
        // هذه العملية تفترض أن النص المدخل هو نص الفيديو الخام الذي تم تحويله من صوت
        task.output = await this.generateSubtitles(textInput);
        break;
      case "text_translation":
        task.description = "ترجمة النصوص بين لغات متعددة.";
        await this.loadModel("m2m100");
        // displayName هنا يمكن أن يحتوي على معلومات اللغة المستهدفة
        const targetLang = (task.options?.targetLanguage as string) || "en";
        task.output = await this.translateText(textInput, targetLang);
        break;
      case "summarization":
        task.description = "تلخيص النصوص الطويلة بذكاء.";
        await this.loadModel("text_generation"); // يمكن استخدام GPT4All/Llama2
        task.output = await this.summarizeText(textInput);
        break;
      case "keyword_extraction":
        task.description = "استخراج الكلمات المفتاحية الأساسية من النص.";
        await this.loadModel("text_analysis"); // أو sentiment_analysis
        const keywords = await this.extractKeywords(textInput);
        task.output = JSON.stringify(keywords, null, 2);
        break;
      default:
        throw enhancedErrorHandler.createError(
          new Error(`عملية نص غير مدعومة: ${task.operation}`),
          "processTextTask",
          { operation: task.operation, taskId: task.id }
        );
    }
  }

  /**
   * 7. الدوال المساعدة التي تستدعي معالجات الملفات والنماذج.
   * هذه الدوال تحاكي استدعاء الوظائف الحقيقية في videoProcessor, audioProcessor, imageProcessor.
   */

  // 7.1. وظائف الفيديو
  private async applyAIEffects(videoFile: File | Blob): Promise<Blob> {
    console.log("تطبيق تأثيرات الذكاء الاصطناعي على الفيديو...");
    // استخدام نموذج style_transfer على إطارات الفيديو
    // محاكاة: تطبيق فلتر بسيط
    const filters = [{ type: "grayscale" as const, intensity: 100 }];
    return videoProcessor.applyFilters(videoFile, filters);
  }

  private async generateAnimation(input: File | Blob): Promise<Blob> {
    console.log("توليد رسوم متحركة...");
    // استخدام AnimateDiff أو Videocrafter
    // محاكاة: تحويل الفيديو أو الصورة إلى GIF
    return videoProcessor.videoToGif(input, 0, 5); // 5 ثوانٍ
  }

  private async generateTransition(videoFile: File | Blob): Promise<Blob> {
    console.log("توليد انتقالات ذكية...");
    // استخدام Videocrafter
    // محاكاة: إضافة انتقال وهمي
    const transitions = [{ type: "dissolve" as const, duration: 1.5 }];
    return videoProcessor.addTransitions([videoFile, videoFile], transitions); // تحتاج مقطعين
  }

  private async imageToVideo(imageFile: File | Blob): Promise<Blob> {
    console.log("تحويل الصورة إلى فيديو...");
    // استخدام Videocrafter
    return videoProcessor.imageToVideo(imageFile, 5); // 5 ثوانٍ
  }

  private async textToVideo(text: string): Promise<Blob> {
    console.log(`تحويل النص "${text.substring(0, 50)}..." إلى فيديو.`);
    // استخدام Videocrafter + Text-to-Image + Text-to-Speech
    const imageBlob = await imageProcessor.textToImage(text, {
      width: 1280, height: 720, fontSize: 48, backgroundColor: "#333", color: "#eee"
    });
    const audioBlob = await audioProcessor.textToSpeech(text);
    return videoProcessor.combineImageAudio(imageBlob, audioBlob, 10); // فيديو لمدة 10 ثوان
  }

  private async generateVideo(prompt: string): Promise<Blob> {
    console.log(`توليد فيديو بناءً على الوصف: "${prompt}"`);
    // استخدام Videocrafter أو Stable Diffusion Video
    const mockVideoBlob = new Blob(["mock video content for " + prompt], { type: "video/mp4" });
    return mockVideoBlob;
  }

  private async stabilizeVideo(videoFile: File | Blob): Promise<Blob> {
    console.log("تثبيت الفيديو...");
    return videoProcessor.stabilizeVideo(videoFile, { intensity: 0.8 });
  }

  private async removeVideoBackground(videoFile: File | Blob): Promise<Blob> {
    console.log("إزالة خلفية الفيديو...");
    // استخدام selfie_segmentation أو modnet
    const mockOutput = new Blob(["mock video with transparent background"], { type: "video/webm" });
    return mockOutput;
  }

  private async blurVideoBackground(videoFile: File | Blob): Promise<Blob> {
    console.log("تمويه خلفية الفيديو...");
    // استخدام selfie_segmentation لتحديد المقدمة والخلفية
    const mockOutput = new Blob(["mock video with blurred background"], { type: "video/mp4" });
    return mockOutput;
  }

  private async swapVideoFaces(videoFile: File | Blob): Promise<Blob> {
    console.log("تبديل الوجوه في الفيديو...");
    // استخدام simswap
    const mockOutput = new Blob(["mock video with swapped faces"], { type: "video/mp4" });
    return mockOutput;
  }

  private async generateShorts(videoFile: File | Blob): Promise<Blob> {
    console.log("توليد مقاطع قصيرة...");
    // استخدام scenecut لتحليل المشاهد
    return videoProcessor.trimVideo(videoFile, 0, 60); // أول 60 ثانية كمثال
  }

  private async textBasedEditing(videoFile: File | Blob, transcript: string): Promise<Blob> {
    console.log("التحرير القائم على النص...");
    // استخدام Whisper لاستخراج النص الأصلي
    const mockEditedVideo = new Blob(["edited video based on: " + transcript], { type: "video/mp4" });
    return mockEditedVideo;
  }

  // 7.2. وظائف الصوت
  private async changeVoice(audioFile: File | Blob): Promise<Blob> {
    console.log("تغيير الصوت...");
    // استخدام Sovits أو Bark TTS
    return audioProcessor.changeVoice(audioFile, { pitch: 1.2, gender: "female" });
  }

  private async reduceNoise(audioFile: File | Blob): Promise<Blob> {
    console.log("تقليل الضوضاء...");
    // استخدام RNNoise
    return audioProcessor.reduceNoise(audioFile, { intensity: 0.7 });
  }

  private async speechToText(audioFile: File | Blob): Promise<string> {
    console.log("تحويل الكلام إلى نص...");
    // استخدام Whisper
    const result = await audioProcessor.speechToText(audioFile, "ar-SA");
    return result;
  }

  private async textToSpeech(text: string): Promise<Blob> {
    console.log(`تحويل النص "${text.substring(0, 50)}..." إلى كلام.`);
    // استخدام Bark TTS
    return audioProcessor.textToSpeech(text, { voice: "ar-Wavenet-B", speed: 1.0 });
  }

  private async translateAudio(audioFile: File | Blob, targetLanguage: string): Promise<Blob> {
    console.log(`ترجمة الصوت إلى ${targetLanguage}...`);
    // استخدام M2M100
    const transcript = await this.speechToText(audioFile);
    const translatedText = await this.translateText(transcript, targetLanguage);
    return await this.textToSpeech(translatedText);
  }

  // 7.3. وظائف الصور
  private async removeImageBackground(imageFile: File | Blob): Promise<Blob> {
    console.log("إزالة خلفية الصورة...");
    // استخدام U2Net أو Modnet
    return imageProcessor.removeBackground(imageFile, { model: "precision" });
  }

  private async enhancePhoto(imageFile: File | Blob): Promise<Blob> {
    console.log("تحسين الصورة...");
    // استخدام Real-ESRGAN أو Super Resolution
    return imageProcessor.enhanceImage(imageFile, { upscaleFactor: 2 });
  }

  private async customCutout(imageFile: File | Blob): Promise<Blob> {
    console.log("قص عناصر محددة من الصورة...");
    // استخدام SAM (Segment Anything Model)
    const mockCutout = new Blob(["mock image cutout"], { type: "image/png" });
    return mockCutout;
  }

  private async textToImage(prompt: string): Promise<Blob> {
    console.log(`توليد صورة من النص: "${prompt}"`);
    // استخدام Stable Diffusion
    return imageProcessor.textToImage(prompt, { width: 512, height: 512, style: "photorealistic" });
  }

  private async upscaleImage(imageFile: File | Blob): Promise<Blob> {
    console.log("تكبير حجم الصورة...");
    // استخدام Super Resolution
    return imageProcessor.upscaleImage(imageFile, { scale: 4 });
  }

  private async transferStyle(imageFile: File | Blob): Promise<Blob> {
    console.log("تطبيق نمط فني على الصورة...");
    // استخدام Style Transfer
    return imageProcessor.applyStyle(imageFile, "starry_night"); // مثال على النمط
  }

  // 7.4. وظائف النص
  private async generateCopy(prompt: string, type: string): Promise<string> {
    console.log(`توليد نص إعلاني لـ: "${type}" بناءً على: "${prompt}"`);
    // استخدام GPT4All أو نموذج text_generation
    const generatedText = `عنوان جذاب: ${prompt} - حلولنا المبتكرة!\nوصف: اكتشف كيف يمكن لذكائنا الاصطناعي أن يحول أفكارك إلى حقيقة مذهلة. جرب الآن!`;
    return generatedText;
  }

  private async analyzeText(text: string): Promise<any> {
    console.log(`تحليل النص: "${text.substring(0, 50)}..."`);
    // استخدام Sentiment Analysis
    const sentiment = text.includes("مذهل") || text.includes("رائع") ? "positive" : "neutral";
    const keywords = text.split(" ").filter(word => word.length > 3 && !["من", "في", "إلى"].includes(word));
    return { sentiment, keywords };
  }

  private async generateSubtitles(text: string): Promise<string> {
    console.log("إنشاء ترجمات من النص...");
    // تحويل النص إلى تنسيق ترجمات (SRT/VTT)
    const lines = text.split('. ').filter(Boolean);
    let srtContent = "";
    let time = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const startTime = this.formatTime(time);
      time += Math.ceil(line.length / 15) * 1.5; // تقدير تقريبي للوقت بناءً على طول النص
      const endTime = this.formatTime(time);
      srtContent += `${i + 1}\n${startTime} --> ${endTime}\n${line}\n\n`;
    }
    return srtContent;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  private async translateText(text: string, targetLanguage: string): Promise<string> {
    console.log(`ترجمة النص "${text.substring(0, 50)}..." إلى ${targetLanguage}.`);
    // استخدام M2M100
    // هذه محاكاة بسيطة للترجمة
    const translations: { [key: string]: { [lang: string]: string } } = {
      "مرحباً بالعالم": { "en": "Hello World", "fr": "Bonjour le monde" },
      "كيف حالك": { "en": "How are you?", "fr": "Comment ça va?" },
    };
    const mockTranslation = translations[text]?.[targetLanguage] || `[ترجمة وهمية إلى ${targetLanguage}: ${text}]`;
    return mockTranslation;
  }

  private async summarizeText(text: string): Promise<string> {
    console.log(`تلخيص النص: "${text.substring(0, 50)}..."`);
    // استخدام نموذج تلخيص (مثل GPT4All أو Llama2)
    const summary = `هذا ملخص موجز للنص الأصلي الذي يتحدث عن: ${text.substring(0, 100)}... والموضوعات الرئيسية هي [موضوع1]، [موضوع2].`;
    return summary;
  }

  private async extractKeywords(text: string): Promise<string[]> {
    console.log(`استخراج الكلمات المفتاحية من النص: "${text.substring(0, 50)}..."`);
    // استخدام نموذج تحليل نص
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const frequentWords = Array.from(new Set(words.filter(w => words.filter(x => x === w).length > 1)));
    return frequentWords.slice(0, 5); // إرجاع 5 كلمات مفتاحية الأكثر تكرارًا
  }

  /**
   * 8. إدارة نظام النقاط (يمكن توسيعه ليكون أكثر تعقيداً).
   */
  public getCreditStatus(): CreditSystem {
    return { ...this.creditSystem };
  }

  public addCredits(amount: number, tier: "free" | "pro" | "enterprise" = "free"): void {
    this.creditSystem.current += amount;
    // يمكن هنا حفظ حالة النقاط في localStorage أو إرسالها إلى الخادم
    console.log(`💰 تمت إضافة ${amount} نقطة. النقاط الحالية: ${this.creditSystem.current}`);
  }

  public setCreditTier(tier: "free" | "pro" | "enterprise"): void {
    this.creditSystem.tier = tier;
    switch (tier) {
      case "free":
        this.creditSystem.current = this.creditSystem.free;
        break;
      case "pro":
        this.creditSystem.current = this.creditSystem.pro;
        break;
      case "enterprise":
        this.creditSystem.current = this.creditSystem.enterprise;
        break;
    }
    console.log(`⭐ تم تغيير مستوى النقاط إلى: ${tier}. النقاط الحالية: ${this.creditSystem.current}`);
  }

  /**
   * 9. دوال مساعدة للحصول على حالة النظام.
   */
  public getProcessingQueue(): AIProcessingTask[] {
    return [...this.processingQueue];
  }

  public isSystemProcessing(): boolean {
    return this.isProcessing;
  }
}
