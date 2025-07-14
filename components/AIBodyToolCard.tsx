import React, { useState } from "react";
import { AIBodyTool, ProcessingSettings } from "../types/aiBodyEditor";

interface AIBodyToolCardProps {
  tool: AIBodyTool;
  onSelect: (tool: AIBodyTool, settings: ProcessingSettings) => void;
  isSelected: boolean;
  isModelLoaded: boolean;
  onLoadModel: (modelIds: string[]) => void;
}

const AIBodyToolCard: React.FC<AIBodyToolCardProps> = ({
  tool,
  onSelect,
  isSelected,
  isModelLoaded,
  onLoadModel,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ProcessingSettings>(tool.settings);

  const handleApply = () => {
    onSelect(tool, settings);
  };

  const handleLoadModel = () => {
    const modelIds = tool.models.map((m) => m.id);
    onLoadModel(modelIds);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      chest: "#ff6b9d",
      waist: "#4ecdc4",
      hips: "#45b7d1",
      full_body: "#96ceb4",
      privacy: "#feca57",
      style: "#ff9ff3",
      post_process: "#54a0ff",
    };
    return colors[category as keyof typeof colors] || "#666";
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "light":
        return "#4ecdc4";
      case "medium":
        return "#feca57";
      case "strong":
        return "#ff6b6b";
      default:
        return "#666";
    }
  };

  return (
    <div className={`ai-tool-card ${isSelected ? "selected" : ""}`}>
      <div className="tool-header">
        <div
          className="tool-icon"
          style={{ color: getCategoryColor(tool.category) }}
        >
          {tool.icon}
        </div>
        <div className="tool-title">
          <h3>{tool.nameAr}</h3>
          <h4>{tool.name}</h4>
        </div>
        <div className="model-status">
          {isModelLoaded ? (
            <span className="status-loaded">✅ جاهز</span>
          ) : (
            <span className="status-unloaded">⏳ غير محمّل</span>
          )}
        </div>
      </div>

      <div className="tool-description">
        <p>{tool.description}</p>
      </div>

      <div className="tool-models">
        <div className="models-header">
          <span>النماذج ��لمطلوبة:</span>
        </div>
        <div className="models-list">
          {tool.models.map((model) => (
            <div key={model.id} className="model-chip">
              <span className="model-name">{model.name}</span>
              <span className="model-type">{model.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tool-settings-preview">
        <div className="setting-item">
          <span>الشدة:</span>
          <span
            className="intensity-indicator"
            style={{ color: getIntensityColor(settings.intensity) }}
          >
            {settings.intensity === "light"
              ? "خفيف"
              : settings.intensity === "medium"
                ? "متوسط"
                : "قوي"}
          </span>
        </div>
        <div className="setting-item">
          <span>النمط:</span>
          <span className="style-indicator">
            {settings.style === "realistic"
              ? "واقعي"
              : settings.style === "anime"
                ? "أنمي"
                : settings.style === "standard"
                  ? "قياسي"
                  : "مختلط"}
          </span>
        </div>
      </div>

      <div className="tool-actions">
        <button
          className="btn-settings"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ إعدادات
        </button>

        {!isModelLoaded ? (
          <button className="btn-load-model" onClick={handleLoadModel}>
            📥 تحميل النموذج
          </button>
        ) : (
          <button className="btn-apply" onClick={handleApply}>
            ⚡ تطبيق
          </button>
        )}
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h4>إعدادات {tool.nameAr}</h4>
            <button
              className="btn-close"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </div>

          <div className="settings-content">
            <div className="setting-group">
              <label>شدة التأثير:</label>
              <select
                value={settings.intensity}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    intensity: e.target.value as "light" | "medium" | "strong",
                  })
                }
              >
                <option value="light">خفيف (20%)</option>
                <option value="medium">متوسط (50%)</option>
                <option value="strong">قوي (80%)</option>
              </select>
            </div>

            <div className="setting-group">
              <label>نمط المعالجة:</label>
              <select
                value={settings.style}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    style: e.target.value as any,
                  })
                }
              >
                <option value="realistic">واقعي</option>
                <option value="anime">أنمي</option>
                <option value="standard">قياسي</option>
                <option value="stylemix">مختلط</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.preserveDetails}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preserveDetails: e.target.checked,
                    })
                  }
                />
                <span>الحفاظ على التفاصيل</span>
              </label>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.blendEdges}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      blendEdges: e.target.checked,
                    })
                  }
                />
                <span>دمج الحواف</span>
              </label>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoBalance}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoBalance: e.target.checked,
                    })
                  }
                />
                <span>موازنة تلقائية</span>
              </label>
            </div>
          </div>

          <div className="settings-actions">
            <button
              className="btn-apply-settings"
              onClick={() => {
                setShowSettings(false);
                if (isModelLoaded) handleApply();
              }}
            >
              ✅ تطبيق الإعدادات
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-tool-card {
          background: linear-gradient(
            145deg,
            rgba(26, 26, 46, 0.9),
            rgba(22, 33, 62, 0.9)
          );
          border: 2px solid transparent;
          border-radius: 15px;
          padding: 20px;
          margin: 10px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .ai-tool-card:hover {
          border-color: ${getCategoryColor(tool.category)};
          box-shadow: 0 10px 30px
            rgba(
              ${getCategoryColor(tool.category)
                .slice(1)
                .match(/.{2}/g)
                ?.map((hex) => parseInt(hex, 16))
                .join(", ")},
              0.3
            );
          transform: translateY(-5px);
        }

        .ai-tool-card.selected {
          border-color: ${getCategoryColor(tool.category)};
          box-shadow: 0 15px 40px
            rgba(
              ${getCategoryColor(tool.category)
                .slice(1)
                .match(/.{2}/g)
                ?.map((hex) => parseInt(hex, 16))
                .join(", ")},
              0.4
            );
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .tool-icon {
          font-size: 32px;
          text-shadow: 0 0 10px currentColor;
        }

        .tool-title h3 {
          color: white;
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        .tool-title h4 {
          color: #cccccc;
          font-size: 14px;
          font-weight: normal;
          margin: 2px 0 0 0;
          opacity: 0.8;
        }

        .model-status {
          margin-left: auto;
        }

        .status-loaded {
          color: #4ecdc4;
          font-size: 12px;
          font-weight: bold;
        }

        .status-unloaded {
          color: #feca57;
          font-size: 12px;
          font-weight: bold;
        }

        .tool-description {
          margin-bottom: 15px;
        }

        .tool-description p {
          color: #cccccc;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .tool-models {
          margin-bottom: 15px;
        }

        .models-header {
          color: #ffffff;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .models-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .model-chip {
          background: rgba(78, 205, 196, 0.2);
          border: 1px solid #4ecdc4;
          border-radius: 12px;
          padding: 4px 8px;
          font-size: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .model-name {
          color: #4ecdc4;
          font-weight: bold;
        }

        .model-type {
          color: #ffffff;
          opacity: 0.7;
        }

        .tool-settings-preview {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
        }

        .setting-item span:first-child {
          color: #cccccc;
          margin-bottom: 3px;
        }

        .intensity-indicator,
        .style-indicator {
          font-weight: bold;
          color: white;
        }

        .tool-actions {
          display: flex;
          gap: 10px;
        }

        .btn-settings,
        .btn-load-model,
        .btn-apply {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-settings {
          background: linear-gradient(145deg, #666, #555);
          color: white;
        }

        .btn-load-model {
          background: linear-gradient(145deg, #feca57, #ff9f43);
          color: white;
        }

        .btn-apply {
          background: linear-gradient(
            145deg,
            ${getCategoryColor(tool.category)},
            ${getCategoryColor(tool.category)}dd
          );
          color: white;
        }

        .btn-settings:hover,
        .btn-load-model:hover,
        .btn-apply:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .settings-panel {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            145deg,
            rgba(0, 0, 0, 0.95),
            rgba(26, 26, 46, 0.95)
          );
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          z-index: 10;
          animation: slideIn 0.3s ease;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .settings-header h4 {
          color: white;
          font-size: 16px;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          color: #ff6b6b;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background 0.3s ease;
        }

        .btn-close:hover {
          background: rgba(255, 107, 107, 0.2);
        }

        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .setting-group label {
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .setting-group select {
          padding: 8px;
          border: 1px solid #4ecdc4;
          border-radius: 5px;
          background: rgba(78, 205, 196, 0.1);
          color: white;
          font-size: 14px;
        }

        .checkbox-label {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          accent-color: #4ecdc4;
        }

        .settings-actions {
          display: flex;
          justify-content: center;
        }

        .btn-apply-settings {
          padding: 12px 25px;
          background: linear-gradient(145deg, #4ecdc4, #44a08d);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-apply-settings:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AIBodyToolCard;
