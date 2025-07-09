import React, { useState, useEffect, useCallback } from "react";

interface Shortcut {
  id: string;
  keys: string[];
  action: string;
  description: string;
  category: "general" | "editing" | "navigation" | "tools";
  handler: () => void;
}

interface QuickAction {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  action: () => void;
  color: string;
}

const QuickControls: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string>("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // تهيئة الاختصارات
  useEffect(() => {
    const initShortcuts: Shortcut[] = [
      {
        id: "new-project",
        keys: ["ctrl", "n"],
        action: "مشروع جديد",
        description: "إنشاء مشروع جديد",
        category: "general",
        handler: () => {
          setLastAction("تم إنشاء مشروع جديد");
          // منطق إنشاء مشروع جديد
        },
      },
      {
        id: "save-project",
        keys: ["ctrl", "s"],
        action: "حفظ المشروع",
        description: "حفظ المشروع الحالي",
        category: "general",
        handler: () => {
          setLastAction("تم حفظ المشروع");
          // منطق حفظ المشروع
        },
      },
      {
        id: "undo",
        keys: ["ctrl", "z"],
        action: "تراجع",
        description: "التراجع عن آخر عملية",
        category: "editing",
        handler: () => {
          setLastAction("تم التراجع");
          // منطق التراجع
        },
      },
      {
        id: "redo",
        keys: ["ctrl", "y"],
        action: "إعادة",
        description: "إعادة آخر عملية",
        category: "editing",
        handler: () => {
          setLastAction("تم الإعادة");
          // منطق الإعادة
        },
      },
      {
        id: "play-pause",
        keys: ["space"],
        action: "تشغيل/إيقاف",
        description: "تشغيل أو إيقاف التشغيل",
        category: "editing",
        handler: () => {
          setLastAction("تم تغيير حالة التشغيل");
          // منطق التشغيل/الإيقاف
        },
      },
      {
        id: "export",
        keys: ["ctrl", "e"],
        action: "تصدير",
        description: "تصدير المشروع",
        category: "general",
        handler: () => {
          setLastAction("بدء عملية التصدير");
          // منطق التصدير
        },
      },
      {
        id: "fullscreen",
        keys: ["f11"],
        action: "ملء الشاشة",
        description: "تبديل وضع ملء الشاشة",
        category: "navigation",
        handler: () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
            setLastAction("خروج من ملء الشاشة");
          } else {
            document.documentElement.requestFullscreen();
            setLastAction("دخول لوضع ملء الشاشة");
          }
        },
      },
      {
        id: "command-palette",
        keys: ["ctrl", "shift", "p"],
        action: "لوحة الأوامر",
        description: "فتح لوحة الأوامر السريعة",
        category: "navigation",
        handler: () => {
          setShowCommandPalette(true);
          setLastAction("فتح لوحة الأوامر");
        },
      },
      {
        id: "quick-search",
        keys: ["ctrl", "k"],
        action: "البحث السريع",
        description: "فتح البحث السريع",
        category: "navigation",
        handler: () => {
          setShowCommandPalette(true);
          setLastAction("فتح البحث السريع");
        },
      },
      {
        id: "duplicate",
        keys: ["ctrl", "d"],
        action: "تكرار",
        description: "تكرار العنصر المحدد",
        category: "editing",
        handler: () => {
          setLastAction("تم تكرار العنصر");
          // منطق التكرار
        },
      },
    ];

    setShortcuts(initShortcuts);

    // الإجراءات السري��ة
    setQuickActions([
      {
        id: "record",
        name: "بدء التسجيل",
        icon: "🎥",
        shortcut: "Ctrl+R",
        action: () => setLastAction("بدء تسجيل الشاشة"),
        color: "red-500",
      },
      {
        id: "ai-enhance",
        name: "تحسين ذكي",
        icon: "✨",
        shortcut: "Ctrl+H",
        action: () => setLastAction("تطبيق التحسين الذكي"),
        color: "purple-500",
      },
      {
        id: "batch-process",
        name: "معالجة دفعية",
        icon: "⚡",
        shortcut: "Ctrl+B",
        action: () => setLastAction("بدء المعالجة الدفعية"),
        color: "blue-500",
      },
      {
        id: "share",
        name: "مشاركة سريعة",
        icon: "📤",
        shortcut: "Ctrl+Shift+S",
        action: () => setLastAction("فتح خيارات المشاركة"),
        color: "green-500",
      },
      {
        id: "template",
        name: "قالب سريع",
        icon: "📋",
        shortcut: "Ctrl+T",
        action: () => setLastAction("اختيار قالب سريع"),
        color: "yellow-500",
      },
      {
        id: "ai-chat",
        name: "مساعد ذكي",
        icon: "🤖",
        shortcut: "Ctrl+/",
        action: () => setLastAction("فتح المساعد الذكي"),
        color: "cyan-500",
      },
    ]);
  }, []);

  // معالج الأحداث للوحة المفاتيح
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const newPressedKeys = new Set(pressedKeys);

      if (event.ctrlKey) newPressedKeys.add("ctrl");
      if (event.shiftKey) newPressedKeys.add("shift");
      if (event.altKey) newPressedKeys.add("alt");
      if (key !== "control" && key !== "shift" && key !== "alt") {
        newPressedKeys.add(key);
      }

      setPressedKeys(newPressedKeys);

      // البحث عن اختصار مطابق
      const matchingShortcut = shortcuts.find((shortcut) => {
        if (shortcut.keys.length !== newPressedKeys.size) return false;
        return shortcut.keys.every((k) => newPressedKeys.has(k));
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.handler();
      }
    },
    [shortcuts, pressedKeys],
  );

  const handleKeyUp = useCallback(() => {
    setPressedKeys(new Set());
  }, []);

  // تسجيل مستمعي الأحداث
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // إخفاء آخر إجراء بعد 3 ثواني
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  const formatShortcut = (keys: string[]) => {
    return keys
      .map((key) => {
        switch (key) {
          case "ctrl":
            return "Ctrl";
          case "shift":
            return "Shift";
          case "alt":
            return "Alt";
          case " ":
            return "Space";
          default:
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
      })
      .join(" + ");
  };

  const filteredActions = quickActions.filter(
    (action) =>
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.shortcut.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const CategorySection = ({
    title,
    shortcuts: categoryShortcuts,
  }: {
    title: string;
    shortcuts: Shortcut[];
  }) => (
    <div className="mb-6">
      <h4 className="font-bold text-white mb-3">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categoryShortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors cursor-pointer"
            onClick={shortcut.handler}
          >
            <div>
              <div className="font-medium text-white">{shortcut.action}</div>
              <div className="text-sm text-white/60">
                {shortcut.description}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {shortcut.keys.map((key, idx) => (
                <React.Fragment key={idx}>
                  <kbd className="px-2 py-1 bg-knoux-purple/20 border border-knoux-purple/30 rounded text-xs text-knoux-purple font-mono">
                    {key === "ctrl"
                      ? "Ctrl"
                      : key === "shift"
                        ? "Shift"
                        : key === "alt"
                          ? "Alt"
                          : key === " "
                            ? "Space"
                            : key.charAt(0).toUpperCase() + key.slice(1)}
                  </kbd>
                  {idx < shortcut.keys.length - 1 && (
                    <span className="text-white/30">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent mb-2">
          ⌨️ التحكم السريع
        </h2>
        <p className="text-white/70">
          اختصارات لوحة المفاتيح والإجراءات السريعة لتسريع العمل
        </p>
      </div>

      {/* آخر إجراء */}
      {lastAction && (
        <div className="glass-card p-4 rounded-xl border border-green-400/30 bg-green-400/10">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">✅</div>
            <div>
              <div className="font-medium text-green-400">تم التنفيذ</div>
              <div className="text-white/70">{lastAction}</div>
            </div>
          </div>
        </div>
      )}

      {/* الإجراءات السريعة */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
          🚀 الإجراءات السريعة
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-xl border-2 border-${action.color}/30 bg-${action.color}/10 hover:bg-${action.color}/20 transition-all duration-300 group text-center`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="font-medium text-white mb-1 group-hover:text-white transition-colors">
                {action.name}
              </div>
              <div className="text-xs text-white/50">{action.shortcut}</div>
            </button>
          ))}
        </div>
      </div>

      {/* لوحة الأوامر */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-rajdhani font-bold text-white">
                🎮 لوحة الأوامر السريعة
              </h3>
              <button
                onClick={() => setShowCommandPalette(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="ابحث عن أمر أو اختصار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-knoux-purple/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-knoux-purple focus:border-knoux-purple mb-4"
              autoFocus
            />

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action();
                    setShowCommandPalette(false);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center justify-between p-3 bg-black/20 hover:bg-black/40 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-white">{action.name}</span>
                  </div>
                  <span className="text-xs text-white/50">
                    {action.shortcut}
                  </span>
                </button>
              ))}

              {filteredShortcuts.map((shortcut) => (
                <button
                  key={shortcut.id}
                  onClick={() => {
                    shortcut.handler();
                    setShowCommandPalette(false);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center justify-between p-3 bg-black/20 hover:bg-black/40 rounded-lg transition-colors text-left"
                >
                  <div>
                    <div className="text-white">{shortcut.action}</div>
                    <div className="text-sm text-white/60">
                      {shortcut.description}
                    </div>
                  </div>
                  <span className="text-xs text-white/50">
                    {formatShortcut(shortcut.keys)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* دليل الاختصارات */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-6">
          📖 دليل الاختصارات
        </h3>

        <CategorySection
          title="🏠 عام"
          shortcuts={shortcuts.filter((s) => s.category === "general")}
        />

        <CategorySection
          title="✏️ التحرير"
          shortcuts={shortcuts.filter((s) => s.category === "editing")}
        />

        <CategorySection
          title="🧭 التنقل"
          shortcuts={shortcuts.filter((s) => s.category === "navigation")}
        />

        <CategorySection
          title="🛠️ الأدوات"
          shortcuts={shortcuts.filter((s) => s.category === "tools")}
        />
      </div>

      {/* نصائح سريعة */}
      <div className="glass-card p-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/5">
        <h3 className="text-xl font-rajdhani font-bold text-yellow-400 mb-4">
          💡 نصائح للاستخدام السريع
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="font-medium text-white mb-2">⌨️ اختصارات مخصصة</h4>
            <p className="text-white/70 text-sm">
              يم��نك تخصيص اختصارات لوحة المفاتيح حسب احتياجاتك في الإعدادات
            </p>
          </div>

          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="font-medium text-white mb-2">🎮 لوحة الأوامر</h4>
            <p className="text-white/70 text-sm">
              استخدم Ctrl+Shift+P لفتح لوحة الأوامر السريعة والوصول لأي ميزة
            </p>
          </div>

          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="font-medium text-white mb-2">🔍 البحث السريع</h4>
            <p className="text-white/70 text-sm">
              اضغط Ctrl+K للبحث السريع في جميع الأدوات والقوالب
            </p>
          </div>

          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="font-medium text-white mb-2">⚡ سير العمل</h4>
            <p className="text-white/70 text-sm">
              احفظ اختصارات مخصصة لسير العمل المتكرر لتوفير الوقت
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickControls;
