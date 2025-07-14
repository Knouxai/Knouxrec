import React, { useState } from "react";
import { OfflineAITool } from "../services/offlineAIToolsService";

interface OfflineToolCardProps {
  tool: OfflineAITool;
  onExecute: (tool: OfflineAITool) => void;
  onSettings: (tool: OfflineAITool) => void;
  onViewResults: (tool: OfflineAITool) => void;
  hasResults?: boolean;
  viewMode: "grid" | "list";
}

const OfflineToolCard: React.FC<OfflineToolCardProps> = ({
  tool,
  onExecute,
  onSettings,
  onViewResults,
  hasResults = false,
  viewMode,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // ألوان حسب الفئة
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "image":
        return "from-purple-500 to-pink-500";
      case "video":
        return "from-blue-500 to-cyan-500";
      case "audio":
        return "from-green-500 to-emerald-500";
      case "text":
        return "from-yellow-500 to-orange-500";
      case "analysis":
        return "from-red-500 to-rose-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  // أيقونة حسب الصعوبة
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  // تنسيق الحجم
  const formatSize = (size: number) => {
    if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} GB`;
    }
    return `${size} MB`;
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  if (viewMode === "list") {
    return (
      <div
        className="glass-card p-4 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-4">
          {/* أيقونة الأداة */}
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(tool.category)} flex items-center justify-center text-xl relative`}
          >
            {tool.icon}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* معلومات الأداة */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{tool.name}</h3>
              <span className="text-white/60 text-sm">({tool.nameEn})</span>
              <span className="text-xs">
                {getDifficultyIcon(tool.difficulty)}
              </span>
            </div>
            <p className="text-white/70 text-sm mb-2">{tool.description}</p>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span>📦 {formatSize(tool.modelSize)}</span>
              <span>⏱️ {formatTime(tool.processingTime)}</span>
              <span>💎 {tool.credits} نقطة</span>
              {tool.timesUsed > 0 && <span>🔢 {tool.timesUsed} استخدام</span>}
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSettings(tool)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
              title="إعدادات"
            >
              ⚙️
            </button>

            {hasResults && (
              <button
                onClick={() => onViewResults(tool)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 transition-all duration-200"
                title="عرض النتائج"
              >
                📊
              </button>
            )}

            <button
              onClick={() => onExecute(tool)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r ${getCategoryColor(tool.category)} text-white hover:scale-105 hover:shadow-lg`}
            >
              ⚡ تشغيل
            </button>
          </div>
        </div>
      </div>
    );
  }

  // عرض Grid
  return (
    <div
      className={`glass-card p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 ${isHovered ? "transform scale-105 shadow-2xl" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* رأس الكارت */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryColor(tool.category)} flex items-center justify-center text-2xl relative`}
        >
          {tool.icon}
          {/* مؤشر الحالة الأوفلاين */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-black">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs">{getDifficultyIcon(tool.difficulty)}</span>
          <span className="text-xs text-white/60">{tool.difficulty}</span>
        </div>
      </div>

      {/* اسم الأداة */}
      <div className="mb-3">
        <h3 className="font-orbitron font-bold text-white text-lg mb-1">
          {tool.name}
        </h3>
        <p className="text-white/60 text-sm">{tool.nameEn}</p>
      </div>

      {/* الوصف */}
      <p className="text-white/70 text-sm mb-4 line-clamp-2">
        {tool.description}
      </p>

      {/* المميزات */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {tool.features.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
            >
              {feature}
            </span>
          ))}
          {tool.features.length > 2 && (
            <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
              +{tool.features.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* معلومات تقنية */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">حجم النموذج:</span>
          <span className="text-white font-medium">
            {formatSize(tool.modelSize)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">وقت المعالجة:</span>
          <span className="text-white font-medium">
            {formatTime(tool.processingTime)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">النقاط المطلوبة:</span>
          <span className="text-yellow-400 font-medium">💎 {tool.credits}</span>
        </div>
        {tool.timesUsed > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">مرات الاستخدام:</span>
            <span className="text-green-400 font-medium">{tool.timesUsed}</span>
          </div>
        )}
      </div>

      {/* شريط التقدم للنموذج */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/60">حالة النموذج:</span>
          <span className="text-green-400">✅ جاهز</span>
        </div>
        <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
        </div>
      </div>

      {/* آخر استخدام */}
      {tool.lastUsed && (
        <div className="mb-4 text-xs text-white/50">
          آخر استخدام: {tool.lastUsed.toLocaleDateString("ar-SA")}
        </div>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSettings(tool)}
          className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 flex items-center justify-center gap-1"
          title="إعدادات الأداة"
        >
          ⚙️
          <span className="text-xs">إعدادات</span>
        </button>

        {hasResults && (
          <button
            onClick={() => onViewResults(tool)}
            className="flex-1 p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 transition-all duration-200 flex items-center justify-center gap-1"
            title="عرض النتائج السابقة"
          >
            📊
            <span className="text-xs">النتائج</span>
          </button>
        )}
      </div>

      {/* زر التشغيل الرئيسي */}
      <button
        onClick={() => onExecute(tool)}
        className={`w-full mt-3 py-3 rounded-xl font-orbitron font-bold text-white transition-all duration-300 bg-gradient-to-r ${getCategoryColor(tool.category)} hover:shadow-xl ${isHovered ? "transform translate-y-[-2px]" : ""}`}
      >
        ⚡ تشغيل الأداة
      </button>

      {/* مؤشر الإدخال والإخراج */}
      <div className="mt-3 flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-1">
          <span>📥</span>
          <span>{tool.inputTypes.length} نوع</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📤</span>
          <span>{tool.outputTypes.length} تنسيق</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineToolCard;
