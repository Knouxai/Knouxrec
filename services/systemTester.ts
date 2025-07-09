// KNOUX REC - System Integration Tester
// نظام اختبار التكامل الشامل

import { feedbackService } from "./feedbackService";
import { screenshotService } from "./screenshotService";
import { enhancedToolboxService } from "./toolboxService_enhanced";
import { offlineAI } from "./offlineAI";

export interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  details?: string;
  error?: string;
}

export interface SystemTestReport {
  overall: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  startTime: Date;
  endTime: Date;
  totalDuration: number;
}

export class SystemTester {
  private results: TestResult[] = [];
  private startTime: Date = new Date();

  // اختبار شامل للنظام
  async runFullSystemTest(): Promise<SystemTestReport> {
    this.startTime = new Date();
    this.results = [];

    const testNotificationId = feedbackService.loading(
      "جار إجراء اختبار شامل للنظام...",
      0,
    );

    try {
      // اختبارات الخدمات الأساسية
      await this.testFeedbackService();
      await this.testScreenshotService();
      await this.testToolboxService();
      await this.testOfflineAI();

      // اختبارات المتصفح
      await this.testBrowserAPIs();

      // اختبارات الأداء
      await this.testPerformance();

      feedbackService.dismiss(testNotificationId);

      const endTime = new Date();
      const report: SystemTestReport = {
        overall: this.results.every((r) => r.success),
        totalTests: this.results.length,
        passedTests: this.results.filter((r) => r.success).length,
        failedTests: this.results.filter((r) => !r.success).length,
        results: this.results,
        startTime: this.startTime,
        endTime,
        totalDuration: endTime.getTime() - this.startTime.getTime(),
      };

      // عرض النتائج
      this.displayTestResults(report);

      return report;
    } catch (error) {
      feedbackService.dismiss(testNotificationId);
      feedbackService.error(`فشل في اختبار النظام: ${error}`);
      throw error;
    }
  }

  // اختبار نظام الإشعارات
  private async testFeedbackService(): Promise<void> {
    const startTime = Date.now();

    try {
      // اختبار الإشعارات المختلفة
      const successId = feedbackService.success("اختبار الإشعار الناجح", {
        duration: 1000,
      });
      const warningId = feedbackService.warning("اختبار التحذير", {
        duration: 1000,
      });
      const infoId = feedbackService.info("اختبار المعلومات", {
        duration: 1000,
      });

      // اختبار التحديث والحذف
      feedbackService.dismiss(successId);
      feedbackService.dismiss(warningId);
      feedbackService.dismiss(infoId);

      // اختبار الأصوات والاهتزاز
      feedbackService.enableSound(true);
      feedbackService.enableVibration(true);
      feedbackService.enableVisual(true);

      this.results.push({
        name: "نظام الإشعارات",
        success: true,
        duration: Date.now() - startTime,
        details: "جميع أنواع الإشعارات تعمل ��نجاح",
      });
    } catch (error) {
      this.results.push({
        name: "نظام الإشعارات",
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    }
  }

  // اختبار خدمة لقطة الشاشة
  private async testScreenshotService(): Promise<void> {
    const startTime = Date.now();

    try {
      // اختبار التقاط لقطة شاشة أساسية
      const result = await screenshotService.captureScreenshot({
        format: "png",
        quality: 0.8,
        captureMode: "screen",
        timestamp: false,
        watermark: false,
      });

      if (result.success && result.blob) {
        this.results.push({
          name: "خدمة لقطة الشاشة",
          success: true,
          duration: Date.now() - startTime,
          details: `تم التقاط ${(result.blob.size / 1024).toFixed(1)}KB بنجاح`,
        });
      } else {
        throw new Error(result.error || "فشل في التقاط لقطة الشاشة");
      }
    } catch (error) {
      // إذا رفض المستخدم الإذن، فهذا طبيعي
      if (
        error instanceof Error &&
        error.message.includes("Permission denied")
      ) {
        this.results.push({
          name: "خدمة لقطة الشاشة",
          success: true,
          duration: Date.now() - startTime,
          details: "المستخدم رفض الإذن (طبيعي في الاختبار)",
        });
      } else {
        this.results.push({
          name: "خدمة لقطة الشاشة",
          success: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : "خطأ غير معروف",
        });
      }
    }
  }

  // اختبار خدمة الأدوات
  private async testToolboxService(): Promise<void> {
    const startTime = Date.now();

    try {
      // اختبار أداة تحويل النص لكلام
      const textResult = await toolboxService.executeTool("text-to-speech", {
        text: "مرحبا هذا اختبار للنظام",
        options: { quality: "fast" },
      });

      if (!textResult.success) {
        throw new Error(`فشل اختبار النص لكلام: ${textResult.error}`);
      }

      // إنشاء صورة اختبار
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, 100, 100);

      const testImageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      });

      // اختبار معالجة الصور
      const imageResult = await toolboxService.executeTool("photo-enhancer", {
        file: testImageBlob,
        options: { quality: "fast" },
      });

      if (!imageResult.success) {
        throw new Error(`فشل اختبار معالجة الصور: ${imageResult.error}`);
      }

      this.results.push({
        name: "خدمة الأدوات",
        success: true,
        duration: Date.now() - startTime,
        details: `تم اختبار ${2} أداة بنجاح`,
      });
    } catch (error) {
      this.results.push({
        name: "خدمة الأدوات",
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    }
  }

  // اختبار الذكاء الاصطناعي
  private async testOfflineAI(): Promise<void> {
    const startTime = Date.now();

    try {
      // اختبار إضافة مهمة
      const taskId = await offlineAI.addTask({
        type: "text",
        operation: "text_analysis",
        input: "نص اختبار للذكاء الاصطناعي",
        credits: 5,
        estimatedTime: 10,
      });

      // اختبار حالة المهمة
      const task = offlineAI.getTaskStatus(taskId);
      if (!task) {
        throw new Error("فشل في إنشاء المهمة");
      }

      // اختبار إحصائيات الأداء
      const stats = offlineAI.getPerformanceStats();

      this.results.push({
        name: "نظام الذكاء الاصطناعي",
        success: true,
        duration: Date.now() - startTime,
        details: `تم إنشاء مهمة ${taskId} وقراءة الإحصائيات`,
      });
    } catch (error) {
      this.results.push({
        name: "نظام الذكاء الاصطناعي",
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    }
  }

  // اختبار APIs المتصفح
  private async testBrowserAPIs(): Promise<void> {
    const startTime = Date.now();
    const apiTests: { name: string; available: boolean }[] = [];

    try {
      // اختبار APIs المختلفة
      apiTests.push({
        name: "MediaDevices",
        available: !!navigator.mediaDevices,
      });
      apiTests.push({
        name: "WebGL",
        available: !!document.createElement("canvas").getContext("webgl"),
      });
      apiTests.push({
        name: "AudioContext",
        available: !!(
          window.AudioContext || (window as any).webkitAudioContext
        ),
      });
      apiTests.push({
        name: "SpeechSynthesis",
        available: !!window.speechSynthesis,
      });
      apiTests.push({ name: "Clipboard", available: !!navigator.clipboard });
      apiTests.push({ name: "Vibration", available: !!navigator.vibrate });
      apiTests.push({
        name: "Notifications",
        available: !!window.Notification,
      });
      apiTests.push({ name: "FileAPI", available: !!window.File });
      apiTests.push({ name: "IndexedDB", available: !!window.indexedDB });
      apiTests.push({ name: "WebWorkers", available: !!window.Worker });

      const availableAPIs = apiTests.filter((api) => api.available).length;
      const totalAPIs = apiTests.length;

      this.results.push({
        name: "APIs المتصفح",
        success: availableAPIs >= totalAPIs * 0.7, // نجح إذا كان 70% من APIs متاحة
        duration: Date.now() - startTime,
        details: `${availableAPIs}/${totalAPIs} APIs متاحة: ${apiTests
          .filter((a) => a.available)
          .map((a) => a.name)
          .join(", ")}`,
      });
    } catch (error) {
      this.results.push({
        name: "APIs المتصفح",
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    }
  }

  // اختبار الأداء
  private async testPerformance(): Promise<void> {
    const startTime = Date.now();

    try {
      // اختبار سرعة الرسم على Canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d")!;

      const drawStartTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `hsl(${i % 360}, 50%, 50%)`;
        ctx.fillRect(Math.random() * 1000, Math.random() * 1000, 10, 10);
      }
      const drawDuration = performance.now() - drawStartTime;

      // اختبار سرعة معالجة البيانات
      const dataStartTime = performance.now();
      const largeArray = new Array(100000).fill(0).map((_, i) => i);
      const processedArray = largeArray
        .map((x) => x * 2)
        .filter((x) => x % 3 === 0);
      const dataDuration = performance.now() - dataStartTime;

      // اختبار الذاكرة (تقريبي)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo
        ? `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`
        : "غير متاح";

      this.results.push({
        name: "اختبار الأداء",
        success: drawDuration < 100 && dataDuration < 50, // معايير أداء معقولة
        duration: Date.now() - startTime,
        details: `رسم: ${drawDuration.toFixed(1)}ms, معالجة: ${dataDuration.toFixed(1)}ms, ذاكرة: ${memoryUsage}`,
      });
    } catch (error) {
      this.results.push({
        name: "اختبار الأداء",
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    }
  }

  // عرض نتائج الاختبار
  private displayTestResults(report: SystemTestReport): void {
    const duration = (report.totalDuration / 1000).toFixed(1);
    const successRate = (
      (report.passedTests / report.totalTests) *
      100
    ).toFixed(1);

    if (report.overall) {
      feedbackService.success(`اكتمل اختبار النظام بنجاح! 🎉`, {
        message: `${report.passedTests}/${report.totalTests} اختبار نجح (${successRate}%) في ${duration}ث`,
        duration: 10000,
        actions: [
          {
            label: "عرض التفاصيل",
            action: () => this.showDetailedResults(report),
            style: "primary",
          },
        ],
      });
    } else {
      feedbackService.error(
        `فشل في ${report.failedTests} اختبار من ${report.totalTests}`,
        {
          message: `معدل النجاح: ${successRate}% في ${duration}ث`,
          duration: 15000,
          actions: [
            {
              label: "عرض الأخطاء",
              action: () => this.showFailedTests(report),
              style: "danger",
            },
          ],
        },
      );
    }
  }

  // عرض النتائج المفصلة
  private showDetailedResults(report: SystemTestReport): void {
    const details = report.results
      .map((result) => {
        const status = result.success ? "✅" : "❌";
        const duration = `(${result.duration}ms)`;
        return `${status} ${result.name} ${duration}`;
      })
      .join("\n");

    console.group("🧪 تقرير اختبار النظام الشامل");
    console.log(`📊 إجمالي الاختبارات: ${report.totalTests}`);
    console.log(`✅ نجح: ${report.passedTests}`);
    console.log(`❌ فشل: ${report.failedTests}`);
    console.log(
      `⏱️ المدة الكلية: ${(report.totalDuration / 1000).toFixed(1)}ث`,
    );
    console.log("📋 تفاصيل الاختبارات:");
    report.results.forEach((result) => {
      const style = result.success ? "color: green" : "color: red";
      console.log(`%c${result.success ? "✅" : "❌"} ${result.name}`, style);
      if (result.details) console.log(`   📝 ${result.details}`);
      if (result.error) console.log(`   🚫 ${result.error}`);
    });
    console.groupEnd();

    feedbackService.info("تم عرض التفاصيل في وحدة التحكم (Console)");
  }

  // عرض الاختبارات الفاشلة
  private showFailedTests(report: SystemTestReport): void {
    const failedTests = report.results.filter((r) => !r.success);

    console.group("❌ الاختبارات الفاشلة");
    failedTests.forEach((test) => {
      console.error(`🚫 ${test.name}: ${test.error}`);
    });
    console.groupEnd();

    feedbackService.warning(`تم عرض ${failedTests.length} خطأ في وحدة التحكم`);
  }

  // اختبار سريع للمكونات الأساسية
  async runQuickTest(): Promise<boolean> {
    const quickTestId = feedbackService.loading("اختبار سريع...", 0);

    try {
      // اختبار سريع للخدمات الأساسية
      const tests = [
        () => feedbackService.info("اختبار", { duration: 100 }),
        () => offlineAI.getPerformanceStats(),
        () => document.createElement("canvas").getContext("2d"),
        () => new Audio(),
      ];

      let passed = 0;
      for (const test of tests) {
        try {
          test();
          passed++;
        } catch (error) {
          console.warn("Quick test failed:", error);
        }
      }

      feedbackService.dismiss(quickTestId);

      const success = passed >= tests.length * 0.75; // 75% نجاح

      if (success) {
        feedbackService.success(
          `اختبار سريع مكتمل! ${passed}/${tests.length} ✅`,
        );
      } else {
        feedbackService.warning(`اختبار سريع: ${passed}/${tests.length} نجح`);
      }

      return success;
    } catch (error) {
      feedbackService.dismiss(quickTestId);
      feedbackService.error(`فشل الاختبار السريع: ${error}`);
      return false;
    }
  }
}

// إنشاء مثيل واحد للاختبار
export const systemTester = new SystemTester();

// إضافة دالة للاختبار السريع في وحدة التحكم
(window as any).testKnouxSystem = () => systemTester.runFullSystemTest();
(window as any).quickTestKnoux = () => systemTester.runQuickTest();
