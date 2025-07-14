import React, { useState, useEffect } from "react";

interface NavigationItem {
  id: string;
  icon: string;
  iconActive?: string;
  label: string;
  labelAr: string;
  description?: string;
  descriptionAr?: string;
  badge?: number;
  isNew?: boolean;
  isLocked?: boolean;
  category?: string;
}

interface EnhancedNavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  compactMode?: boolean;
  language?: "ar" | "en";
  notifications?: number;
}

const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  currentView,
  onNavigate,
  onBack,
  showBackButton = false,
  compactMode = false,
  language = "ar",
  notifications = 0,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const navigationItems: NavigationItem[] = [
    {
      id: "main",
      icon: "🏠",
      iconActive: "🏡",
      label: "Home",
      labelAr: "الرئيسية",
      description: "Main dashboard",
      descriptionAr: "اللوحة الرئيسية",
      category: "main",
    },
    {
      id: "templates",
      icon: "📽️",
      iconActive: "🎬",
      label: "Templates",
      labelAr: "القوالب",
      description: "Video templates",
      descriptionAr: "قوالب الفيديو",
      badge: 5,
      category: "content",
    },
    {
      id: "toolbox",
      icon: "🛠️",
      iconActive: "⚒️",
      label: "Toolbox",
      labelAr: "صندوق الأدوات",
      description: "Editing tools",
      descriptionAr: "أدوات التحرير",
      badge: 8,
      category: "tools",
    },
    {
      id: "offline-tools",
      icon: "🧠",
      iconActive: "🤖",
      label: "AI Offline",
      labelAr: "أدوات أوفلاين",
      description: "38 AI tools",
      descriptionAr: "38 أداة ذكية",
      badge: 38,
      isNew: true,
      category: "ai",
    },
    {
      id: "visual-patch-lab",
      icon: "🧩",
      iconActive: "✨",
      label: "Visual Patch",
      labelAr: "المختبر البصري",
      description: "50 editing tools",
      descriptionAr: "50 أداة تحرير",
      badge: 50,
      isNew: true,
      category: "visual",
    },
    {
      id: "ai-body-editor",
      icon: "🔞",
      iconActive: "💫",
      label: "Body Editor",
      labelAr: "محرر الجسم",
      description: "18+ AI editor",
      descriptionAr: "محرر ذكي 18+",
      badge: 7,
      isLocked: true,
      category: "adult",
    },
    {
      id: "recordings",
      icon: "🎬",
      iconActive: "📹",
      label: "Recordings",
      labelAr: "التسجيلات",
      description: "Your recordings",
      descriptionAr: "تسجيلاتك",
      category: "media",
    },
    {
      id: "ai",
      icon: "🧠",
      iconActive: "🚀",
      label: "AI Analysis",
      labelAr: "التحليل الذكي",
      description: "Smart analysis",
      descriptionAr: "التحليل الذكي",
      category: "ai",
    },
    {
      id: "files",
      icon: "📁",
      iconActive: "📂",
      label: "Files",
      labelAr: "الملفات",
      description: "File manager",
      descriptionAr: "مدير الملفات",
      category: "storage",
    },
  ];

  const categoryColors = {
    main: "#4ecdc4",
    content: "#ff6b9d",
    tools: "#45b7d1",
    ai: "#96ceb4",
    visual: "#ff9ff3",
    adult: "#ff6b6b",
    media: "#54a0ff",
    storage: "#feca57",
  };

  const t = (en: string, ar: string) => (language === "ar" ? ar : en);

  useEffect(() => {
    if (currentView) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const getItemColor = (item: NavigationItem) => {
    return (
      categoryColors[item.category as keyof typeof categoryColors] || "#4ecdc4"
    );
  };

  const handleItemClick = (itemId: string, item: NavigationItem) => {
    if (item.isLocked) {
      // Show unlock prompt for locked items
      if (
        confirm(
          t(
            "This feature requires verification. Continue?",
            "هذه الميزة تتطلب تحقق. هل تريد المتابعة؟",
          ),
        )
      ) {
        onNavigate(itemId);
      }
      return;
    }

    onNavigate(itemId);
  };

  const handleItemHover = (itemId: string | null) => {
    setHoveredItem(itemId);
    if (itemId && !compactMode) {
      setShowTooltip(itemId);
    } else {
      setShowTooltip(null);
    }
  };

  return (
    <div
      className={`enhanced-navigation ${compactMode ? "compact" : ""} ${isAnimating ? "animating" : ""}`}
    >
      {/* Back Button */}
      {showBackButton && onBack && (
        <div className="back-section">
          <button
            onClick={onBack}
            className="back-button"
            title={t("Go Back", "العودة")}
          >
            <span className="back-icon">{language === "ar" ? "→" : "←"}</span>
            <span className="back-text">{t("Back", "رجوع")}</span>
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="navigation-container">
        <div className="navigation-grid">
          {navigationItems.map((item) => {
            const isActive = currentView === item.id;
            const isHovered = hoveredItem === item.id;
            const itemColor = getItemColor(item);

            return (
              <div key={item.id} className="nav-item-wrapper">
                <button
                  className={`nav-item ${isActive ? "active" : ""} ${item.isNew ? "new" : ""} ${item.isLocked ? "locked" : ""}`}
                  onClick={() => handleItemClick(item.id, item)}
                  onMouseEnter={() => handleItemHover(item.id)}
                  onMouseLeave={() => handleItemHover(null)}
                  style={
                    {
                      "--item-color": itemColor,
                      "--item-glow": `${itemColor}40`,
                    } as React.CSSProperties
                  }
                >
                  {/* Icon */}
                  <div className="nav-icon-container">
                    <span className="nav-icon">
                      {isActive && item.iconActive
                        ? item.iconActive
                        : item.icon}
                    </span>

                    {/* Badge */}
                    {item.badge && (
                      <div className="nav-badge">
                        {item.badge > 99 ? "99+" : item.badge}
                      </div>
                    )}

                    {/* New Indicator */}
                    {item.isNew && <div className="new-indicator">✨</div>}

                    {/* Lock Indicator */}
                    {item.isLocked && <div className="lock-indicator">🔒</div>}
                  </div>

                  {/* Labels */}
                  {!compactMode && (
                    <div className="nav-labels">
                      <span className="nav-label">
                        {language === "ar" ? item.labelAr : item.label}
                      </span>
                      <span className="nav-description">
                        {language === "ar"
                          ? item.descriptionAr
                          : item.description}
                      </span>
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActive && <div className="active-indicator" />}

                  {/* Hover Effect */}
                  {isHovered && <div className="hover-effect" />}

                  {/* Ripple Effect */}
                  <div className="ripple-effect" />
                </button>

                {/* Tooltip for Compact Mode */}
                {compactMode && showTooltip === item.id && (
                  <div className="nav-tooltip">
                    <div className="tooltip-content">
                      <h4>{language === "ar" ? item.labelAr : item.label}</h4>
                      <p>
                        {language === "ar"
                          ? item.descriptionAr
                          : item.description}
                      </p>
                      {item.badge && (
                        <span className="tooltip-badge">
                          {item.badge} {t("items", "عنصر")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="quick-action"
            title={t("Settings", "الإعدادات")}
            onClick={() => onNavigate("settings")}
          >
            <span className="quick-icon">⚙️</span>
          </button>

          <button
            className="quick-action notification-btn"
            title={t("Notifications", "الإشعارات")}
            onClick={() => onNavigate("notifications")}
          >
            <span className="quick-icon">🔔</span>
            {notifications > 0 && (
              <div className="notification-count">
                {notifications > 99 ? "99+" : notifications}
              </div>
            )}
          </button>

          <button
            className="quick-action"
            title={t("Help", "المساعدة")}
            onClick={() => onNavigate("help")}
          >
            <span className="quick-icon">❓</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        .enhanced-navigation {
          background: linear-gradient(
            145deg,
            rgba(26, 26, 46, 0.95),
            rgba(22, 33, 62, 0.95)
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 20px;
          margin: 20px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .enhanced-navigation.compact {
          padding: 15px;
          margin: 15px;
        }

        .enhanced-navigation.animating {
          transform: scale(1.02);
          box-shadow: 0 20px 50px rgba(78, 205, 196, 0.2);
        }

        .back-section {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .back-icon {
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .back-button:hover .back-icon {
          transform: translateX(-3px);
        }

        .back-text {
          font-size: 14px;
        }

        .navigation-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .navigation-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(${compactMode ? "80px" : "150px"}, 1fr)
          );
          gap: 15px;
        }

        .nav-item-wrapper {
          position: relative;
        }

        .nav-item {
          position: relative;
          display: flex;
          flex-direction: ${compactMode ? "column" : "row"};
          align-items: center;
          gap: ${compactMode ? "8px" : "12px"};
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: rgba(255, 255, 255, 0.8);
          padding: ${compactMode ? "15px 10px" : "15px 20px"};
          cursor: pointer;
          transition: all 0.4s ease;
          overflow: hidden;
          text-align: ${compactMode ? "center" : "left"};
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--item-color);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px var(--item-glow);
        }

        .nav-item.active {
          background: var(--item-glow);
          border-color: var(--item-color);
          color: var(--item-color);
          box-shadow: 0 15px 40px var(--item-glow);
          transform: translateY(-2px);
        }

        .nav-item.new::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid #ff6b9d;
          border-bottom: 15px solid transparent;
          border-top: 15px solid #ff6b9d;
        }

        .nav-item.locked {
          opacity: 0.7;
        }

        .nav-item.locked:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .nav-icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-icon {
          font-size: ${compactMode ? "24px" : "28px"};
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 12px currentColor);
        }

        .nav-item.active .nav-icon {
          transform: scale(1.15);
          filter: drop-shadow(0 0 15px currentColor);
        }

        .nav-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(145deg, #ff6b9d, #c44569);
          color: white;
          border-radius: 12px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(255, 107, 157, 0.4);
          animation: badgePulse 2s infinite;
        }

        .new-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 12px;
          animation: sparkle 1.5s infinite;
        }

        .lock-indicator {
          position: absolute;
          bottom: -5px;
          right: -5px;
          font-size: 12px;
          opacity: 0.8;
        }

        .nav-labels {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-label {
          font-weight: 600;
          font-size: ${compactMode ? "12px" : "14px"};
          transition: color 0.3s ease;
        }

        .nav-description {
          font-size: ${compactMode ? "10px" : "12px"};
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .nav-item:hover .nav-description {
          opacity: 1;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 40%;
          background: linear-gradient(
            to bottom,
            var(--item-color),
            transparent
          );
          border-radius: 0 4px 4px 0;
          animation: activeGlow 2s infinite;
        }

        .hover-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            45deg,
            transparent,
            var(--item-glow),
            transparent
          );
          border-radius: 16px;
          animation: shimmer 1.5s infinite;
        }

        .ripple-effect {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          pointer-events: none;
        }

        .nav-item:active .ripple-effect {
          background: radial-gradient(
            circle,
            var(--item-glow) 0%,
            transparent 70%
          );
          animation: ripple 0.6s ease-out;
        }

        .nav-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 10px;
          z-index: 1000;
          animation: tooltipFadeIn 0.3s ease;
        }

        .tooltip-content {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .tooltip-content h4 {
          margin: 0 0 4px 0;
          font-weight: 600;
          color: var(--item-color);
        }

        .tooltip-content p {
          margin: 0 0 4px 0;
          opacity: 0.8;
        }

        .tooltip-badge {
          display: inline-block;
          background: var(--item-color);
          color: black;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .quick-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quick-action {
          position: relative;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-action:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
        }

        .quick-icon {
          font-size: 18px;
        }

        .notification-count {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ff6b6b;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: notificationPulse 2s infinite;
        }

        @keyframes badgePulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
        }

        @keyframes activeGlow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes notificationPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .enhanced-navigation {
            margin: 10px;
            padding: 15px;
          }

          .navigation-grid {
            grid-template-columns: repeat(
              auto-fit,
              minmax(${compactMode ? "60px" : "120px"}, 1fr)
            );
            gap: 10px;
          }

          .nav-item {
            padding: ${compactMode ? "12px 8px" : "12px 15px"};
          }

          .nav-icon {
            font-size: ${compactMode ? "20px" : "24px"};
          }

          .nav-label {
            font-size: ${compactMode ? "10px" : "12px"};
          }

          .nav-description {
            font-size: ${compactMode ? "8px" : "10px"};
          }

          .back-button {
            padding: 10px 15px;
          }

          .quick-actions {
            gap: 8px;
          }

          .quick-action {
            padding: 10px;
          }

          .quick-icon {
            font-size: 16px;
          }
        }

        /* Dark mode adjustments */
        .enhanced-navigation.dark {
          background: linear-gradient(
            145deg,
            rgba(15, 15, 25, 0.95),
            rgba(12, 18, 35, 0.95)
          );
        }

        /* RTL Support */
        .enhanced-navigation[dir="rtl"] .active-indicator {
          left: auto;
          right: 0;
          border-radius: 4px 0 0 4px;
        }

        .enhanced-navigation[dir="rtl"] .back-button:hover {
          transform: translateX(5px);
        }

        .enhanced-navigation[dir="rtl"] .back-button:hover .back-icon {
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
};

export default EnhancedNavigation;
