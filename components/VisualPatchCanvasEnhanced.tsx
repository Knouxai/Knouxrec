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

interface BrushStroke {
  id: string;
  points: Point2D[];
  tool: VisualPatchTool;
  settings: ToolSettings;
  timestamp: number;
}

interface ImageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
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
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point2D | null>(null);
  const [currentBrushStroke, setCurrentBrushStroke] =
    useState<BrushStroke | null>(null);
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  });

  // Load and setup image
  useEffect(() => {
    if (
      !canvasRef.current ||
      !overlayCanvasRef.current ||
      (!originalImage && !currentImage)
    )
      return;

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!ctx || !overlayCtx) return;

    const img = new Image();
    img.onload = () => {
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
      overlayCanvas.width = newWidth;
      overlayCanvas.height = newHeight;
      setCanvasSize({ width: newWidth, height: newHeight });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Store original image data for undo/redo
      originalImageDataRef.current = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      saveToUndoStack();

      setImageLoaded(true);
    };

    const imageToLoad = showBeforeAfter ? originalImage : currentImage;
    if (imageToLoad) {
      img.src = imageToLoad;
    }
  }, [originalImage, currentImage, showBeforeAfter]);

  // Undo/Redo management
  const saveToUndoStack = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imageData);

    // Limit undo stack size
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }

    // Clear redo stack when new action is performed
    redoStackRef.current = [];
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current state to redo stack
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStackRef.current.push(currentData);

    // Remove current state from undo stack
    undoStackRef.current.pop();

    // Apply previous state
    const previousData = undoStackRef.current[undoStackRef.current.length - 1];
    ctx.putImageData(previousData, 0, 0);
  }, []);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || redoStackRef.current.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current state to undo stack
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(currentData);

    // Apply redo state
    const redoData = redoStackRef.current.pop()!;
    ctx.putImageData(redoData, 0, 0);
  }, []);

  // Coordinate transformation
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

  // Drawing functions
  const drawBrushStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      point: Point2D,
      tool: VisualPatchTool,
      toolSettings: ToolSettings,
    ) => {
      if (!lastPoint) return;

      ctx.save();

      // Set brush properties
      ctx.globalCompositeOperation =
        tool.editMode === "erase" ? "destination-out" : "source-over";
      ctx.globalAlpha = toolSettings.intensity / 100;
      ctx.lineWidth = toolSettings.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Apply tool-specific effects
      switch (tool.id) {
        case "brush_manual":
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          break;
        case "smooth_tool":
          ctx.filter = "blur(1px)";
          ctx.strokeStyle = "rgba(200, 200, 255, 0.6)";
          break;
        case "sharpen_tool":
          ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
          break;
        default:
          ctx.strokeStyle = tool.previewColor;
      }

      // Draw line
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      // Apply special effects based on tool
      if (tool.editMode === "warp") {
        applyWarpEffect(ctx, point, toolSettings);
      } else if (tool.editMode === "pinch") {
        applyPinchEffect(ctx, point, toolSettings);
      }

      ctx.restore();
    },
    [lastPoint],
  );

  const applyWarpEffect = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      center: Point2D,
      toolSettings: ToolSettings,
    ) => {
      const radius = toolSettings.brushSize / 2;
      const strength = toolSettings.intensity / 100;

      const imageData = ctx.getImageData(
        Math.max(0, center.x - radius),
        Math.max(0, center.y - radius),
        Math.min(ctx.canvas.width, radius * 2),
        Math.min(ctx.canvas.height, radius * 2),
      );

      // Apply warp transformation
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - radius;
          const dy = y - radius;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < radius) {
            const factor = (1 - distance / radius) * strength;
            const angle = Math.atan2(dy, dx);
            const warpX = x + Math.cos(angle) * factor * 5;
            const warpY = y + Math.sin(angle) * factor * 5;

            if (warpX >= 0 && warpX < width && warpY >= 0 && warpY < height) {
              const sourceIndex =
                (Math.floor(warpY) * width + Math.floor(warpX)) * 4;
              const targetIndex = (y * width + x) * 4;

              data[targetIndex] = data[sourceIndex];
              data[targetIndex + 1] = data[sourceIndex + 1];
              data[targetIndex + 2] = data[sourceIndex + 2];
              data[targetIndex + 3] = data[sourceIndex + 3];
            }
          }
        }
      }

      ctx.putImageData(imageData, center.x - radius, center.y - radius);
    },
    [],
  );

  const applyPinchEffect = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      center: Point2D,
      toolSettings: ToolSettings,
    ) => {
      const radius = toolSettings.brushSize / 2;
      const strength = toolSettings.intensity / 200; // Reduced strength for pinch

      const imageData = ctx.getImageData(
        Math.max(0, center.x - radius),
        Math.max(0, center.y - radius),
        Math.min(ctx.canvas.width, radius * 2),
        Math.min(ctx.canvas.height, radius * 2),
      );

      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const centerX = radius;
      const centerY = radius;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < radius && distance > 0) {
            const factor = Math.pow(1 - distance / radius, 2) * strength;
            const pinchDistance = distance * (1 - factor);
            const angle = Math.atan2(dy, dx);

            const sourceX = centerX + Math.cos(angle) * pinchDistance;
            const sourceY = centerY + Math.sin(angle) * pinchDistance;

            if (
              sourceX >= 0 &&
              sourceX < width &&
              sourceY >= 0 &&
              sourceY < height
            ) {
              const sourceIndex =
                (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
              const targetIndex = (y * width + x) * 4;

              data[targetIndex] = data[sourceIndex];
              data[targetIndex + 1] = data[sourceIndex + 1];
              data[targetIndex + 2] = data[sourceIndex + 2];
              data[targetIndex + 3] = data[sourceIndex + 3];
            }
          }
        }
      }

      ctx.putImageData(imageData, center.x - radius, center.y - radius);
    },
    [],
  );

  // Real-time filter application
  const applyRealTimeFilter = useCallback(
    (point: Point2D, tool: VisualPatchTool, toolSettings: ToolSettings) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const radius = toolSettings.brushSize / 2;
      const imageData = ctx.getImageData(
        Math.max(0, point.x - radius),
        Math.max(0, point.y - radius),
        Math.min(canvas.width, radius * 2),
        Math.min(canvas.height, radius * 2),
      );

      const data = imageData.data;
      const centerX = point.x - Math.max(0, point.x - radius);
      const centerY = point.y - Math.max(0, point.y - radius);

      for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= radius) {
            const falloff = 1 - distance / radius;
            const strength = (toolSettings.intensity / 100) * falloff;
            const index = (y * imageData.width + x) * 4;

            switch (tool.id) {
              case "brighten_tool":
                data[index] = Math.min(255, data[index] + strength * 50);
                data[index + 1] = Math.min(
                  255,
                  data[index + 1] + strength * 50,
                );
                data[index + 2] = Math.min(
                  255,
                  data[index + 2] + strength * 50,
                );
                break;
              case "darken_tool":
                data[index] = Math.max(0, data[index] - strength * 50);
                data[index + 1] = Math.max(0, data[index + 1] - strength * 50);
                data[index + 2] = Math.max(0, data[index + 2] - strength * 50);
                break;
              case "saturate_tool":
                const gray =
                  0.299 * data[index] +
                  0.587 * data[index + 1] +
                  0.114 * data[index + 2];
                data[index] = gray + strength * (data[index] - gray);
                data[index + 1] = gray + strength * (data[index + 1] - gray);
                data[index + 2] = gray + strength * (data[index + 2] - gray);
                break;
              case "smooth_tool":
                // Apply blur effect
                const blurRadius = Math.ceil(strength * 3);
                if (blurRadius > 0) {
                  const r = data[index];
                  const g = data[index + 1];
                  const b = data[index + 2];
                  data[index] = r * (1 - strength * 0.3);
                  data[index + 1] = g * (1 - strength * 0.3);
                  data[index + 2] = b * (1 - strength * 0.3);
                }
                break;
            }
          }
        }
      }

      ctx.putImageData(
        imageData,
        Math.max(0, point.x - radius),
        Math.max(0, point.y - radius),
      );
    },
    [],
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedTool || isProcessing || !imageLoaded) return;

      const point = getCanvasPoint(event);
      if (!point) return;

      if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
        // Middle mouse or Ctrl+click for panning
        setIsPanning(true);
        return;
      }

      setIsDrawing(true);
      setLastPoint(point);

      // Start new brush stroke
      const newStroke: BrushStroke = {
        id: `stroke-${Date.now()}`,
        points: [point],
        tool: selectedTool,
        settings: { ...settings },
        timestamp: Date.now(),
      };
      setCurrentBrushStroke(newStroke);

      onCanvasStateChange({
        isDrawing: true,
        currentTool: selectedTool.id,
      });

      // Apply initial point for certain tools
      if (
        selectedTool.editMode === "brush" ||
        selectedTool.editMode === "erase"
      ) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            drawBrushStroke(ctx, point, selectedTool, settings);
          }
        }
      }
    },
    [
      selectedTool,
      isProcessing,
      imageLoaded,
      getCanvasPoint,
      settings,
      onCanvasStateChange,
      drawBrushStroke,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const point = getCanvasPoint(event);
      if (!point) return;

      // Update cursor preview
      drawCursorPreview(point);

      if (isPanning) {
        // Handle panning (future implementation)
        return;
      }

      if (!isDrawing || !selectedTool || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Add point to current stroke
      if (currentBrushStroke) {
        const updatedStroke = {
          ...currentBrushStroke,
          points: [...currentBrushStroke.points, point],
        };
        setCurrentBrushStroke(updatedStroke);
      }

      // Apply drawing effect
      if (
        selectedTool.editMode === "brush" ||
        selectedTool.editMode === "erase"
      ) {
        drawBrushStroke(ctx, point, selectedTool, settings);
      } else if (
        [
          "brighten_tool",
          "darken_tool",
          "saturate_tool",
          "smooth_tool",
        ].includes(selectedTool.id)
      ) {
        applyRealTimeFilter(point, selectedTool, settings);
      } else if (
        selectedTool.editMode === "warp" ||
        selectedTool.editMode === "pinch"
      ) {
        if (selectedTool.editMode === "warp") {
          applyWarpEffect(ctx, point, settings);
        } else {
          applyPinchEffect(ctx, point, settings);
        }
      }

      setLastPoint(point);
    },
    [
      isDrawing,
      isPanning,
      selectedTool,
      currentBrushStroke,
      settings,
      getCanvasPoint,
      drawBrushStroke,
      applyRealTimeFilter,
      applyWarpEffect,
      applyPinchEffect,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !selectedTool) return;

    setIsDrawing(false);
    setLastPoint(null);

    // Finalize brush stroke
    if (currentBrushStroke) {
      setBrushStrokes((prev) => [...prev, currentBrushStroke]);
      setCurrentBrushStroke(null);

      // Save to undo stack
      saveToUndoStack();

      // Create edit region for the stroke
      const region: EditRegion = {
        id: currentBrushStroke.id,
        points: currentBrushStroke.points,
        intensity: settings.intensity,
        brushSize: settings.brushSize,
        feather: settings.feather,
      };

      onRegionComplete([region]);
    }

    onCanvasStateChange({
      isDrawing: false,
      currentTool: null,
    });
  }, [
    isPanning,
    isDrawing,
    selectedTool,
    currentBrushStroke,
    settings,
    saveToUndoStack,
    onRegionComplete,
    onCanvasStateChange,
  ]);

  // Cursor preview
  const drawCursorPreview = useCallback(
    (point: Point2D) => {
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas || !selectedTool) return;

      const ctx = overlayCanvas.getContext("2d");
      if (!ctx) return;

      // Clear overlay
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // Draw brush preview
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = selectedTool.previewColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.arc(point.x, point.y, settings.brushSize / 2, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw feather preview
      if (settings.feather > 0) {
        ctx.globalAlpha = 0.3;
        ctx.setLineDash([2, 2]);
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

  const getCursor = (): string => {
    if (!selectedTool) return "default";
    if (isPanning) return "grabbing";

    switch (selectedTool.editMode) {
      case "brush":
      case "erase":
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
      {/* Main Canvas */}
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

      {/* Overlay Canvas for Cursor Preview */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
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

      {/* Action Buttons */}
      {imageLoaded && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={undo}
            disabled={undoStackRef.current.length < 2}
            className="glass-card p-2 rounded-lg text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="تراجع (Ctrl+Z)"
          >
            ↶ تراجع
          </button>
          <button
            onClick={redo}
            disabled={redoStackRef.current.length === 0}
            className="glass-card p-2 rounded-lg text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="إعادة (Ctrl+Y)"
          >
            ↷ إعادة
          </button>
        </div>
      )}

      {/* Before/After Indicator */}
      {imageLoaded && (
        <div className="absolute bottom-4 center glass-card p-2 rounded-lg">
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
            <br />
            الضربات: {brushStrokes.length}
          </div>
        </div>
      )}

      {/* Drawing Status */}
      {isDrawing && currentBrushStroke && (
        <div className="absolute top-1/2 left-4 glass-card p-2 rounded-lg">
          <div className="text-xs text-white/80">
            🎨 جار الرسم...
            <br />
            النقاط: {currentBrushStroke.points.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualPatchCanvas;
