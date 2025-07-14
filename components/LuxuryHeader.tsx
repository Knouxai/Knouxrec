import React, { useState, useEffect } from "react";
import { KnouxLogo, SmokeEffect, FloatingParticles } from "./LuxuryIcons";

interface LuxuryHeaderProps {
  isRecording: boolean;
  onSettingsClick: () => void;
  onNotificationsClick: () => void;
  notificationCount: number;
  currentView: string;
  onViewChange: (view: string) => void;
}

const LuxuryHeader: React.FC<LuxuryHeaderProps> = ({
  isRecording,
  onSettingsClick,
  onNotificationsClick,
  notificationCount,
  currentView,
  onViewChange,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const glowTimer = setInterval(() => {
      setIsGlowing((prev) => !prev);
    }, 3000);

    return () => clearInterval(glowTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* الخلفية المتحركة */}
      <div className="luxury-background" />
      <FloatingParticles />

      <header className="relative z-50 glass-card border-b border-white/20 backdrop-blur-xl">
        <SmokeEffect />

        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* القسم الأيسر - اللوجو والعنوان */}
            <div className="flex items-center gap-6">
              <div
                className={`transition-all duration-500 ${isGlowing ? "neon-glow" : ""}`}
              >
                <KnouxLogo size={80} className="interactive-hover" />
              </div>

              <div>
                <h1 className="luxury-title-ar text-4xl font-bold mb-2">
                  KNOUX REC
                </h1>
                <p className="luxury-subtitle-ar text-lg opacity-80">
                  استوديو التسجيل الاحترافي المتقدم
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="sound-wave">
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                  </div>
                  <span className="luxury-text text-sm opacity-60">
                    مدعوم بالذكاء الاصطناعي
                  </span>
                </div>
              </div>
            </div>

            {/* القسم الأوسط - معلومات النظام */}
            <div className="hidden lg:flex flex-col items-center gap-2">
              <div className="luxury-glass-card px-6 py-3 text-center">
                <div className="luxury-text text-xl font-bold neon-glow">
                  {formatTime(currentTime)}
                </div>
                <div className="luxury-text text-sm opacity-70">
                  {formatDate(currentTime)}
                </div>
              </div>

              {/* مؤشر حالة التسجيل */}
              {isRecording && (
                <div className="flex items-center gap-2 luxury-glass-card px-4 py-2 bg-red-500/20 border-red-500/30">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="luxury-text text-red-300 font-semibold text-sm">
                    جار التسجيل
                  </span>
                </div>
              )}
            </div>

            {/* القسم الأيمن - أزرار التحكم */}
            <div className="flex items-center gap-4">
              {/* زر الإشعارات */}
              <button
                onClick={onNotificationsClick}
                className="luxury-button relative"
                title="الإشعارات"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>

                {notificationCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </div>
                )}
              </button>

              {/* زر الإعدادات */}
              <button
                onClick={onSettingsClick}
                className="luxury-button"
                title="الإعدادات"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin-slow"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              {/* مؤشر الأداء */}
              <div className="hidden md:flex flex-col items-center gap-1">
                <div className="luxury-text text-xs opacity-60">CPU</div>
                <div className="luxury-progress w-16">
                  <div
                    className="luxury-progress-bar"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <div className="luxury-text text-xs opacity-60">45%</div>
              </div>

              <div className="hidden md:flex flex-col items-center gap-1">
                <div className="luxury-text text-xs opacity-60">RAM</div>
                <div className="luxury-progress w-16">
                  <div
                    className="luxury-progress-bar"
                    style={{ width: "67%" }}
                  ></div>
                </div>
                <div className="luxury-text text-xs opacity-60">67%</div>
              </div>
            </div>
          </div>

          {/* شريط التنقل السفلي */}
          <div className="mt-6 flex items-center justify-center">
            <nav className="luxury-glass-card rounded-full px-8 py-4">
              <div className="flex items-center gap-8">
                {[
                  {
                    id: "main",
                    icon: "🏠",
                    label: "الرئيسية",
                    labelEn: "Home",
                  },
                  {
                    id: "templates",
                    icon: "📽️",
                    label: "القوالب",
                    labelEn: "Templates",
                  },
                  {
                    id: "toolbox",
                    icon: "🛠️",
                    label: "الأدوات",
                    labelEn: "Toolbox",
                  },
                  {
                    id: "offline-tools",
                    icon: "🧠",
                    label: "أوفلاين",
                    labelEn: "AI Offline",
                  },
                  {
                    id: "visual-patch-lab",
                    icon: "🧩",
                    label: "المختبر",
                    labelEn: "Patch Lab",
                  },
                  {
                    id: "recordings",
                    icon: "🎬",
                    label: "التسجيلات",
                    labelEn: "Recordings",
                  },
                  {
                    id: "files",
                    icon: "📁",
                    label: "الملفات",
                    labelEn: "Files",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`
                      relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-500
                      ${
                        currentView === item.id
                          ? "luxury-glass-card neon-glow scale-110"
                          : "hover:luxury-glass-card hover:scale-105 opacity-70 hover:opacity-100"
                      }
                    `}
                    title={`${item.label} - ${item.labelEn}`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="luxury-text text-xs font-semibold text-center">
                      <div>{item.label}</div>
                      <div className="opacity-60">{item.labelEn}</div>
                    </div>

                    {/* مؤشر التحديد */}
                    {currentView === item.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* خط الانعكاس */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </header>

      <style jsx>{`
        @keyframes animate-spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: animate-spin-slow 4s linear infinite;
        }
      `}</style>
    </>
  );
};

export default LuxuryHeader;
