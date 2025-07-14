import React from "react";
import { VisualPatchTool } from "../types/visualPatchLab";

interface VisualPatchToolCardProps {
  tool: VisualPatchTool;
  isSelected: boolean;
  isEnabled: boolean;
  onSelect: (toolId: string) => void;
  onSettings: (toolId: string) => void;
  compact?: boolean;
}

const VisualPatchToolCard: React.FC<VisualPatchToolCardProps> = ({
  tool,
  isSelected,
  isEnabled,
  onSelect,
  onSettings,
  compact = false,
}) => {
  const getCategoryGradient = (category: string): string => {
    switch (category) {
      case "body-scale":
        return "from-green-500/30 to-emerald-600/30";
      case "waist-belly":
        return "from-purple-500/30 to-violet-600/30";
      case "chest":
        return "from-pink-500/30 to-rose-600/30";
      case "hips-thighs":
        return "from-orange-500/30 to-amber-600/30";
      case "legs-feet":
        return "from-blue-500/30 to-cyan-600/30";
      case "arms-shoulders":
        return "from-teal-500/30 to-emerald-600/30";
      case "head-face":
        return "from-yellow-500/30 to-orange-600/30";
      case "freeform":
        return "from-indigo-500/30 to-purple-600/30";
      default:
        return "from-gray-500/30 to-slate-600/30";
    }
  };

  const getCategoryBorder = (category: string): string => {
    switch (category) {
      case "body-scale":
        return "border-green-500/50";
      case "waist-belly":
        return "border-purple-500/50";
      case "chest":
        return "border-pink-500/50";
      case "hips-thighs":
        return "border-orange-500/50";
      case "legs-feet":
        return "border-blue-500/50";
      case "arms-shoulders":
        return "border-teal-500/50";
      case "head-face":
        return "border-yellow-500/50";
      case "freeform":
        return "border-indigo-500/50";
      default:
        return "border-gray-500/50";
    }
  };

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getComplexityIcon = (complexity: string): string => {
    switch (complexity) {
      case "low":
        return "🟢";
      case "medium":
        return "🟡";
      case "high":
        return "🔴";
      default:
        return "⚪";
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => onSelect(tool.id)}
        disabled={!isEnabled}
        className={`
          group relative overflow-hidden rounded-xl p-3 transition-all duration-300
          glass-card ${getCategoryBorder(tool.category)}
          ${
            isSelected
              ? `bg-gradient-to-br ${getCategoryGradient(tool.category)} border-2 scale-105 shadow-xl`
              : "hover:bg-white/5 border hover:border-white/30"
          }
          ${!isEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-102"}
        `}
      >
        {/* Background gradient effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(tool.category)} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
        />

        <div className="relative z-10 flex items-center gap-3">
          {/* Tool Icon */}
          <div className="text-2xl">{tool.icon}</div>

          {/* Tool Info */}
          <div className="flex-1 text-left">
            <div className="font-semibold text-white text-sm">
              {tool.nameAr}
            </div>
            <div className="text-xs text-white/70 font-medium">{tool.name}</div>
          </div>

          {/* Complexity Indicator */}
          <div className="flex flex-col items-center">
            <span className="text-xs">
              {getComplexityIcon(tool.processingComplexity)}
            </span>
            <span
              className={`text-xs font-medium ${getComplexityColor(tool.processingComplexity)}`}
            >
              {tool.processingComplexity}
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSettings(tool.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-white/10"
          >
            <span className="text-white/70 hover:text-white text-xs">⚙️</span>
          </button>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse" />
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(tool.id)}
      disabled={!isEnabled}
      className={`
        group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 min-h-48
        glass-card ${getCategoryBorder(tool.category)}
        ${
          isSelected
            ? `bg-gradient-to-br ${getCategoryGradient(tool.category)} border-2 scale-105 shadow-2xl`
            : "hover:bg-white/5 border hover:border-white/30"
        }
        ${!isEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-102"}
      `}
    >
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(tool.category)} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl mb-2">{tool.icon}</div>

          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSettings(tool.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-white/10"
          >
            <span className="text-white/70 hover:text-white">⚙️</span>
          </button>
        </div>

        {/* Tool Names */}
        <div className="mb-4">
          <h3 className="font-bold text-white text-lg mb-1">{tool.nameAr}</h3>
          <h4 className="font-medium text-white/80 text-sm">{tool.name}</h4>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm mb-4 flex-1 leading-relaxed">
          {tool.descriptionAr}
        </p>

        {/* Tool Specs */}
        <div className="space-y-2">
          {/* Edit Mode */}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">نمط التحرير:</span>
            <span className="text-white/80 text-xs font-medium capitalize">
              {tool.editMode}
            </span>
          </div>

          {/* Complexity */}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">التعقيد:</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">
                {getComplexityIcon(tool.processingComplexity)}
              </span>
              <span
                className={`text-xs font-medium ${getComplexityColor(tool.processingComplexity)}`}
              >
                {tool.processingComplexity}
              </span>
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">معاينة فورية:</span>
            <span
              className={`text-xs font-medium ${tool.realTimePreview ? "text-green-400" : "text-red-400"}`}
            >
              {tool.realTimePreview ? "✓ نعم" : "✗ لا"}
            </span>
          </div>

          {/* Symmetry Support */}
          {tool.supportsSymmetry && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">التماثل:</span>
              <span className="text-green-400 text-xs font-medium">
                ✓ مدعوم
              </span>
            </div>
          )}

          {/* Default Intensity */}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">الشدة الافتراضية:</span>
            <span className="text-white/80 text-xs font-medium">
              {tool.defaultIntensity}%
            </span>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg animate-pulse" />
          </div>
        )}

        {/* Preview Color Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 opacity-50">
          <div
            className="h-full rounded-b-2xl"
            style={{ backgroundColor: tool.previewColor }}
          />
        </div>
      </div>
    </button>
  );
};

export default VisualPatchToolCard;
