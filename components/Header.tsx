import React from "react";

interface HeaderProps {
  isRecording: boolean;
  onSettingsClick: () => void;
  onNotificationsClick: () => void;
  notificationCount: number;
  currentView?: string;
  onViewChange?: (
    view: "main" | "recordings" | "ai" | "settings" | "files",
  ) => void;
}

const Header: React.FC<HeaderProps> = ({
  isRecording,
  onSettingsClick,
  onNotificationsClick,
  notificationCount,
  currentView = "main",
  onViewChange,
}) => {
  const quickActions = [
    { id: "recordings", icon: "🎬", label: "Library", color: "knoux-purple" },
    { id: "ai", icon: "🧠", label: "AI Tools", color: "knoux-neon" },
    { id: "files", icon: "📁", label: "Files", color: "green-400" },
  ];

  return (
    <header className="glass-card p-4 m-4 mb-0 rounded-2xl border border-knoux-purple/30">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-500 ${
                isRecording
                  ? "bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-neon-purple animate-pulse"
                  : "bg-gradient-to-br from-knoux-purple via-purple-600 to-knoux-neon shadow-neon-purple hover:shadow-neon-blue"
              }`}
            >
              <span className="font-orbitron text-white drop-shadow-lg">K</span>
            </div>
            {isRecording && (
              <>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"></div>
              </>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
              KNOUX REC
            </h1>
            <p className="text-sm text-white/70 font-rajdhani">
              {isRecording ? (
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span>Recording in progress...</span>
                </span>
              ) : (
                "Luxury AI-Powered Screen Recorder"
              )}
            </p>
          </div>
        </div>

        {/* Quick Actions & Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Navigation (Desktop) */}
          {onViewChange && currentView === "main" && (
            <div className="hidden md:flex items-center space-x-2 mr-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onViewChange(action.id as any)}
                  className={`px-4 py-2 rounded-xl glass hover:bg-${action.color}/20 transition-all duration-300 flex items-center space-x-2 group`}
                  title={action.label}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span
                    className={`font-rajdhani font-medium text-${action.color} group-hover:text-white transition-colors`}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Notifications */}
          <button
            onClick={onNotificationsClick}
            className="relative p-3 rounded-xl glass hover:bg-knoux-neon/20 transition-all duration-300 text-knoux-neon group"
            title="Notifications"
          >
            <svg
              className="w-6 h-6 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-3 3V10a5 5 0 0 0-10 0v10l-3-3h5m3 0a3 3 0 0 1-6 0"
              />
            </svg>
            {notificationCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="p-3 rounded-xl glass hover:bg-knoux-purple/20 transition-all duration-300 text-knoux-purple group"
            title="Settings"
          >
            <svg
              className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      {onViewChange && currentView === "main" && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-center space-x-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onViewChange(action.id as any)}
                className={`px-4 py-3 rounded-xl glass hover:bg-${action.color}/20 transition-all duration-300 flex flex-col items-center space-y-1 group flex-1`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span
                  className={`text-xs font-rajdhani font-medium text-${action.color} group-hover:text-white transition-colors`}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recording Status Bar */}
      {isRecording && (
        <div className="mt-4 pt-4 border-t border-red-500/30">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-rajdhani font-bold">
                LIVE RECORDING
              </span>
            </div>
            <div className="text-white/50">•</div>
            <span className="text-white/70 text-sm font-mono">
              All systems active
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
