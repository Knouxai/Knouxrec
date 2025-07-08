import React, { useState, useEffect } from "react";
import {
  PerformanceMetrics,
  SystemInfo,
  performanceMonitor,
} from "../services/performanceMonitor";

const PerformancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    recordingQuality: "good",
    bandwidth: 0,
    droppedFrames: 0,
    latency: 0,
  });

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const sysInfo =
      performanceMonitor.constructor.getSystemInfo() as SystemInfo;
    setSystemInfo(sysInfo);

    const handleMetricsUpdate = (newMetrics: PerformanceMetrics) => {
      setMetrics(newMetrics);
    };

    performanceMonitor.addCallback(handleMetricsUpdate);

    return () => {
      performanceMonitor.removeCallback(handleMetricsUpdate);
    };
  }, []);

  const toggleMonitoring = () => {
    if (isMonitoring) {
      performanceMonitor.stopMonitoring();
    } else {
      performanceMonitor.startMonitoring();
    }
    setIsMonitoring(!isMonitoring);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "good":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "poor":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const getMetricColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return "text-green-400";
    if (value <= thresholds[1]) return "text-yellow-400";
    return "text-red-400";
  };

  const MetricCard = ({
    title,
    value,
    unit,
    icon,
    color,
    subtitle,
  }: {
    title: string;
    value: number | string;
    unit?: string;
    icon: string;
    color: string;
    subtitle?: string;
  }) => (
    <div className="glass-card p-4 rounded-xl border border-knoux-purple/20 hover:border-knoux-purple/40 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${color}`}>
          {value}
          {unit}
        </span>
      </div>
      <div className="text-sm text-white font-medium">{title}</div>
      {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}
    </div>
  );

  if (!systemInfo) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <span className="ml-3 text-white">Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-orbitron font-bold text-white">
              ⚡ Performance Monitor
            </h2>
            <p className="text-white/70">
              Real-time system performance tracking
            </p>
          </div>

          <button
            onClick={toggleMonitoring}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              isMonitoring
                ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                : "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
            }`}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </button>
        </div>

        {/* Recording Quality Badge */}
        <div
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getQualityColor(metrics.recordingQuality)}`}
        >
          <span className="font-bold">
            Recording Quality: {metrics.recordingQuality.toUpperCase()}
          </span>
          {metrics.recordingQuality === "excellent" && <span>🏆</span>}
          {metrics.recordingQuality === "good" && <span>✅</span>}
          {metrics.recordingQuality === "poor" && <span>⚠️</span>}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Frame Rate"
          value={metrics.fps}
          unit=" FPS"
          icon="🎬"
          color={getMetricColor(metrics.fps, [45, 30])}
          subtitle="Target: 60 FPS"
        />

        <MetricCard
          title="Memory Usage"
          value={metrics.memoryUsage}
          unit="%"
          icon="🧠"
          color={getMetricColor(metrics.memoryUsage, [70, 85])}
          subtitle={`${systemInfo.memory} GB Available`}
        />

        <MetricCard
          title="CPU Usage"
          value={metrics.cpuUsage}
          unit="%"
          icon="⚙️"
          color={getMetricColor(metrics.cpuUsage, [60, 80])}
          subtitle={`${systemInfo.cores} Cores`}
        />

        <MetricCard
          title="Bandwidth"
          value={metrics.bandwidth}
          unit=" Mbps"
          icon="📊"
          color={getMetricColor(metrics.bandwidth, [10, 20])}
          subtitle="Estimated Usage"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Dropped Frames"
          value={metrics.droppedFrames}
          icon="⚠️"
          color={getMetricColor(metrics.droppedFrames, [5, 15])}
          subtitle="Lower is better"
        />

        <MetricCard
          title="Latency"
          value={metrics.latency}
          unit=" ms"
          icon="⚡"
          color={getMetricColor(metrics.latency, [20, 50])}
          subtitle="Frame Processing"
        />

        <MetricCard
          title="Hardware Accel."
          value={systemInfo.isHardwareAccelerated ? "ON" : "OFF"}
          icon="🚀"
          color={
            systemInfo.isHardwareAccelerated ? "text-green-400" : "text-red-400"
          }
          subtitle={systemInfo.gpu}
        />
      </div>

      {/* System Information */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all"
        >
          <h3 className="text-lg font-orbitron font-bold text-white">
            💻 System Information
          </h3>
          <svg
            className={`w-5 h-5 text-knoux-purple transition-transform ${showDetails ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showDetails && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-knoux-purple/10 rounded-lg border border-knoux-purple/20">
                <div className="text-sm text-white/70">Browser</div>
                <div className="font-bold text-white">{systemInfo.browser}</div>
              </div>

              <div className="p-3 bg-knoux-purple/10 rounded-lg border border-knoux-purple/20">
                <div className="text-sm text-white/70">Platform</div>
                <div className="font-bold text-white">
                  {systemInfo.platform}
                </div>
              </div>

              <div className="p-3 bg-knoux-purple/10 rounded-lg border border-knoux-purple/20">
                <div className="text-sm text-white/70">CPU Cores</div>
                <div className="font-bold text-white">
                  {systemInfo.cores} cores
                </div>
              </div>

              <div className="p-3 bg-knoux-purple/10 rounded-lg border border-knoux-purple/20">
                <div className="text-sm text-white/70">Memory</div>
                <div className="font-bold text-white">
                  {systemInfo.memory} GB
                </div>
              </div>
            </div>

            <div className="p-3 bg-knoux-neon/10 rounded-lg border border-knoux-neon/20">
              <div className="text-sm text-white/70">Graphics</div>
              <div className="font-bold text-white">{systemInfo.gpu}</div>
              <div
                className={`text-xs ${systemInfo.isHardwareAccelerated ? "text-green-400" : "text-red-400"}`}
              >
                Hardware Acceleration:{" "}
                {systemInfo.isHardwareAccelerated ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <h3 className="text-lg font-orbitron font-bold text-white mb-4">
          💡 Performance Tips
        </h3>

        <div className="space-y-3">
          {metrics.fps < 30 && (
            <div className="p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-white">
                  Low frame rate detected. Consider reducing video quality.
                </span>
              </div>
            </div>
          )}

          {metrics.memoryUsage > 80 && (
            <div className="p-3 bg-red-400/10 rounded-lg border border-red-400/20">
              <div className="flex items-center space-x-2">
                <span className="text-red-400">🚨</span>
                <span className="text-white">
                  High memory usage. Close unnecessary browser tabs.
                </span>
              </div>
            </div>
          )}

          {!systemInfo.isHardwareAccelerated && (
            <div className="p-3 bg-knoux-neon/10 rounded-lg border border-knoux-neon/20">
              <div className="flex items-center space-x-2">
                <span className="text-knoux-neon">🚀</span>
                <span className="text-white">
                  Enable hardware acceleration for better performance.
                </span>
              </div>
            </div>
          )}

          {metrics.recordingQuality === "excellent" && (
            <div className="p-3 bg-green-400/10 rounded-lg border border-green-400/20">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">🏆</span>
                <span className="text-white">
                  Excellent performance! Your recordings will be top quality.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Performance Chart */}
      {isMonitoring && (
        <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
          <h3 className="text-lg font-orbitron font-bold text-white mb-4">
            📈 Live Performance
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-knoux-purple/10 rounded-lg">
              <div className="text-3xl font-bold text-knoux-purple">
                {metrics.fps}
              </div>
              <div className="text-sm text-white/70">FPS</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-knoux-purple h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (metrics.fps / 60) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-knoux-neon/10 rounded-lg">
              <div className="text-3xl font-bold text-knoux-neon">
                {metrics.memoryUsage}%
              </div>
              <div className="text-sm text-white/70">Memory</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-knoux-neon h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-green-400/10 rounded-lg">
              <div className="text-3xl font-bold text-green-400">
                {metrics.cpuUsage}%
              </div>
              <div className="text-sm text-white/70">CPU</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePanel;
