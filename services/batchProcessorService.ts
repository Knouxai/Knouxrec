import {
  BatchProcessJob,
  ProcessingImage,
  ProcessingSettings,
  AIProcessingResult,
  FilterCriteria,
  DEFAULT_FILTER_CRITERIA,
} from "../types/aiBodyEditor";
import AIModelsService from "./aiModelsService";

interface BatchProcessorOptions {
  maxConcurrent: number;
  outputFormat: "png" | "jpg" | "webp";
  compressionQuality: number;
  preserveMetadata: boolean;
}

interface ProcessingProgress {
  jobId: string;
  current: number;
  total: number;
  currentFile: string;
  estimatedTimeRemaining: number;
  averageProcessingTime: number;
}

class BatchProcessorService {
  private static instance: BatchProcessorService;
  private activeJobs: Map<string, BatchProcessJob> = new Map();
  private processingQueue: string[] = [];
  private aiService: AIModelsService;
  private maxConcurrentJobs = 3;
  private processingCallbacks: Map<
    string,
    (progress: ProcessingProgress) => void
  > = new Map();

  static getInstance(): BatchProcessorService {
    if (!BatchProcessorService.instance) {
      BatchProcessorService.instance = new BatchProcessorService();
    }
    return BatchProcessorService.instance;
  }

  constructor() {
    this.aiService = AIModelsService.getInstance();
  }

  async createBatchJob(
    toolId: string,
    inputFolder: string,
    settings: ProcessingSettings,
    filterCriteria: FilterCriteria = DEFAULT_FILTER_CRITERIA,
  ): Promise<string> {
    const jobId = this.generateJobId();

    // Scan input folder for valid images
    const images = await this.scanInputFolder(inputFolder, filterCriteria);

    if (images.length === 0) {
      throw new Error("No valid images found in the specified folder");
    }

    const job: BatchProcessJob = {
      id: jobId,
      toolId,
      inputFolder,
      outputFolder: `outputs/ai_body_editor/${toolId}/${Date.now()}/`,
      images,
      settings,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
      errors: [],
    };

    this.activeJobs.set(jobId, job);
    this.processingQueue.push(jobId);

    // Start processing if not at max capacity
    this.processNextInQueue();

    return jobId;
  }

  private generateJobId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async scanInputFolder(
    folderPath: string,
    criteria: FilterCriteria,
  ): Promise<ProcessingImage[]> {
    // Simulate folder scanning (in real implementation, would use File API or Node.js fs)
    const mockImages: ProcessingImage[] = [];

    // Generate mock image data for demonstration
    for (let i = 1; i <= 10; i++) {
      const filename = `image_${i.toString().padStart(3, "0")}.jpg`;
      const image: ProcessingImage = {
        id: `img_${i}`,
        filename,
        path: `${folderPath}/${filename}`,
        size: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
        dimensions: {
          width: 1024 + Math.floor(Math.random() * 1024),
          height: 1024 + Math.floor(Math.random() * 1024),
        },
        processed: false,
      };

      // Apply filter criteria
      if (this.validateImage(image, criteria)) {
        mockImages.push(image);
      }
    }

    return mockImages;
  }

  private validateImage(
    image: ProcessingImage,
    criteria: FilterCriteria,
  ): boolean {
    // Check file size
    if (image.size > criteria.maxFileSize) return false;

    // Check resolution
    if (
      image.dimensions.width < criteria.minResolution.width ||
      image.dimensions.height < criteria.minResolution.height
    )
      return false;

    // Check format
    const extension = image.filename
      .toLowerCase()
      .substring(image.filename.lastIndexOf("."));
    if (!criteria.supportedFormats.includes(extension)) return false;

    return true;
  }

  private async processNextInQueue(): Promise<void> {
    const activeJobsCount = Array.from(this.activeJobs.values()).filter(
      (job) => job.status === "processing",
    ).length;

    if (
      activeJobsCount >= this.maxConcurrentJobs ||
      this.processingQueue.length === 0
    ) {
      return;
    }

    const jobId = this.processingQueue.shift()!;
    const job = this.activeJobs.get(jobId);

    if (!job) return;

    job.status = "processing";

    try {
      await this.processJob(job);
      job.status = "completed";
      job.completedAt = Date.now();
    } catch (error) {
      job.status = "failed";
      job.errors.push(error instanceof Error ? error.message : "Unknown error");
    }

    // Process next job in queue
    this.processNextInQueue();
  }

  private async processJob(job: BatchProcessJob): Promise<void> {
    const totalImages = job.images.length;
    let processedCount = 0;
    const processingTimes: number[] = [];

    for (const image of job.images) {
      try {
        const startTime = Date.now();

        // Load image data
        const imageData = await this.loadImageData(image.path);

        // Process with AI
        const result = await this.aiService.processImage(
          job.toolId,
          imageData,
          job.settings,
        );

        const processingTime = Date.now() - startTime;
        processingTimes.push(processingTime);

        if (result.success) {
          image.processed = true;
          image.outputPath = result.outputPath;
          image.processingTime = processingTime;

          // Save processed image
          await this.saveProcessedImage(
            result,
            job.outputFolder,
            image.filename,
          );
        } else {
          image.error = result.error;
          job.errors.push(`${image.filename}: ${result.error}`);
        }

        processedCount++;
        job.progress = Math.round((processedCount / totalImages) * 100);

        // Update progress callback
        const callback = this.processingCallbacks.get(job.id);
        if (callback) {
          const avgProcessingTime =
            processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
          const remainingImages = totalImages - processedCount;
          const estimatedTimeRemaining = remainingImages * avgProcessingTime;

          callback({
            jobId: job.id,
            current: processedCount,
            total: totalImages,
            currentFile: image.filename,
            estimatedTimeRemaining,
            averageProcessingTime: avgProcessingTime,
          });
        }
      } catch (error) {
        image.error =
          error instanceof Error ? error.message : "Processing failed";
        job.errors.push(`${image.filename}: ${image.error}`);
        processedCount++;
        job.progress = Math.round((processedCount / totalImages) * 100);
      }
    }
  }

  private async loadImageData(imagePath: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${imagePath}`));

      // For demo purposes, create synthetic image data
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;

      // Create gradient pattern
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "#ff6b6b");
      gradient.addColorStop(0.5, "#4ecdc4");
      gradient.addColorStop(1, "#45b7d1");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some noise for realism
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          2,
          2,
        );
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    });
  }

  private async saveProcessedImage(
    result: AIProcessingResult,
    outputFolder: string,
    filename: string,
  ): Promise<void> {
    // In a real implementation, this would save to the file system
    // For demo purposes, we'll simulate the save operation

    const outputFilename = `processed_${filename}`;
    const fullPath = `${outputFolder}${outputFilename}`;

    // Simulate file save delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`Saved processed image to: ${fullPath}`);
  }

  getJobStatus(jobId: string): BatchProcessJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getAllJobs(): BatchProcessJob[] {
    return Array.from(this.activeJobs.values());
  }

  getActiveJobs(): BatchProcessJob[] {
    return Array.from(this.activeJobs.values()).filter(
      (job) => job.status === "processing" || job.status === "pending",
    );
  }

  setProgressCallback(
    jobId: string,
    callback: (progress: ProcessingProgress) => void,
  ): void {
    this.processingCallbacks.set(jobId, callback);
  }

  removeProgressCallback(jobId: string): void {
    this.processingCallbacks.delete(jobId);
  }

  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;

    if (job.status === "pending") {
      // Remove from queue
      const queueIndex = this.processingQueue.indexOf(jobId);
      if (queueIndex !== -1) {
        this.processingQueue.splice(queueIndex, 1);
      }
      job.status = "failed";
      job.errors.push("Job cancelled by user");
      return true;
    }

    return false; // Cannot cancel job that's already processing
  }

  deleteJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;

    if (job.status === "processing") {
      return false; // Cannot delete active job
    }

    this.activeJobs.delete(jobId);
    this.processingCallbacks.delete(jobId);
    return true;
  }

  getJobStatistics(jobId: string): {
    totalImages: number;
    processedImages: number;
    failedImages: number;
    successRate: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
  } | null {
    const job = this.activeJobs.get(jobId);
    if (!job) return null;

    const totalImages = job.images.length;
    const processedImages = job.images.filter((img) => img.processed).length;
    const failedImages = job.images.filter((img) => img.error).length;
    const successRate =
      totalImages > 0 ? (processedImages / totalImages) * 100 : 0;

    const processingTimes = job.images
      .filter((img) => img.processingTime)
      .map((img) => img.processingTime!);

    const totalProcessingTime = processingTimes.reduce(
      (sum, time) => sum + time,
      0,
    );
    const averageProcessingTime =
      processingTimes.length > 0
        ? totalProcessingTime / processingTimes.length
        : 0;

    return {
      totalImages,
      processedImages,
      failedImages,
      successRate,
      totalProcessingTime,
      averageProcessingTime,
    };
  }

  getBatchProcessorStats(): {
    activeJobs: number;
    queuedJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalImagesProcessed: number;
    systemLoad: number;
  } {
    const jobs = Array.from(this.activeJobs.values());
    const activeJobs = jobs.filter((job) => job.status === "processing").length;
    const queuedJobs = this.processingQueue.length;
    const completedJobs = jobs.filter(
      (job) => job.status === "completed",
    ).length;
    const failedJobs = jobs.filter((job) => job.status === "failed").length;

    const totalImagesProcessed = jobs.reduce((total, job) => {
      return total + job.images.filter((img) => img.processed).length;
    }, 0);

    const systemLoad = (activeJobs / this.maxConcurrentJobs) * 100;

    return {
      activeJobs,
      queuedJobs,
      completedJobs,
      failedJobs,
      totalImagesProcessed,
      systemLoad,
    };
  }

  setMaxConcurrentJobs(max: number): void {
    this.maxConcurrentJobs = Math.max(1, Math.min(max, 10));
  }

  async exportJobResults(jobId: string): Promise<Blob> {
    const job = this.activeJobs.get(jobId);
    if (!job) throw new Error("Job not found");

    const stats = this.getJobStatistics(jobId)!;

    const reportData = {
      jobInfo: {
        id: job.id,
        toolId: job.toolId,
        inputFolder: job.inputFolder,
        outputFolder: job.outputFolder,
        status: job.status,
        createdAt: new Date(job.createdAt).toISOString(),
        completedAt: job.completedAt
          ? new Date(job.completedAt).toISOString()
          : null,
      },
      settings: job.settings,
      statistics: stats,
      images: job.images.map((img) => ({
        filename: img.filename,
        processed: img.processed,
        outputPath: img.outputPath,
        processingTime: img.processingTime,
        error: img.error,
      })),
      errors: job.errors,
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  }
}

export default BatchProcessorService;
