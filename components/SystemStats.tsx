import React, { useState, useEffect } from "react";

interface SystemStats {
  totalTools: number;
  aiPoweredTools: number;
  totalTemplates: number;
  totalModels: number;
  installedModels: number;
  storageUsed: number;
  processingTasks: number;
  systemHealth: "excellent" | "good" | "fair" | "poor";
  uptime: string;
  lastUpdate: string;
}

const SystemStats: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalTools: 35,
    aiPoweredTools: 28,
    totalTemplates: 88,
    totalModels: 24,
    installedModels: 18,
    storageUsed: 15.2,
    processingTasks: 0,
    systemHealth: "excellent",
    uptime: "2h 45m",
    lastUpdate: "2024-12-19",
  });

  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    gpuUsage: 0,
    networkActivity: 0,
  });

  // محاكاة البيانات الحية
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        cpuUsage: Math.floor(Math.random() * 40) + 10, // 10-50%
        memoryUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
        gpuUsage: Math.floor(Math.random() * 60) + 15, // 15-75%
        networkActivity: Math.floor(Math.random() * 100), // 0-100%
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-blue-400";
      case "fair":
        return "text-yellow-400";
      case "poor":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "excellent":
        return "🟢";
      case "good":
        return "🔵";
      case "fair":
        return "🟡";
      case "poor":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "knoux-purple",
    progress,
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
    progress?: number;
    trend?: "up" | "down" | "stable";
  }) => (
    <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <div
            className={`text-sm ${
              trend === "up"
                ? "text-green-400"
                : trend === "down"
                  ? "text-red-400"
                  : "text-white/50"
            }`}
          >
            {trend === "up" ? "↗️" : trend === "down" ? "↘️" : "➡️"}
          </div>
        )}
      </div>

      <div className={`text-2xl font-bold text-${color} mb-1`}>{value}</div>

      <div className="text-sm text-white font-medium mb-1">{title}</div>

      {subtitle && <div className="text-xs text-white/50">{subtitle}</div>}

      {progress !== undefined && (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div
              className={`bg-${color} h-1 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
              📊 إحصائيات النظام
            </h2>
            <p className="text-white/70 mt-1">
              نظرة شاملة على أداء وحالة KNOUX REC
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm text-white/50">حالة النظام:</span>
              <span className={getHealthColor(stats.systemHealth)}>
                {getHealthIcon(stats.systemHealth)}
              </span>
            </div>
            <div className="text-sm text-white/50">
              آخر تحديث: {stats.lastUpdate}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="إجمالي الأدوات"
          value={stats.totalTools}
          subtitle="متاحة للاستخدام"
          icon="🛠️"
          color="knoux-purple"
          trend="stable"
        />

        <StatCard
          title="أدوات ذكية"
          value={stats.aiPoweredTools}
          subtitle="مدعومة بالذكاء الاصطناعي"
          icon="🤖"
          color="knoux-neon"
          trend="up"
        />

        <StatCard
          title="القوالب"
          value={stats.totalTemplates}
          subtitle="قالب جاهز"
          icon="📽️"
          color="blue-400"
          trend="up"
        />

        <StatCard
          title="النماذج المثبتة"
          value={`${stats.installedModels}/${stats.totalModels}`}
          subtitle="نماذج ذكاء اصطناعي"
          icon="🧠"
          color="purple-400"
          progress={(stats.installedModels / stats.totalModels) * 100}
          trend="up"
        />

        <StatCard
          title="التخزين المستخدم"
          value={`${stats.storageUsed} GB`}
          subtitle="من 50 GB"
          icon="���"
          color="yellow-400"
          progress={(stats.storageUsed / 50) * 100}
          trend="stable"
        />

        <StatCard
          title="المهام النشطة"
          value={stats.processingTasks}
          subtitle="معالجة حالياً"
          icon="⚡"
          color="green-400"
          trend="stable"
        />
      </div>

      {/* Real-time Performance */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
          ⚡ الأداء المباشر
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-knoux-purple/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">المعالج (CPU)</span>
              <span className="text-knoux-purple font-bold">
                {realTimeData.cpuUsage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-knoux-purple h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeData.cpuUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-blue-400/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">الذاكرة (RAM)</span>
              <span className="text-blue-400 font-bold">
                {realTimeData.memoryUsage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeData.memoryUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-green-400/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">كرت الرسوم (GPU)</span>
              <span className="text-green-400 font-bold">
                {realTimeData.gpuUsage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeData.gpuUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-yellow-400/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">الشبكة</span>
              <span className="text-yellow-400 font-bold">
                {realTimeData.networkActivity}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeData.networkActivity}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tools by Category */}
        <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
          <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
            🔧 الأدوات حسب الفئة
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>🎥</span>
                <span className="text-white">أدوات ا��فيديو</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 font-bold">16</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>🎵</span>
                <span className="text-white">أدوات الصوت</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">7</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>🖼️</span>
                <span className="text-white">أدوات الصور</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 font-bold">6</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: "17%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>📝</span>
                <span className="text-white">أدوات النصوص</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-400 font-bold">5</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-400 h-2 rounded-full"
                    style={{ width: "14%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates by Category */}
        <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
          <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
            📽️ القوالب حسب الفئة
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>📚</span>
                <span className="text-white">تعليمية</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 font-bold">10</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>🎬</span>
                <span className="text-white">مقدمات</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-bold">12</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span>📹</span>
                <span className="text-white">فلوجات</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 font-bold">10</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>💼</span>
                <span className="text-white">أعمال</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-400 font-bold">10</span>
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-400 h-2 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
          ℹ️ معلومات النظام
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-black/20 rounded-lg">
            <div className="text-sm text-white/50 mb-1">وقت التشغيل</div>
            <div className="text-lg font-bold text-knoux-purple">
              {stats.uptime}
            </div>
          </div>

          <div className="p-4 bg-black/20 rounded-lg">
            <div className="text-sm text-white/50 mb-1">إصدار التطبيق</div>
            <div className="text-lg font-bold text-knoux-neon">v2.0.0</div>
          </div>

          <div className="p-4 bg-black/20 rounded-lg">
            <div className="text-sm text-white/50 mb-1">وضع التشغيل</div>
            <div className="text-lg font-bold text-green-400">100% Offline</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
