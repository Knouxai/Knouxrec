import React, { useState, useRef } from "react";
import { VideoTemplate, TemplateElement } from "../types/templates";

interface TemplateEditorProps {
  template: VideoTemplate;
  onSave: (customizations: Record<string, any>) => void;
  onClose: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onClose,
}) => {
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [previewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCustomization = (key: string, value: any) => {
    setCustomizations((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (placeholderKey: string, file: File) => {
    if (file) {
      const url = URL.createObjectURL(file);
      updateCustomization(placeholderKey, { file, url });
    }
  };

  const handleRender = async () => {
    setIsRendering(true);
    // Simulate rendering process
    setTimeout(() => {
      setIsRendering(false);
      onSave(customizations);
    }, 3000);
  };

  const ElementEditor = ({ element }: { element: TemplateElement }) => {
    const currentValue =
      customizations[element.placeholder_key] || element.default_value;

    switch (element.type) {
      case "text":
        return (
          <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
            <h4 className="font-rajdhani font-bold text-white mb-3 flex items-center">
              📝 {element.placeholder_key.replace("_", " ").toUpperCase()}
            </h4>

            <div className="space-y-3">
              {/* Text Input */}
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Text Content
                </label>
                <textarea
                  value={currentValue?.text || element.default_value}
                  onChange={(e) =>
                    updateCustomization(element.placeholder_key, {
                      ...currentValue,
                      text: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-black/30 border border-knoux-purple/30 rounded-lg text-white resize-none focus:ring-2 focus:ring-knoux-purple"
                  rows={3}
                  placeholder="Enter your text..."
                />
              </div>

              {/* Text Styling */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">
                    Font Size
                  </label>
                  <select
                    value={
                      currentValue?.fontSize || element.config.font_size || 24
                    }
                    onChange={(e) =>
                      updateCustomization(element.placeholder_key, {
                        ...currentValue,
                        fontSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white"
                  >
                    <option value={16}>16px</option>
                    <option value={18}>18px</option>
                    <option value={24}>24px</option>
                    <option value={32}>32px</option>
                    <option value={48}>48px</option>
                    <option value={64}>64px</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={
                      currentValue?.color || element.config.color || "#ffffff"
                    }
                    onChange={(e) =>
                      updateCustomization(element.placeholder_key, {
                        ...currentValue,
                        color: e.target.value,
                      })
                    }
                    className="w-full h-10 bg-black/30 border border-knoux-purple/30 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Text Alignment
                </label>
                <div className="flex space-x-2">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        updateCustomization(element.placeholder_key, {
                          ...currentValue,
                          textAlign: align,
                        })
                      }
                      className={`px-3 py-2 rounded-lg transition-all ${
                        (currentValue?.textAlign ||
                          element.config.text_align) === align
                          ? "bg-knoux-purple/30 text-knoux-purple border border-knoux-purple"
                          : "bg-black/20 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {align === "left"
                        ? "⬅️"
                        : align === "center"
                          ? "⏸️"
                          : "➡️"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "image":
      case "logo":
        return (
          <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
            <h4 className="font-rajdhani font-bold text-white mb-3 flex items-center">
              {element.type === "logo" ? "🏷️" : "🖼️"}{" "}
              {element.placeholder_key.replace("_", " ").toUpperCase()}
            </h4>

            <div className="space-y-3">
              {/* Current Image Preview */}
              {(currentValue?.url || element.default_value) && (
                <div className="aspect-video bg-black/30 rounded-lg overflow-hidden border border-knoux-purple/20">
                  <img
                    src={currentValue?.url || element.default_value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-knoux-purple/30 rounded-lg hover:border-knoux-purple/60 transition-all text-knoux-purple hover:bg-knoux-purple/10 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Upload {element.type === "logo" ? "Logo" : "Image"}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(element.placeholder_key, file);
                }}
                className="hidden"
              />

              {/* Image Controls */}
              {currentValue?.url && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      Opacity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentValue?.opacity || 100}
                      onChange={(e) =>
                        updateCustomization(element.placeholder_key, {
                          ...currentValue,
                          opacity: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-white/60">
                      {currentValue?.opacity || 100}%
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      Rotation
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={currentValue?.rotation || 0}
                      onChange={(e) =>
                        updateCustomization(element.placeholder_key, {
                          ...currentValue,
                          rotation: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-white/60">
                      {currentValue?.rotation || 0}°
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "video":
        return (
          <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
            <h4 className="font-rajdhani font-bold text-white mb-3 flex items-center">
              🎥 {element.placeholder_key.replace("_", " ").toUpperCase()}
            </h4>

            <div className="space-y-3">
              {/* Video Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-knoux-neon/30 rounded-lg hover:border-knoux-neon/60 transition-all text-knoux-neon hover:bg-knoux-neon/10 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Upload Video</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(element.placeholder_key, file);
                }}
                className="hidden"
              />

              {currentValue?.url && (
                <video
                  src={currentValue.url}
                  controls
                  className="w-full rounded-lg"
                />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="glass-card rounded-2xl border border-knoux-purple/30 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-knoux-purple/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white">
                  {template.name}
                </h2>
                <p className="text-white/70 mt-1">Customize your template</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/70 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
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

          <div className="flex h-[70vh]">
            {/* Left Panel - Elements */}
            <div className="w-1/2 p-6 overflow-y-auto border-r border-knoux-purple/20">
              <h3 className="text-lg font-orbitron font-bold text-white mb-4">
                ✏️ Customize Elements
              </h3>
              <div className="space-y-4">
                {template.elements.map((element) => (
                  <ElementEditor key={element.id} element={element} />
                ))}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-1/2 p-6 bg-black/20">
              <h3 className="text-lg font-orbitron font-bold text-white mb-4">
                👁️ Live Preview
              </h3>
              <div className="aspect-video bg-black/50 rounded-xl border border-knoux-purple/20 flex items-center justify-center">
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-white/70">Preview will appear here</p>
                    <p className="text-white/50 text-sm mt-1">
                      Make changes to see live preview
                    </p>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="mt-4 p-4 bg-knoux-purple/10 rounded-lg border border-knoux-purple/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-white/70">Duration</div>
                    <div className="text-white font-medium">
                      {template.duration}s
                    </div>
                  </div>
                  <div>
                    <div className="text-white/70">Aspect Ratio</div>
                    <div className="text-white font-medium">
                      {template.aspect_ratio}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/70">Elements</div>
                    <div className="text-white font-medium">
                      {template.elements.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/70">Difficulty</div>
                    <div
                      className={`font-medium capitalize ${
                        template.difficulty === "easy"
                          ? "text-green-400"
                          : template.difficulty === "medium"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {template.difficulty}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-knoux-purple/20 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/40 rounded-xl text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save as draft
                    console.log("Saving as draft...");
                  }}
                  className="px-6 py-3 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-xl text-knoux-purple font-medium transition-all"
                >
                  Save Draft
                </button>
              </div>

              <button
                onClick={handleRender}
                disabled={isRendering}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  isRendering
                    ? "bg-yellow-500/20 text-yellow-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-knoux-purple to-knoux-neon text-white hover:scale-105"
                }`}
              >
                {isRendering ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <span>Rendering...</span>
                  </div>
                ) : (
                  "🎬 Render Video"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
