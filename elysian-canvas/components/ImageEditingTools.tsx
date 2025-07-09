import React, { useState, useRef, useEffect } from "react";
import { UploadedImage } from "../services/ImageUploadService";

interface ImageEditingToolsProps {
  selectedImage: UploadedImage | null;
  onImageUpdate: (imageData: string) => void;
  canvas: HTMLCanvasElement | null;
}

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  invert: number;
  grayscale: number;
  vintage: number;
  dramatic: number;
}

export const ImageEditingTools: React.FC<ImageEditingToolsProps> = ({
  selectedImage,
  onImageUpdate,
  canvas,
}) => {
  const [activeTab, setActiveTab] = useState<
    "filters" | "adjustments" | "effects" | "crop"
  >("filters");
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sepia: 0,
    invert: 0,
    grayscale: 0,
    vintage: 0,
    dramatic: 0,
  });

  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (selectedImage && previewCanvasRef.current) {
      applyFilters();
    }
  }, [selectedImage, filterSettings]);

  const applyFilters = () => {
    if (!selectedImage || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Build filter string
      const filters = [
        `brightness(${filterSettings.brightness}%)`,
        `contrast(${filterSettings.contrast}%)`,
        `saturate(${filterSettings.saturation}%)`,
        `hue-rotate(${filterSettings.hue}deg)`,
        `blur(${filterSettings.blur}px)`,
        `sepia(${filterSettings.sepia}%)`,
        `invert(${filterSettings.invert}%)`,
        `grayscale(${filterSettings.grayscale}%)`,
      ].join(" ");

      ctx.filter = filters;
      ctx.drawImage(img, 0, 0);

      // Apply custom effects
      if (filterSettings.vintage > 0) {
        applyVintageEffect(ctx, canvas, filterSettings.vintage / 100);
      }

      if (filterSettings.dramatic > 0) {
        applyDramaticEffect(ctx, canvas, filterSettings.dramatic / 100);
      }

      // Update the main canvas if provided
      if (canvas) {
        const mainCtx = canvas.getContext("2d")!;
        mainCtx.clearRect(0, 0, canvas.width, canvas.height);
        mainCtx.drawImage(
          previewCanvasRef.current,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }

      // Notify parent component
      onImageUpdate(previewCanvasRef.current.toDataURL());
    };

    img.src = selectedImage.url;
  };

  const applyVintageEffect = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    intensity: number,
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Vintage color grading
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Warm tone shift
      data[i] = Math.min(255, r + 20 * intensity); // Red boost
      data[i + 1] = Math.min(255, g + 10 * intensity); // Slight green boost
      data[i + 2] = Math.max(0, b - 15 * intensity); // Blue reduction

      // Add slight sepia tone
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = Math.min(255, gray + 40 * intensity);
      data[i + 1] = Math.min(255, gray + 20 * intensity);
      data[i + 2] = Math.max(0, gray - 10 * intensity);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyDramaticEffect = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    intensity: number,
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Increase contrast dramatically
      const factor =
        (259 * (255 + 255 * intensity)) / (255 * (259 - 255 * intensity));

      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(
        0,
        Math.min(255, factor * (data[i + 1] - 128) + 128),
      );
      data[i + 2] = Math.max(
        0,
        Math.min(255, factor * (data[i + 2] - 128) + 128),
      );
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleFilterChange = (filter: keyof FilterSettings, value: number) => {
    setFilterSettings((prev) => ({
      ...prev,
      [filter]: value,
    }));
  };

  const resetFilters = () => {
    setFilterSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      invert: 0,
      grayscale: 0,
      vintage: 0,
      dramatic: 0,
    });
  };

  const applyPreset = (presetName: string) => {
    const presets: Record<string, Partial<FilterSettings>> = {
      "Classic B&W": {
        grayscale: 100,
        contrast: 120,
        brightness: 110,
      },
      "Vintage Warm": {
        vintage: 80,
        sepia: 30,
        brightness: 105,
        contrast: 115,
      },
      Dramatic: {
        dramatic: 70,
        contrast: 140,
        saturation: 120,
        brightness: 95,
      },
      "Soft Portrait": {
        brightness: 105,
        contrast: 95,
        saturation: 110,
        blur: 0.5,
      },
      "Film Noir": {
        grayscale: 100,
        dramatic: 60,
        contrast: 150,
        brightness: 85,
      },
      "Golden Hour": {
        brightness: 110,
        contrast: 105,
        saturation: 120,
        hue: 15,
        vintage: 40,
      },
    };

    const preset = presets[presetName];
    if (preset) {
      setFilterSettings((prev) => ({
        ...prev,
        ...preset,
      }));
    }
  };

  if (!selectedImage) {
    return (
      <div className="no-image-selected">
        <div className="no-image-icon">🖼️</div>
        <h3>No Image Selected</h3>
        <p>Upload an image to start editing</p>
      </div>
    );
  }

  return (
    <div className="image-editing-tools">
      {/* Preview Section */}
      <div className="preview-section">
        <h3>Live Preview</h3>
        <canvas
          ref={previewCanvasRef}
          className="preview-canvas"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      {/* Tool Tabs */}
      <div className="tool-tabs">
        <button
          onClick={() => setActiveTab("filters")}
          className={`tab-button ${activeTab === "filters" ? "active" : ""}`}
        >
          🎨 Filters
        </button>
        <button
          onClick={() => setActiveTab("adjustments")}
          className={`tab-button ${activeTab === "adjustments" ? "active" : ""}`}
        >
          ⚙️ Adjustments
        </button>
        <button
          onClick={() => setActiveTab("effects")}
          className={`tab-button ${activeTab === "effects" ? "active" : ""}`}
        >
          ✨ Effects
        </button>
        <button
          onClick={() => setActiveTab("crop")}
          className={`tab-button ${activeTab === "crop" ? "active" : ""}`}
        >
          ✂️ Crop
        </button>
      </div>

      {/* Tool Content */}
      <div className="tool-content">
        {activeTab === "filters" && (
          <div className="filters-panel">
            <h4>Quick Presets</h4>
            <div className="presets-grid">
              {[
                "Classic B&W",
                "Vintage Warm",
                "Dramatic",
                "Soft Portrait",
                "Film Noir",
                "Golden Hour",
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className="preset-button"
                >
                  {preset}
                </button>
              ))}
            </div>

            <button onClick={resetFilters} className="reset-button">
              🔄 Reset All
            </button>
          </div>
        )}

        {activeTab === "adjustments" && (
          <div className="adjustments-panel">
            <div className="slider-group">
              <label>Brightness: {filterSettings.brightness}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={filterSettings.brightness}
                onChange={(e) =>
                  handleFilterChange("brightness", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>

            <div className="slider-group">
              <label>Contrast: {filterSettings.contrast}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={filterSettings.contrast}
                onChange={(e) =>
                  handleFilterChange("contrast", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>

            <div className="slider-group">
              <label>Saturation: {filterSettings.saturation}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={filterSettings.saturation}
                onChange={(e) =>
                  handleFilterChange("saturation", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>

            <div className="slider-group">
              <label>Hue: {filterSettings.hue}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={filterSettings.hue}
                onChange={(e) =>
                  handleFilterChange("hue", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>
          </div>
        )}

        {activeTab === "effects" && (
          <div className="effects-panel">
            <div className="slider-group">
              <label>Blur: {filterSettings.blur}px</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filterSettings.blur}
                onChange={(e) =>
                  handleFilterChange("blur", parseFloat(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>

            <div className="slider-group">
              <label>Sepia: {filterSettings.sepia}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filterSettings.sepia}
                onChange={(e) =>
                  handleFilterChange("sepia", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>

            <div className="slider-group">
              <label>Grayscale: {filterSettings.grayscale}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filterSettings.grayscale}
                onChange={(e) =>
                  handleFilterChange("grayscale", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>

            <div className="slider-group">
              <label>Vintage: {filterSettings.vintage}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filterSettings.vintage}
                onChange={(e) =>
                  handleFilterChange("vintage", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>

            <div className="slider-group">
              <label>Dramatic: {filterSettings.dramatic}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filterSettings.dramatic}
                onChange={(e) =>
                  handleFilterChange("dramatic", parseInt(e.target.value))
                }
                className="adjustment-slider"
              />
            </div>
          </div>
        )}

        {activeTab === "crop" && (
          <div className="crop-panel">
            <h4>Crop & Resize</h4>
            <p>Crop functionality will be implemented here</p>
            <button className="feature-coming-soon">🚧 Coming Soon</button>
          </div>
        )}
      </div>

      <style>{`
        .image-editing-tools {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          color: white;
          max-height: 80vh;
          overflow-y: auto;
        }

        .no-image-selected {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.6);
        }

        .no-image-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .preview-section {
          margin-bottom: 20px;
        }

        .preview-section h3 {
          margin: 0 0 15px 0;
          color: #4ecdc4;
        }

        .preview-canvas {
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          max-width: 100%;
          height: auto;
        }

        .tool-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-button {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          border-radius: 8px 8px 0 0;
          color: rgba(255, 255, 255, 0.7);
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .tab-button.active {
          background: rgba(78, 205, 196, 0.2);
          color: #4ecdc4;
          border-bottom: 2px solid #4ecdc4;
        }

        .tab-button:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .tool-content {
          min-height: 200px;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
          margin-bottom: 20px;
        }

        .preset-button {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .preset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
        }

        .reset-button {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: 8px;
          color: #ff6b6b;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .reset-button:hover {
          background: rgba(255, 107, 107, 0.3);
        }

        .slider-group {
          margin-bottom: 20px;
        }

        .slider-group label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .adjustment-slider {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .adjustment-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4ecdc4;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(78, 205, 196, 0.4);
        }

        .adjustment-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4ecdc4;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(78, 205, 196, 0.4);
        }

        .feature-coming-soon {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.4);
          border-radius: 8px;
          color: #ffc107;
          padding: 12px 20px;
          cursor: not-allowed;
          width: 100%;
        }

        .adjustments-panel h4,
        .effects-panel h4,
        .filters-panel h4,
        .crop-panel h4 {
          margin: 0 0 16px 0;
          color: #4ecdc4;
          font-size: 1.1rem;
        }

        /* Scrollbar styling */
        .image-editing-tools::-webkit-scrollbar {
          width: 6px;
        }

        .image-editing-tools::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .image-editing-tools::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .image-editing-tools::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ImageEditingTools;
