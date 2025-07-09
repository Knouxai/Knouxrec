import React, { useState, useEffect, useRef } from "react";
import { AdultGateAdvanced } from "./core/AdultGateAdvanced";
import { MasterRenderer, RenderConfig } from "./core/MasterRenderer";
import { AestheticEngine, AestheticProfile } from "./core/AestheticEngine";
import { MasterSlider } from "./editor-ui/MasterSlider";
import { EnhancedGallery } from "./components/EnhancedGallery";
import {
  imageUploadService,
  UploadedImage,
} from "./services/ImageUploadService";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  data: any;
}

interface ElysianCanvasProps {
  onClose?: () => void;
}

export const ElysianCanvas: React.FC<ElysianCanvasProps> = ({ onClose }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<
    "gallery" | "editor" | "preview"
  >("gallery");
  const [renderConfig, setRenderConfig] = useState<Partial<RenderConfig>>({});
  const [masterIntensity, setMasterIntensity] = useState(1.0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null,
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const masterRenderer = useRef<MasterRenderer | null>(null);
  const aestheticEngine = useRef<AestheticEngine | null>(null);

  // Sample templates
  const [templates] = useState<Template[]>([
    {
      id: "vitruvian-form",
      name: "Vitruvian Form",
      category: "Body as Sculpture",
      description:
        "Perfect geometric proportions inspired by Leonardo da Vinci",
      data: {}, // Would load from JSON
    },
    {
      id: "shadow-play",
      name: "Shadow Play Portrait",
      category: "Noir Atmosphere",
      description: "Dramatic use of shadow and light to create mystery",
      data: {}, // Would load from JSON
    },
    {
      id: "celestial-body",
      name: "Celestial Body",
      category: "Mystical Realms",
      description: "Transform into a cosmic entity with stellar elements",
      data: {}, // Would load from JSON
    },
  ]);

  const [sliderConfigs] = useState([
    {
      id: "lighting-intensity",
      label: "Lighting Intensity",
      min: 0,
      max: 2,
      step: 0.01,
      value: 1.0,
      category: "lighting",
      description: "Controls the overall intensity of all light sources",
    },
    {
      id: "shadow-depth",
      label: "Shadow Depth",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.7,
      category: "lighting",
      description: "Adjusts the darkness and contrast of shadows",
    },
    {
      id: "color-saturation",
      label: "Color Saturation",
      min: 0,
      max: 2,
      step: 0.01,
      value: 1.0,
      category: "color",
      description: "Controls the vibrancy and intensity of colors",
    },
    {
      id: "atmosphere-density",
      label: "Atmosphere Density",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.3,
      category: "atmosphere",
      description: "Adjusts fog and atmospheric particle density",
    },
    {
      id: "material-smoothness",
      label: "Surface Smoothness",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.8,
      category: "material",
      description: "Controls skin and surface material smoothness",
    },
  ]);

  useEffect(() => {
    if (isVerified && canvasRef.current) {
      masterRenderer.current = new MasterRenderer(canvasRef.current);
      aestheticEngine.current = new AestheticEngine();
    }
  }, [isVerified]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setActiveView("editor");
  };

  const handleImageUpload = async (file: File) => {
    try {
      const uploadedImage = await imageUploadService.uploadImage(file);
      setUploadedImages((prev) => [uploadedImage, ...prev]);
      setSelectedImage(uploadedImage);

      // If we have a canvas, apply the image to it
      if (canvasRef.current && uploadedImage) {
        await imageUploadService.convertImageToCanvas(
          uploadedImage.id,
          canvasRef.current,
        );
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      // You could add a notification here
    }
  };

  const handleSliderChange = (id: string, value: number) => {
    // Update render config based on slider changes
    const newConfig = { ...renderConfig };

    switch (id) {
      case "lighting-intensity":
        if (!newConfig.lighting) newConfig.lighting = {};
        newConfig.lighting.primaryLight = {
          ...newConfig.lighting.primaryLight,
          intensity: value,
        };
        break;
      // Add more cases for other sliders
    }

    setRenderConfig(newConfig);

    // Re-render if we have a renderer
    if (masterRenderer.current && selectedTemplate) {
      renderTemplate();
    }
  };

  const renderTemplate = async () => {
    if (
      !masterRenderer.current ||
      !aestheticEngine.current ||
      !selectedTemplate
    )
      return;

    // Apply aesthetic profile if available
    const profile = aestheticEngine.current.getProfile(selectedTemplate.id);
    if (profile && canvasRef.current) {
      aestheticEngine.current.applyAesthetic(
        profile,
        canvasRef.current,
        masterIntensity,
      );
    }

    // Render with current config
    if (renderConfig.lighting) {
      masterRenderer.current.updateConfig(renderConfig);
      await masterRenderer.current.renderScene([]);
    }
  };

  const handlePreview = () => {
    setActiveView("preview");
    renderTemplate();
  };

  if (!isVerified) {
    return <AdultGateAdvanced onVerified={() => setIsVerified(true)} />;
  }

  return (
    <div className="elysian-canvas-main">
      <div className="canvas-header">
        <div className="header-left">
          <h1 className="canvas-title">✨ Elysian Canvas</h1>
          <p className="canvas-subtitle">Art for the Discerning Adult</p>
        </div>
        <div className="header-right">
          <div className="view-tabs">
            <button
              onClick={() => setActiveView("gallery")}
              className={`view-tab ${activeView === "gallery" ? "active" : ""}`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveView("editor")}
              className={`view-tab ${activeView === "editor" ? "active" : ""}`}
              disabled={!selectedTemplate}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={`view-tab ${activeView === "preview" ? "active" : ""}`}
              disabled={!selectedTemplate}
            >
              Preview
            </button>
          </div>
          {onClose && (
            <button onClick={onClose} className="close-button">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="canvas-content">
        {activeView === "gallery" && (
          <EnhancedGallery
            onTemplateSelect={handleTemplateSelect}
            onImageUpload={handleImageUpload}
          />
        )}

        {activeView === "editor" && selectedTemplate && (
          <div className="editor-view">
            <div className="editor-header">
              <h2>Artistic Control Panel</h2>
              <p>Fine-tune every aspect of your artistic vision</p>
            </div>

            <div className="editor-layout">
              <div className="controls-panel">
                <MasterSlider
                  configs={sliderConfigs}
                  onValueChange={handleSliderChange}
                  masterIntensity={masterIntensity}
                  onMasterIntensityChange={setMasterIntensity}
                  preset={selectedTemplate.name}
                />
              </div>

              <div className="preview-panel">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="preview-canvas"
                />
                <div className="preview-controls">
                  <button onClick={handlePreview} className="render-button">
                    🎨 Render Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "preview" && selectedTemplate && (
          <div className="preview-view">
            <div className="preview-header">
              <h2>Final Artistic Vision</h2>
              <p>
                {selectedTemplate.name} - {selectedTemplate.category}
              </p>
            </div>

            <div className="preview-container">
              <canvas
                ref={canvasRef}
                width={1200}
                height={900}
                className="final-canvas"
              />
            </div>

            <div className="preview-actions">
              <button
                onClick={() => setActiveView("editor")}
                className="edit-button"
              >
                ← Back to Editor
              </button>
              <button className="export-button">💾 Export Artwork</button>
              <button className="save-button">⭐ Save to Gallery</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .elysian-canvas-main {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.95) 0%, 
            rgba(20, 20, 40, 0.98) 50%, 
            rgba(40, 20, 60, 0.95) 100%);
          backdrop-filter: blur(20px);
          z-index: 8888;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .canvas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .header-left {
          display: flex;
          flex-direction: column;
        }

        .canvas-title {
          font-size: 2rem;
          background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          font-weight: 700;
        }

        .canvas-subtitle {
          color: rgba(255, 255, 255, 0.7);
          margin: 5px 0 0 0;
          font-style: italic;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .view-tabs {
          display: flex;
          gap: 8px;
        }

        .view-tab {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-tab.active {
          background: rgba(78, 205, 196, 0.2);
          border-color: rgba(78, 205, 196, 0.4);
          color: #4ecdc4;
        }

        .view-tab:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .view-tab:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .close-button {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: #ff6b6b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 107, 107, 0.3);
          transform: scale(1.1);
        }

        .canvas-content {
          flex: 1;
          overflow-y: auto;
          padding: 30px;
        }

        .gallery-view {
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .gallery-header h2 {
          color: white;
          font-size: 2rem;
          margin: 0 0 10px 0;
        }

        .gallery-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          margin: 0;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .template-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .template-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .template-preview {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 4rem;
          color: white;
          font-weight: bold;
        }

        .template-info h3 {
          color: white;
          margin: 0 0 8px 0;
          font-size: 1.3rem;
        }

        .template-category {
          color: #4ecdc4;
          margin: 0 0 12px 0;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .template-description {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          line-height: 1.5;
        }

        .editor-view, .preview-view {
          max-width: 1400px;
          margin: 0 auto;
        }

        .editor-header, .preview-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .editor-header h2, .preview-header h2 {
          color: white;
          font-size: 1.8rem;
          margin: 0 0 8px 0;
        }

        .editor-header p, .preview-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .editor-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 30px;
          height: calc(100vh - 200px);
        }

        .controls-panel {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          overflow: hidden;
        }

        .preview-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .preview-canvas, .final-canvas {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 100%;
        }

        .preview-canvas {
          height: 450px;
        }

        .final-canvas {
          height: 600px;
        }

        .preview-controls {
          display: flex;
          justify-content: center;
        }

        .render-button {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 12px;
          color: white;
          padding: 12px 24px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .render-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
        }

        .preview-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .preview-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .edit-button, .export-button, .save-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          padding: 12px 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .export-button {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
        }

        .save-button {
          background: linear-gradient(45deg, #ffd700, #ffb347);
          color: #333;
        }

        .edit-button:hover, .export-button:hover, .save-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        /* Scrollbar styling */
        .canvas-content::-webkit-scrollbar {
          width: 8px;
        }

        .canvas-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .canvas-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .canvas-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ElysianCanvas;
