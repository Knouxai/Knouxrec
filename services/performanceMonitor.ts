// Advanced Performance Monitoring for KNOUX REC
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  recordingQuality: "poor" | "good" | "excellent";
  bandwidth: number;
  droppedFrames: number;
  latency: number;
}

export interface SystemInfo {
  browser: string;
  platform: string;
  memory: number;
  cores: number;
  gpu: string;
  isHardwareAccelerated: boolean;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private startTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private monitoringInterval: number | null = null;
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = [];

  private constructor() {
    this.metrics = {
      fps: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      recordingQuality: "good",
      bandwidth: 0,
      droppedFrames: 0,
      latency: 0,
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = performance.now();
    this.frameCount = 0;

    // Monitor every second
    this.monitoringInterval = window.setInterval(() => {
      this.updateMetrics();
      this.notifyCallbacks();
    }, 1000);

    console.log("🎯 KNOUX Performance: Monitoring started");
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log("🎯 KNOUX Performance: Monitoring stopped");
  }

  addCallback(callback: (metrics: PerformanceMetrics) => void): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (metrics: PerformanceMetrics) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  private updateMetrics(): void {
    // FPS Calculation
    const currentTime = performance.now();
    if (this.lastFrameTime > 0) {
      const deltaTime = currentTime - this.lastFrameTime;
      this.metrics.fps = Math.round(1000 / deltaTime);
    }
    this.lastFrameTime = currentTime;

    // Memory Usage
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(
        (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      );
    }

    // CPU Usage (estimated)
    this.metrics.cpuUsage = this.estimateCPUUsage();

    // Recording Quality Assessment
    this.metrics.recordingQuality = this.assessRecordingQuality();

    // Bandwidth (estimated)
    this.metrics.bandwidth = this.estimateBandwidth();

    // Latency (frame processing time)
    this.metrics.latency = this.measureLatency();
  }

  private estimateCPUUsage(): number {
    // Simple CPU usage estimation based on frame timing
    const frameTime = performance.now() - this.lastFrameTime;
    const targetFrameTime = 1000 / 60; // 60 FPS target

    const cpuUsage = Math.min(100, (frameTime / targetFrameTime) * 50);
    return Math.round(cpuUsage);
  }

  private assessRecordingQuality(): "poor" | "good" | "excellent" {
    const { fps, memoryUsage, droppedFrames } = this.metrics;

    if (fps >= 55 && memoryUsage < 70 && droppedFrames < 5) {
      return "excellent";
    } else if (fps >= 45 && memoryUsage < 85 && droppedFrames < 15) {
      return "good";
    } else {
      return "poor";
    }
  }

  private estimateBandwidth(): number {
    // Estimate bandwidth based on quality settings and resolution
    // This is a simplified calculation
    const baseSize = 1920 * 1080; // 1080p base
    const fps = this.metrics.fps || 60;
    const compressionRatio = 0.1; // Assume 10:1 compression

    const bytesPerSecond = baseSize * fps * 3 * compressionRatio; // RGB
    const mbps = (bytesPerSecond * 8) / (1024 * 1024); // Convert to Mbps

    return Math.round(mbps * 10) / 10; // Round to 1 decimal
  }

  private measureLatency(): number {
    // Measure frame processing latency
    const start = performance.now();

    // Simulate some processing
    requestAnimationFrame(() => {
      const end = performance.now();
      this.metrics.latency = Math.round(end - start);
    });

    return this.metrics.latency;
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback({ ...this.metrics });
      } catch (error) {
        console.error("Performance callback error:", error);
      }
    });
  }

  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Frame counting for FPS calculation
  recordFrame(): void {
    this.frameCount++;
  }

  recordDroppedFrame(): void {
    this.metrics.droppedFrames++;
  }

  resetDroppedFrames(): void {
    this.metrics.droppedFrames = 0;
  }

  // System Information
  static getSystemInfo(): SystemInfo {
    const nav = navigator as any;

    // Browser detection
    let browser = "Unknown";
    if (nav.userAgent.includes("Chrome")) browser = "Chrome";
    else if (nav.userAgent.includes("Firefox")) browser = "Firefox";
    else if (nav.userAgent.includes("Safari")) browser = "Safari";
    else if (nav.userAgent.includes("Edge")) browser = "Edge";

    // Platform detection
    const platform = nav.platform || nav.userAgentData?.platform || "Unknown";

    // Memory
    const memory = nav.deviceMemory || 0;

    // CPU cores
    const cores = nav.hardwareConcurrency || 1;

    // GPU info (if available)
    let gpu = "Unknown";
    let isHardwareAccelerated = false;

    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpu =
            gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ||
            "WebGL Enabled";
          isHardwareAccelerated = true;
        }
      }
    } catch (error) {
      console.warn("Could not detect GPU info:", error);
    }

    return {
      browser,
      platform,
      memory,
      cores,
      gpu,
      isHardwareAccelerated,
    };
  }

  // Performance Optimization Suggestions
  static getOptimizationSuggestions(
    metrics: PerformanceMetrics,
    systemInfo: SystemInfo,
  ): string[] {
    const suggestions: string[] = [];

    if (metrics.fps < 30) {
      suggestions.push("Consider reducing video quality to improve frame rate");
      suggestions.push("Close other applications to free up system resources");
    }

    if (metrics.memoryUsage > 80) {
      suggestions.push(
        "High memory usage detected - restart browser to free up memory",
      );
      suggestions.push(
        "Consider reducing recording duration for better performance",
      );
    }

    if (metrics.cpuUsage > 85) {
      suggestions.push(
        "High CPU usage - consider enabling hardware acceleration",
      );
      suggestions.push("Reduce screen effects and animations during recording");
    }

    if (metrics.droppedFrames > 10) {
      suggestions.push("Too many dropped frames - try lowering the frame rate");
      suggestions.push("Check for background processes consuming resources");
    }

    if (!systemInfo.isHardwareAccelerated) {
      suggestions.push(
        "Enable hardware acceleration in browser settings for better performance",
      );
    }

    if (systemInfo.memory < 4) {
      suggestions.push(
        "Consider upgrading system memory for better recording performance",
      );
    }

    if (suggestions.length === 0) {
      suggestions.push("Performance is optimal! 🚀");
    }

    return suggestions;
  }

  // Performance Report
  generateReport(): {
    summary: string;
    metrics: PerformanceMetrics;
    systemInfo: SystemInfo;
    suggestions: string[];
    grade: "A" | "B" | "C" | "D" | "F";
  } {
    const systemInfo = PerformanceMonitor.getSystemInfo();
    const suggestions = PerformanceMonitor.getOptimizationSuggestions(
      this.metrics,
      systemInfo,
    );

    // Calculate performance grade
    let score = 0;
    if (this.metrics.fps >= 55) score += 25;
    else if (this.metrics.fps >= 45) score += 20;
    else if (this.metrics.fps >= 30) score += 15;
    else score += 5;

    if (this.metrics.memoryUsage < 70) score += 25;
    else if (this.metrics.memoryUsage < 85) score += 20;
    else score += 10;

    if (this.metrics.cpuUsage < 60) score += 25;
    else if (this.metrics.cpuUsage < 80) score += 20;
    else score += 10;

    if (this.metrics.droppedFrames < 5) score += 25;
    else if (this.metrics.droppedFrames < 15) score += 15;
    else score += 5;

    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else grade = "F";

    const summary = `Performance Grade: ${grade} (${score}/100) - ${this.metrics.recordingQuality.toUpperCase()} quality recording`;

    return {
      summary,
      metrics: { ...this.metrics },
      systemInfo,
      suggestions,
      grade,
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
