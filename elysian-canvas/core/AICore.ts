import { InferenceSession, Tensor } from "onnxruntime-web";

export interface AIModel {
  id: string;
  name: string;
  type: "pose" | "style-transfer" | "upscaling" | "diffusion" | "enhancement";
  modelPath: string;
  inputShape: number[];
  outputShape: number[];
  isLoaded: boolean;
  session?: InferenceSession;
  metadata: {
    description: string;
    requirements: {
      memory: number; // MB
      gpu: boolean;
    };
    performance: {
      speed: "fast" | "medium" | "slow";
      quality: "basic" | "good" | "excellent";
    };
  };
}

export interface PoseData {
  keypoints: Array<{
    x: number;
    y: number;
    confidence: number;
    name: string;
  }>;
  skeleton: Array<[number, number]>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface StyleTransferOptions {
  styleStrength: number;
  preserveColors: boolean;
  blendMode: "normal" | "multiply" | "overlay";
}

export class AICore {
  private static instance: AICore;
  private models: Map<string, AIModel> = new Map();
  private isInitialized: boolean = false;
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor() {
    this.initializeModels();
  }

  public static getInstance(): AICore {
    if (!AICore.instance) {
      AICore.instance = new AICore();
    }
    return AICore.instance;
  }

  private initializeModels(): void {
    // Pose estimation models
    this.registerModel({
      id: "pose-estimation-light",
      name: "Lightweight Pose Estimation",
      type: "pose",
      modelPath: "/elysian-canvas/models/pose-models/pose-light.onnx",
      inputShape: [1, 3, 368, 368],
      outputShape: [1, 17, 46, 46],
      isLoaded: false,
      metadata: {
        description: "Fast pose detection for real-time editing",
        requirements: {
          memory: 50,
          gpu: false,
        },
        performance: {
          speed: "fast",
          quality: "good",
        },
      },
    });

    // Style transfer models
    this.registerModel({
      id: "artistic-style-classic",
      name: "Classic Artistic Style Transfer",
      type: "style-transfer",
      modelPath:
        "/elysian-canvas/models/style-transfer-models/classic-art.onnx",
      inputShape: [1, 3, 512, 512],
      outputShape: [1, 3, 512, 512],
      isLoaded: false,
      metadata: {
        description: "Transform images with classical art styles",
        requirements: {
          memory: 200,
          gpu: true,
        },
        performance: {
          speed: "medium",
          quality: "excellent",
        },
      },
    });

    // Upscaling models
    this.registerModel({
      id: "real-esrgan-x2",
      name: "Real-ESRGAN 2x Upscaler",
      type: "upscaling",
      modelPath: "/elysian-canvas/models/upscaling-models/real-esrgan-x2.onnx",
      inputShape: [1, 3, 512, 512],
      outputShape: [1, 3, 1024, 1024],
      isLoaded: false,
      metadata: {
        description: "High-quality 2x image upscaling",
        requirements: {
          memory: 300,
          gpu: true,
        },
        performance: {
          speed: "slow",
          quality: "excellent",
        },
      },
    });

    // Enhancement models
    this.registerModel({
      id: "portrait-enhancer",
      name: "Portrait Enhancement AI",
      type: "enhancement",
      modelPath:
        "/elysian-canvas/models/enhancement-models/portrait-enhance.onnx",
      inputShape: [1, 3, 512, 512],
      outputShape: [1, 3, 512, 512],
      isLoaded: false,
      metadata: {
        description: "AI-powered portrait enhancement and beautification",
        requirements: {
          memory: 150,
          gpu: false,
        },
        performance: {
          speed: "medium",
          quality: "excellent",
        },
      },
    });
  }

  private registerModel(model: AIModel): void {
    this.models.set(model.id, model);
  }

  public async loadModel(modelId: string): Promise<void> {
    if (this.loadingPromises.has(modelId)) {
      return this.loadingPromises.get(modelId);
    }

    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    if (model.isLoaded) {
      return Promise.resolve();
    }

    const loadPromise = this.loadModelInternal(model);
    this.loadingPromises.set(modelId, loadPromise);

    try {
      await loadPromise;
      model.isLoaded = true;
      this.loadingPromises.delete(modelId);
    } catch (error) {
      this.loadingPromises.delete(modelId);
      throw error;
    }
  }

  private async loadModelInternal(model: AIModel): Promise<void> {
    try {
      console.log(`Loading AI model: ${model.name}`);

      // Configure execution providers based on requirements
      const executionProviders = model.metadata.requirements.gpu
        ? ["webgl", "wasm"]
        : ["wasm"];

      model.session = await InferenceSession.create(model.modelPath, {
        executionProviders,
        graphOptimizationLevel: "all",
        enableMemPattern: true,
        enableCpuMemArena: true,
      });

      console.log(`Model ${model.name} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load model ${model.name}:`, error);
      throw new Error(`Failed to load model ${model.name}: ${error}`);
    }
  }

  public async detectPose(imageData: ImageData): Promise<PoseData> {
    const modelId = "pose-estimation-light";
    await this.loadModel(modelId);

    const model = this.models.get(modelId)!;
    if (!model.session) {
      throw new Error("Model session not available");
    }

    try {
      // Preprocess image
      const inputTensor = this.preprocessImageForPose(
        imageData,
        model.inputShape,
      );

      // Run inference
      const feeds = { input: inputTensor };
      const results = await model.session.run(feeds);

      // Postprocess results
      const outputTensor = results.output;
      return this.postprocessPoseResults(
        outputTensor,
        imageData.width,
        imageData.height,
      );
    } catch (error) {
      console.error("Pose detection failed:", error);
      throw error;
    }
  }

  private preprocessImageForPose(
    imageData: ImageData,
    inputShape: number[],
  ): Tensor {
    const [, , height, width] = inputShape;

    // Create canvas for preprocessing
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    // Resize image to model input size
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.drawImage(tempCanvas, 0, 0, width, height);
    const resizedImageData = ctx.getImageData(0, 0, width, height);

    // Convert to tensor format [1, 3, H, W] with normalized values
    const tensor = new Float32Array(1 * 3 * height * width);
    const data = resizedImageData.data;

    for (let i = 0; i < height * width; i++) {
      const pixelIndex = i * 4;
      const tensorIndex = i;

      // Normalize to [-1, 1] and convert BGR to RGB
      tensor[tensorIndex] = (data[pixelIndex] / 255.0) * 2.0 - 1.0; // R
      tensor[tensorIndex + height * width] =
        (data[pixelIndex + 1] / 255.0) * 2.0 - 1.0; // G
      tensor[tensorIndex + 2 * height * width] =
        (data[pixelIndex + 2] / 255.0) * 2.0 - 1.0; // B
    }

    return new Tensor("float32", tensor, [1, 3, height, width]);
  }

  private postprocessPoseResults(
    outputTensor: Tensor,
    originalWidth: number,
    originalHeight: number,
  ): PoseData {
    const data = outputTensor.data as Float32Array;
    const [, numKeypoints, outputHeight, outputWidth] = outputTensor.dims;

    const keypoints = [];
    const confidenceThreshold = 0.3;

    // COCO pose keypoint names
    const keypointNames = [
      "nose",
      "left_eye",
      "right_eye",
      "left_ear",
      "right_ear",
      "left_shoulder",
      "right_shoulder",
      "left_elbow",
      "right_elbow",
      "left_wrist",
      "right_wrist",
      "left_hip",
      "right_hip",
      "left_knee",
      "right_knee",
      "left_ankle",
      "right_ankle",
    ];

    for (let k = 0; k < numKeypoints; k++) {
      let maxConfidence = 0;
      let maxX = 0;
      let maxY = 0;

      // Find the position with maximum confidence for this keypoint
      for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidth; x++) {
          const index = k * outputHeight * outputWidth + y * outputWidth + x;
          const confidence = data[index];

          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            maxX = x;
            maxY = y;
          }
        }
      }

      if (maxConfidence > confidenceThreshold) {
        keypoints.push({
          x: (maxX / outputWidth) * originalWidth,
          y: (maxY / outputHeight) * originalHeight,
          confidence: maxConfidence,
          name: keypointNames[k] || `keypoint_${k}`,
        });
      }
    }

    // Define skeleton connections
    const skeleton: Array<[number, number]> = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4], // Head
      [5, 6],
      [5, 7],
      [7, 9],
      [6, 8],
      [8, 10], // Arms
      [5, 11],
      [6, 12],
      [11, 12], // Torso
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16], // Legs
    ];

    // Calculate bounding box
    let minX = originalWidth,
      minY = originalHeight,
      maxX = 0,
      maxY = 0;
    keypoints.forEach((kp) => {
      minX = Math.min(minX, kp.x);
      minY = Math.min(minY, kp.y);
      maxX = Math.max(maxX, kp.x);
      maxY = Math.max(maxY, kp.y);
    });

    return {
      keypoints,
      skeleton,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    };
  }

  public async applyStyleTransfer(
    imageData: ImageData,
    styleId: string,
    options: StyleTransferOptions = {
      styleStrength: 1.0,
      preserveColors: false,
      blendMode: "normal",
    },
  ): Promise<ImageData> {
    const modelId = "artistic-style-classic";
    await this.loadModel(modelId);

    const model = this.models.get(modelId)!;
    if (!model.session) {
      throw new Error("Style transfer model not available");
    }

    try {
      // Preprocess image
      const inputTensor = this.preprocessImageForStyleTransfer(
        imageData,
        model.inputShape,
      );

      // Run inference
      const feeds = {
        content_image: inputTensor,
        style_strength: new Tensor("float32", [options.styleStrength], [1]),
      };
      const results = await model.session.run(feeds);

      // Postprocess results
      return this.postprocessStyleTransferResults(
        results.output,
        imageData,
        options,
      );
    } catch (error) {
      console.error("Style transfer failed:", error);
      throw error;
    }
  }

  private preprocessImageForStyleTransfer(
    imageData: ImageData,
    inputShape: number[],
  ): Tensor {
    const [, , height, width] = inputShape;

    // Similar preprocessing as pose detection but with different normalization
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.drawImage(tempCanvas, 0, 0, width, height);
    const resizedImageData = ctx.getImageData(0, 0, width, height);

    const tensor = new Float32Array(1 * 3 * height * width);
    const data = resizedImageData.data;

    // Normalize to [0, 1] for style transfer
    for (let i = 0; i < height * width; i++) {
      const pixelIndex = i * 4;
      tensor[i] = data[pixelIndex] / 255.0; // R
      tensor[i + height * width] = data[pixelIndex + 1] / 255.0; // G
      tensor[i + 2 * height * width] = data[pixelIndex + 2] / 255.0; // B
    }

    return new Tensor("float32", tensor, [1, 3, height, width]);
  }

  private postprocessStyleTransferResults(
    outputTensor: Tensor,
    originalImageData: ImageData,
    options: StyleTransferOptions,
  ): ImageData {
    const data = outputTensor.data as Float32Array;
    const [, , height, width] = outputTensor.dims;

    // Create result canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = originalImageData.width;
    canvas.height = originalImageData.height;

    // Convert tensor back to image data
    const resultImageData = new ImageData(width, height);
    const resultData = resultImageData.data;

    for (let i = 0; i < height * width; i++) {
      const pixelIndex = i * 4;

      // Denormalize from [0, 1] to [0, 255]
      resultData[pixelIndex] = Math.max(0, Math.min(255, data[i] * 255)); // R
      resultData[pixelIndex + 1] = Math.max(
        0,
        Math.min(255, data[i + height * width] * 255),
      ); // G
      resultData[pixelIndex + 2] = Math.max(
        0,
        Math.min(255, data[i + 2 * height * width] * 255),
      ); // B
      resultData[pixelIndex + 3] = 255; // A
    }

    // Scale back to original size
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.putImageData(resultImageData, 0, 0);

    ctx.drawImage(
      tempCanvas,
      0,
      0,
      originalImageData.width,
      originalImageData.height,
    );

    return ctx.getImageData(
      0,
      0,
      originalImageData.width,
      originalImageData.height,
    );
  }

  public async upscaleImage(
    imageData: ImageData,
    scale: number = 2,
  ): Promise<ImageData> {
    const modelId = "real-esrgan-x2";
    await this.loadModel(modelId);

    const model = this.models.get(modelId)!;
    if (!model.session) {
      throw new Error("Upscaling model not available");
    }

    // For now, return a simple upscaled version
    // In production, this would use the actual ESRGAN model
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = imageData.width * scale;
    canvas.height = imageData.height * scale;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  public getAvailableModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  public getModelStatus(modelId: string): {
    isLoaded: boolean;
    isLoading: boolean;
  } {
    const model = this.models.get(modelId);
    return {
      isLoaded: model?.isLoaded || false,
      isLoading: this.loadingPromises.has(modelId),
    };
  }

  public async unloadModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (model && model.session) {
      await model.session.release();
      model.isLoaded = false;
      model.session = undefined;
    }
  }

  public async unloadAllModels(): Promise<void> {
    const unloadPromises = Array.from(this.models.keys()).map((id) =>
      this.unloadModel(id),
    );
    await Promise.all(unloadPromises);
  }
}

export const aiCore = AICore.getInstance();
