import React, { useState, useEffect } from "react";
import QuickControls from "./QuickControls";

interface Workspace {
  id: string;
  name: string;
  description: string;
  projects: number;
  lastUsed: string;
  color: string;
  tools: string[];
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  executions: number;
}

interface WorkflowStep {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  condition?: string;
}

const AdvancedFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "workspaces" | "automation" | "shortcuts" | "customization"
  >("workspaces");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});

  // تحميل البيانات الأولية
  useEffect(() => {
    // مساحات العمل
    setWorkspaces([
      {
        id: "ws1",
        name: "المشاريع التعليمية",
        description: "مساحة عمل مخصصة للمحتوى التعليمي والشروحات",
        projects: 12,
        lastUsed: "منذ ساعتين",
        color: "blue-500",
        tools: ["ai-video-generator", "speech-to-text", "subtitle-maker"],
      },
      {
        id: "ws2",
        name: "المحتوى التسويقي",
        description: "إنشاء إعلانات ومحتوى تسويقي احترافي",
        projects: 8,
        lastUsed: "أمس",
        color: "green-500",
        tools: ["text-to-video", "ai-copywriting", "photo-enhancer"],
      },
      {
        id: "ws3",
        name: "الإنتاج السينمائي",
        description: "مشاريع سينمائية وإنتاج متقدم",
        projects: 5,
        lastUsed: "منذ 3 أيام",
        color: "purple-500",
        tools: ["ai-animation", "face-swap", "ai-effects"],
      },
    ]);

    // سير العمل التلقائي
    setWorkflows([
      {
        id: "wf1",
        name: "معالجة الفيديو السريعة",
        description: "تحسين تلقائي للفيديوهات مع إضافة ترجمات",
        enabled: true,
        executions: 45,
        steps: [
          {
            id: "s1",
            tool: "video-stabilization",
            parameters: { strength: "medium" },
          },
          {
            id: "s2",
            tool: "speech-to-text",
            parameters: { language: "arabic" },
          },
          { id: "s3", tool: "subtitle-maker", parameters: { style: "modern" } },
        ],
      },
      {
        id: "wf2",
        name: "إنتاج المحتوى التسويقي",
        description: "من النص إلى فيديو تسويقي كامل",
        enabled: true,
        executions: 23,
        steps: [
          {
            id: "s1",
            tool: "ai-copywriting",
            parameters: { tone: "professional" },
          },
          {
            id: "s2",
            tool: "text-to-image",
            parameters: { style: "commercial" },
          },
          { id: "s3", tool: "image-to-video", parameters: { duration: 30 } },
        ],
      },
    ]);

    // اختصارات لوحة المفاتيح
    setShortcuts({
      "Ctrl+N": "مشروع جديد",
      "Ctrl+S": "حفظ المشروع",
      "Ctrl+Z": "تراجع",
      "Ctrl+Y": "إعادة",
      Space: "تشغيل/إيقاف",
      "Ctrl+E": "تصدير",
      "Ctrl+I": "استيراد",
      F11: "ملء الشاشة",
      "Ctrl+D": "تكرار",
      Delete: "حذف المحدد",
    });
  }, []);

  const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => (
    <div className="glass-card p-6 rounded-xl border border-knoux-purple/20 hover:border-knoux-purple/60 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-grow">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-4 h-4 bg-${workspace.color} rounded-full`}></div>
            <h3 className="font-rajdhani font-bold text-white text-lg group-hover:text-knoux-purple transition-colors">
              {workspace.name}
            </h3>
          </div>
          <p className="text-white/70 text-sm mb-3 line-clamp-2">
            {workspace.description}
          </p>

          {/* إحصائيات */}
          <div className="flex items-center space-x-4 text-xs text-white/50 mb-3">
            <span>📁 {workspace.projects} مشروع</span>
            <span>🕒 {workspace.lastUsed}</span>
          </div>

          {/* الأدوات المفضلة */}
          <div className="flex flex-wrap gap-1">
            {workspace.tools.slice(0, 3).map((tool, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-knoux-purple/10 border border-knoux-purple/20 rounded text-xs text-knoux-purple"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* إجراءات */}
        <div className="flex flex-col space-y-2">
          <button className="px-3 py-1 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-lg text-sm transition-all">
            فتح
          </button>
          <button className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 hover:text-white rounded-lg text-sm transition-all">
            تعديل
          </button>
        </div>
      </div>
    </div>
  );

  const WorkflowCard = ({ workflow }: { workflow: AutomationWorkflow }) => (
    <div className="glass-card p-6 rounded-xl border border-knoux-purple/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-grow">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${workflow.enabled ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
            ></div>
            <h3 className="font-rajdhani font-bold text-white text-lg">
              {workflow.name}
            </h3>
          </div>
          <p className="text-white/70 text-sm mb-3">{workflow.description}</p>

          {/* خطوات العمل */}
          <div className="mb-3">
            <div className="text-sm text-white/50 mb-2">خطوات العمل:</div>
            <div className="flex items-center space-x-2">
              {workflow.steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="px-2 py-1 bg-knoux-neon/20 rounded text-xs text-knoux-neon">
                    {step.tool}
                  </div>
                  {idx < workflow.steps.length - 1 && (
                    <span className="text-white/30">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/50">
            🔄 {workflow.executions} تنفيذ
          </div>
        </div>

        {/* مفتاح التفعيل */}
        <div className="flex flex-col items-end space-y-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={workflow.enabled}
              onChange={() => {
                setWorkflows((prev) =>
                  prev.map((w) =>
                    w.id === workflow.id ? { ...w, enabled: !w.enabled } : w,
                  ),
                );
              }}
              className="sr-only"
            />
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${workflow.enabled ? "bg-knoux-purple" : "bg-gray-600"}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${workflow.enabled ? "translate-x-4" : ""}`}
              ></div>
            </div>
          </label>
          <button className="px-3 py-1 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-lg text-sm transition-all">
            تشغيل
          </button>
        </div>
      </div>
    </div>
  );

  const ShortcutRow = ({
    shortcut,
    action,
  }: {
    shortcut: string;
    action: string;
  }) => (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
      <span className="text-white/70">{action}</span>
      <div className="flex items-center space-x-1">
        {shortcut.split("+").map((key, idx) => (
          <React.Fragment key={idx}>
            <kbd className="px-2 py-1 bg-knoux-purple/20 border border-knoux-purple/30 rounded text-xs text-knoux-purple font-mono">
              {key}
            </kbd>
            {idx < shortcut.split("+").length - 1 && (
              <span className="text-white/30">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const tabs = [
    {
      id: "workspaces",
      name: "مساحات العمل",
      icon: "🏢",
      count: workspaces.length,
    },
    { id: "automation", name: "الأتمتة", icon: "🤖", count: workflows.length },
    {
      id: "shortcuts",
      name: "الاختصارات",
      icon: "⌨️",
      count: Object.keys(shortcuts).length,
    },
    { id: "customization", name: "التخصيص", icon: "🎨", count: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent mb-2">
          ⚡ المميزات المتقدمة
        </h2>
        <p className="text-white/70">
          أدوات احترافية لتحسين الإنتاجية والتخصيص المتقدم
        </p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-4 rounded-2xl border border-knoux-purple/20">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "bg-knoux-purple/30 border border-knoux-purple text-knoux-purple"
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
              <span className="text-xs opacity-75 bg-white/10 px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        {activeTab === "workspaces" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-rajdhani font-bold text-white">
                🏢 مساحات العمل
              </h3>
              <button className="px-4 py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-xl font-medium transition-all">
                + إنشاء مساحة عمل جديدة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "automation" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-rajdhani font-bold text-white">
                🤖 سير العمل التلقائي
              </h3>
              <button className="px-4 py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-xl font-medium transition-all">
                + إنشاء سير عمل جديد
              </button>
            </div>

            <div className="space-y-4">
              {workflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 p-4 bg-knoux-purple/10 rounded-xl border border-knoux-purple/20">
              <h4 className="font-bold text-white mb-3">🚀 إجراءات سريعة</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-left transition-all">
                  <div className="text-lg mb-1">🎬</div>
                  <div className="font-medium text-white text-sm">
                    معالجة دفعية للفيديوهات
                  </div>
                </button>
                <button className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-left transition-all">
                  <div className="text-lg mb-1">📊</div>
                  <div className="font-medium text-white text-sm">
                    تقرير الأداء اليومي
                  </div>
                </button>
                <button className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-left transition-all">
                  <div className="text-lg mb-1">🔄</div>
                  <div className="font-medium text-white text-sm">
                    مزامنة المشاريع
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "shortcuts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-rajdhani font-bold text-white">
                ⌨️ اختصارات لوحة المفاتيح
              </h3>
              <button className="px-4 py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-xl font-medium transition-all">
                تخصيص الاختصارات
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(shortcuts).map(([shortcut, action]) => (
                <ShortcutRow
                  key={shortcut}
                  shortcut={shortcut}
                  action={action}
                />
              ))}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/30">
              <h4 className="font-bold text-yellow-400 mb-2">
                💡 نصائح الاستخدام
              </h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• استخدم Ctrl+Space لفتح البحث السريع</li>
                <li>• اضغط Tab للتنقل بين العناصر</li>
                <li>• استخدم الأسهم للتنقل في القوائم</li>
                <li>• اضغط Esc للإلغاء أو الخروج</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "customization" && (
          <div>
            <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
              🎨 التخصيص المتقدم
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* الثيمات */}
              <div className="p-6 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <span>🌈</span>
                  <span>الثيمات والألوان</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">الثيم الحالي</span>
                    <select className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-1 text-white text-sm">
                      <option>Purple Neon</option>
                      <option>Blue Crystal</option>
                      <option>Green Matrix</option>
                      <option>Red Cyber</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">شفافية الخلفية</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">كثافة التأثيرات</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="90"
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {/* الواجهة */}
              <div className="p-6 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <span>🖼️</span>
                  <span>تخطيط الواجهة</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">حجم الأيقونات</span>
                    <select className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-1 text-white text-sm">
                      <option>صغير</option>
                      <option>متوسط</option>
                      <option>كبير</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">كثافة المحتوى</span>
                    <select className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-1 text-white text-sm">
                      <option>مريح</option>
                      <option>متوسط</option>
                      <option>مكثف</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">الرسوم المتحركة</span>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only"
                      />
                      <div className="relative w-8 h-4 bg-gray-600 rounded-full">
                        <div className="absolute top-0 left-0 w-4 h-4 bg-knoux-purple rounded-full transition-transform translate-x-4"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* الأداء */}
              <div className="p-6 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <span>⚡</span>
                  <span>تحسين الأداء</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">جودة الرسوم</span>
                    <select className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-1 text-white text-sm">
                      <option>عالية</option>
                      <option>متوسطة</option>
                      <option>منخفضة</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">تسريع الأجهزة</span>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only"
                      />
                      <div className="relative w-8 h-4 bg-gray-600 rounded-full">
                        <div className="absolute top-0 left-0 w-4 h-4 bg-knoux-purple rounded-full transition-transform translate-x-4"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* التصدير */}
              <div className="p-6 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <span>📤</span>
                  <span>إعدادات التصدير</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">
                      جودة الفيديو الافتراضية
                    </span>
                    <select className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-1 text-white text-sm">
                      <option>4K</option>
                      <option>1080p</option>
                      <option>720p</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">تنسيق الصوت</span>
                    <select className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-1 text-white text-sm">
                      <option>MP3</option>
                      <option>WAV</option>
                      <option>AAC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* حفظ الإعدادات */}
            <div className="mt-6 flex items-center justify-between">
              <button className="px-6 py-2 bg-knoux-purple hover:bg-knoux-purple/80 text-white rounded-xl font-medium transition-all">
                حفظ التغييرات
              </button>
              <button className="px-6 py-2 bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 hover:text-white rounded-xl font-medium transition-all">
                استعادة الافتراضي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFeatures;
