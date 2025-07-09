import React, { useEffect, useRef } from "react";
import { Notification } from "../types";

interface NotificationsDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onDismiss: (id: string) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  notifications,
  onClose,
  onDismiss,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return {
          icon: "✅",
          color: "text-green-400",
          bg: "bg-green-400/20",
          border: "border-green-400/30",
        };
      case "error":
        return {
          icon: "❌",
          color: "text-red-400",
          bg: "bg-red-400/20",
          border: "border-red-400/30",
        };
      case "warning":
        return {
          icon: "⚠️",
          color: "text-yellow-400",
          bg: "bg-yellow-400/20",
          border: "border-yellow-400/30",
        };
      case "info":
      default:
        return {
          icon: "ℹ️",
          color: "text-knoux-neon",
          bg: "bg-knoux-neon/20",
          border: "border-knoux-neon/30",
        };
    }
  };

  const handleClearAll = () => {
    notifications.forEach((notification) => onDismiss(notification.id));
  };

  return (
    <div className="absolute top-full right-0 mt-2 z-50">
      <div
        ref={dropdownRef}
        className="glass-card w-96 max-w-[90vw] rounded-2xl border border-knoux-purple/30 shadow-glass-xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔔</span>
              <h3 className="font-orbitron font-bold text-white">
                Notifications
              </h3>
              {notifications.length > 0 && (
                <span className="px-2 py-1 bg-knoux-purple/30 border border-knoux-purple rounded-lg text-knoux-purple text-xs font-medium">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs hover:bg-red-500/30 transition-all"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-all text-white/70 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🔕</div>
              <h4 className="font-rajdhani font-bold text-white mb-1">
                All Clear!
              </h4>
              <p className="text-white/70 text-sm">
                No notifications at the moment
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification, index) => {
                const { icon, color, bg, border } = getNotificationIcon(
                  notification.type,
                );

                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-xl border ${bg} ${border} hover:bg-opacity-80 transition-all duration-300 group relative overflow-hidden`}
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Animated Border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 text-lg ${color}`}>
                        {icon}
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <p className="text-white text-sm leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Timestamp */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-white/50 text-xs">
                            Just now
                          </span>

                          {/* Type Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${color} ${bg} ${border}`}
                          >
                            {notification.type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={() => onDismiss(notification.id)}
                        className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all text-white/70 hover:text-white"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Progress Bar for Auto-dismiss */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
                      <div
                        className={`h-full ${bg} opacity-50`}
                        style={{
                          animation: "progressBar 5s linear forwards",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </span>
              <span>Auto-clear in 5s</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsDropdown;
