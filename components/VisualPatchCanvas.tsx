import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  VisualPatchTool,
  EditRegion,
  Point2D,
  ToolSettings,
  CanvasState,
} from "../types/visualPatchLab";

interface VisualPatchCanvasProps {
  selectedTool: VisualPatchTool | null;
  settings: ToolSettings;
  canvasState: CanvasState;
  onCanvasStateChange: (state: Partial<CanvasState>) => void;
  onRegionComplete: (regions: EditRegion[]) => void;
  isProcessing: boolean;
  showBeforeAfter: boolean;
  originalImage: string | null;
  currentImage: string | null;
}

const VisualPatchCanvas: React.FC<VisualPatchCanvasProps> = ({
  selectedTool,
  settings,
  canvasState,
  onCanvasStateChange,
  onRegionComplete,
  isProcessing,
  showBeforeAfter,
  originalImage,
  currentImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point2D[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Load image onto canvas
  useEffect(() => {
    if (!canvasRef.current || (!originalImage && !currentImage)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate canvas size maintaining aspect ratio
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 600;

      const aspectRatio = img.width / img.height;
      let newWidth = Math.min(containerWidth - 40, img.width);
      let newHeight = newWidth / aspectRatio;

      if (newHeight > containerHeight - 40) {
        newHeight = containerHeight - 40;
        newWidth = newHeight * aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      setCanvasSize({ width: newWidth, height: newHeight });

      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      setImageLoaded(true);
    };

    const imageToLoad = showBeforeAfter ? originalImage : currentImage;
    if (imageToLoad) {
      img.src = imageToLoad;
    }
  }, [originalImage, currentImage, showBeforeAfter]);

  // Handle canvas drawing
  const getCanvasPoint = useCallback(
    (event: React.MouseEvent): Point2D | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

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

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedTool || isProcessing || !imageLoaded) return;

      const point = getCanvasPoint(event);
      if (!point) return;

      setIsDrawing(true);
      setCurrentPoints([point]);

      onCanvasStateChange({
        isDrawing: true,
        currentTool: selectedTool.id,
      });
    },
    [
      selectedTool,
      isProcessing,
      imageLoaded,
      getCanvasPoint,
      onCanvasStateChange,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawing || !selectedTool || !canvasRef.current) return;

      const point = getCanvasPoint(event);
      if (!point) return;

      setCurrentPoints((prev) => [...prev, point]);

      // Draw preview if enabled
      if (settings.realTimePreview) {
        drawPreview(point);
      }
    },
    [isDrawing, selectedTool, settings.realTimePreview, getCanvasPoint],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !selectedTool || currentPoints.length === 0) return;

    setIsDrawing(false);

    // Create edit region
    const region: EditRegion = {
      id: `region-${Date.now()}`,
      points: currentPoints,
      intensity: settings.intensity,
      brushSize: settings.brushSize,
      feather: settings.feather,
    };

    // Apply symmetry if enabled
    const regions: EditRegion[] = [region];
    if (settings.symmetryEnabled && selectedTool.supportsSymmetry) {
      const symmetricRegion = createSymmetricRegion(region);
      if (symmetricRegion) {
        regions.push(symmetricRegion);
      }
    }

    onRegionComplete(regions);
    setCurrentPoints([]);

    onCanvasStateChange({
      isDrawing: false,
      currentTool: null,
    });
  }, [
    isDrawing,
    selectedTool,
    currentPoints,
    settings,
    onRegionComplete,
    onCanvasStateChange,
  ]);

  const drawPreview = useCallback(
    (point: Point2D) => {
      const canvas = canvasRef.current;
      if (!canvas || !selectedTool) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Save current state
      ctx.save();

      // Set preview style
      ctx.globalAlpha = selectedTool.overlayOpacity;
      ctx.fillStyle = selectedTool.previewColor;
      ctx.strokeStyle = selectedTool.previewColor;

      // Draw brush preview
      ctx.beginPath();
      ctx.arc(point.x, point.y, settings.brushSize / 2, 0, 2 * Math.PI);

      if (selectedTool.editMode === "brush") {
        ctx.fill();
      } else {
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw feather effect
      if (settings.feather > 0) {
        ctx.globalAlpha = selectedTool.overlayOpacity * 0.3;
        ctx.beginPath();
        ctx.arc(
          point.x,
          point.y,
          (settings.brushSize / 2) * (1 + settings.feather / 100),
          0,
          2 * Math.PI,
        );
        ctx.stroke();
      }

      ctx.restore();
    },
    [selectedTool, settings],
  );

  const createSymmetricRegion = useCallback(
    (region: EditRegion): EditRegion | null => {
      if (!canvasRef.current) return null;

      const canvas = canvasRef.current;
      const centerX = canvas.width / 2;

      const symmetricPoints = region.points.map((point) => ({
        x: centerX * 2 - point.x,
        y: point.y,
      }));

      return {
        ...region,
        id: `${region.id}-symmetric`,
        points: symmetricPoints,
      };
    },
    [],
  );

  // Draw guides and grid
  const drawGuides = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !settings.showGuides) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Center lines
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Third lines
    ctx.beginPath();
    ctx.moveTo(canvas.width / 3, 0);
    ctx.lineTo(canvas.width / 3, canvas.height);
    ctx.moveTo((canvas.width * 2) / 3, 0);
    ctx.lineTo((canvas.width * 2) / 3, canvas.height);
    ctx.moveTo(0, canvas.height / 3);
    ctx.lineTo(canvas.width, canvas.height / 3);
    ctx.moveTo(0, (canvas.height * 2) / 3);
    ctx.lineTo(canvas.width, (canvas.height * 2) / 3);
    ctx.stroke();

    ctx.restore();
  }, [settings.showGuides]);

  // Draw grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !settings.snapToGrid) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    const gridSize = 20;

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [settings.snapToGrid]);

  // Update canvas overlays
  useEffect(() => {
    if (!imageLoaded) return;

    // Redraw guides and grid after a short delay to avoid conflicts
    const timer = setTimeout(() => {
      drawGrid();
      drawGuides();
    }, 100);

    return () => clearTimeout(timer);
  }, [imageLoaded, drawGrid, drawGuides]);

  const getCursor = (): string => {
    if (!selectedTool) return "default";

    switch (selectedTool.editMode) {
      case "brush":
        return "crosshair";
      case "pinch":
        return "grab";
      case "warp":
        return "move";
      case "drag":
        return "move";
      case "mirror":
        return "copy";
      default:
        return "crosshair";
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-full border border-white/20 rounded-lg shadow-2xl ${
          isProcessing ? "pointer-events-none opacity-50" : ""
        }`}
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-xl text-center">
            <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-3" />
            <p className="text-white font-medium">جار تطبيق التأثير...</p>
          </div>
        </div>
      )}

      {/* No Image Placeholder */}
      {!originalImage && !currentImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/60">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-lg font-medium mb-2">لا توجد صورة محملة</p>
            <p className="text-sm">قم بتحميل صورة لبدء التحرير</p>
          </div>
        </div>
      )}

      {/* Tool Info Overlay */}
      {selectedTool && imageLoaded && (
        <div className="absolute top-4 left-4 glass-card p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedTool.icon}</span>
            <div>
              <p className="text-white font-medium text-sm">
                {selectedTool.nameAr}
              </p>
              <p className="text-white/70 text-xs">{selectedTool.editMode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Info */}
      {selectedTool && imageLoaded && (
        <div className="absolute top-4 right-4 glass-card p-3 rounded-lg">
          <div className="text-xs text-white/80 space-y-1">
            <div>شدة: {settings.intensity}%</div>
            <div>حجم: {settings.brushSize}px</div>
            <div>نعومة: {settings.feather}%</div>
            {settings.symmetryEnabled && (
              <div className="text-green-400">التماثل مفعل</div>
            )}
          </div>
        </div>
      )}

      {/* Before/After Indicator */}
      {imageLoaded && (
        <div className="absolute bottom-4 left-4 glass-card p-2 rounded-lg">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-2 py-1 rounded ${showBeforeAfter ? "bg-red-500/30 text-red-300" : "bg-green-500/30 text-green-300"}`}
            >
              {showBeforeAfter ? "قبل" : "بعد"}
            </span>
          </div>
        </div>
      )}

      {/* Canvas Info */}
      {imageLoaded && (
        <div className="absolute bottom-4 right-4 glass-card p-2 rounded-lg">
          <div className="text-xs text-white/60">
            {canvasSize.width} × {canvasSize.height}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualPatchCanvas;
