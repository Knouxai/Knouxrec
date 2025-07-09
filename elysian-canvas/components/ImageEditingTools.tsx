import React, { useState, useEffect, useRef } from "react";

interface ImageEditingToolsProps {
  selectedImage: any;
  onImageUpdate: (processedImage: any) => void;
}

interface FilterPreset {
  id: string;
  name: string;
  icon: string;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
    sepia: number;
    invert: number;
    opacity: number;
  };
}

export const ImageEditingTools: React.FC<ImageEditingToolsProps> = ({
  selectedImage,
  onImageUpdate,
}) => {
  // Filter states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);
  const [opacity, setOpacity] = useState(100);

  // Advanced tools states
  const [activetool, setActiveTools] = useState<string>("filters");
  const [cropMode, setCropMode] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(24);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);

  // Filter presets
  const filterPresets: FilterPreset[] = [
    {
      id: "original",
      name: "Original",
      icon: "🎯",
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
        sepia: 0,
        invert: 0,
        opacity: 100,
      },
    },
    {
      id: "vintage",
      name: "Vintage",
      icon: "📸",
      filters: {
        brightness: 110,
        contrast: 90,
        saturation: 80,
        hue: 10,
        blur: 0,
        sepia: 30,
        invert: 0,
        opacity: 100,
      },
    },
    {
      id: "noir",
      name: "Film Noir",
      icon: "🎭",
      filters: {
        brightness: 90,
        contrast: 130,
        saturation: 0,
        hue: 0,
        blur: 0,
        sepia: 0,
        invert: 0,
        opacity: 100,
      },
    },
    {
      id: "dreamy",
      name: "Dreamy",
      icon: "☁️",
      filters: {
        brightness: 120,
        contrast: 80,
        saturation: 120,
        hue: -10,
        blur: 1,
        sepia: 0,
        invert: 0,
        opacity: 90,
      },
    },
    {
      id: "dramatic",
      name: "Dramatic",
      icon: "⚡",
      filters: {
        brightness: 85,
        contrast: 140,
        saturation: 110,
        hue: 5,
        blur: 0,
        sepia: 0,
        invert: 0,
        opacity: 100,
      },
    },
    {
      id: "soft",
      name: "Soft Glow",
      icon: "✨",
      filters: {
        brightness: 115,
        contrast: 85,
        saturation: 105,
        hue: 0,
        blur: 0.5,
        sepia: 5,
        invert: 0,
        opacity: 95,
      },
    },
  ];

  // Apply filters to canvas
  const applyFilters = () => {
    if (!canvasRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load and draw the original image
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply CSS filters
      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        hue-rotate(${hue}deg)
        blur(${blur}px)
        sepia(${sepia}%)
        invert(${invert}%)
        opacity(${opacity}%)
      `;

      // Calculate dimensions to maintain aspect ratio
      const maxWidth = canvas.width;
      const maxHeight = canvas.height;

      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      // Center the image
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      // Draw the filtered image
      ctx.drawImage(img, x, y, width, height);

      // Reset filter for other operations
      ctx.filter = "none";

      // Add text if in text mode
      if (textMode && textContent) {
        ctx.fillStyle = textColor;
        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(textContent, canvas.width / 2, canvas.height / 2);
      }

      // Trigger update callback
      onImageUpdate({
        ...selectedImage,
        processedUrl: canvas.toDataURL(),
        filters: {
          brightness,
          contrast,
          saturation,
          hue,
          blur,
          sepia,
          invert,
          opacity,
        },
      });
    };

    img.src = selectedImage.url;
  };

  // Apply preset filter
  const applyPreset = (preset: FilterPreset) => {
    setBrightness(preset.filters.brightness);
    setContrast(preset.filters.contrast);
    setSaturation(preset.filters.saturation);
    setHue(preset.filters.hue);
    setBlur(preset.filters.blur);
    setSepia(preset.filters.sepia);
    setInvert(preset.filters.invert);
    setOpacity(preset.filters.opacity);
  };

  // Reset all filters
  const resetFilters = () => {
    applyPreset(filterPresets[0]); // Apply original preset
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `elysian-edit-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Apply filters whenever any value changes
  useEffect(() => {
    applyFilters();
  }, [
    brightness,
    contrast,
    saturation,
    hue,
    blur,
    sepia,
    invert,
    opacity,
    textContent,
    textColor,
    textSize,
    selectedImage,
  ]);

  return (
    <div className="image-editing-tools">
      {/* Tool Tabs */}
      <div className="tool-tabs">
        <button
          className={`tool-tab ${activeTools === "filters" ? "active" : ""}`}
          onClick={() => setActiveTools("filters")}
        >
          🎨 Filters
        </button>
        <button
          className={`tool-tab ${activeTools === "adjust" ? "active" : ""}`}
          onClick={() => setActiveTools("adjust")}
        >
          ⚙️ Adjust
        </button>
        <button
          className={`tool-tab ${activeTools === "effects" ? "active" : ""}`}
          onClick={() => setActiveTools("effects")}
        >
          ✨ Effects
        </button>
        <button
          className={`tool-tab ${activeTools === "text" ? "active" : ""}`}
          onClick={() => setActiveTools("text")}
        >
          📝 Text
        </button>
      </div>

      {/* Filter Presets */}
      {activeTools === "filters" && (
        <div className="filters-section">
          <h3>🎭 Quick Filters</h3>
          <div className="preset-grid">
            {filterPresets.map((preset) => (
              <button
                key={preset.id}
                className="preset-button"
                onClick={() => applyPreset(preset)}
              >
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Adjustments */}
      {activeTools === "adjust" && (
        <div className="adjust-section">
          <h3>⚙️ Manual Adjustments</h3>

          <div className="control-group">
            <label>Brightness</label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="slider"
            />
            <span>{brightness}%</span>
          </div>

          <div className="control-group">
            <label>Contrast</label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="slider"
            />
            <span>{contrast}%</span>
          </div>

          <div className="control-group">
            <label>Saturation</label>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="slider"
            />
            <span>{saturation}%</span>
          </div>

          <div className="control-group">
            <label>Hue</label>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="slider"
            />
            <span>{hue}°</span>
          </div>
        </div>
      )}

      {/* Effects */}
      {activeTools === "effects" && (
        <div className="effects-section">
          <h3>✨ Special Effects</h3>

          <div className="control-group">
            <label>Blur</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="slider"
            />
            <span>{blur}px</span>
          </div>

          <div className="control-group">
            <label>Sepia</label>
            <input
              type="range"
              min="0"
              max="100"
              value={sepia}
              onChange={(e) => setSepia(Number(e.target.value))}
              className="slider"
            />
            <span>{sepia}%</span>
          </div>

          <div className="control-group">
            <label>Invert</label>
            <input
              type="range"
              min="0"
              max="100"
              value={invert}
              onChange={(e) => setInvert(Number(e.target.value))}
              className="slider"
            />
            <span>{invert}%</span>
          </div>

          <div className="control-group">
            <label>Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="slider"
            />
            <span>{opacity}%</span>
          </div>
        </div>
      )}

      {/* Text Tool */}
      {activeTools === "text" && (
        <div className="text-section">
          <h3>📝 Add Text</h3>

          <div className="text-controls">
            <div className="control-group">
              <label>Text Content</label>
              <input
                type="text"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text..."
                className="text-input"
              />
            </div>

            <div className="control-group">
              <label>Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="color-input"
              />
            </div>

            <div className="control-group">
              <label>Text Size</label>
              <input
                type="range"
                min="12"
                max="72"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="slider"
              />
              <span>{textSize}px</span>
            </div>

            <button
              className={`toggle-button ${textMode ? "active" : ""}`}
              onClick={() => setTextMode(!textMode)}
            >
              {textMode ? "Hide Text" : "Show Text"}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={resetFilters} className="action-button reset">
          🔄 Reset All
        </button>
        <button onClick={downloadImage} className="action-button download">
          💾 Download
        </button>
      </div>

      {/* Canvas for processing */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ display: "none" }}
      />

      <style>{`
        .image-editing-tools {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tool-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 15px;
        }

        .tool-tab {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
          flex: 1;
          text-align: center;
        }

        .tool-tab.active {
          background: rgba(78, 205, 196, 0.2);
          border-color: rgba(78, 205, 196, 0.4);
          color: #4ecdc4;
        }

        .tool-tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .filters-section,
        .adjust-section,
        .effects-section,
        .text-section {
          margin-bottom: 20px;
        }

        .filters-section h3,
        .adjust-section h3,
        .effects-section h3,
        .text-section h3 {
          color: white;
          margin: 0 0 15px 0;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .preset-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          padding: 12px 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .preset-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #4ecdc4;
          transform: translateY(-2px);
        }

        .preset-icon {
          font-size: 20px;
        }

        .preset-name {
          font-size: 11px;
          font-weight: 500;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .control-group label {
          color: rgba(255, 255, 255, 0.8);
          min-width: 70px;
          font-size: 12px;
        }

        .slider {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #4ecdc4;
          border-radius: 50%;
          cursor: pointer;
        }

        .control-group span {
          color: #4ecdc4;
          min-width: 40px;
          text-align: right;
          font-size: 11px;
          font-weight: 500;
        }

        .text-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: white;
          padding: 8px 12px;
          font-size: 12px;
        }

        .text-input:focus {
          outline: none;
          border-color: #4ecdc4;
        }

        .color-input {
          width: 40px;
          height: 30px;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          cursor: pointer;
        }

        .toggle-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: white;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
          margin-top: 10px;
        }

        .toggle-button.active {
          background: rgba(78, 205, 196, 0.2);
          border-color: rgba(78, 205, 196, 0.4);
          color: #4ecdc4;
        }

        .toggle-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-button {
          flex: 1;
          border: none;
          border-radius: 8px;
          color: white;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 12px;
        }

        .action-button.reset {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
        }

        .action-button.download {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
