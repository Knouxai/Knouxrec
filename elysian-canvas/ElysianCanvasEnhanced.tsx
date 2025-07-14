import React, { useState, useEffect, useRef, useCallback } from "react";
import { AdultGateAdvanced } from "./core/AdultGateAdvanced";
import { MasterRenderer, RenderConfig } from "./core/MasterRenderer";
import { AestheticEngine, AestheticProfile } from "./core/AestheticEngine";
import { MasterSlider } from "./editor-ui/MasterSlider";
import { EnhancedGallery } from "./components/EnhancedGallery";
import { ImageEditingTools } from "./components/ImageEditingTools";
import {
  imageUploadService,
  UploadedImage,
} from "./services/ImageUploadService";
import CanvasEffectsService, {
  FilterOptions,
} from "../services/canvasEffectsService";

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

interface DrawingTool {
  id: string;
  name: string;
  icon: string;
  cursor: string;
  blendMode?: GlobalCompositeOperation;
  opacity?: number;
}

interface BrushSettings {
  size: number;
  opacity: number;
  hardness: number;
  flow: number;
  spacing: number;
  pressure: boolean;
  blendMode: GlobalCompositeOperation;
}

interface DrawingStroke {
  id: string;
  tool: string;
  points: Array<{ x: number; y: number; pressure?: number }>;
  settings: BrushSettings;
  timestamp: number;
}

export const ElysianCanvas: React.FC<ElysianCanvasProps> = ({ onClose }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<
    "upload" | "gallery" | "editor" | "preview" | "drawing"
  >("upload");
  const [renderConfig, setRenderConfig] = useState<Partial<RenderConfig>>({});
  const [masterIntensity, setMasterIntensity] = useState(1.0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null,
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(
    null,
  );
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [selectedDrawingTool, setSelectedDrawingTool] =
    useState<DrawingTool | null>(null);
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    size: 20,
    opacity: 100,
    hardness: 100,
    flow: 100,
    spacing: 10,
    pressure: false,
    blendMode: "source-over",
  });

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const masterRenderer = useRef<MasterRenderer | null>(null);
  const aestheticEngine = useRef<AestheticEngine | null>(null);
  const effectsService = useRef<CanvasEffectsService>(
    CanvasEffectsService.getInstance(),
  );

  // Undo/Redo stacks
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);

  // Image editing tools state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);
  const [opacity, setOpacity] = useState(100);

  // Drawing tools
  const drawingTools: DrawingTool[] = [
    { id: "brush", name: "فرشاة", icon: "🖌️", cursor: "crosshair" },
    { id: "pencil", name: "قلم رصاص", icon: "✏️", cursor: "crosshair" },
    {
      id: "eraser",
      name: "ممحاة",
      icon: "🧽",
      cursor: "crosshair",
      blendMode: "destination-out",
    },
    { id: "smudge", name: "تلطيخ", icon: "👆", cursor: "grab" },
    { id: "blur", name: "ضبابية", icon: "🌫️", cursor: "crosshair" },
    { id: "sharpen", name: "وضو��", icon: "🔍", cursor: "crosshair" },
    {
      id: "dodge",
      name: "إضاءة",
      icon: "☀️",
      cursor: "crosshair",
      blendMode: "color-dodge",
    },
    {
      id: "burn",
      name: "إظلام",
      icon: "🌙",
      cursor: "crosshair",
      blendMode: "color-burn",
    },
    { id: "clone", name: "استنساخ", icon: "📋", cursor: "copy" },
    { id: "heal", name: "شفاء", icon: "❤️", cursor: "crosshair" },
  ];

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

  // Setup drawing canvas
  useEffect(() => {
    if (drawingCanvasRef.current && imageCanvasRef.current) {
      const drawingCanvas = drawingCanvasRef.current;
      const imageCanvas = imageCanvasRef.current;

      drawingCanvas.width = imageCanvas.width;
      drawingCanvas.height = imageCanvas.height;

      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = imageCanvas.width;
        overlayCanvasRef.current.height = imageCanvas.height;
      }
    }
  }, [selectedImage]);

  // Get canvas coordinates
  const getCanvasCoordinates = useCallback(
    (event: React.MouseEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  // Drawing functions
  const startDrawing = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedDrawingTool || !drawingCanvasRef.current) return;

      const canvas = drawingCanvasRef.current;
      const coords = getCanvasCoordinates(event, canvas);

      setIsDrawing(true);

      const newStroke: DrawingStroke = {
        id: `stroke-${Date.now()}`,
        tool: selectedDrawingTool.id,
        points: [coords],
        settings: { ...brushSettings },
        timestamp: Date.now(),
      };

      setCurrentStroke(newStroke);

      // Apply initial point for certain tools
      if (
        selectedDrawingTool.id === "brush" ||
        selectedDrawingTool.id === "pencil"
      ) {
        drawPoint(coords, selectedDrawingTool, brushSettings);
      }
    },
    [selectedDrawingTool, brushSettings, getCanvasCoordinates],
  );

  const continueDrawing = useCallback(
    (event: React.MouseEvent) => {
      if (
        !isDrawing ||
        !selectedDrawingTool ||
        !drawingCanvasRef.current ||
        !currentStroke
      )
        return;

      const canvas = drawingCanvasRef.current;
      const coords = getCanvasCoordinates(event, canvas);

      // Update current stroke
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, coords],
      };
      setCurrentStroke(updatedStroke);

      // Draw line from last point to current point
      const lastPoint = currentStroke.points[currentStroke.points.length - 1];
      drawLine(lastPoint, coords, selectedDrawingTool, brushSettings);

      // Apply special effects based on tool
      switch (selectedDrawingTool.id) {
        case "blur":
          applyBlurEffect(coords, brushSettings.size);
          break;
        case "sharpen":
          applySharpenEffect(coords, brushSettings.size);
          break;
        case "smudge":
          applySmudgeEffect(lastPoint, coords, brushSettings.size);
          break;
        case "clone":
          applyCloneEffect(coords, brushSettings.size);
          break;
        case "heal":
          applyHealEffect(coords, brushSettings.size);
          break;
      }
    },
    [
      isDrawing,
      selectedDrawingTool,
      currentStroke,
      brushSettings,
      getCanvasCoordinates,
    ],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);

    // Save to undo stack
    saveToUndoStack();
  }, [isDrawing, currentStroke]);

  // Drawing helper functions
  const drawPoint = useCallback(
    (
      point: { x: number; y: number },
      tool: DrawingTool,
      settings: BrushSettings,
    ) => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.globalCompositeOperation = tool.blendMode || settings.blendMode;
      ctx.globalAlpha = settings.opacity / 100;
      ctx.fillStyle = getCurrentColor();

      ctx.beginPath();
      ctx.arc(point.x, point.y, settings.size / 2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    },
    [],
  );

  const drawLine = useCallback(
    (
      from: { x: number; y: number },
      to: { x: number; y: number },
      tool: DrawingTool,
      settings: BrushSettings,
    ) => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.globalCompositeOperation = tool.blendMode || settings.blendMode;
      ctx.globalAlpha = settings.opacity / 100;
      ctx.strokeStyle = getCurrentColor();
      ctx.lineWidth = settings.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      ctx.restore();
    },
    [],
  );

  const getCurrentColor = useCallback(() => {
    // This would normally come from a color picker
    return "#ffffff";
  }, []);

  // Effect application functions
  const applyBlurEffect = useCallback(
    (point: { x: number; y: number }, size: number) => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const radius = size / 2;
      const imageData = ctx.getImageData(
        Math.max(0, point.x - radius),
        Math.max(0, point.y - radius),
        Math.min(canvas.width, radius * 2),
        Math.min(canvas.height, radius * 2),
      );

      const blurredData = effectsService.current.applyGaussianBlur(
        imageData,
        2,
      );
      ctx.putImageData(blurredData, point.x - radius, point.y - radius);
    },
    [],
  );

  const applySharpenEffect = useCallback(
    (point: { x: number; y: number }, size: number) => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const radius = size / 2;
      const imageData = ctx.getImageData(
        Math.max(0, point.x - radius),
        Math.max(0, point.y - radius),
        Math.min(canvas.width, radius * 2),
        Math.min(canvas.height, radius * 2),
      );

      const sharpenedData = effectsService.current.applyConvolution(
        imageData,
        "sharpen",
      );
      ctx.putImageData(sharpenedData, point.x - radius, point.y - radius);
    },
    [],
  );

  const applySmudgeEffect = useCallback(
    (
      from: { x: number; y: number },
      to: { x: number; y: number },
      size: number,
    ) => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const radius = size / 2;

      // Get image data from source point
      const sourceData = ctx.getImageData(
        Math.max(0, from.x - radius),
        Math.max(0, from.y - radius),
        radius * 2,
        radius * 2,
      );

      // Apply it to destination point with some blending
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.putImageData(sourceData, to.x - radius, to.y - radius);
      ctx.restore();
    },
    [],
  );

  const applyCloneEffect = useCallback(
    (point: { x: number; y: number }, size: number) => {
      // Clone effect would require a source point selection
      // This is a simplified version
      console.log("Clone effect applied at", point);
    },
    [],
  );

  const applyHealEffect = useCallback(
    (point: { x: number; y: number }, size: number) => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const radius = size / 2;
      const imageData = ctx.getImageData(
        Math.max(0, point.x - radius),
        Math.max(0, point.y - radius),
        Math.min(canvas.width, radius * 2),
        Math.min(canvas.height, radius * 2),
      );

      const healedData = effectsService.current.applySkinSmoothing(
        imageData,
        50,
      );
      ctx.putImageData(healedData, point.x - radius, point.y - radius);
    },
    [],
  );

  // Undo/Redo functionality
  const saveToUndoStack = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.current.push(imageData);

    // Limit stack size
    if (undoStack.current.length > 50) {
      undoStack.current.shift();
    }

    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length < 2) return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStack.current.push(currentData);

    undoStack.current.pop();
    const previousData = undoStack.current[undoStack.current.length - 1];
    ctx.putImageData(previousData, 0, 0);
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.current.push(currentData);

    const redoData = redoStack.current.pop()!;
    ctx.putImageData(redoData, 0, 0);
  }, []);

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

      setActiveView("drawing");
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
      const maxWidth = 1200;
      const maxHeight = 800;

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

      // Update canvas size
      canvas.width = width;
      canvas.height = height;

      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);

      // Setup drawing canvas
      if (drawingCanvasRef.current) {
        drawingCanvasRef.current.width = width;
        drawingCanvasRef.current.height = height;
        saveToUndoStack();
      }

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

    // Create composite canvas
    const compositeCanvas = document.createElement("canvas");
    const compositeCtx = compositeCanvas.getContext("2d");
    if (!compositeCtx) return;

    compositeCanvas.width = imageCanvasRef.current.width;
    compositeCanvas.height = imageCanvasRef.current.height;

    // Draw base image
    compositeCtx.drawImage(imageCanvasRef.current, 0, 0);

    // Draw drawing layer if it exists
    if (drawingCanvasRef.current) {
      compositeCtx.drawImage(drawingCanvasRef.current, 0, 0);
    }

    const link = document.createElement("a");
    link.download = `elysian-edit-${Date.now()}.png`;
    link.href = compositeCanvas.toDataURL();
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        (event.ctrlKey && event.key === "y") ||
        (event.ctrlKey && event.shiftKey && event.key === "Z")
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

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
              onClick={() => setActiveView("drawing")}
              className={`view-tab ${activeView === "drawing" ? "active" : ""}`}
              disabled={!selectedImage}
            >
              🖌️ Drawing
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
                        setActiveView("drawing");
                      }}
                    >
                      <img src={image.url} alt={image.name} />
                      <div className="thumbnail-overlay">
                        <span>{image.name}</span>
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

        {/* Drawing View */}
        {activeView === "drawing" && selectedImage && (
          <div className="drawing-view">
            <div className="drawing-header">
              <h2>🖌️ Digital Drawing Studio</h2>
              <p>Professional drawing tools for artistic expression</p>
            </div>

            <div className="drawing-layout">
              {/* Left Panel - Drawing Tools */}
              <div className="tools-panel">
                <div className="tool-section">
                  <h3>🎨 Drawing Tools</h3>
                  <div className="drawing-tools-grid">
                    {drawingTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedDrawingTool(tool)}
                        className={`drawing-tool ${selectedDrawingTool?.id === tool.id ? "active" : ""}`}
                        title={tool.name}
                      >
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-name">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tool-section">
                  <h3>🔧 Brush Settings</h3>

                  <div className="control-group">
                    <label>Size</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={brushSettings.size}
                      onChange={(e) =>
                        setBrushSettings((prev) => ({
                          ...prev,
                          size: Number(e.target.value),
                        }))
                      }
                      className="slider"
                    />
                    <span>{brushSettings.size}px</span>
                  </div>

                  <div className="control-group">
                    <label>Opacity</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={brushSettings.opacity}
                      onChange={(e) =>
                        setBrushSettings((prev) => ({
                          ...prev,
                          opacity: Number(e.target.value),
                        }))
                      }
                      className="slider"
                    />
                    <span>{brushSettings.opacity}%</span>
                  </div>

                  <div className="control-group">
                    <label>Hardness</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={brushSettings.hardness}
                      onChange={(e) =>
                        setBrushSettings((prev) => ({
                          ...prev,
                          hardness: Number(e.target.value),
                        }))
                      }
                      className="slider"
                    />
                    <span>{brushSettings.hardness}%</span>
                  </div>

                  <div className="control-group">
                    <label>Flow</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={brushSettings.flow}
                      onChange={(e) =>
                        setBrushSettings((prev) => ({
                          ...prev,
                          flow: Number(e.target.value),
                        }))
                      }
                      className="slider"
                    />
                    <span>{brushSettings.flow}%</span>
                  </div>
                </div>

                <div className="tool-section">
                  <h3>⚡ Actions</h3>
                  <div className="action-buttons">
                    <button
                      onClick={undo}
                      disabled={undoStack.current.length < 2}
                      className="action-button undo"
                    >
                      ↶ Undo
                    </button>
                    <button
                      onClick={redo}
                      disabled={redoStack.current.length === 0}
                      className="action-button redo"
                    >
                      ↷ Redo
                    </button>
                    <button
                      onClick={() => {
                        const canvas = drawingCanvasRef.current;
                        if (canvas) {
                          const ctx = canvas.getContext("2d");
                          if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            setStrokes([]);
                            saveToUndoStack();
                          }
                        }
                      }}
                      className="action-button clear"
                    >
                      🗑️ Clear
                    </button>
                    <button
                      onClick={downloadImage}
                      className="action-button download"
                    >
                      💾 Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Center Panel - Drawing Canvas */}
              <div className="canvas-panel">
                <div className="drawing-canvas-container">
                  <canvas ref={imageCanvasRef} className="base-canvas" />

                  <canvas
                    ref={drawingCanvasRef}
                    className="drawing-canvas"
                    onMouseDown={startDrawing}
                    onMouseMove={continueDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{ cursor: selectedDrawingTool?.cursor || "default" }}
                  />

                  <canvas ref={overlayCanvasRef} className="overlay-canvas" />
                </div>

                <div className="canvas-info">
                  {selectedImage && (
                    <div className="image-info">
                      <span>📸 {selectedImage.name}</span>
                      <span>
                        📏 {selectedImage.width}x{selectedImage.height}
                      </span>
                      <span>💾 {Math.round(selectedImage.size / 1024)}KB</span>
                      <span>🎨 Strokes: {strokes.length}</span>
                    </div>
                  )}
                  {selectedDrawingTool && (
                    <div className="tool-info">
                      <span>🖌️ {selectedDrawingTool.name}</span>
                      <span>📏 {brushSettings.size}px</span>
                      <span>🌫️ {brushSettings.opacity}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor View - Keep existing editor code */}
        {activeView === "editor" && (selectedImage || selectedTemplate) && (
          <div className="editor-view">
            {/* Keep existing editor implementation */}
          </div>
        )}

        {/* Preview View - Keep existing preview code */}
        {activeView === "preview" && (selectedImage || selectedTemplate) && (
          <div className="preview-view">
            {/* Keep existing preview implementation */}
          </div>
        )}
      </div>

      <style>{`
        /* Keep all existing styles and add new drawing styles */
        
        .drawing-view {
          max-width: 1600px;
          margin: 0 auto;
        }

        .drawing-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .drawing-header h2 {
          color: white;
          font-size: 2rem;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .drawing-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 1.1rem;
        }

        .drawing-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 30px;
          height: calc(100vh - 300px);
        }

        .drawing-tools-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .drawing-tool {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: white;
        }

        .drawing-tool:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #4ecdc4;
          transform: translateY(-2px);
        }

        .drawing-tool.active {
          background: rgba(78, 205, 196, 0.2);
          border-color: #4ecdc4;
          color: #4ecdc4;
        }

        .tool-icon {
          font-size: 20px;
        }

        .tool-name {
          font-size: 10px;
          font-weight: 500;
        }

        .drawing-canvas-container {
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

        .base-canvas,
        .drawing-canvas,
        .overlay-canvas {
          position: absolute;
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
        }

        .drawing-canvas {
          z-index: 2;
        }

        .overlay-canvas {
          z-index: 3;
          pointer-events: none;
        }

        .action-button.undo,
        .action-button.redo {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .action-button.clear {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tool-info,
        .image-info {
          display: flex;
          gap: 15px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .tool-info span,
        .image-info span {
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Add all other existing styles here */
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

        .action-button.download {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .canvas-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .canvas-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        /* Upload view styles */
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

        /* Responsive Design */
        @media (max-width: 1200px) {
          .drawing-layout {
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
          
          .drawing-layout {
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
