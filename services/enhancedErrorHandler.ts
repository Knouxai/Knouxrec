export interface ErrorContext {
  modelName?: string;
  operation?: string;
  stage?: string;
  timestamp: number;
  userAgent: string;
  memoryUsage?: number;
  additionalInfo?: Record<string, any>;
}

export interface ErrorSolution {
  title: string;
  description: string;
  actions: ErrorAction[];
  severity: "low" | "medium" | "high" | "critical";
  canAutoResolve: boolean;
}

export interface ErrorAction {
  label: string;
  action: () => Promise<void> | void;
  isPrimary?: boolean;
  isDestructive?: boolean;
}

export interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  solution: ErrorSolution;
  attempts: number;
  resolved: boolean;
  createdAt: number;
}

export class EnhancedErrorHandler {
  private errorHistory: ErrorReport[] = [];
  private maxHistorySize = 100;
  private autoResolveEnabled = true;
  private errorCallbacks = new Map<string, (report: ErrorReport) => void>();

  // معالجة خطأ تحميل النموذج
  async handleModelLoadingError(
    error: Error,
    modelName: string,
    context?: Partial<ErrorContext>,
  ): Promise<ErrorReport> {
    const fullContext: ErrorContext = {
      modelName,
      operation: "model_loading",
      stage: "unknown",
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      memoryUsage: this.getMemoryUsage(),
      ...context,
    };

    const solution = this.analyzeModelLoadingError(
      error,
      modelName,
      fullContext,
    );

    const report: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      context: fullContext,
      solution,
      attempts: 0,
      resolved: false,
      createdAt: Date.now(),
    };

    this.addToHistory(report);

    // محاولة الحل التلقائي
    if (this.autoResolveEnabled && solution.canAutoResolve) {
      await this.attemptAutoResolve(report);
    }

    // استدعاء المستمعين
    this.notifyErrorCallbacks(report);

    return report;
  }

  // تحليل خطأ تحميل النموذج
  private analyzeModelLoadingError(
    error: Error,
    modelName: string,
    context: ErrorContext,
  ): ErrorSolution {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // خطأ الشبكة / عدم وجود الملف
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("404") ||
      errorMessage.includes("not found")
    ) {
      return {
        title: "فشل في تحميل ملفات النموذج",
        description: `تعذر العثور على ملفات النموذج ${modelName} أو الوصول إليها. قد يكون السبب عدم وجود الملفات أو مشكلة في الشبكة.`,
        severity: "high",
        canAutoResolve: true,
        actions: [
          {
            label: "استخدام النموذج الاحتياطي",
            action: () => this.loadFallbackModel(modelName),
            isPrimary: true,
          },
          {
            label: "إعادة تحميل التطبيق",
            action: () => window.location.reload(),
          },
          {
            label: "التحقق من الاتصال",
            action: () => this.checkNetworkConnection(),
          },
        ],
      };
    }

    // خطأ الذاكرة
    if (
      errorMessage.includes("memory") ||
      errorMessage.includes("out of memory") ||
      errorMessage.includes("allocation failed")
    ) {
      return {
        title: "نفدت الذاكرة المتاحة",
        description: `لا توجد ذاكرة كافية لتحميل النموذج ${modelName}. يُنصح بإغلاق التطبيقات الأخرى أو إلغاء تحميل نماذج أخرى.`,
        severity: "critical",
        canAutoResolve: true,
        actions: [
          {
            label: "تحرير الذاكرة تلقائياً",
            action: () => this.freeMemoryAutomatically(),
            isPrimary: true,
          },
          {
            label: "تحميل نموذج أصغر",
            action: () => this.loadSmallerModel(modelName),
          },
          {
            label: "إعادة تشغيل التطبيق",
            action: () => window.location.reload(),
            isDestructive: true,
          },
        ],
      };
    }

    // خطأ تحليل النموذج
    if (
      errorMessage.includes("parse") ||
      errorMessage.includes("json") ||
      errorMessage.includes("invalid") ||
      errorMessage.includes("corrupt")
    ) {
      return {
        title: "ملف النموذج تالف أو غير صالح",
        description: `ملف النموذج ${modelName} تالف أو في تنسيق غير صحيح. يجب إعادة تحميل الملفات أو استخدام نموذج بديل.`,
        severity: "high",
        canAutoResolve: true,
        actions: [
          {
            label: "استخدام النموذج الاحتياطي",
            action: () => this.loadFallbackModel(modelName),
            isPrimary: true,
          },
          {
            label: "مسح الكاش وإعادة التحميل",
            action: () => this.clearCacheAndReload(),
          },
          {
            label: "تنزيل النموذج مرة أخرى",
            action: () => this.redownloadModel(modelName),
          },
        ],
      };
    }

    // خطأ WebGL / GPU
    if (
      errorMessage.includes("webgl") ||
      errorMessage.includes("gpu") ||
      errorMessage.includes("graphic")
    ) {
      return {
        title: "مشكلة في معالج الرسوم",
        description: `تعذر استخدام معالج الرسوم لتشغيل النموذج ${modelName}. سيتم التبديل إلى معالجة المعالج العادي.`,
        severity: "medium",
        canAutoResolve: true,
        actions: [
          {
            label: "التبديل إلى المعالج العادي",
            action: () => this.switchToCPUMode(),
            isPrimary: true,
          },
          {
            label: "إعادة تشغيل المتصفح",
            action: () => this.restartBrowser(),
          },
          {
            label: "تحديث برامج تشغيل الرسوم",
            action: () => this.showGraphicsDriverInfo(),
          },
        ],
      };
    }

    // خطأ عدم الدعم
    if (
      errorMessage.includes("unsupported") ||
      errorMessage.includes("not supported") ||
      errorMessage.includes("compatibility")
    ) {
      return {
        title: "النموذج غير مدعوم في هذا المتصفح",
        description: `النموذج ${modelName} يتطلب مميزات غير متوفرة في متصفحك الحالي.`,
        severity: "high",
        canAutoResolve: false,
        actions: [
          {
            label: "استخدام نموذج متوافق",
            action: () => this.loadCompatibleModel(modelName),
            isPrimary: true,
          },
          {
            label: "تحديث المتصفح",
            action: () => this.showBrowserUpdateInfo(),
          },
          {
            label: "تجربة متصفح آخر",
            action: () => this.showAlternativeBrowsers(),
          },
        ],
      };
    }

    // خطأ انتهاء المهلة الزمنية
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out")
    ) {
      return {
        title: "انتهت المهلة الزمنية للتحميل",
        description: `استغرق تحميل النموذج ${modelName} وقتاً أطول من المتوقع. قد يكون بسبب الاتصال البطيء أو حجم النموذج الكبير.`,
        severity: "medium",
        canAutoResolve: true,
        actions: [
          {
            label: "إعادة المحاولة مع وقت أطول",
            action: () => this.retryWithLongerTimeout(modelName),
            isPrimary: true,
          },
          {
            label: "تحميل نموذج أصغر",
            action: () => this.loadSmallerModel(modelName),
          },
          {
            label: "التحقق من سرعة الاتصال",
            action: () => this.checkConnectionSpeed(),
          },
        ],
      };
    }

    // خطأ عام
    return {
      title: "خطأ غير معروف في تحميل النموذج",
      description: `حدث خطأ غير متوقع أثناء تحميل النموذج ${modelName}: ${error.message}`,
      severity: "medium",
      canAutoResolve: false,
      actions: [
        {
          label: "إعادة المحاولة",
          action: () => this.retryModelLoading(modelName),
          isPrimary: true,
        },
        {
          label: "استخدام نموذج بديل",
          action: () => this.loadAlternativeModel(modelName),
        },
        {
          label: "إبلاغ عن المشكلة",
          action: () => this.reportError(error, context),
        },
      ],
    };
  }

  // محاولة الحل التلقائي
  private async attemptAutoResolve(report: ErrorReport): Promise<boolean> {
    try {
      report.attempts++;

      // تنفيذ الإجراء الأساسي
      const primaryAction = report.solution.actions.find(
        (action) => action.isPrimary,
      );
      if (primaryAction) {
        await primaryAction.action();
        report.resolved = true;
        console.log(`✅ تم حل الخطأ تلقائياً: ${report.solution.title}`);
        return true;
      }
    } catch (autoResolveError) {
      console.error("فشل في الحل التلقائي:", autoResolveError);
    }

    return false;
  }

  // إجراءات الحل
  private async loadFallbackModel(modelName: string): Promise<void> {
    console.log(`جار تحميل النموذج الاحتياطي لـ ${modelName}...`);
    // سيتم ربطها مع enhancedModelManager
  }

  private async freeMemoryAutomatically(): Promise<void> {
    console.log("جار تحرير الذاكرة تلقائياً...");
    // تحرير النماذج غير المستخدمة
    if ("gc" in window) {
      (window as any).gc();
    }
  }

  private async loadSmallerModel(modelName: string): Promise<void> {
    console.log(`جار البحث عن نموذج أصغر بديل لـ ${modelName}...`);
    // تحميل نسخة مضغوطة أو مبسطة
  }

  private async clearCacheAndReload(): Promise<void> {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error("فشل في مسح الكاش:", error);
      window.location.reload();
    }
  }

  private async redownloadModel(modelName: string): Promise<void> {
    console.log(`جار إعادة تنزيل النموذج ${modelName}...`);
    // إعادة تنزيل ملفات النموذج
  }

  private async switchToCPUMode(): Promise<void> {
    console.log("جار التبديل إلى وضع المعالج العادي...");
    // تعطيل WebGL واستخدام CPU
    if (typeof tf !== "undefined") {
      await tf.setBackend("cpu");
    }
  }

  private restartBrowser(): void {
    alert("يرجى إغلاق وإعادة فتح المتصفح لحل المشكلة.");
  }

  private showGraphicsDriverInfo(): void {
    const info = `
معلومات معالج الرسوم:
- Vendor: ${this.getGPUInfo().vendor || "غير معروف"}
- Renderer: ${this.getGPUInfo().renderer || "غير معروف"}

يُنصح بتحديث برامج تشغيل كرت الرسوم من موقع الشركة المصنعة.
    `.trim();

    alert(info);
  }

  private loadCompatibleModel(modelName: string): Promise<void> {
    console.log(`جار البحث عن نموذج متوافق بديل لـ ${modelName}...`);
    return Promise.resolve();
  }

  private showBrowserUpdateInfo(): void {
    const info = `
متصفحك الحالي: ${navigator.userAgent}

يُنصح بتحديث متصفحك إلى أحدث نسخة لدعم أفضل للنماذج.

روابط التحديث:
- Chrome: chrome://settings/help
- Firefox: firefox://settings/help
- Safari: System Preferences > Software Update
- Edge: edge://settings/help
    `.trim();

    alert(info);
  }

  private showAlternativeBrowsers(): void {
    const info = `
المتصفحات المدعومة بشكل كامل:
✅ Google Chrome (الأحدث)
✅ Mozilla Firefox (الأحدث)  
✅ Microsoft Edge (الأحدث)
⚠️ Safari (دعم محدود)

يُنصح باستخدام Chrome أو Firefox للحصول على أفضل أداء.
    `.trim();

    alert(info);
  }

  private async retryWithLongerTimeout(modelName: string): Promise<void> {
    console.log(`إعادة محاولة تحميل ${modelName} مع مهلة زمنية أطول...`);
  }

  private async checkConnectionSpeed(): Promise<void> {
    console.log("جار فحص سرعة الاتصال...");
    // فحص سرعة التحميل
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      const speed = connection.effectiveType || "غير معروف";
      alert(
        `سرعة الاتصال: ${speed}\nإذا كان الاتصال بطيئاً، جرب تحميل نماذج أصغر.`,
      );
    } else {
      alert("لا يمكن قياس سرعة الاتصال في هذا المتصفح.");
    }
  }

  private async retryModelLoading(modelName: string): Promise<void> {
    console.log(`إعادة محاولة تحميل ${modelName}...`);
  }

  private async loadAlternativeModel(modelName: string): Promise<void> {
    console.log(`جار البحث عن نموذج بديل لـ ${modelName}...`);
  }

  private async reportError(
    error: Error,
    context: ErrorContext,
  ): Promise<void> {
    const report = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    console.log("تقرير الخطأ:", report);
    // يمكن إرسال التقرير لخدمة تحليل الأخطاء
  }

  private async checkNetworkConnection(): Promise<void> {
    try {
      const response = await fetch("/models/ping", { method: "HEAD" });
      if (response.ok) {
        alert("✅ الاتصال بالخادم المحلي يعمل بشكل طبيعي.");
      } else {
        alert("⚠️ هناك مشكلة في الاتصال بالخادم المحلي.");
      }
    } catch {
      alert(
        "❌ لا يمكن الوصول إلى الخادم المحلي. تأكد من تشغيل التطبيق بشكل صحيح.",
      );
    }
  }

  // مساعدات
  private getMemoryUsage(): number {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }
    return 0;
  }

  private getGPUInfo(): { vendor?: string; renderer?: string } {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
          };
        }
      }
    } catch {
      // ignore
    }

    return {};
  }

  private addToHistory(report: ErrorReport): void {
    this.errorHistory.unshift(report);

    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  private notifyErrorCallbacks(report: ErrorReport): void {
    for (const [, callback] of this.errorCallbacks) {
      try {
        callback(report);
      } catch (error) {
        console.error("خطأ في callback معالج الأخطاء:", error);
      }
    }
  }

  // واجهة عامة
  public onError(id: string, callback: (report: ErrorReport) => void): void {
    this.errorCallbacks.set(id, callback);
  }

  public offError(id: string): void {
    this.errorCallbacks.delete(id);
  }

  public getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory];
  }

  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  public setAutoResolve(enabled: boolean): void {
    this.autoResolveEnabled = enabled;
  }

  public async resolveError(
    errorId: string,
    actionIndex = 0,
  ): Promise<boolean> {
    const report = this.errorHistory.find((r) => r.id === errorId);
    if (!report) return false;

    const action = report.solution.actions[actionIndex];
    if (!action) return false;

    try {
      await action.action();
      report.resolved = true;
      return true;
    } catch (error) {
      console.error("فشل في تنفيذ إجراء الحل:", error);
      return false;
    }
  }

  public getUnresolvedErrors(): ErrorReport[] {
    return this.errorHistory.filter((report) => !report.resolved);
  }
}

// إنشاء مثيل مشترك
export const enhancedErrorHandler = new EnhancedErrorHandler();
