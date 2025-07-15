import React, { useState, useEffect } from "react";
import { Theme, RecordingSettings, Hotkeys } from "../types";
import ToggleSwitch from "./ToggleSwitch";
import HotkeyCaptureInput from "./HotkeyCaptureInput";

interface Language {
  code: string;
  name: string;
  nameNative: string;
  flag: string;
}

interface EnhancedSettings extends RecordingSettings {
  language: string;
  autoSave: boolean;
  notifications: boolean;
  soundEffects: boolean;
  compactMode: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  backgroundOpacity: number;
  gridSnapEnabled: boolean;
  smartPreview: boolean;
}

interface SettingsCategory {
  id: string;
  icon: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
}

interface EnhancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  settings: RecordingSettings;
  onSave: (settings: RecordingSettings) => void;
}

const EnhancedSettingsModal: React.FC<EnhancedSettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  settings,
  onSave,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("ar");

  const [enhancedSettings, setEnhancedSettings] = useState<EnhancedSettings>({
    ...settings,
    language: "ar",
    autoSave: true,
    notifications: true,
    soundEffects: true,
    compactMode: false,
    animationSpeed: "normal",
    backgroundOpacity: 80,
    gridSnapEnabled: false,
    smartPreview: true,
  });

  const languages: Language[] = [
    { code: "ar", name: "Arabic", nameNative: "العربية", flag: "🇸🇦" },
    { code: "en", name: "English", nameNative: "English", flag: "🇺🇸" },
    { code: "fr", name: "French", nameNative: "Français", flag: "🇫🇷" },
    { code: "es", name: "Spanish", nameNative: "Español", flag: "🇪🇸" },
    { code: "de", name: "German", nameNative: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "Chinese", nameNative: "中文", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", nameNative: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "Korean", nameNative: "한국어", flag: "🇰🇷" },
  ];

  const categories: SettingsCategory[] = [
    {
      id: "general",
      icon: "⚙️",
      title: "General",
      titleAr: "عام",
      description: "Basic application settings",
      descriptionAr: "إعدادات التطبيق الأساسية",
    },
    {
      id: "appearance",
      icon: "🎨",
      title: "Appearance",
      titleAr: "المظهر",
      description: "Theme and visual preferences",
      descriptionAr: "السمة والتفضيلات البصرية",
    },
    {
      id: "recording",
      icon: "🎬",
      title: "Recording",
      titleAr: "التسجيل",
      description: "Recording quality and behavior",
      descriptionAr: "جودة التسجيل والسلوك",
    },
    {
      id: "ai",
      icon: "��",
      title: "AI & Processing",
      titleAr: "الذكاء الاصطناعي",
      description: "AI features and processing",
      descriptionAr: "ميزات الذكاء الاصطناعي والمعالجة",
    },
    {
      id: "hotkeys",
      icon: "⌨️",
      title: "Hotkeys",
      titleAr: "المفاتيح",
      description: "Keyboard shortcuts",
      descriptionAr: "اختصارات لوحة المفاتيح",
    },
    {
      id: "advanced",
      icon: "🔧",
      title: "Advanced",
      titleAr: "متقدم",
      description: "Advanced configuration",
      descriptionAr: "التكوين المتقدم",
    },
    {
      id: "about",
      icon: "ℹ️",
      title: "About",
      titleAr: "حول",
      description: "Application information",
      descriptionAr: "معلومات التطبيق",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleToggle = (key: keyof EnhancedSettings) => {
    setEnhancedSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (
    key: keyof EnhancedSettings,
    value: string | number,
  ) => {
    setEnhancedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleHotkeyChange = (hotkeyName: keyof Hotkeys, value: string) => {
    setEnhancedSettings((prev) => ({
      ...prev,
      hotkeys: {
        ...prev.hotkeys,
        [hotkeyName]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(enhancedSettings);
    onClose();
  };

  const handleReset = () => {
    if (
      confirm(
        currentLanguage === "ar"
          ? "هل تريد إعادة تعيين جميع الإعدادات؟"
          : "Reset all settings to default?",
      )
    ) {
      setEnhancedSettings({
        ...settings,
        language: "ar",
        autoSave: true,
        notifications: true,
        soundEffects: true,
        compactMode: false,
        animationSpeed: "normal",
        backgroundOpacity: 80,
        gridSnapEnabled: false,
        smartPreview: true,
      });
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      searchQuery === "" ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.titleAr.includes(searchQuery),
  );

  const t = (en: string, ar: string) => (currentLanguage === "ar" ? ar : en);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className={`settings-modal ${isAnimating ? "opening" : ""}`}>
        {/* Header */}
        <div className="settings-header">
          <div className="header-left">
            <h1 className="settings-title">⚙️ {t("Settings", "الإعدادات")}</h1>
            <p className="settings-subtitle">
              {t("Customize your experience", "خصص تجربتك")}
            </p>
          </div>

          <div className="header-actions">
            <div className="language-switcher">
              <select
                value={currentLanguage}
                onChange={(e) => {
                  setCurrentLanguage(e.target.value);
                  handleInputChange("language", e.target.value);
                }}
                className="language-select"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nameNative}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="close-button"
              title={t("Close", "إغلاق")}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t("Search settings...", "البحث في الإعدادات...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="settings-body">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`nav-item ${activeCategory === category.id ? "active" : ""}`}
                >
                  <span className="nav-icon">{category.icon}</span>
                  <div className="nav-content">
                    <span className="nav-title">
                      {currentLanguage === "ar"
                        ? category.titleAr
                        : category.title}
                    </span>
                    <span className="nav-description">
                      {currentLanguage === "ar"
                        ? category.descriptionAr
                        : category.description}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="settings-content">
            {activeCategory === "general" && (
              <div className="settings-section">
                <h2 className="section-title">
                  ⚙️ {t("General Settings", "الإعدادات العامة")}
                </h2>

                <div className="setting-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Auto Save", "الحفظ التلقائي")}</h3>
                      <p>
                        {t(
                          "Automatically save your work",
                          "احفظ عملك تلقائياً",
                        )}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={enhancedSettings.autoSave}
                      onChange={() => handleToggle("autoSave")}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Notifications", "الإشعارات")}</h3>
                      <p>
                        {t(
                          "Show desktop notifications",
                          "عرض إشعارات سطح المكتب",
                        )}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={enhancedSettings.notifications}
                      onChange={() => handleToggle("notifications")}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Sound Effects", "المؤثرات الصوتية")}</h3>
                      <p>
                        {t(
                          "Play UI sound effects",
                          "تشغيل مؤثرات صوتية للواجهة",
                        )}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={enhancedSettings.soundEffects}
                      onChange={() => handleToggle("soundEffects")}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Smart Preview", "المعاينة الذكية")}</h3>
                      <p>
                        {t("Enhanced preview features", "ميزات معاينة محسنة")}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={enhancedSettings.smartPreview}
                      onChange={() => handleToggle("smartPreview")}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "appearance" && (
              <div className="settings-section">
                <h2 className="section-title">
                  🎨 {t("Appearance", "المظهر")}
                </h2>

                <div className="setting-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Theme", "السمة")}</h3>
                      <p>
                        {t(
                          "Choose your preferred theme",
                          "اختر السمة المفضلة لديك",
                        )}
                      </p>
                    </div>
                    <div className="theme-options">
                      <button
                        onClick={() => setTheme("light")}
                        className={`theme-option ${theme === "light" ? "active" : ""}`}
                      >
                        <span className="theme-icon">☀️</span>
                        <span>{t("Light", "فاتح")}</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`theme-option ${theme === "dark" ? "active" : ""}`}
                      >
                        <span className="theme-icon">🌙</span>
                        <span>{t("Dark", "داكن")}</span>
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Compact Mode", "الوضع المضغوط")}</h3>
                      <p>{t("Use compact interface", "استخدم واجهة مضغوطة")}</p>
                    </div>
                    <ToggleSwitch
                      enabled={enhancedSettings.compactMode}
                      onChange={() => handleToggle("compactMode")}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Animation Speed", "سرعة الحركة")}</h3>
                      <p>
                        {t("Control animation timing", "تحكم في توقيت الحركات")}
                      </p>
                    </div>
                    <select
                      value={enhancedSettings.animationSpeed}
                      onChange={(e) =>
                        handleInputChange("animationSpeed", e.target.value)
                      }
                      className="select-input"
                    >
                      <option value="slow">{t("Slow", "بطيء")}</option>
                      <option value="normal">{t("Normal", "عادي")}</option>
                      <option value="fast">{t("Fast", "سريع")}</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Background Opacity", "شفافية الخلفية")}</h3>
                      <p>
                        {t(
                          "Adjust background transparency",
                          "اضبط شفافية الخلفية",
                        )}
                      </p>
                    </div>
                    <div className="slider-container">
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={enhancedSettings.backgroundOpacity}
                        onChange={(e) =>
                          handleInputChange(
                            "backgroundOpacity",
                            Number(e.target.value),
                          )
                        }
                        className="slider"
                      />
                      <span className="slider-value">
                        {enhancedSettings.backgroundOpacity}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "recording" && (
              <div className="settings-section">
                <h2 className="section-title">
                  🎬 {t("Recording Settings", "إعدادات التسجيل")}
                </h2>

                <div className="setting-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Video Quality", "جودة الفيديو")}</h3>
                      <p>
                        {t("Select recording quality", "اختر جودة التسجيل")}
                      </p>
                    </div>
                    <select
                      value={enhancedSettings.videoQuality}
                      onChange={(e) =>
                        handleInputChange("videoQuality", e.target.value)
                      }
                      className="select-input"
                    >
                      <option value="720p">HD (720p)</option>
                      <option value="1080p">Full HD (1080p)</option>
                      <option value="1440p">2K (1440p)</option>
                      <option value="2160p">4K (2160p)</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Frame Rate", "معدل الإطارات")}</h3>
                      <p>{t("Frames per second", "إطارات في الثانية")}</p>
                    </div>
                    <select
                      value={enhancedSettings.fps}
                      onChange={(e) =>
                        handleInputChange("fps", Number(e.target.value))
                      }
                      className="select-input"
                    >
                      <option value={24}>24 FPS</option>
                      <option value={30}>30 FPS</option>
                      <option value={60}>60 FPS</option>
                      <option value={120}>120 FPS</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Grid Snap", "الالتصاق بالشبكة")}</h3>
                      <p>
                        {t("Snap elements to grid", "التصاق العناصر بالشبكة")}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={enhancedSettings.gridSnapEnabled}
                      onChange={() => handleToggle("gridSnapEnabled")}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("File Name Pattern", "نمط اسم الملف")}</h3>
                      <p>{t("Custom file naming", "تسمية مخصصة للملفات")}</p>
                    </div>
                    <input
                      type="text"
                      value={enhancedSettings.fileNamePattern}
                      onChange={(e) =>
                        handleInputChange("fileNamePattern", e.target.value)
                      }
                      className="text-input"
                      placeholder="KNOUX-REC-[DATE]_[TIME]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "ai" && (
              <div className="settings-section">
                <h2 className="section-title">
                  🧠 {t("AI & Processing", "الذكاء الاصطناعي والمعالجة")}
                </h2>

                <div className="setting-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("AI Processing", "معالجة الذكاء الاصطناعي")}</h3>
                      <p>
                        {t(
                          "Enable AI post-processing",
                          "تفعيل المعالجة بالذكاء الاصطناعي",
                        )}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={enhancedSettings.aiProcessingEnabled}
                      onChange={() => handleToggle("aiProcessingEnabled")}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Live Filter", "المرشح المباشر")}</h3>
                      <p>
                        {t(
                          "Apply filters during recording",
                          "تطبيق المرشحات أثناء التسجيل",
                        )}
                      </p>
                    </div>
                    <select
                      value={enhancedSettings.liveFilter}
                      onChange={(e) =>
                        handleInputChange("liveFilter", e.target.value)
                      }
                      className="select-input"
                    >
                      <option value="none">{t("None", "بدون")}</option>
                      <option value="neon-glow">
                        {t("Neon Glow", "توهج نيون")}
                      </option>
                      <option value="grayscale">
                        {t("Grayscale", "رمادي")}
                      </option>
                      <option value="sepia">{t("Sepia", "بني داكن")}</option>
                      <option value="invert">{t("Invert", "عكس")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "hotkeys" && (
              <div className="settings-section">
                <h2 className="section-title">
                  ⌨️ {t("Keyboard Shortcuts", "اختصارات لوحة المفاتيح")}
                </h2>

                <div className="setting-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Start/Stop Recording", "بدء/إيقاف التسجيل")}</h3>
                      <p>{t("Toggle recording", "تبديل التسجيل")}</p>
                    </div>
                    <HotkeyCaptureInput
                      value={enhancedSettings.hotkeys.startStop}
                      onChange={(v) => handleHotkeyChange("startStop", v)}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Pause/Resume", "إيقاف مؤقت/استئناف")}</h3>
                      <p>
                        {t(
                          "Pause or resume recording",
                          "إيقاف مؤقت أو استئناف التسجيل",
                        )}
                      </p>
                    </div>
                    <HotkeyCaptureInput
                      value={enhancedSettings.hotkeys.pauseResume}
                      onChange={(v) => handleHotkeyChange("pauseResume", v)}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Screenshot", "لقطة شاشة")}</h3>
                      <p>{t("Take a screenshot", "التقاط لقطة شاشة")}</p>
                    </div>
                    <HotkeyCaptureInput
                      value={enhancedSettings.hotkeys.screenshot}
                      onChange={(v) => handleHotkeyChange("screenshot", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "advanced" && (
              <div className="settings-section">
                <h2 className="section-title">
                  🔧 {t("Advanced Settings", "الإعداد��ت المتقدمة")}
                </h2>

                <div className="setting-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Debug Mode", "وضع التصحيح")}</h3>
                      <p>
                        {t("Enable debug information", "تفعيل معلومات التصحيح")}
                      </p>
                    </div>
                    <ToggleSwitch enabled={false} onChange={() => {}} />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Hardware Acceleration", "تسريع الأجهزة")}</h3>
                      <p>
                        {t(
                          "Use GPU acceleration",
                          "استخدام تسريع كرت الرسومات",
                        )}
                      </p>
                    </div>
                    <ToggleSwitch enabled={true} onChange={() => {}} />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Clear Cache", "مسح التخزين المؤقت")}</h3>
                      <p>
                        {t(
                          "Clear application cache",
                          "مسح تخزين التطبيق المؤقت",
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            t(
                              "Clear all cached data?",
                              "مسح جميع البيانات المؤقتة؟",
                            ),
                          )
                        ) {
                          localStorage.clear();
                          alert(t("Cache cleared!", "تم مسح التخزين المؤقت!"));
                        }
                      }}
                      className="action-button danger"
                    >
                      {t("Clear Cache", "مسح التخزين")}
                    </button>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t("Reset Settings", "إعادة تعيين الإعدادات")}</h3>
                      <p>
                        {t(
                          "Reset all settings to default",
                          "إعادة تعيين جميع الإعدادات للافتراضي",
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="action-button danger"
                    >
                      {t("Reset All", "إعادة تعيين الكل")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "about" && (
              <div className="settings-section">
                <h2 className="section-title">
                  ℹ️ {t("About KNOUX REC", "حول KNOUX REC")}
                </h2>

                <div className="about-content">
                  <div className="app-info">
                    <div className="app-logo">🎬</div>
                    <h3>KNOUX REC Professional</h3>
                    <p className="version">
                      {t("Version", "الإصدار")} 3.0.0 Beta
                    </p>
                    <p className="description">
                      {t(
                        "Professional recording studio with AI-powered features",
                        "استوديو تسجيل احترافي مع ميزات مدعومة بالذكاء الاصطناعي",
                      )}
                    </p>
                  </div>

                  <div className="features-list">
                    <h4>{t("Features", "الميزات")}</h4>
                    <ul>
                      <li>✅ {t("HD/4K Recording", "تسجيل HD/4K")}</li>
                      <li>
                        ✅ {t("AI Processing", "معالجة بالذكاء الاصطناعي")}
                      </li>
                      <li>✅ {t("50+ Visual Tools", "50+ أداة بصرية")}</li>
                      <li>✅ {t("Real-time Effects", "تأثيرات فورية")}</li>
                      <li>
                        ✅ {t("Multi-language Support", "دعم متعدد اللغات")}
                      </li>
                    </ul>
                  </div>

                  <div className="links-section">
                    <h4>{t("Links", "الروابط")}</h4>
                    <div className="links-grid">
                      <button className="link-button">
                        🌐 {t("Website", "الموقع الإلكتروني")}
                      </button>
                      <button className="link-button">
                        📘 {t("Documentation", "التوثيق")}
                      </button>
                      <button className="link-button">
                        🐛 {t("Report Bug", "إبلاغ عن خطأ")}
                      </button>
                      <button className="link-button">
                        💬 {t("Support", "الدعم")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <div className="footer-actions">
            <button onClick={handleReset} className="secondary-button">
              🔄 {t("Reset", "إعادة تعيين")}
            </button>

            <div className="primary-actions">
              <button onClick={onClose} className="secondary-button">
                {t("Cancel", "إلغاء")}
              </button>
              <button onClick={handleSave} className="primary-button">
                💾 {t("Save Changes", "حفظ التغييرات")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-modal {
          background: linear-gradient(
            145deg,
            rgba(26, 26, 46, 0.95),
            rgba(22, 33, 62, 0.95)
          );
          border: 2px solid rgba(78, 205, 196, 0.3);
          border-radius: 24px;
          width: 90vw;
          max-width: 1200px;
          height: 85vh;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalSlideIn 0.5s ease-out;
        }

        .settings-modal.opening {
          animation:
            modalSlideIn 0.5s ease-out,
            modalGlow 0.5s ease-out;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .header-left h1 {
          color: #4ecdc4;
          font-size: 28px;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
        }

        .settings-subtitle {
          color: rgba(255, 255, 255, 0.7);
          margin: 5px 0 0 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .language-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
        }

        .close-button {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: #ff6b6b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 107, 107, 0.3);
          transform: scale(1.1);
        }

        .search-container {
          padding: 20px 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          z-index: 1;
          opacity: 0.6;
        }

        .search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          padding: 12px 40px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #4ecdc4;
          box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
        }

        .clear-search {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 4px;
        }

        .settings-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .settings-sidebar {
          width: 280px;
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          overflow-y: auto;
        }

        .settings-nav {
          padding: 20px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 15px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 8px;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateX(5px);
        }

        .nav-item.active {
          background: rgba(78, 205, 196, 0.2);
          color: #4ecdc4;
          border: 1px solid rgba(78, 205, 196, 0.4);
          box-shadow: 0 5px 15px rgba(78, 205, 196, 0.2);
        }

        .nav-icon {
          font-size: 20px;
          width: 24px;
          text-align: center;
        }

        .nav-content {
          flex: 1;
        }

        .nav-title {
          display: block;
          font-weight: 600;
          font-size: 14px;
        }

        .nav-description {
          display: block;
          font-size: 12px;
          opacity: 0.7;
          margin-top: 2px;
        }

        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 30px;
        }

        .settings-section {
          max-width: 700px;
        }

        .section-title {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .setting-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(78, 205, 196, 0.3);
        }

        .setting-info {
          flex: 1;
          margin-right: 20px;
        }

        .setting-info h3 {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 5px 0;
        }

        .setting-info p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 0;
        }

        .theme-options {
          display: flex;
          gap: 10px;
        }

        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-option:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .theme-option.active {
          background: rgba(78, 205, 196, 0.2);
          border-color: #4ecdc4;
          color: #4ecdc4;
        }

        .theme-icon {
          font-size: 20px;
        }

        .select-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          padding: 10px 15px;
          font-size: 14px;
          cursor: pointer;
          min-width: 150px;
        }

        .text-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          padding: 10px 15px;
          font-size: 14px;
          min-width: 200px;
        }

        .text-input:focus {
          outline: none;
          border-color: #4ecdc4;
          box-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .slider {
          width: 150px;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #4ecdc4;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
        }

        .slider-value {
          color: #4ecdc4;
          font-weight: 600;
          min-width: 50px;
        }

        .action-button {
          background: linear-gradient(145deg, #ff6b6b, #ee5a52);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
        }

        .about-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .app-info {
          text-align: center;
          padding: 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .app-logo {
          font-size: 60px;
          margin-bottom: 15px;
        }

        .app-info h3 {
          color: white;
          font-size: 24px;
          margin: 0 0 10px 0;
        }

        .version {
          color: #4ecdc4;
          font-weight: 600;
          margin: 0 0 15px 0;
        }

        .description {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .features-list,
        .links-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
        }

        .features-list h4,
        .links-section h4 {
          color: white;
          margin: 0 0 15px 0;
        }

        .features-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-list li {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          padding: 5px 0;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .link-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .link-button:hover {
          background: rgba(78, 205, 196, 0.2);
          border-color: #4ecdc4;
          color: #4ecdc4;
        }

        .settings-footer {
          padding: 20px 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .primary-actions {
          display: flex;
          gap: 15px;
        }

        .primary-button {
          background: linear-gradient(145deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 12px;
          color: white;
          padding: 12px 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 14px;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
        }

        .secondary-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          padding: 12px 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 14px;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalGlow {
          0%,
          100% {
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          }
          50% {
            box-shadow: 0 25px 80px rgba(78, 205, 196, 0.4);
          }
        }

        /* Scrollbar Styling */
        .settings-sidebar::-webkit-scrollbar,
        .settings-content::-webkit-scrollbar {
          width: 8px;
        }

        .settings-sidebar::-webkit-scrollbar-track,
        .settings-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .settings-sidebar::-webkit-scrollbar-thumb,
        .settings-content::-webkit-scrollbar-thumb {
          background: rgba(78, 205, 196, 0.3);
          border-radius: 4px;
        }

        .settings-sidebar::-webkit-scrollbar-thumb:hover,
        .settings-content::-webkit-scrollbar-thumb:hover {
          background: rgba(78, 205, 196, 0.5);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .settings-modal {
            width: 95vw;
            height: 95vh;
          }

          .settings-body {
            flex-direction: column;
          }

          .settings-sidebar {
            width: 100%;
            height: 200px;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .settings-nav {
            display: flex;
            overflow-x: auto;
            padding: 15px;
            gap: 10px;
          }

          .nav-item {
            min-width: 120px;
            flex-shrink: 0;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .setting-info {
            margin-right: 0;
          }

          .links-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedSettingsModal;
