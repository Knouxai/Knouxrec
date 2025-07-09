import React, { useState } from "react";
import { Recording } from "../types";
import { processAdvancedTranscript } from "../services/offlineAI";
import PerformancePanel from "./PerformancePanel";
import AIModelsManager from "./AIModelsManager";
import SystemStats from "./SystemStats";
import AdvancedFeatures from "./AdvancedFeatures";
import BatchProcessor from "./BatchProcessor";
import AnalyticsDashboard from "./AnalyticsDashboard";

interface AIPanelProps {
  recordings: Recording[];
  onUpdateRecording: (recording: Recording) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ recordings, onUpdateRecording }) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<
    | "transcript"
    | "ocr"
    | "face"
    | "audio"
    | "models"
    | "stats"
    | "advanced"
    | "batch"
    | "analytics"
  >("transcript");

  const aiTools = [
    {
      id: "transcript",
      name: "Speech Analysis",
      icon: "🎤",
      description: "Extract and analyze speech from recordings",
      color: "knoux-purple",
      status: "active",
    },
    {
      id: "performance",
      name: "Performance Monitor",
      icon: "⚡",
      description: "Real-time system performance tracking",
      color: "knoux-neon",
      status: "active",
    },
    {
      id: "models",
      name: "إدارة النماذج",
      icon: "🧠",
      description: "إدارة وتحسين نماذج الذكاء الاصطناعي المحلية",
      color: "purple-400",
      status: "active",
    },
    {
      id: "stats",
      name: "إحصائيات النظام",
      icon: "📊",
      description: "نظرة شاملة على أداء وحالة النظام",
      color: "indigo-400",
      status: "active",
    },
    {
      id: "advanced",
      name: "المميزات المتقدمة",
      icon: "⚡",
      description: "أدوات احترافية للإنتاجية والتخصيص",
      color: "orange-400",
      status: "active",
    },
    {
      id: "batch",
      name: "المعالجة الدفعية",
      icon: "🔄",
      description: "معالجة مجموعات كبيرة من الملفات",
      color: "cyan-400",
      status: "active",
    },
    {
      id: "analytics",
      name: "التحليلات الذكية",
      icon: "📈",
      description: "رؤى عميقة وتحليلات متقدمة",
      color: "pink-400",
      status: "active",
    },
    {
      id: "ocr",
      name: "Text Recognition",
      icon: "📝",
      description: "Extract text from screen recordings (OCR)",
      color: "yellow-400",
      status: "coming-soon",
    },
    {
      id: "face",
      name: "Face Detection",
      icon: "👥",
      description: "Detect faces and expressions (MediaPipe)",
      color: "green-400",
      status: "coming-soon",
    },
    {
      id: "audio",
      name: "Audio Analysis",
      icon: "🎵",
      description: "Analyze audio patterns and quality",
      color: "red-400",
      status: "coming-soon",
    },
    {
      id: "object",
      name: "Object Detection",
      icon: "🎯",
      description: "Identify objects in screen recordings",
      color: "purple-400",
      status: "coming-soon",
    },
  ];

  const handleProcessRecording = async (recording: Recording) => {
    if (!recording.transcript || processing) return;

    setProcessing(recording.id);
    try {
      const result = await processTranscript(recording.transcript);
      const updatedRecording = {
        ...recording,
        name: result.title,
        summary: result.summary,
        keywords: result.keywords,
        isProcessing: false,
      };
      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error("AI processing failed:", error);
    } finally {
      setProcessing(null);
    }
  };

  const renderToolContent = () => {
    switch (selectedTool) {
      case "performance":
        return <PerformancePanel />;

      case "transcript":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-orbitron font-bold text-knoux-purple mb-4">
              Speech Analysis Results
            </h3>
            {recordings.length === 0 ? (
              <div className="glass-card p-8 rounded-xl text-center">
                <div className="text-6xl mb-4">🎤</div>
                <p className="text-white/70">
                  No recordings available for analysis
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recordings.map((recording) => (
                  <div key={recording.id} className="glass-card p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-rajdhani font-bold text-white">
                        {recording.name}
                      </h4>
                      <button
                        onClick={() => handleProcessRecording(recording)}
                        disabled={
                          !recording.transcript || processing === recording.id
                        }
                        className="glow-button px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                      >
                        {processing === recording.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="loading-dots">
                              <div></div>
                              <div></div>
                              <div></div>
                              <div></div>
                            </div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          "Analyze"
                        )}
                      </button>
                    </div>

                    {recording.summary && (
                      <div className="mt-3 p-3 bg-knoux-purple/20 rounded-lg">
                        <p className="text-sm text-white/90">
                          {recording.summary}
                        </p>
                        {recording.keywords &&
                          recording.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {recording.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-knoux-neon/30 rounded-lg text-xs text-white"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    )}

                    {recording.transcript && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-knoux-neon hover:text-white transition-colors">
                          View Transcript
                        </summary>
                        <div className="mt-2 p-3 bg-black/30 rounded-lg">
                          <p className="text-sm text-white/80">
                            {recording.transcript}
                          </p>
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "ocr":
        return (
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-orbitron font-bold text-knoux-neon mb-2">
              Text Recognition
            </h3>
            <p className="text-white/70 mb-4">
              Extract text from screen recordings using offline OCR
            </p>
            <p className="text-sm text-yellow-400">
              🚧 Coming Soon - Offline Tesseract.js Integration
            </p>
          </div>
        );

      case "face":
        return (
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-orbitron font-bold text-green-400 mb-2">
              Face Detection
            </h3>
            <p className="text-white/70 mb-4">
              Detect and analyze faces in your recordings
            </p>
            <p className="text-sm text-yellow-400">
              🚧 Coming Soon - MediaPipe Integration
            </p>
          </div>
        );

      case "audio":
        return (
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-orbitron font-bold text-yellow-400 mb-2">
              Audio Analysis
            </h3>
            <p className="text-white/70 mb-4">
              Analyze audio quality, patterns, and characteristics
            </p>
            <p className="text-sm text-yellow-400">
              🚧 Coming Soon - Web Audio API Integration
            </p>
          </div>
        );

      case "models":
        return <AIModelsManager />;

      case "stats":
        return <SystemStats />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
          🧠 KNOUX AI Tools
        </h2>
        <p className="text-white/70">
          Offline AI processing powered by open-source models
        </p>
      </div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id as any)}
            disabled={tool.status === "coming-soon"}
            className={`glass-card interactive p-6 rounded-xl text-center transition-all duration-300 relative ${
              selectedTool === tool.id
                ? `bg-${tool.color}/20 border-${tool.color}`
                : tool.status === "coming-soon"
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-white/10"
            }`}
          >
            {/* Status Badge */}
            {tool.status === "active" && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
            {tool.status === "coming-soon" && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded text-xs text-yellow-400">
                Soon
              </div>
            )}

            <div className="text-3xl mb-2">{tool.icon}</div>
            <div className={`font-orbitron font-bold text-${tool.color} mb-1`}>
              {tool.name}
            </div>
            <div className="text-xs text-white/60">{tool.description}</div>
          </button>
        ))}
      </div>

      {/* Selected Tool Content */}
      <div className="glass-card p-6 rounded-2xl">{renderToolContent()}</div>

      {/* AI Models Info */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-orbitron font-bold text-white mb-4">
          🔧 Available Models (Offline)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-knoux-purple/20 rounded-lg">
            <div className="font-bold text-knoux-purple">Speech Processing</div>
            <div className="text-sm text-white/70">
              Built-in keyword extraction & summarization
            </div>
          </div>
          <div className="p-4 bg-knoux-neon/20 rounded-lg opacity-50">
            <div className="font-bold text-knoux-neon">Tesseract.js OCR</div>
            <div className="text-sm text-white/70">
              Coming Soon - Text recognition
            </div>
          </div>
          <div className="p-4 bg-green-400/20 rounded-lg opacity-50">
            <div className="font-bold text-green-400">MediaPipe</div>
            <div className="text-sm text-white/70">
              Coming Soon - Face & pose detection
            </div>
          </div>
          <div className="p-4 bg-yellow-400/20 rounded-lg opacity-50">
            <div className="font-bold text-yellow-400">Web Audio API</div>
            <div className="text-sm text-white/70">
              Coming Soon - Audio analysis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
