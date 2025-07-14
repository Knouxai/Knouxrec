// أنواع خاصة بأدوات الذكاء الاصطناعي الأوفلاين

export interface OfflineAIModel {
  id: string;
  name: string;
  type: "tensorflow" | "onnx" | "python" | "wasm";
  size: number; // MB
  path: string;
  loaded: boolean;
  version: string;
  capabilities: string[];
  metadata: {
    framework: string;
    inputShape?: number[];
    outputShape?: number[];
    accuracy?: number;
    speed?: "fast" | "medium" | "slow";
  };
}

export interface ProcessingTask {
  id: string;
  toolId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  stage: string;
  startTime: number;
  endTime?: number;
  inputData: ProcessingInput;
  result?: ProcessingResult;
  error?: string;
}

export interface ProcessingInput {
  type: "file" | "text" | "url";
  data: File | string | ArrayBuffer;
  metadata?: Record<string, any>;
  settings?: ToolSettings;
}

export interface ProcessingResult {
  success: boolean;
  outputType: "file" | "text" | "json" | "image" | "video" | "audio";
  data: Blob | string | ArrayBuffer | any;
  metadata: {
    processingTime: number;
    modelUsed: string;
    confidence?: number;
    additionalInfo?: Record<string, any>;
  };
  preview?: {
    thumbnail?: string;
    summary?: string;
    keyPoints?: string[];
  };
}

export interface ToolSettings {
  quality: "fast" | "balanced" | "high";
  outputFormat: string;
  customParams?: Record<string, any>;
  gpu?: boolean;
  batchSize?: number;
  maxDuration?: number;
}

export interface ToolCapability {
  id: string;
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  requires: string[]; // required models/dependencies
  optional: string[]; // optional enhancements
}

export interface OfflineToolCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  color: string;
  tools: string[]; // tool IDs
}

export interface ToolUsageStats {
  toolId: string;
  totalRuns: number;
  successRate: number;
  averageProcessingTime: number;
  lastUsed: Date;
  favoriteSettings: ToolSettings;
  userRating?: number;
  feedback?: string[];
}

export interface BatchProcessingJob {
  id: string;
  name: string;
  toolId: string;
  inputs: ProcessingInput[];
  settings: ToolSettings;
  status: "queued" | "processing" | "completed" | "failed";
  progress: {
    completed: number;
    total: number;
    currentItem?: string;
  };
  results: ProcessingResult[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ToolPreset {
  id: string;
  name: string;
  toolId: string;
  settings: ToolSettings;
  description: string;
  tags: string[];
  isDefault: boolean;
  createdBy: "system" | "user";
  popularity: number;
}

export interface ModelLoadingProgress {
  modelId: string;
  stage: "downloading" | "parsing" | "loading" | "ready" | "error";
  progress: number;
  bytesLoaded: number;
  totalBytes: number;
  speed: number; // bytes per second
  eta: number; // estimated time remaining in seconds
  error?: string;
}

export interface OfflineToolConfig {
  maxConcurrentTasks: number;
  maxMemoryUsage: number; // MB
  autoUnloadModels: boolean;
  preferredBackend: "cpu" | "gpu" | "auto";
  cacheSize: number; // MB
  logLevel: "debug" | "info" | "warn" | "error";
  enableTelemetry: boolean;
}

export interface ToolBenchmark {
  toolId: string;
  device: string;
  metrics: {
    processingTime: number;
    memoryUsage: number;
    cpuUsage: number;
    accuracy?: number;
    throughput: number; // items per second
  };
  testCase: string;
  date: Date;
}

export interface ToolDependency {
  type: "model" | "library" | "binary";
  name: string;
  version: string;
  source: string;
  size: number;
  optional: boolean;
  description: string;
}

// Union types for better type safety
export type ToolCategory = "image" | "video" | "audio" | "text" | "analysis";
export type ToolDifficulty = "easy" | "medium" | "hard";
export type ProcessingStage =
  | "initializing"
  | "preprocessing"
  | "processing"
  | "postprocessing"
  | "finalizing";
export type ResultFormat =
  | "png"
  | "jpg"
  | "mp4"
  | "wav"
  | "json"
  | "txt"
  | "pdf";

// Helper interfaces for specific tool types
export interface ImageToolResult extends ProcessingResult {
  data: Blob; // Image blob
  metadata: ProcessingResult["metadata"] & {
    dimensions: { width: number; height: number };
    format: string;
    colorSpace?: string;
    compression?: number;
  };
}

export interface VideoToolResult extends ProcessingResult {
  data: Blob; // Video blob
  metadata: ProcessingResult["metadata"] & {
    duration: number;
    fps: number;
    resolution: { width: number; height: number };
    codec: string;
    bitrate?: number;
  };
}

export interface AudioToolResult extends ProcessingResult {
  data: Blob; // Audio blob
  metadata: ProcessingResult["metadata"] & {
    duration: number;
    sampleRate: number;
    channels: number;
    format: string;
    bitrate?: number;
  };
}

export interface TextToolResult extends ProcessingResult {
  data: string; // Text content
  metadata: ProcessingResult["metadata"] & {
    language?: string;
    wordCount?: number;
    sentiment?: "positive" | "negative" | "neutral";
    entities?: Array<{
      text: string;
      type: string;
      confidence: number;
    }>;
  };
}

export interface AnalysisToolResult extends ProcessingResult {
  data: any; // Analysis data (JSON)
  metadata: ProcessingResult["metadata"] & {
    analysisType: string;
    dataPoints: number;
    insights: string[];
    recommendations?: string[];
  };
}

// Event types for tool execution
export interface ToolEvent {
  type:
    | "started"
    | "progress"
    | "stage-changed"
    | "completed"
    | "failed"
    | "cancelled";
  toolId: string;
  taskId: string;
  timestamp: number;
  data?: any;
}

export interface ToolEventHandler {
  (event: ToolEvent): void;
}

// Configuration for tool execution environment
export interface ExecutionEnvironment {
  maxWorkers: number;
  timeoutMs: number;
  retryAttempts: number;
  sandbox: boolean;
  resourceLimits: {
    memory: number;
    cpu: number;
    disk: number;
  };
}
