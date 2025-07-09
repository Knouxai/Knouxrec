import React from "react";

interface BackNavigationProps {
  currentView: string;
  onBack: () => void;
  onNavigate: (
    view:
      | "main"
      | "recordings"
      | "ai"
      | "settings"
      | "files"
      | "templates"
      | "toolbox",
  ) => void;
}

const BackNavigation: React.FC<BackNavigationProps> = ({
  currentView,
  onBack,
  onNavigate,
}) => {
  const getViewTitle = (view: string) => {
    switch (view) {
      case "templates":
        return "📽️ Video Templates";
      case "toolbox":
        return "🛠️ AI Toolbox";
      case "recordings":
        return "🎬 Recording Library";
      case "ai":
        return "🧠 AI Analysis";
      case "files":
        return "📁 File Manager";
      case "settings":
        return "⚙️ Settings";
      default:
        return "🏠 KNOUX REC";
    }
  };

  const navigationItems = [
    { id: "main", icon: "🏠", label: "الرئيسية" },
    { id: "templates", icon: "📽️", label: "القوالب" },
    { id: "toolbox", icon: "🛠️", label: "Toolbox" },
    { id: "recordings", icon: "🎬", label: "Recordings" },
    { id: "ai", icon: "🧠", label: "AI Tools" },
    { id: "files", icon: "📁", label: "Files" },
  ];

  return (
    <div className="glass-card mx-4 mt-4 mb-2 p-4 rounded-2xl">
      <div className="flex items-center justify-between">
        {/* Back Button & Current View */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="glow-button p-3 rounded-xl text-white hover:bg-knoux-purple/30 transition-all duration-300 group"
            title="Go Back"
          >
            <svg
              className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div>
            <h1 className="text-xl font-orbitron font-bold text-white">
              {getViewTitle(currentView)}
            </h1>
            <div className="text-sm text-white/60">
              Navigate through KNOUX REC features
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                currentView === item.id
                  ? "bg-knoux-purple/30 border border-knoux-purple text-knoux-purple"
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-rajdhani font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Quick Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                currentView === item.id
                  ? "bg-knoux-purple/30 border border-knoux-purple text-knoux-purple"
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mt-3 flex items-center space-x-2 text-sm text-white/50">
        <span>KNOUX REC</span>
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-knoux-purple">
          {getViewTitle(currentView).split(" ").slice(1).join(" ")}
        </span>
      </div>
    </div>
  );
};

export default BackNavigation;
