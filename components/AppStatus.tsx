import { useState, useEffect } from "react";

interface SystemStatus {
  browserSupport: boolean;
  webRTCSupport: boolean;
  screenCaptureSupport: boolean;
  audioContextSupport: boolean;
  webGLSupport: boolean;
  workerSupport: boolean;
  offlineSupport: boolean;
  storageQuota: number;
  performanceScore: number;
}

interface AppInfo {
  version: string;
  buildDate: string;
  environment: string;
  aiModelsLoaded: number;
  totalFeatures: number;
  activeFeatures: number;
}

const AppStatus = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    browserSupport: false,
    webRTCSupport: false,
    screenCaptureSupport: false,
    audioContextSupport: false,
    webGLSupport: false,
    workerSupport: false,
    offlineSupport: false,
    storageQuota: 0,
    performanceScore: 0,
  });

  const [appInfo, setAppInfo] = useState<AppInfo>({
    version: "1.0.0",
    buildDate: new Date().toISOString().split("T")[0],
    environment: import.meta.env.MODE || "development",
    aiModelsLoaded: 0,
    totalFeatures: 35,
    activeFeatures: 0,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    checkSystemCapabilities();
    loadAppInfo();
  }, []);

  const checkSystemCapabilities = async () => {
    const status: SystemStatus = {
      browserSupport: !!window.navigator && !!window.document,
      webRTCSupport: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),
      screenCaptureSupport: !!(
        navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
      ),
      audioContextSupport: !!(
        window.AudioContext || (window as any).webkitAudioContext
      ),
      webGLSupport: !!document.createElement("canvas").getContext("webgl"),
      workerSupport: !!window.Worker,
      offlineSupport: !!window.navigator.serviceWorker,
      storageQuota: 0,
      performanceScore: 0,
    };

    // Check storage quota
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        status.storageQuota = Math.round(
          (estimate.quota || 0) / (1024 * 1024 * 1024),
        ); // GB
      } catch (error) {
        console.warn("Could not estimate storage:", error);
      }
    }

    // Calculate performance score
    const supportedFeatures = Object.values(status).filter(Boolean).length;
    status.performanceScore = Math.round((supportedFeatures / 7) * 100);

    setSystemStatus(status);
  };

  const loadAppInfo = () => {
    // Simulate loading AI models and features
    setTimeout(() => {
      setAppInfo((prev) => ({
        ...prev,
        aiModelsLoaded: 24,
        activeFeatures: 32,
      }));
    }, 1000);
  };

  const getStatusColor = (supported: boolean) => {
    return supported ? "text-green-400" : "text-red-400";
  };

  const getStatusIcon = (supported: boolean) => {
    return supported ? "✅" : "❌";
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-green-400" };
    if (score >= 80) return { grade: "A", color: "text-green-400" };
    if (score >= 70) return { grade: "B", color: "text-yellow-400" };
    if (score >= 60) return { grade: "C", color: "text-orange-400" };
    return { grade: "D", color: "text-red-400" };
  };

  const performanceGrade = getPerformanceGrade(systemStatus.performanceScore);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`glass-card transition-all duration-300 ${isExpanded ? "w-80" : "w-16"}`}
      >
        <div
          className="p-4 cursor-pointer flex items-center justify-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {!isExpanded ? (
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${systemStatus.performanceScore > 80 ? "bg-green-400" : systemStatus.performanceScore > 60 ? "bg-yellow-400" : "bg-red-400"} animate-pulse`}
              ></div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-knoux-purple">
                  System Status
                </h3>
                <button className="text-white/50 hover:text-white">✕</button>
              </div>

              {/* App Information */}
              <div className="space-y-3 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-knoux-neon">
                    KNOUX REC
                  </div>
                  <div className="text-sm text-white/70">
                    v{appInfo.version} ({appInfo.environment})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {appInfo.aiModelsLoaded}
                    </div>
                    <div className="text-white/70">AI Models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {appInfo.activeFeatures}
                    </div>
                    <div className="text-white/70">Features</div>
                  </div>
                </div>
              </div>

              {/* Performance Score */}
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold ${performanceGrade.color}`}>
                  {performanceGrade.grade}
                </div>
                <div className="text-sm text-white/70">Performance Grade</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${systemStatus.performanceScore}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {systemStatus.performanceScore}% Compatibility
                </div>
              </div>

              {/* System Capabilities */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Screen Recording</span>
                  <span
                    className={getStatusColor(
                      systemStatus.screenCaptureSupport,
                    )}
                  >
                    {getStatusIcon(systemStatus.screenCaptureSupport)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audio Processing</span>
                  <span
                    className={getStatusColor(systemStatus.audioContextSupport)}
                  >
                    {getStatusIcon(systemStatus.audioContextSupport)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>WebGL Support</span>
                  <span className={getStatusColor(systemStatus.webGLSupport)}>
                    {getStatusIcon(systemStatus.webGLSupport)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Web Workers</span>
                  <span className={getStatusColor(systemStatus.workerSupport)}>
                    {getStatusIcon(systemStatus.workerSupport)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Storage Quota</span>
                  <span className="text-white/70">
                    {systemStatus.storageQuota}GB
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button className="px-2 py-1 bg-knoux-purple/20 rounded text-knoux-purple hover:bg-knoux-purple/30 transition-colors">
                    Optimize
                  </button>
                  <button className="px-2 py-1 bg-knoux-neon/20 rounded text-knoux-neon hover:bg-knoux-neon/30 transition-colors">
                    Refresh
                  </button>
                </div>
              </div>

              {/* Build Info */}
              <div className="mt-3 pt-2 border-t border-white/20 text-xs text-white/50 text-center">
                Built: {appInfo.buildDate}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppStatus;
