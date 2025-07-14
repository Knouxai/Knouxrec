export interface AIModel {
  id: string;
  name: string;
  path: string;
  type: "controlnet" | "animeganv3" | "openpose" | "gfpgan" | "stylemix";
  description: string;
  isLoaded: boolean;
}

export interface ProcessingSettings {
  intensity: "light" | "medium" | "strong";
  style: "standard" | "anime" | "realistic" | "stylemix";
  preserveDetails: boolean;
  blendEdges: boolean;
  autoBalance: boolean;
}

export interface BodyPart {
  id: string;
  name: string;
  nameAr: string;
  regions: Array<{ x: number; y: number; width: number; height: number }>;
  targetModels: string[];
}

export interface AIBodyTool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: string;
  icon: string;
  models: AIModel[];
  settings: ProcessingSettings;
  outputFolder: string;
  isOffline: boolean;
  requiresModel: boolean;
  targetBodyParts: BodyPart[];
}

export interface BatchProcessJob {
  id: string;
  toolId: string;
  inputFolder: string;
  outputFolder: string;
  images: ProcessingImage[];
  settings: ProcessingSettings;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: number;
  completedAt?: number;
  errors: string[];
}

export interface ProcessingImage {
  id: string;
  filename: string;
  path: string;
  size: number;
  dimensions: { width: number; height: number };
  processed: boolean;
  outputPath?: string;
  processingTime?: number;
  detectedFeatures?: DetectedFeature[];
  error?: string;
}

export interface DetectedFeature {
  type: "face" | "body" | "chest" | "waist" | "hips" | "sensitive";
  confidence: number;
  bounds: { x: number; y: number; width: number; height: number };
  keypoints?: Array<{ x: number; y: number; confidence: number }>;
}

export interface AIProcessingResult {
  success: boolean;
  outputPath?: string;
  processingTime: number;
  originalSize: { width: number; height: number };
  outputSize: { width: number; height: number };
  appliedEffects: string[];
  detectedFeatures: DetectedFeature[];
  error?: string;
  metadata: {
    model: string;
    settings: ProcessingSettings;
    timestamp: number;
  };
}

export interface ModelLoadStatus {
  modelId: string;
  isLoading: boolean;
  isLoaded: boolean;
  loadProgress: number;
  error?: string;
  loadTime?: number;
}

export interface FilterCriteria {
  femaleOnly: boolean;
  fullBodyOnly: boolean;
  minResolution: { width: number; height: number };
  maxFileSize: number;
  supportedFormats: string[];
  requiresNSFWDetection: boolean;
}

export const AI_BODY_TOOLS: AIBodyTool[] = [
  {
    id: "chest_resize",
    name: "Chest Resize",
    nameAr: "تعديل الصدر",
    description: "تكبير أو تصغير الصدر وفق نماذج متعددة",
    category: "chest",
    icon: "🩱",
    models: [
      {
        id: "controlnet_chest",
        name: "ControlNet Chest",
        path: "models/controlnet_sd15_canny.pth",
        type: "controlnet",
        description: "ControlNet model for precise chest editing",
        isLoaded: false,
      },
    ],
    settings: {
      intensity: "medium",
      style: "realistic",
      preserveDetails: true,
      blendEdges: true,
      autoBalance: true,
    },
    outputFolder: "outputs/ai_body_editor/chest_resize/",
    isOffline: true,
    requiresModel: true,
    targetBodyParts: [
      {
        id: "chest_region",
        name: "Chest Area",
        nameAr: "منطقة الصدر",
        regions: [{ x: 0.3, y: 0.2, width: 0.4, height: 0.3 }],
        targetModels: ["controlnet_chest"],
      },
    ],
  },
  {
    id: "waist_slimmer",
    name: "Waist Slimmer",
    nameAr: "تنحيف الخصر",
    description: "تنحيف أو توسيع الخصر باستخدام OpenPose + DepthMap",
    category: "waist",
    icon: "⏳",
    models: [
      {
        id: "openpose_refiner",
        name: "OpenPose Refiner",
        path: "models/openpose_refiner.onnx",
        type: "openpose",
        description: "Advanced pose-based waist modification",
        isLoaded: false,
      },
    ],
    settings: {
      intensity: "medium",
      style: "realistic",
      preserveDetails: true,
      blendEdges: true,
      autoBalance: true,
    },
    outputFolder: "outputs/ai_body_editor/waist_slimmer/",
    isOffline: true,
    requiresModel: true,
    targetBodyParts: [
      {
        id: "waist_region",
        name: "Waist Area",
        nameAr: "منطقة الخصر",
        regions: [{ x: 0.25, y: 0.4, width: 0.5, height: 0.2 }],
        targetModels: ["openpose_refiner"],
      },
    ],
  },
  {
    id: "hip_reshape",
    name: "Hip Reshape",
    nameAr: "تحسين الأرداف",
    description: "تحسين شكل الأرداف أو تعديلها باستخدام PoseEditor",
    category: "hips",
    icon: "🍑",
    models: [
      {
        id: "pose_editor",
        name: "Pose Editor",
        path: "models/pose_editor.pt",
        type: "openpose",
        description: "Specialized hip and thigh reshaping model",
        isLoaded: false,
      },
    ],
    settings: {
      intensity: "medium",
      style: "realistic",
      preserveDetails: true,
      blendEdges: true,
      autoBalance: true,
    },
    outputFolder: "outputs/ai_body_editor/hip_reshape/",
    isOffline: true,
    requiresModel: true,
    targetBodyParts: [
      {
        id: "hip_region",
        name: "Hip Area",
        nameAr: "منطقة الأرداف",
        regions: [{ x: 0.2, y: 0.5, width: 0.6, height: 0.3 }],
        targetModels: ["pose_editor"],
      },
    ],
  },
  {
    id: "body_proportions",
    name: "Body Proportions AI",
    nameAr: "ضبط التناسق الكلي",
    description: "ضبط التناسق الكلي لجسم الأنثى أوتوماتيكيًا",
    category: "full_body",
    icon: "⚖️",
    models: [
      {
        id: "shape_normalizer",
        name: "AI Shape Normalizer",
        path: "models/shape_normalizer.pt",
        type: "stylemix",
        description: "Full body proportion balancing AI",
        isLoaded: false,
      },
    ],
    settings: {
      intensity: "light",
      style: "realistic",
      preserveDetails: true,
      blendEdges: true,
      autoBalance: true,
    },
    outputFolder: "outputs/ai_body_editor/body_proportions/",
    isOffline: true,
    requiresModel: true,
    targetBodyParts: [
      {
        id: "full_body",
        name: "Full Body",
        nameAr: "الجسم كاملًا",
        regions: [{ x: 0, y: 0, width: 1, height: 1 }],
        targetModels: ["shape_normalizer"],
      },
    ],
  },
  {
    id: "blur_sensitive",
    name: "Blur Sensitive Parts",
    nameAr: "تعتيم المناطق الحساسة",
    description: "تعتيم أو تغبيش المناطق الحساسة أوتوماتيكياً",
    category: "privacy",
    icon: "🔒",
    models: [
      {
        id: "segment_anything",
        name: "SegmentAnything",
        path: "models/segment_anything.pt",
        type: "controlnet",
        description: "Advanced sensitive area detection and blurring",
        isLoaded: false,
      },
    ],
    settings: {
      intensity: "strong",
      style: "standard",
      preserveDetails: false,
      blendEdges: true,
      autoBalance: false,
    },
    outputFolder: "outputs/ai_body_editor/blur_sensitive/",
    isOffline: true,
    requiresModel: true,
    targetBodyParts: [
      {
        id: "sensitive_regions",
        name: "Sensitive Areas",
        nameAr: "المناطق الحساسة",
        regions: [
          { x: 0.3, y: 0.2, width: 0.4, height: 0.3 },
          { x: 0.4, y: 0.6, width: 0.2, height: 0.15 },
        ],
        targetModels: ["segment_anything"],
      },
    ],
  },
  {
    id: "style_transfer_18",
    name: "Style Transfer 18+",
    nameAr: "تحويل النمط",
    description: "تطبيق نمط معين على الجسم (واقعي، رسوم، دمية)",
    category: "style",
    icon: "🎨",
    models: [
      {
        id: "animeganv3",
        name: "AnimeGANv3",
        path: "models/animeganv3.pt",
        type: "animeganv3",
        description: "Advanced style transfer for body images",
        isLoaded: false,
      },
      {
        id: "realfusion",
        name: "RealFusion",
        path: "models/realfusion.pt",
        type: "stylemix",
        description: "Realistic style enhancement model",
        isLoaded: false,
      },
    ],
    settings: {
      intensity: "medium",
      style: "anime",
      preserveDetails: true,
      blendEdges: true,
      autoBalance: true,
    },
    outputFolder: "outputs/ai_body_editor/style_transfer/",
    isOffline: true,
    requiresModel: true,
    targetBodyParts: [
      {
        id: "full_body_style",
        name: "Full Body Style",
        nameAr: "نمط الجسم كاملًا",
        regions: [{ x: 0, y: 0, width: 1, height: 1 }],
        targetModels: ["animeganv3", "realfusion"],
      },
    ],
  },
  {
    id: "body_blend_fix",
    name: "Full Body Blend Fix",
    nameAr: "دمج حواف الجسم",
    description: "دمج حواف الجسم وتنعيمها بعد التعديل",
    category: "post_process",
    icon: "🔧",
    models: [
      {
        id: "gfpgan",
        name: "GFPGAN",
        path: "models/gfpgan.pth",
        type: "gfpgan",
        description: "Advanced face and body restoration",
        isLoaded: false,
      },
      {
        id: "inpaint_model",
        name: "Inpaint Model",
        path: "models/inpaint_large.pt",
        type: "controlnet",
        description: "Seamless edge blending and fixing",
        isLoaded: false,
      },
    ],
    settings: {
      intensity: "light",
      style: "realistic",
      preserveDetails: true,
      blendEdges: true,
      autoBalance: true,
    },
    outputFolder: "outputs/ai_body_editor/body_blend/",
    isOffline: true,
    requiresModel: true,
    targetBodyParts: [
      {
        id: "blend_regions",
        name: "Blend Areas",
        nameAr: "مناطق الدمج",
        regions: [{ x: 0, y: 0, width: 1, height: 1 }],
        targetModels: ["gfpgan", "inpaint_model"],
      },
    ],
  },
];

export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  femaleOnly: true,
  fullBodyOnly: true,
  minResolution: { width: 512, height: 512 },
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFormats: [".jpg", ".jpeg", ".png", ".webp"],
  requiresNSFWDetection: true,
};
