import React, { useState, useEffect, useRef, useCallback } from "react";
import { AdultGateAdvanced } from "./core/AdultGateAdvanced";
import { MasterRenderer, RenderConfig } from "./core/MasterRenderer";
import { AestheticEngine } from "./core/AestheticEngine";
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

interface ImageFilter {
  id: string;
  name: string;
  function: (imageData: ImageData) => ImageData;
}

export const ElysianCanvas: React.FC<ElysianCanvasProps> = ({ onClose }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<
    "upload" | "gallery" | "editor" | "preview"
  >("upload");
  const [renderConfig, setRenderConfig] = useState<Partial<RenderConfig>>({});
  const [masterIntensity, setMasterIntensity] = useState(1.0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null,
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const masterRenderer = useRef<MasterRenderer | null>(null);
  const aestheticEngine = useRef<AestheticEngine | null>(null);

  // Image editing tools state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);
  const [opacity, setOpacity] = useState(100);

  // Sample templates
  const [templates] = useState<Template[]>([
    {
      id: "vitruvian-form",
      name: "Vitruvian Form",
      category: "Body as Sculpture",
      description:
        "Perfect geometric proportions inspired by Leonardo da Vinci",
      data: {},
    },
    {
      id: "shadow-play",
      name: "Shadow Play Portrait",
      category: "Noir Atmosphere",
      description: "Dramatic use of shadow and light to create mystery",
      data: {},
    },
    {
      id: "celestial-body",
      name: "Celestial Body",
      category: "Mystical Realms",
      description: "Transform into a cosmic entity with stellar elements",
      data: {},
    },
    {
      id: "renaissance-beauty",
      name: "Renaissance Beauty",
      category: "Classical Art",
      description: "Timeless elegance with Renaissance-inspired aesthetics",
      data: {},
    },
    {
      id: "abstract-form",
      name: "Abstract Form",
      category: "Modern Art",
      description: "Contemporary artistic expression with abstract elements",
      data: {},
    },
  ]);

  // Image filters
  const [imageFilters] = useState<ImageFilter[]>([
    {
      id: "vintage",
      name: "Vintage",
      function: (imageData: ImageData) => {
        // Apply vintage filter logic
        return imageData;
      },
    },
    {
      id: "noir",
      name: "Film Noir",
      function: (imageData: ImageData) => {
        // Apply noir filter logic
        return imageData;
      },
    },
    {
      id: "dreamy",
      name: "Dreamy",
      function: (imageData: ImageData) => {
        // Apply dreamy filter logic
        return imageData;
      },
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

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsProcessing(true);

    try {
      const uploadedImage = await imageUploadService.uploadImage(file);
      setUploadedImages((prev) => [uploadedImage, ...prev]);
      setSelectedImage(uploadedImage);

      // Display image on canvas
      if (imageCanvasRef.current) {
        await displayImageOnCanvas(uploadedImage);
      }

      setActiveView("editor");
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Display image on canvas
  const displayImageOnCanvas = async (image: UploadedImage) => {
    if (!imageCanvasRef.current) return;

    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
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

      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, width, height);

      // Apply current filters
      applyImageFilters();
    };

    img.src = image.url;
  };

  // Apply image filters
  const applyImageFilters = () => {
    if (!imageCanvasRef.current || !selectedImage) return;

    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply CSS filters
    canvas.style.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      hue-rotate(${hue}deg)
      blur(${blur}px)
      sepia(${sepia}%)
      invert(${invert}%)
      opacity(${opacity}%)
    `;
  };

  // Reset filters
  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setSepia(0);
    setInvert(0);
    setOpacity(100);
  };

  // Download edited image
  const downloadImage = () => {
    if (!imageCanvasRef.current) return;

    const canvas = imageCanvasRef.current;
    const link = document.createElement("a");
    link.download = `elysian-edit-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setActiveView("editor");
  };

  const handleSliderChange = (id: string, value: number) => {
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

    const profile = aestheticEngine.current.getProfile(selectedTemplate.id);
    if (profile && canvasRef.current) {
      aestheticEngine.current.applyAesthetic(
        profile,
        canvasRef.current,
        masterIntensity,
      );
    }

    if (renderConfig.lighting) {
      masterRenderer.current.updateConfig(renderConfig);
      await masterRenderer.current.renderScene([]);
    }
  };

  const handlePreview = () => {
    setActiveView("preview");
    renderTemplate();
  };

  // Apply filters on change
  useEffect(() => {
    applyImageFilters();
  }, [brightness, contrast, saturation, hue, blur, sepia, invert, opacity]);

  if (!isVerified) {
    return <AdultGateAdvanced onVerified={() => setIsVerified(true)} />;
  }

  return (
    <div className="elysian-canvas-main">
      <div className="canvas-header">
        <div className="header-left">
          <h1 className="canvas-title">✨ Elysian Canvas Studio</h1>
          <p className="canvas-subtitle">
            Professional Art Creation & Editing Suite
          </p>
        </div>
        <div className="header-right">
          <div className="view-tabs">
            <button
              onClick={() => setActiveView("upload")}
              className={`view-tab ${activeView === "upload" ? "active" : ""}`}
            >
              📁 Upload
            </button>
            <button
              onClick={() => setActiveView("gallery")}
              className={`view-tab ${activeView === "gallery" ? "active" : ""}`}
            >
              🖼️ Gallery
            </button>
            <button
              onClick={() => setActiveView("editor")}
              className={`view-tab ${activeView === "editor" ? "active" : ""}`}
              disabled={!selectedImage && !selectedTemplate}
            >
              🎨 Editor
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={`view-tab ${activeView === "preview" ? "active" : ""}`}
              disabled={!selectedImage && !selectedTemplate}
            >
              👁️ Preview
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
        {/* Upload View */}
        {activeView === "upload" && (
          <div className="upload-view">
            <div className="upload-header">
              <h2>🎭 Upload Your Artistic Vision</h2>
              <p>Drag and drop your images or click to select files</p>
            </div>

            <div
              className={`upload-zone ${isDragOver ? "drag-over" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                style={{ display: "none" }}
              />

              {isProcessing ? (
                <div className="upload-processing">
                  <div className="loading-spinner"></div>
                  <p>Processing your masterpiece...</p>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon">🎨</div>
                  <h3>Drop Your Art Here</h3>
                  <p>Supports JPG, PNG, GIF, WebP</p>
                  <button className="upload-button">📁 Choose Files</button>
                </div>
              )}
            </div>

            {/* Recent uploads */}
            {uploadedImages.length > 0 && (
              <div className="recent-uploads">
                <h3>🖼️ Recent Uploads</h3>
                <div className="uploads-grid">
                  {uploadedImages.slice(0, 6).map((image) => (
                    <div
                      key={image.id}
                      className="upload-thumbnail"
                      onClick={() => {
                        setSelectedImage(image);
                        displayImageOnCanvas(image);
                        setActiveView("editor");
                      }}
                    >
                      <img src={image.url} alt={image.metadata.name} />
                      <div className="thumbnail-overlay">
                        <span>{image.metadata.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick start templates */}
            <div className="quick-templates">
              <h3>🎭 Quick Start Templates</h3>
              <div className="templates-grid">
                {templates.slice(0, 3).map((template) => (
                  <div
                    key={template.id}
                    className="template-card small"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="template-preview">🎨</div>
                    <div className="template-info">
                      <h4>{template.name}</h4>
                      <p>{template.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gallery View */}
        {activeView === "gallery" && (
          <EnhancedGallery
            onTemplateSelect={handleTemplateSelect}
            onImageUpload={handleFileUpload}
          />
        )}

        {/* Editor View */}
        {activeView === "editor" && (selectedImage || selectedTemplate) && (
          <div className="editor-view">
            <div className="editor-header">
              <h2>🎨 Creative Studio</h2>
              <p>Transform your vision with professional tools</p>
            </div>

            <div className="editor-layout">
              {/* Left Panel - Tools */}
              <div className="tools-panel">
                <div className="tool-section">
                  <h3>🔧 Image Controls</h3>

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
                    <label>Hue Rotate</label>
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
                </div>

                <div className="tool-section">
                  <h3>🎭 Quick Filters</h3>
                  <div className="filter-buttons">
                    {imageFilters.map((filter) => (
                      <button
                        key={filter.id}
                        className="filter-button"
                        onClick={() => {
                          // Apply quick filter
                          console.log("Applying filter:", filter.name);
                        }}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tool-section">
                  <h3>⚡ Actions</h3>
                  <div className="action-buttons">
                    <button
                      onClick={resetFilters}
                      className="action-button reset"
                    >
                      🔄 Reset
                    </button>
                    <button
                      onClick={downloadImage}
                      className="action-button download"
                    >
                      ��� Download
                    </button>
                    <button
                      onClick={handlePreview}
                      className="action-button preview"
                    >
                      👁️ Preview
                    </button>
                  </div>
                </div>

                {/* Template controls if template is selected */}
                {selectedTemplate && (
                  <div className="tool-section">
                    <h3>🎨 Template Controls</h3>
                    <MasterSlider
                      configs={sliderConfigs}
                      onValueChange={handleSliderChange}
                      masterIntensity={masterIntensity}
                      onMasterIntensityChange={setMasterIntensity}
                      preset={selectedTemplate.name}
                    />
                  </div>
                )}
              </div>

              {/* Center Panel - Canvas */}
              <div className="canvas-panel">
                <div className="canvas-container">
                  <canvas
                    ref={imageCanvasRef}
                    width={800}
                    height={600}
                    className="main-canvas"
                  />

                  {selectedTemplate && (
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className="template-canvas"
                    />
                  )}
                </div>

                <div className="canvas-info">
                  {selectedImage && (
                    <div className="image-info">
                      <span>📸 {selectedImage.name}</span>
                      <span>
                        📏 {selectedImage.width}x{selectedImage.height}
                      </span>
                      <span>💾 {Math.round(selectedImage.size / 1024)}KB</span>
                    </div>
                  )}
                  {selectedTemplate && (
                    <div className="template-info">
                      <span>🎭 {selectedTemplate.name}</span>
                      <span>📂 {selectedTemplate.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview View */}
        {activeView === "preview" && (selectedImage || selectedTemplate) && (
          <div className="preview-view">
            <div className="preview-header">
              <h2>👁️ Final Preview</h2>
              <p>Your artistic masterpiece ready for the world</p>
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
                className="action-button edit"
              >
                ← Back to Editor
              </button>
              <button onClick={downloadImage} className="action-button export">
                💾 Export Masterpiece
              </button>
              <button className="action-button save">⭐ Save to Gallery</button>
              <button
                onClick={() => {
                  if (navigator.share && selectedImage) {
                    navigator.share({
                      title: "Elysian Canvas Creation",
                      text: "Check out my artistic creation!",
                      url: selectedImage.url,
                    });
                  }
                }}
                className="action-button share"
              >
                🌐 Share
              </button>
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
          font-family: 'Arial', sans-serif;
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
          font-size: 14px;
        }

        .view-tab.active {
          background: rgba(78, 205, 196, 0.2);
          border-color: rgba(78, 205, 196, 0.4);
          color: #4ecdc4;
          transform: translateY(-2px);
        }

        .view-tab:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
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

        /* Upload View Styles */
        .upload-view {
          max-width: 1200px;
          margin: 0 auto;
        }

        .upload-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .upload-header h2 {
          color: white;
          font-size: 2.5rem;
          margin: 0 0 10px 0;
          font-weight: 600;
        }

        .upload-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.2rem;
          margin: 0;
        }

        .upload-zone {
          border: 3px dashed rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 80px 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
          margin-bottom: 50px;
        }

        .upload-zone.drag-over {
          border-color: #4ecdc4;
          background: rgba(78, 205, 196, 0.1);
          transform: scale(1.02);
        }

        .upload-zone:hover {
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.05);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .upload-icon {
          font-size: 5rem;
          opacity: 0.7;
        }

        .upload-content h3 {
          color: white;
          font-size: 2rem;
          margin: 0;
          font-weight: 500;
        }

        .upload-content p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          font-size: 1.1rem;
        }

        .upload-button {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 15px;
          color: white;
          padding: 15px 30px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
        }

        .upload-processing {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid #4ecdc4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .recent-uploads {
          margin-bottom: 50px;
        }

        .recent-uploads h3 {
          color: white;
          font-size: 1.5rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .uploads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .upload-thumbnail {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .upload-thumbnail:hover {
          transform: scale(1.05);
          border-color: #4ecdc4;
        }

        .upload-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: white;
          padding: 15px 10px 10px;
          font-size: 12px;
          font-weight: 500;
        }

        .quick-templates h3 {
          color: white;
          font-size: 1.5rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .template-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
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

        .template-card.small {
          padding: 15px;
        }

        .template-preview {
          width: 100%;
          height: 120px;
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          font-size: 3rem;
          color: white;
          font-weight: bold;
        }

        .template-card.small .template-preview {
          height: 80px;
          font-size: 2rem;
        }

        .template-info h3,
        .template-info h4 {
          color: white;
          margin: 0 0 8px 0;
          font-size: 1.2rem;
        }

        .template-info p {
          color: #4ecdc4;
          margin: 0;
          font-weight: 500;
          font-size: 0.9rem;
        }

        /* Editor View Styles */
        .editor-view {
          max-width: 1600px;
          margin: 0 auto;
        }

        .editor-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .editor-header h2 {
          color: white;
          font-size: 2rem;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .editor-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 1.1rem;
        }

        .editor-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 30px;
          height: calc(100vh - 250px);
        }

        .tools-panel {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tool-section {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tool-section:last-child {
          border-bottom: none;
        }

        .tool-section h3 {
          color: white;
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .control-group label {
          color: rgba(255, 255, 255, 0.8);
          min-width: 80px;
          font-size: 14px;
        }

        .slider {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #4ecdc4;
          border-radius: 50%;
          cursor: pointer;
        }

        .control-group span {
          color: #4ecdc4;
          min-width: 50px;
          text-align: right;
          font-size: 12px;
          font-weight: 500;
        }

        .filter-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          padding: 10px 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .filter-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #4ecdc4;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-button {
          border: none;
          border-radius: 10px;
          color: white;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 14px;
        }

        .action-button.reset {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
        }

        .action-button.download {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .action-button.preview {
          background: linear-gradient(45deg, #ffd700, #ffb347);
          color: #333;
        }

        .action-button.edit {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-button.export {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
        }

        .action-button.save {
          background: linear-gradient(45deg, #ffd700, #ffb347);
          color: #333;
        }

        .action-button.share {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .canvas-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .canvas-container {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 600px;
        }

        .main-canvas,
        .template-canvas {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
        }

        .template-canvas {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.8;
          mix-blend-mode: overlay;
        }

        .canvas-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .image-info,
        .template-info {
          display: flex;
          gap: 15px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .image-info span,
        .template-info span {
          background: rgba(255, 255, 255, 0.05);
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Preview View Styles */
        .preview-view {
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
        }

        .preview-header {
          margin-bottom: 30px;
        }

        .preview-header h2 {
          color: white;
          font-size: 2rem;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .preview-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 1.1rem;
        }

        .preview-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .final-canvas {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          max-width: 100%;
          height: auto;
        }

        .preview-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* Scrollbar styling */
        .canvas-content::-webkit-scrollbar,
        .tools-panel::-webkit-scrollbar {
          width: 8px;
        }

        .canvas-content::-webkit-scrollbar-track,
        .tools-panel::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .canvas-content::-webkit-scrollbar-thumb,
        .tools-panel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .canvas-content::-webkit-scrollbar-thumb:hover,
        .tools-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .editor-layout {
            grid-template-columns: 300px 1fr;
          }
        }

        @media (max-width: 768px) {
          .canvas-header {
            padding: 15px 20px;
          }
          
          .canvas-title {
            font-size: 1.5rem;
          }
          
          .view-tabs {
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .view-tab {
            padding: 8px 12px;
            font-size: 12px;
          }
          
          .editor-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .tools-panel {
            max-height: 300px;
          }
          
          .upload-zone {
            padding: 40px 20px;
          }
          
          .upload-header h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ElysianCanvas;
