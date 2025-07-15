// KNOUX REC - Auto-Allocation Verification and Testing System
// نظام فحص واختبار التخصيص التلقائي

import { smartAutoAllocation, AllocationReport } from "./smartAutoAllocation";
import { offlineAI } from "./offlineAI";
import { toolboxService } from "./toolboxService";

export interface TestResult {
  sectionName: string;
  testType: "functionality" | "integrity" | "performance" | "compatibility";
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  testTime: number;
  details?: any;
}

export interface VerificationReport {
  overall: {
    score: number;
    passed: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    executionTime: number;
  };
  sections: TestResult[];
  summary: string;
  criticalIssues: string[];
  actionItems: string[];
}

export class AllocationTesterService {
  private testResults: TestResult[] = [];

  // بدء الفحص الشامل
  async runComprehensiveVerification(): Promise<VerificationReport> {
    console.log("🔍 بدء فحص واختبار جميع المكونات المخصصة...");

    const startTime = Date.now();
    this.testResults = [];

    // اختبار النماذج
    await this.testAIModels();

    // اختبار الخدمات
    await this.testServices();

    // اختبار الإعدادات
    await this.testConfigurations();

    // اختبار القوالب
    await this.testTemplates();

    // اختبار الأدوات
    await this.testTools();

    // اختبار البيانات
    await this.testDataIntegrity();

    // اختبار الأداء
    await this.testPerformance();

    // اختبار التوافق
    await this.testCompatibility();

    const executionTime = Date.now() - startTime;

    return this.generateVerificationReport(executionTime);
  }

  // اختبار نماذج الذكاء الاصطناعي
  private async testAIModels(): Promise<void> {
    const startTime = Date.now();

    try {
      const models = [
        "whisper",
        "stable_diffusion",
        "real_esrgan",
        "rnnoise",
        "yolo",
      ];
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      for (const modelName of models) {
        try {
          // فحص وجود إعدادات النموذج
          const savedConfig = localStorage.getItem(`knoux_model_${modelName}`);
          if (!savedConfig) {
            issues.push(`إعدادات النموذج ${modelName} غير موجودة`);
            score -= 15;
            continue;
          }

          const config = JSON.parse(savedConfig);

          // فحص اكتمال الإعدادات
          if (!config.settings || !config.optimizations) {
            issues.push(`إعدادات النموذج ${modelName} غير مكتملة`);
            score -= 10;
          }

          // فحص تحميل النموذج
          const loadSuccess = await offlineAI.loadModel(modelName);
          if (!loadSuccess) {
            issues.push(`فشل تحميل النموذج ${modelName}`);
            score -= 20;
          } else {
            recommendations.push(`النموذج ${modelName} يعمل بشكل صحيح`);
          }
        } catch (error) {
          issues.push(`خطأ في اختبار النموذج ${modelName}: ${error}`);
          score -= 25;
        }
      }

      this.addTestResult({
        sectionName: "AI Models",
        testType: "functionality",
        passed: score > 60,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
        details: { modelsChecked: models.length },
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "AI Models",
        testType: "functionality",
        passed: false,
        score: 0,
        issues: [`فشل اختبار النماذج: ${error}`],
        recommendations: ["إعادة تهيئة نظام النماذج"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // اختبار الخدمات
  private async testServices(): Promise<void> {
    const startTime = Date.now();

    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // اختبار خدمة صندوق الأدوات
      const toolboxConfig = localStorage.getItem("knoux_toolbox_config");
      if (!toolboxConfig) {
        issues.push("إعدادات صندوق الأدوات غير موجودة");
        score -= 30;
      } else {
        const config = JSON.parse(toolboxConfig);
        if (!config.categories || !config.defaultSettings) {
          issues.push("إعدادات صندوق الأدوات غير مكتملة");
          score -= 20;
        }
      }

      // اختبار الأدوات المدعومة
      const supportedTools = toolboxService.getSupportedTools();
      if (supportedTools.length === 0) {
        issues.push("لا توجد أدوات مدعومة");
        score -= 40;
      } else {
        recommendations.push(`${supportedTools.length} أداة مدعومة ومتاحة`);
      }

      // اختبار أداة بسيطة
      try {
        const testResult = await toolboxService.executeTool("text-generator", {
          text: "اختبار",
          options: { customParams: { text: "اختبار" } },
        });

        if (!testResult.success) {
          issues.push("فشل اختبار تنفيذ الأدوات");
          score -= 25;
        } else {
          recommendations.push("أدوات التنفيذ تعمل بشكل صحيح");
        }
      } catch (error) {
        issues.push(`خطأ في اختبار تنفيذ الأدوات: ${error}`);
        score -= 30;
      }

      this.addTestResult({
        sectionName: "Services",
        testType: "functionality",
        passed: score > 50,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
        details: { toolsCount: supportedTools.length },
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "Services",
        testType: "functionality",
        passed: false,
        score: 0,
        issues: [`فشل اختبار الخدمات: ${error}`],
        recommendations: ["إعادة تهيئة الخدمات"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // اختبار الإعدادات
  private async testConfigurations(): Promise<void> {
    const startTime = Date.now();

    try {
      const configs = [
        "knoux_user_settings",
        "knoux_recording_config",
        "knoux_audio_settings",
        "knoux_security_settings",
        "knoux_system_optimizations",
      ];

      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      for (const configKey of configs) {
        const configData = localStorage.getItem(configKey);
        if (!configData) {
          issues.push(`إعدادات ${configKey} غير موجودة`);
          score -= 20;
        } else {
          try {
            const parsed = JSON.parse(configData);
            if (!parsed || Object.keys(parsed).length === 0) {
              issues.push(`إعدادات ${configKey} فارغة`);
              score -= 15;
            } else {
              recommendations.push(`إعدادات ${configKey} محملة بشكل صحيح`);
            }
          } catch (error) {
            issues.push(`إعدادات ${configKey} تالفة`);
            score -= 25;
          }
        }
      }

      this.addTestResult({
        sectionName: "Configurations",
        testType: "integrity",
        passed: score > 60,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
        details: { configsChecked: configs.length },
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "Configurations",
        testType: "integrity",
        passed: false,
        score: 0,
        issues: [`فشل اختبار الإعدادات: ${error}`],
        recommendations: ["إعادة تهيئة الإعدادات"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // اختبار القوالب
  private async testTemplates(): Promise<void> {
    const startTime = Date.now();

    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const templatesData = localStorage.getItem("knoux_templates_data");
      if (!templatesData) {
        issues.push("بيانات القوالب غير موجودة");
        score -= 50;
      } else {
        try {
          const templates = JSON.parse(templatesData);

          if (!templates.video || templates.video.length === 0) {
            issues.push("قوالب الفيديو غير موجودة");
            score -= 25;
          } else {
            recommendations.push(`${templates.video.length} قالب فيديو متاح`);
          }

          if (!templates.image || templates.image.length === 0) {
            issues.push("قوالب الصور غير موجودة");
            score -= 15;
          } else {
            recommendations.push(`${templates.image.length} قالب صورة متاح`);
          }

          // فحص صحة القوالب
          for (const template of templates.video) {
            if (!template.elements || template.elements.length === 0) {
              issues.push(`قالب ${template.name} لا يحتوي على عناصر`);
              score -= 10;
            }
          }
        } catch (error) {
          issues.push("بيانات القوالب تالفة");
          score -= 40;
        }
      }

      this.addTestResult({
        sectionName: "Templates",
        testType: "integrity",
        passed: score > 50,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "Templates",
        testType: "integrity",
        passed: false,
        score: 0,
        issues: [`فشل اختبار القوالب: ${error}`],
        recommendations: ["إعادة تهيئة القوالب"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // اختبار الأدوات
  private async testTools(): Promise<void> {
    const startTime = Date.now();

    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      const supportedTools = toolboxService.getSupportedTools();

      for (const toolId of supportedTools.slice(0, 3)) {
        // اختبار أول 3 أدوات
        try {
          const toolConfig = localStorage.getItem(`knoux_tool_${toolId}`);
          if (!toolConfig) {
            issues.push(`إعدادات الأداة ${toolId} غير موجودة`);
            score -= 15;
            continue;
          }

          // اختبار تنفيذ الأداة
          let testInput: any = {};

          if (toolId === "text-generator") {
            testInput = {
              text: "اختبار",
              options: { customParams: { text: "اختبار" } },
            };
          } else if (toolId === "qr-generator") {
            testInput = {
              text: "https://test.com",
              options: { customParams: { text: "https://test.com" } },
            };
          }

          if (Object.keys(testInput).length > 0) {
            const result = await toolboxService.executeTool(toolId, testInput);
            if (!result.success) {
              issues.push(`فشل تنفيذ الأداة ${toolId}: ${result.error}`);
              score -= 20;
            } else {
              recommendations.push(`الأداة ${toolId} تعمل بشكل صحيح`);
            }
          }
        } catch (error) {
          issues.push(`خطأ في اختبار الأداة ${toolId}: ${error}`);
          score -= 25;
        }
      }

      this.addTestResult({
        sectionName: "Tools",
        testType: "functionality",
        passed: score > 60,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
        details: { toolsTested: Math.min(3, supportedTools.length) },
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "Tools",
        testType: "functionality",
        passed: false,
        score: 0,
        issues: [`فشل اختبار الأدوات: ${error}`],
        recommendations: ["إعادة فحص الأدوات"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // اختبار سلامة البيانات
  private async testDataIntegrity(): Promise<void> {
    const startTime = Date.now();

    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // فحص البيانات الأساسية
      const dataKeys = [
        "knoux_image_filters",
        "knoux_video_effects",
        "knoux_export_formats",
        "knoux_hotkey_bindings",
        "knoux_theme_customizations",
      ];

      for (const key of dataKeys) {
        const data = localStorage.getItem(key);
        if (!data) {
          issues.push(`بيانات ${key} غير موجودة`);
          score -= 20;
        } else {
          try {
            const parsed = JSON.parse(data);
            if (!parsed || Object.keys(parsed).length === 0) {
              issues.push(`بيانات ${key} فارغة`);
              score -= 15;
            } else {
              recommendations.push(`بيانات ${key} سليمة`);
            }
          } catch (error) {
            issues.push(`بيانات ${key} تالفة`);
            score -= 25;
          }
        }
      }

      // فحص حجم البيانات
      const totalSize = Object.keys(localStorage)
        .filter((key) => key.startsWith("knoux_"))
        .reduce((total, key) => {
          const value = localStorage.getItem(key) || "";
          return total + value.length;
        }, 0);

      if (totalSize < 10000) {
        // أقل من 10KB
        issues.push("حجم البيانات المخزنة قليل جداً");
        score -= 10;
      } else if (totalSize > 5000000) {
        // أكثر من 5MB
        issues.push("حجم البيانات المخزنة كبير جداً");
        score -= 5;
        recommendations.push("فكر في تحسين البيانات المخزنة");
      } else {
        recommendations.push(
          `حجم البيانات مناسب: ${(totalSize / 1024).toFixed(1)}KB`,
        );
      }

      this.addTestResult({
        sectionName: "Data Integrity",
        testType: "integrity",
        passed: score > 70,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
        details: { totalSize, keysChecked: dataKeys.length },
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "Data Integrity",
        testType: "integrity",
        passed: false,
        score: 0,
        issues: [`ف��ل اختبار سلامة البيانات: ${error}`],
        recommendations: ["إعادة تهيئة البيانات"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // اختبار الأداء
  private async testPerformance(): Promise<void> {
    const startTime = Date.now();

    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // اختبار سرعة الوصول للبيانات
      const accessStartTime = performance.now();
      for (let i = 0; i < 10; i++) {
        localStorage.getItem("knoux_user_settings");
      }
      const accessTime = performance.now() - accessStartTime;

      if (accessTime > 100) {
        issues.push("بطء في الوصول للبيانات");
        score -= 20;
      } else {
        recommendations.push("سرعة الوصول للبيانات جيدة");
      }

      // اختبار الذاكرة
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const memoryUsage =
          memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;

        if (memoryUsage > 0.8) {
          issues.push("استخدام ذاكرة عالي");
          score -= 25;
        } else if (memoryUsage > 0.6) {
          recommendations.push("استخدام الذاكرة معتدل");
        } else {
          recommendations.push("استخدام الذاكرة منخفض وجيد");
        }
      }

      // اختبار تحسينات النظام
      const optimizations = localStorage.getItem("knoux_system_optimizations");
      if (optimizations) {
        const config = JSON.parse(optimizations);
        if (!config.memory?.autoCleanup) {
          issues.push("التنظيف التلقائي للذاكرة غير مفعل");
          score -= 10;
        }
        if (!config.rendering?.hardwareAcceleration) {
          issues.push("تسريع الأجهزة غير مفعل");
          score -= 15;
        }
      }

      this.addTestResult({
        sectionName: "Performance",
        testType: "performance",
        passed: score > 60,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
        details: { accessTime, memoryUsage: memoryInfo?.usedJSHeapSize || 0 },
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "Performance",
        testType: "performance",
        passed: false,
        score: 0,
        issues: [`فشل اختبار الأداء: ${error}`],
        recommendations: ["فحص إعدادات الأداء"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // اختبار التوافق
  private async testCompatibility(): Promise<void> {
    const startTime = Date.now();

    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // فحص دعم المتصفح للميزات المطلوبة
      const requiredFeatures = [
        { name: "localStorage", test: () => typeof Storage !== "undefined" },
        {
          name: "Canvas",
          test: () => !!document.createElement("canvas").getContext,
        },
        {
          name: "WebGL",
          test: () => !!document.createElement("canvas").getContext("webgl"),
        },
        {
          name: "Web Audio API",
          test: () =>
            typeof AudioContext !== "undefined" ||
            typeof (window as any).webkitAudioContext !== "undefined",
        },
        {
          name: "MediaRecorder",
          test: () => typeof MediaRecorder !== "undefined",
        },
        {
          name: "File API",
          test: () =>
            typeof File !== "undefined" && typeof FileReader !== "undefined",
        },
      ];

      for (const feature of requiredFeatures) {
        try {
          if (!feature.test()) {
            issues.push(`الميزة ${feature.name} غير مدعومة`);
            score -= 15;
          } else {
            recommendations.push(`الميزة ${feature.name} ��دعومة`);
          }
        } catch (error) {
          issues.push(`خطأ في فحص الميزة ${feature.name}`);
          score -= 10;
        }
      }

      // فحص إعدادات المتصفح
      if (navigator.hardwareConcurrency) {
        recommendations.push(`عدد المعالجات: ${navigator.hardwareConcurrency}`);
      }

      if (navigator.deviceMemory) {
        if (navigator.deviceMemory < 4) {
          issues.push("ذاكرة الجهاز قليلة");
          score -= 10;
        } else {
          recommendations.push(`ذاكرة الجهاز: ${navigator.deviceMemory}GB`);
        }
      }

      this.addTestResult({
        sectionName: "Compatibility",
        testType: "compatibility",
        passed: score > 70,
        score: Math.max(0, score),
        issues,
        recommendations,
        testTime: Date.now() - startTime,
        details: { featuresChecked: requiredFeatures.length },
      });
    } catch (error) {
      this.addTestResult({
        sectionName: "Compatibility",
        testType: "compatibility",
        passed: false,
        score: 0,
        issues: [`فشل اختبار التوافق: ${error}`],
        recommendations: ["فحص متطلبات النظام"],
        testTime: Date.now() - startTime,
      });
    }
  }

  // إضافة نتيجة اختبار
  private addTestResult(result: TestResult): void {
    this.testResults.push(result);
  }

  // إنشاء تقرير الفحص
  private generateVerificationReport(
    executionTime: number,
  ): VerificationReport {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    const overallScore =
      this.testResults.reduce((sum, r) => sum + r.score, 0) / totalTests;
    const overallPassed = overallScore > 60 && failedTests === 0;

    const criticalIssues = this.testResults
      .filter((r) => !r.passed)
      .map((r) => r.issues)
      .flat();

    const actionItems = this.generateActionItems();
    const summary = this.generateSummary(
      overallScore,
      passedTests,
      failedTests,
    );

    return {
      overall: {
        score: Math.round(overallScore),
        passed: overallPassed,
        totalTests,
        passedTests,
        failedTests,
        executionTime,
      },
      sections: this.testResults,
      summary,
      criticalIssues,
      actionItems,
    };
  }

  // إنشاء عناصر العمل
  private generateActionItems(): string[] {
    const actionItems: string[] = [];

    const failedSections = this.testResults.filter((r) => !r.passed);

    for (const section of failedSections) {
      if (section.sectionName === "AI Models") {
        actionItems.push("إعادة تحميل وتكوين نماذج الذكاء الاصطناعي");
      } else if (section.sectionName === "Services") {
        actionItems.push("إعادة تهيئة خدمات صندوق الأدوات");
      } else if (section.sectionName === "Configurations") {
        actionItems.push("إعادة إنشاء ملفات الإعدادات");
      } else if (section.sectionName === "Templates") {
        actionItems.push("إعادة تحميل قوالب الفيديو والصور");
      } else if (section.sectionName === "Performance") {
        actionItems.push("تحسين إعدادات الأداء والذاكرة");
      } else if (section.sectionName === "Compatibility") {
        actionItems.push("فحص متطلبات النظام ودعم المتصفح");
      }
    }

    if (actionItems.length === 0) {
      actionItems.push("جميع الأنظمة تعمل بشكل صحيح - لا يوجد إجراءات مطلوبة");
    }

    return actionItems;
  }

  // إنشاء ملخص التقرير
  private generateSummary(
    overallScore: number,
    passedTests: number,
    failedTests: number,
  ): string {
    if (overallScore >= 90) {
      return `🟢 ممتاز: جميع المكونات تعمل بكفاءة عالية. تم اجتياز ${passedTests} من ${passedTests + failedTests} اختبار بنجاح.`;
    } else if (overallScore >= 75) {
      return `🟡 جيد: معظم المكونات تعمل بشكل صحيح مع بعض التحسينات المطلوبة. تم اجتياز ${passedTests} من ${passedTests + failedTests} اختبار.`;
    } else if (overallScore >= 60) {
      return `🟠 مقبول: النظام يعمل ولكن يحتاج تحسينات. تم اجتياز ${passedTests} من ${passedTests + failedTests} اختبار. يُنصح بمراجعة المكونات الفاشلة.`;
    } else {
      return `🔴 يحتاج إصلاح: النظام يحتاج صيانة عاجلة. فشل ${failedTests} من ${passedTests + failedTests} اختبار. يجب إعادة تهيئة المكونات.`;
    }
  }

  // الحصول على نتائج الاختبار
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  // إعادة تعيين النتائج
  resetResults(): void {
    this.testResults = [];
  }

  // اختبار مكون واحد
  async testSingleSection(sectionName: string): Promise<TestResult | null> {
    const methodMap: Record<string, () => Promise<void>> = {
      "ai-models": this.testAIModels.bind(this),
      services: this.testServices.bind(this),
      configurations: this.testConfigurations.bind(this),
      templates: this.testTemplates.bind(this),
      tools: this.testTools.bind(this),
      data: this.testDataIntegrity.bind(this),
      performance: this.testPerformance.bind(this),
      compatibility: this.testCompatibility.bind(this),
    };

    const method = methodMap[sectionName.toLowerCase()];
    if (!method) {
      return null;
    }

    this.testResults = [];
    await method();

    return this.testResults[0] || null;
  }
}

// إنشاء instance وحيد
export const allocationTester = new AllocationTesterService();
export default allocationTester;
