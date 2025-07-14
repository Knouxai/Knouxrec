import React, { useState, useEffect, useMemo } from "react";
import {
  OfflineAITool,
  ToolExecutionResult,
  offlineAIToolsService,
} from "../services/offlineAIToolsService";
import OfflineToolCard from "./OfflineToolCard";
import ToolExecutionDialog from "./ToolExecutionDialog";
import { feedbackService } from "../services/feedbackService";

type TabCategory = "all" | "text" | "video" | "image" | "audio" | "analysis";
type ViewMode = "grid" | "list";

const OfflineAIToolsPanel: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<TabCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [tools, setTools] = useState<OfflineAITool[]>([]);
  const [executionDialog, setExecutionDialog] = useState<{
    isOpen: boolean;
    tool: OfflineAITool | null;
  }>({ isOpen: false, tool: null });
  const [results, setResults] = useState<Map<string, ToolExecutionResult[]>>(
    new Map(),
  );
  const [sortBy, setSortBy] = useState<"name" | "usage" | "recent" | "credits">(
    "name",
  );

  // تحميل الأدوات عند بدء التشغيل
  useEffect(() => {
    const loadedTools = offlineAIToolsService.getAllTools();
    setTools(loadedTools);
    feedbackService.info(
      `تم تحميل ${loadedTools.length} أداة ذكاء اصطناعي أوفلاين`,
    );
  }, []);

  // فلترة وترتيب الأدوات
  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools;

    // فلترة حسب التبويب
    if (selectedTab !== "all") {
      filtered = filtered.filter((tool) => tool.category === selectedTab);
    }

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      filtered = offlineAIToolsService.searchTools(searchQuery);
      if (selectedTab !== "all") {
        filtered = filtered.filter((tool) => tool.category === selectedTab);
      }
    }

    // ترتيب النتائج
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "usage":
          return b.timesUsed - a.timesUsed;
        case "recent":
          if (!a.lastUsed && !b.lastUsed) return 0;
          if (!a.lastUsed) return 1;
          if (!b.lastUsed) return -1;
          return b.lastUsed.getTime() - a.lastUsed.getTime();
        case "credits":
          return a.credits - b.credits;
        case "name":
        default:
          return a.name.localeCompare(b.name, "ar");
      }
    });

    return filtered;
  }, [tools, selectedTab, searchQuery, sortBy]);

  // تبويبات الفئات
  const tabs = [
    { id: "all" as const, name: "الكل", icon: "🔮", count: tools.length },
    {
      id: "text" as const,
      name: "نصوص",
      icon: "🔤",
      count: offlineAIToolsService.getToolsByCategory("text").length,
    },
    {
      id: "video" as const,
      name: "فيديو",
      icon: "🎞️",
      count: offlineAIToolsService.getToolsByCategory("video").length,
    },
    {
      id: "image" as const,
      name: "صور",
      icon: "🖼️",
      count: offlineAIToolsService.getToolsByCategory("image").length,
    },
    {
      id: "audio" as const,
      name: "صوت",
      icon: "🔊",
      count: offlineAIToolsService.getToolsByCategory("audio").length,
    },
    {
      id: "analysis" as const,
      name: "تحليل",
      icon: "📊",
      count: offlineAIToolsService.getToolsByCategory("analysis").length,
    },
  ];

  // معالجة تشغيل الأداة
  const handleExecuteTool = (tool: OfflineAITool) => {
    setExecutionDialog({ isOpen: true, tool });
  };

  // معالجة إعدادات الأداة
  const handleToolSettings = (tool: OfflineAITool) => {
    feedbackService.info(`إعدادات ${tool.name} - قريباً...`);
  };

  // معالجة عرض النتائج
  const handleViewResults = (tool: OfflineAITool) => {
    const toolResults = offlineAIToolsService.getExecutionHistory(tool.id);
    if (toolResults.length > 0) {
      // يمكن فتح نافذة منفصلة لعرض النتائج
      feedbackService.info(
        `عرض ${toolResults.length} نتيجة سابقة لـ ${tool.name}`,
      );
    } else {
      feedbackService.warning(`لا توجد نتائج سابقة لـ ${tool.name}`);
    }
  };

  // معالجة نتيجة التنفيذ
  const handleExecutionResult = (result: ToolExecutionResult) => {
    if (result.success) {
      // تحديث النتائج المحفوظة
      const toolId = executionDialog.tool?.id;
      if (toolId) {
        setResults((prev) => {
          const newResults = new Map(prev);
          const existing = newResults.get(toolId) || [];
          newResults.set(toolId, [result, ...existing].slice(0, 10)); // حفظ آخر 10 نتائج
          return newResults;
        });

        // تحديث قائمة الأدوات لإظهار الاستخدام الجديد
        setTools((prev) =>
          prev.map((tool) =>
            tool.id === toolId
              ? { ...tool, timesUsed: tool.timesUsed + 1, lastUsed: new Date() }
              : tool,
          ),
        );
      }
    }
  };

  // إحصائيات الاستخدام
  const usageStats = useMemo(() => {
    return offlineAIToolsService.getUsageStats();
  }, [tools]);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* رأس القسم */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
            🧠
          </div>
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white">
              أدوات الذكاء الاصطناعي
            </h1>
            <p className="text-white/70">
              38 أداة ذكية تعمل 100% أوفلاين بدون إنترنت 🚫🌐
            </p>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-knoux-purple">
              {usageStats.totalTools}
            </div>
            <div className="text-white/70 text-sm">أداة متاحة</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-knoux-neon">
              {usageStats.totalUsage}
            </div>
            <div className="text-white/70 text-sm">مرة استخدام</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-white/70 text-sm">أوفلاين</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-yellow-400">0</div>
            <div className="text-white/70 text-sm">APIs خارجية</div>
          </div>
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* شريط البحث */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 ابحث عن أداة (الاسم، الوصف، المميزات...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pr-10 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-knoux-purple focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* ترتيب */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-3 bg-black/30 border border-white/20 rounded-xl text-white"
          >
            <option value="name">ترتيب أبجدي</option>
            <option value="usage">الأكثر استخداماً</option>
            <option value="recent">الأحدث استخداماً</option>
            <option value="credits">النقاط (أقل لأكثر)</option>
          </select>

          {/* تبديل وضع العرض */}
          <div className="flex bg-black/30 border border-white/20 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-knoux-purple text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              🔲
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-knoux-purple text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              📋
            </button>
          </div>
        </div>

        {/* تبويبات الفئات */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedTab === tab.id
                  ? "bg-knoux-purple text-white"
                  : "bg-black/30 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* رسالة النتائج */}
      {searchQuery && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-300">
            🔍 وُجد {filteredAndSortedTools.length} أداة تطابق "{searchQuery}"
          </p>
        </div>
      )}

      {/* شبكة الأدوات */}
      {filteredAndSortedTools.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredAndSortedTools.map((tool) => (
            <OfflineToolCard
              key={tool.id}
              tool={tool}
              onExecute={handleExecuteTool}
              onSettings={handleToolSettings}
              onViewResults={handleViewResults}
              hasResults={
                results.has(tool.id) && (results.get(tool.id)?.length || 0) > 0
              }
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            لا توجد أدوات تطابق البحث
          </h3>
          <p className="text-white/60 mb-4">
            جرب البحث بكلمات مختلفة أو تصفح الفئات المختلفة
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTab("all");
            }}
            className="px-6 py-3 bg-knoux-purple hover:bg-knoux-purple/80 rounded-xl text-white font-medium transition-all duration-200"
          >
            عرض جميع الأدوات
          </button>
        </div>
      )}

      {/* نافذة تشغيل الأداة */}
      <ToolExecutionDialog
        tool={executionDialog.tool}
        isOpen={executionDialog.isOpen}
        onClose={() => setExecutionDialog({ isOpen: false, tool: null })}
        onResult={handleExecutionResult}
      />
    </div>
  );
};

export default OfflineAIToolsPanel;
