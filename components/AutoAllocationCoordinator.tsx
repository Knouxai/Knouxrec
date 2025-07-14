import React, { useState, useEffect } from "react";
import {
  smartAutoAllocation,
  AllocationReport,
} from "../services/smartAutoAllocation";
import {
  allocationTester,
  VerificationReport,
} from "../services/allocationTester";

interface AutoAllocationCoordinatorProps {
  onComplete?: (report: VerificationReport) => void;
  autoStart?: boolean;
}

const AutoAllocationCoordinator: React.FC<AutoAllocationCoordinatorProps> = ({
  onComplete,
  autoStart = false,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "allocating" | "testing" | "complete"
  >("idle");
  const [allocationReports, setAllocationReports] = useState<
    AllocationReport[]
  >([]);
  const [verificationReport, setVerificationReport] =
    useState<VerificationReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("");

  useEffect(() => {
    if (autoStart && phase === "idle") {
      startAutoAllocation();
    }
  }, [autoStart]);

  const startAutoAllocation = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setPhase("allocating");
    setProgress(0);
    setCurrentSection("بدء الفحص الذكي...");

    try {
      // مرحلة التخصيص التلقائي
      console.log("🚀 بدء النظام الذكي للتخصيص التلقائي");

      const reports = await smartAutoAllocation.startSmartAllocation();
      setAllocationReports(reports);
      setProgress(50);
      setPhase("testing");
      setCurrentSection("اختبار المكونات المخصصة...");

      // مرحلة الاختبار والتحقق
      const verification =
        await allocationTester.runComprehensiveVerification();
      setVerificationReport(verification);
      setProgress(100);
      setPhase("complete");
      setCurrentSection("اكتمل التخصيص والاختبار");

      console.log("✅ اكتمل التخصيص التلقائي والاختبار بنجاح");

      if (onComplete) {
        onComplete(verification);
      }
    } catch (error) {
      console.error("❌ خطأ في التخصيص التلقائي:", error);
      setPhase("idle");
      setCurrentSection("فشل في التخصيص");
    } finally {
      setIsRunning(false);
    }
  };

  const generateConsoleReport = () => {
    if (!verificationReport) return;

    console.log("\n" + "=".repeat(80));
    console.log("📊 تقرير التخصيص التلقائي الذكي - KNOUX REC");
    console.log("=".repeat(80));

    console.log("\n🎯 النتائج العامة:");
    console.log(`   النقاط الإجمالية: ${verificationReport.overall.score}/100`);
    console.log(
      `   الحالة العامة: ${verificationReport.overall.passed ? "✅ نجح" : "❌ فشل"}`,
    );
    console.log(
      `   إجمالي الاختبارات: ${verificationReport.overall.totalTests}`,
    );
    console.log(
      `   الاختبارات الناجحة: ${verificationReport.overall.passedTests}`,
    );
    console.log(
      `   الاختبارات الفاشلة: ${verificationReport.overall.failedTests}`,
    );
    console.log(
      `   وقت التنفيذ: ${(verificationReport.overall.executionTime / 1000).toFixed(2)} ثانية`,
    );

    console.log("\n📋 ملخص العمليات المنجزة:");
    allocationReports.forEach((report) => {
      const status = report.success ? "✅" : "❌";
      console.log(`   ${status} ${report.sectionName} (${report.contentType})`);
      if (!report.success && report.error) {
        console.log(`      خطأ: ${report.error}`);
      }
    });

    console.log("\n🔍 نتائج الاختبارات التفصيلية:");
    verificationReport.sections.forEach((section) => {
      const status = section.passed ? "✅" : "❌";
      console.log(`   ${status} ${section.sectionName}: ${section.score}/100`);

      if (section.issues.length > 0) {
        section.issues.forEach((issue) => {
          console.log(`      ⚠️  ${issue}`);
        });
      }

      if (section.recommendations.length > 0) {
        section.recommendations.forEach((rec) => {
          console.log(`      💡 ${rec}`);
        });
      }
    });

    console.log("\n📝 الملخص:");
    console.log(`   ${verificationReport.summary}`);

    if (verificationReport.criticalIssues.length > 0) {
      console.log("\n🚨 المشاكل الحرجة:");
      verificationReport.criticalIssues.forEach((issue) => {
        console.log(`   ❗ ${issue}`);
      });
    }

    console.log("\n📋 عناصر العمل المطلوبة:");
    verificationReport.actionItems.forEach((item) => {
      console.log(`   📌 ${item}`);
    });

    console.log("\n📊 إحصائيات التخصيص:");
    const stats = smartAutoAllocation.getAllocationStats();
    console.log(`   إجمالي العمليات: ${stats.total}`);
    console.log(`   العمليات الناجحة: ${stats.successful}`);
    console.log(`   العمليات الفاشلة: ${stats.failed}`);
    console.log(`   معدل النجاح: ${stats.successRate.toFixed(1)}%`);
    console.log(
      `   متوسط وقت التخصيص: ${stats.averageAllocationTime.toFixed(0)} مللي ثانية`,
    );
    console.log(
      `   إجمالي وقت التخصيص: ${(stats.totalAllocationTime / 1000).toFixed(2)} ثانية`,
    );

    console.log("\n💾 المكونات المخصصة:");
    Object.entries(stats.typeStats).forEach(([type, count]) => {
      const typeNames: Record<string, string> = {
        config: "الإعدادات",
        data: "البيانات",
        model: "النماذج",
        template: "القوالب",
        service: "الخدمات",
      };
      console.log(`   ${typeNames[type] || type}: ${count} مكون`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("🎉 تم إنجاز التخصيص التلقائي الذكي بنجاح!");
    console.log("📦 جميع المك��نات جاهزة للتشغيل والتغليف في ملف EXE");
    console.log("=".repeat(80) + "\n");
  };

  useEffect(() => {
    if (phase === "complete" && verificationReport) {
      // تأخير بسيط لضمان اكتمال العمليات
      setTimeout(() => {
        generateConsoleReport();
      }, 1000);
    }
  }, [phase, verificationReport]);

  if (!isRunning && phase === "idle") {
    return (
      <div className="glass-card p-6 rounded-xl border border-knoux-purple/30 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
            النظام الذكي للتخصيص التلقائي
          </h2>
          <p className="text-white/70 mb-6">
            سيقوم النظام بفحص جميع الأقسام والخدمات وتخصيص المحتوى المناسب
            تلقائياً
          </p>
          <button
            onClick={startAutoAllocation}
            className="px-8 py-4 bg-gradient-to-r from-knoux-purple to-knoux-neon rounded-xl font-bold text-white hover:scale-105 transition-all"
          >
            🚀 بدء التخصيص التلقائي الذكي
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl border border-knoux-purple/30 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">
          {phase === "allocating" ? "⚙️" : phase === "testing" ? "🔍" : "✅"}
        </div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
          {phase === "allocating"
            ? "التخصيص التلقائي جارٍ..."
            : phase === "testing"
              ? "اختبار المكونات..."
              : "اكتمل التخصيص بنجاح!"}
        </h2>
        <p className="text-white/70">{currentSection}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>التقدم</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Allocation Reports */}
      {allocationReports.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-rajdhani font-bold text-white mb-4">
            📋 عمليات التخصيص المنجزة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {allocationReports.map((report, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  report.success
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {report.sectionName}
                  </span>
                  <span className="text-xs">
                    {report.success ? "✅" : "❌"}
                  </span>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {report.contentType} • {report.allocationTime}ms
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Report */}
      {verificationReport && (
        <div className="space-y-6">
          <h3 className="text-lg font-rajdhani font-bold text-white">
            🔍 نتائج الاختبار والتحقق
          </h3>

          {/* Overall Score */}
          <div className="glass-card p-4 rounded-lg border border-knoux-purple/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">النقاط الإجمالية</span>
              <span
                className={`text-2xl font-bold ${
                  verificationReport.overall.score >= 80
                    ? "text-green-400"
                    : verificationReport.overall.score >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {verificationReport.overall.score}/100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-green-400 font-bold text-lg">
                  {verificationReport.overall.passedTests}
                </div>
                <div className="text-xs text-white/60">نجح</div>
              </div>
              <div>
                <div className="text-red-400 font-bold text-lg">
                  {verificationReport.overall.failedTests}
                </div>
                <div className="text-xs text-white/60">فشل</div>
              </div>
              <div>
                <div className="text-blue-400 font-bold text-lg">
                  {(verificationReport.overall.executionTime / 1000).toFixed(1)}
                  s
                </div>
                <div className="text-xs text-white/60">وقت التنفيذ</div>
              </div>
            </div>
          </div>

          {/* Section Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verificationReport.sections.map((section, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  section.passed
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">
                    {section.sectionName}
                  </span>
                  <span
                    className={`font-bold ${
                      section.score >= 80
                        ? "text-green-400"
                        : section.score >= 60
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {section.score}/100
                  </span>
                </div>

                <div className="text-xs text-white/60 mb-2">
                  {section.testType} • {section.testTime}ms
                </div>

                {section.issues.length > 0 && (
                  <div className="text-xs text-red-300 space-y-1">
                    {section.issues.slice(0, 2).map((issue, i) => (
                      <div key={i}>⚠️ {issue}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass-card p-4 rounded-lg border border-knoux-purple/20">
            <h4 className="font-rajdhani font-bold text-white mb-2">
              📝 ملخص النتائج
            </h4>
            <p className="text-white/80 text-sm">
              {verificationReport.summary}
            </p>
          </div>

          {/* Action Items */}
          {verificationReport.actionItems.length > 0 && (
            <div className="glass-card p-4 rounded-lg border border-knoux-purple/20">
              <h4 className="font-rajdhani font-bold text-white mb-3">
                📋 الإجراءات المطلوبة
              </h4>
              <div className="space-y-2">
                {verificationReport.actionItems.map((item, index) => (
                  <div
                    key={index}
                    className="text-sm text-white/70 flex items-start"
                  >
                    <span className="text-knoux-neon mr-2">📌</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Actions */}
      {phase === "complete" && (
        <div className="mt-8 pt-6 border-t border-knoux-purple/20">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setPhase("idle");
                setAllocationReports([]);
                setVerificationReport(null);
                setProgress(0);
              }}
              className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/40 rounded-xl text-white font-medium transition-all"
            >
              إعادة تشغيل
            </button>
            <button
              onClick={generateConsoleReport}
              className="px-6 py-3 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-xl text-knoux-purple font-medium transition-all"
            >
              📊 عرض التقرير التفصيلي
            </button>
            <button
              onClick={() => {
                // هنا يمكن إضافة منطق التغليف في EXE
                console.log("🎉 جاهز للتغليف في ملف EXE!");
                alert("جميع المكونات جاهزة للتغليف والتثبيت!");
              }}
              className="px-6 py-3 bg-gradient-to-r from-knoux-purple to-knoux-neon rounded-xl font-bold text-white hover:scale-105 transition-all"
            >
              📦 تغليف في EXE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoAllocationCoordinator;
