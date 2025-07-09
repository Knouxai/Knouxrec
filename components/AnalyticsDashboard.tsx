import React, { useState, useEffect } from "react";

interface AnalyticsData {
  usage: {
    totalSessions: number;
    totalProcessingTime: number;
    averageSessionTime: number;
    mostUsedTools: Array<{ name: string; count: number; percentage: number }>;
    toolsPerformance: Array<{
      tool: string;
      avgTime: number;
      successRate: number;
    }>;
  };
  productivity: {
    filesProcessed: number;
    totalOutputSize: number;
    averageFileSize: number;
    processingEfficiency: number;
    dailyActivity: Array<{ date: string; files: number; time: number }>;
  };
  aiModels: {
    modelsUsage: Array<{ model: string; usage: number; accuracy: number }>;
    modelPerformance: Array<{
      model: string;
      cpuUsage: number;
      memoryUsage: number;
      loadTime: number;
    }>;
    aiInsights: Array<{
      insight: string;
      impact: "high" | "medium" | "low";
      suggestion: string;
    }>;
  };
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    popularCategories: Array<{ category: string; growth: number }>;
    userBehavior: Array<{
      action: string;
      frequency: number;
      trend: "up" | "down" | "stable";
    }>;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter"
  >("week");
  const [activeInsight, setActiveInsight] = useState<number>(0);

  // تحميل بيانات التحليلات
  useEffect(() => {
    const generateAnalytics = (): AnalyticsData => {
      return {
        usage: {
          totalSessions: 147,
          totalProcessingTime: 2340, // بالدقائق
          averageSessionTime: 23,
          mostUsedTools: [
            { name: "محسن الصور", count: 89, percentage: 35 },
            { name: "النص إلى كلام", count: 67, percentage: 26 },
            { name: "مولد الفيديو الذكي", count: 45, percentage: 18 },
            { name: "إزالة الخلفية", count: 34, percentage: 13 },
            { name: "تقليل الضوضاء", count: 20, percentage: 8 },
          ],
          toolsPerformance: [
            { tool: "محسن الصور", avgTime: 2.3, successRate: 98 },
            { tool: "النص إلى كلام", avgTime: 1.8, successRate: 95 },
            { tool: "إزالة الخلفية", avgTime: 3.1, successRate: 92 },
            { tool: "تقليل الضوضاء", avgTime: 1.2, successRate: 97 },
            { tool: "مولد الفيديو", avgTime: 8.7, successRate: 89 },
          ],
        },
        productivity: {
          filesProcessed: 1247,
          totalOutputSize: 15.7, // GB
          averageFileSize: 12.6, // MB
          processingEfficiency: 94,
          dailyActivity: [
            { date: "الإثنين", files: 23, time: 45 },
            { date: "الثلاثاء", files: 31, time: 67 },
            { date: "الأربعاء", files: 28, time: 52 },
            { date: "الخميس", files: 35, time: 78 },
            { date: "الجمعة", files: 42, time: 89 },
            { date: "السبت", files: 19, time: 34 },
            { date: "الأحد", files: 15, time: 28 },
          ],
        },
        aiModels: {
          modelsUsage: [
            { model: "Real-ESRGAN", usage: 89, accuracy: 96 },
            { model: "Whisper", usage: 76, accuracy: 94 },
            { model: "Stable Diffusion", usage: 54, accuracy: 91 },
            { model: "YOLOv8", usage: 43, accuracy: 88 },
            { model: "U-2-Net", usage: 32, accuracy: 93 },
          ],
          modelPerformance: [
            {
              model: "Real-ESRGAN",
              cpuUsage: 45,
              memoryUsage: 2.1,
              loadTime: 1.2,
            },
            { model: "Whisper", cpuUsage: 67, memoryUsage: 3.8, loadTime: 2.3 },
            {
              model: "Stable Diffusion",
              cpuUsage: 89,
              memoryUsage: 8.2,
              loadTime: 5.1,
            },
            { model: "YOLOv8", cpuUsage: 34, memoryUsage: 1.2, loadTime: 0.8 },
            { model: "U-2-Net", cpuUsage: 52, memoryUsage: 2.7, loadTime: 1.5 },
          ],
          aiInsights: [
            {
              insight: "زيادة استخدام أدوات تحسين الصور بنسبة 45% هذا الأسبوع",
              impact: "high",
              suggestion: "يُنصح بتحسين كاش نماذج تحسين الصور لأداء أفضل",
            },
            {
              insight: "انخفاض في استخدام أدوات الفيديو بنسبة 12%",
              impact: "medium",
              suggestion: "إضافة قوالب فيديو جديدة قد يزيد من الاستخدام",
            },
            {
              insight: "ارتفاع معدل نجاح نماذج النص إلى كلام إلى 95%",
              impact: "low",
              suggestion: "مشاركة هذا التحسن مع المستخدمين كميزة",
            },
          ],
        },
        trends: {
          weeklyGrowth: 15.3,
          monthlyGrowth: 47.8,
          popularCategories: [
            { category: "أدوات الصور", growth: 23 },
            { category: "أدوات النصوص", growth: 18 },
            { category: "أدوات الصوت", growth: 12 },
            { category: "أدوات الفيديو", growth: 8 },
          ],
          userBehavior: [
            { action: "معالجة دفعية", frequency: 45, trend: "up" },
            { action: "استخدام القوالب", frequency: 67, trend: "up" },
            { action: "تخصيص الأدوات", frequency: 23, trend: "stable" },
            { action: "تصدير عالي الجودة", frequency: 78, trend: "up" },
          ],
        },
      };
    };

    setAnalyticsData(generateAnalytics());
  }, [selectedPeriod]);

  // دوار التوصيات
  useEffect(() => {
    if (analyticsData?.aiModels.aiInsights) {
      const interval = setInterval(() => {
        setActiveInsight(
          (prev) => (prev + 1) % analyticsData.aiModels.aiInsights.length,
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [analyticsData]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📊</div>
          <h3 className="text-xl font-orbitron font-bold text-white mb-2">
            جاري تحليل البيانات...
          </h3>
          <p className="text-white/70">
            انتظر قليلاً بينما نجهز التحليلات المتقدمة
          </p>
        </div>
      </div>
    );
  }

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "knoux-purple",
    trend,
    change,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
    trend?: "up" | "down" | "stable";
    change?: string;
  }) => (
    <div className="glass-card p-6 rounded-xl border border-knoux-purple/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-grow">
          <div className={`text-3xl font-bold text-${color} mb-2`}>{value}</div>
          <h3 className="font-rajdhani font-bold text-white mb-1">{title}</h3>
          {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
        </div>
        <div className="text-right">
          <div className="text-2xl mb-2">{icon}</div>
          {trend && change && (
            <div
              className={`text-sm flex items-center space-x-1 ${
                trend === "up"
                  ? "text-green-400"
                  : trend === "down"
                    ? "text-red-400"
                    : "text-white/50"
              }`}
            >
              <span>
                {trend === "up" ? "↗️" : trend === "down" ? "↘️" : "➡️"}
              </span>
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({
    label,
    value,
    maxValue,
    color = "knoux-purple",
    showPercentage = true,
  }: {
    label: string;
    value: number;
    maxValue: number;
    color?: string;
    showPercentage?: boolean;
  }) => {
    const percentage = (value / maxValue) * 100;
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>{label}</span>
          <span>
            {showPercentage
              ? `${Math.round(percentage)}%`
              : `${value}/${maxValue}`}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`bg-${color} h-2 rounded-full transition-all duration-1000`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
              📊 تحليلات ذكية
            </h2>
            <p className="text-white/70 mt-1">
              رؤى عميقة حول استخدام وأداء KNOUX REC
            </p>
          </div>

          <div className="flex space-x-2">
            {["week", "month", "quarter"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedPeriod === period
                    ? "bg-knoux-purple text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {period === "week"
                  ? "أسبوع"
                  : period === "month"
                    ? "شهر"
                    : "ربع سنة"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="إجمالي الجلسات"
          value={analyticsData.usage.totalSessions}
          subtitle="جلسة عمل"
          icon="👥"
          color="knoux-purple"
          trend="up"
          change="+15%"
        />
        <MetricCard
          title="الملفات المعالجة"
          value={analyticsData.productivity.filesProcessed}
          subtitle="ملف"
          icon="📁"
          color="green-400"
          trend="up"
          change="+23%"
        />
        <MetricCard
          title="وقت المعالجة"
          value={`${Math.round(analyticsData.usage.totalProcessingTime / 60)}h`}
          subtitle={`${analyticsData.usage.totalProcessingTime % 60}m`}
          icon="⏱️"
          color="blue-400"
          trend="stable"
          change="±2%"
        />
        <MetricCard
          title="كفاءة المعالجة"
          value={`${analyticsData.productivity.processingEfficiency}%`}
          subtitle="معدل النجاح"
          icon="🎯"
          color="yellow-400"
          trend="up"
          change="+5%"
        />
      </div>

      {/* AI Insights Banner */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20 bg-gradient-to-r from-knoux-purple/10 to-knoux-neon/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h3 className="font-rajdhani font-bold text-white mb-1">
                توصية ذكية
              </h3>
              <p className="text-white/80">
                {analyticsData.aiModels.aiInsights[activeInsight]?.insight}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              analyticsData.aiModels.aiInsights[activeInsight]?.impact ===
              "high"
                ? "bg-red-500/20 text-red-400"
                : analyticsData.aiModels.aiInsights[activeInsight]?.impact ===
                    "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
            }`}
          >
            {analyticsData.aiModels.aiInsights[activeInsight]?.impact === "high"
              ? "عالي الأهمية"
              : analyticsData.aiModels.aiInsights[activeInsight]?.impact ===
                  "medium"
                ? "متوسط الأهمية"
                : "منخفض الأهمية"}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأدوات الأكثر استخداماً */}
        <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
          <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
            🛠️ الأدوات الأكثر استخداماً
          </h3>

          <div className="space-y-4">
            {analyticsData.usage.mostUsedTools.map((tool, idx) => (
              <ProgressBar
                key={idx}
                label={tool.name}
                value={tool.percentage}
                maxValue={100}
                color={
                  idx === 0
                    ? "knoux-purple"
                    : idx === 1
                      ? "green-400"
                      : idx === 2
                        ? "blue-400"
                        : idx === 3
                          ? "yellow-400"
                          : "purple-400"
                }
              />
            ))}
          </div>
        </div>

        {/* أداء النماذج */}
        <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
          <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
            🧠 أداء نماذج الذكاء الاصطناعي
          </h3>

          <div className="space-y-4">
            {analyticsData.aiModels.modelsUsage.map((model, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
              >
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {model.model}
                    </span>
                    <span className="text-knoux-neon text-sm">
                      {model.accuracy}% دقة
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-knoux-purple h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${model.usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* النشاط اليومي */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
          📈 النشاط اليومي
        </h3>

        <div className="grid grid-cols-7 gap-4">
          {analyticsData.productivity.dailyActivity.map((day, idx) => (
            <div key={idx} className="text-center">
              <div className="text-white/50 text-sm mb-2">{day.date}</div>
              <div className="relative h-32 bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-knoux-purple to-knoux-neon transition-all duration-1000"
                  style={{ height: `${(day.files / 50) * 100}%` }}
                ></div>
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-white text-xs font-bold">
                    {day.files}
                  </span>
                </div>
              </div>
              <div className="text-white/70 text-xs mt-1">{day.time}د</div>
            </div>
          ))}
        </div>
      </div>

      {/* الاتجاهات والتوقعات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الفئات الشائعة */}
        <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
          <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
            📊 الفئات الشائعة
          </h3>

          <div className="space-y-4">
            {analyticsData.trends.popularCategories.map((category, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-white/70">{category.category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 font-bold">
                    +{category.growth}%
                  </span>
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(category.growth / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* سلوك المستخدم */}
        <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
          <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
            👤 سلوك المستخدم
          </h3>

          <div className="space-y-4">
            {analyticsData.trends.userBehavior.map((behavior, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
              >
                <span className="text-white/70">{behavior.action}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">
                    {behavior.frequency}%
                  </span>
                  <div
                    className={`text-sm ${
                      behavior.trend === "up"
                        ? "text-green-400"
                        : behavior.trend === "down"
                          ? "text-red-400"
                          : "text-white/50"
                    }`}
                  >
                    {behavior.trend === "up"
                      ? "↗️"
                      : behavior.trend === "down"
                        ? "↘️"
                        : "➡️"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* تقرير مفصل */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-rajdhani font-bold text-white">
            📋 تقرير مفصل
          </h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-xl font-medium transition-all">
              تصدير PDF
            </button>
            <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 hover:text-white rounded-xl font-medium transition-all">
              تصدير Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="font-bold text-white mb-2">📈 نمو الاستخدام</h4>
            <div className="text-2xl font-bold text-green-400 mb-1">
              +{analyticsData.trends.weeklyGrowth}%
            </div>
            <div className="text-sm text-white/50">هذا الأسبوع</div>
          </div>

          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="font-bold text-white mb-2">⚡ متوسط وقت الجلسة</h4>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {analyticsData.usage.averageSessionTime}م
            </div>
            <div className="text-sm text-white/50">لكل جلسة</div>
          </div>

          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="font-bold text-white mb-2">💾 حجم المخرجات</h4>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {analyticsData.productivity.totalOutputSize} GB
            </div>
            <div className="text-sm text-white/50">إجمالي</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
