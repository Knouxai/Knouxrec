// KNOUX MorphCore™ - Offline Visual Patch Lab
// نظام أدوات التعديل المحلي - 50 أداة بدون AI

export interface MorphTool {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  executable: string;
  description: string;
  icon: string;
  settings: ToolSetting[];
  isActive: boolean;
  lastUsed?: number;
}

export interface ToolSetting {
  id: string;
  name: string;
  type: "slider" | "toggle" | "select" | "color";
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  defaultValue: any;
}

export interface MorphCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  tools: MorphTool[];
  folderPath: string;
}

export interface ProcessResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  processingTime: number;
}

export class KnouxMorphCore {
  private categories: Map<string, MorphCategory> = new Map();
  private currentImage: string | null = null;
  private originalImage: string | null = null;
  private outputHistory: string[] = [];
  private presets: Map<string, any> = new Map();

  constructor() {
    this.initializeCategories();
    this.loadPresets();
  }

  // تهيئة جميع الفئات والأدوات الـ 50
  private initializeCategories(): void {
    const categories: MorphCategory[] = [
      {
        id: "body_scale",
        name: "تكبير/تصغير الجسم",
        nameEn: "Body Scale Tools",
        icon: "📏",
        folderPath: "modules/body_scale/",
        tools: [
          {
            id: "resize_body",
            name: "تغيير حجم الجسم",
            nameEn: "Resize Body",
            category: "body_scale",
            executable: "resize_body.exe",
            description: "تغيير حجم الجسم بالكامل بنسب متناسقة",
            icon: "🔄",
            isActive: true,
            settings: [
              {
                id: "scale",
                name: "نسبة التغيير",
                type: "slider",
                value: 100,
                min: 50,
                max: 150,
                step: 1,
                defaultValue: 100,
              },
              {
                id: "maintain_proportions",
                name: "حفظ النسب",
                type: "toggle",
                value: true,
                defaultValue: true,
              },
            ],
          },
          {
            id: "enlarge_upper_body",
            name: "تكبير الجزء العلوي",
            nameEn: "Enlarge Upper Body",
            category: "body_scale",
            executable: "enlarge_upper_body.exe",
            description: "تكبير الصدر والكتفين والذراعين",
            icon: "⬆️",
            isActive: true,
            settings: [
              {
                id: "intensity",
                name: "شدة التكبير",
                type: "slider",
                value: 50,
                min: 0,
                max: 100,
                step: 5,
                defaultValue: 50,
              },
            ],
          },
          {
            id: "enlarge_lower_body",
            name: "تكبير الجزء السفلي",
            nameEn: "Enlarge Lower Body",
            category: "body_scale",
            executable: "enlarge_lower_body.exe",
            description: "تكبير الأرداف والساقين",
            icon: "⬇️",
            isActive: true,
            settings: [
              {
                id: "intensity",
                name: "شدة التكبير",
                type: "slider",
                value: 50,
                min: 0,
                max: 100,
                step: 5,
                defaultValue: 50,
              },
            ],
          },
          {
            id: "shrink_body",
            name: "تصغير الجسم",
            nameEn: "Shrink Body",
            category: "body_scale",
            executable: "shrink_body.exe",
            description: "تصغير الجسم بالكامل",
            icon: "🔽",
            isActive: true,
            settings: [
              {
                id: "reduction",
                name: "نسبة التصغير",
                type: "slider",
                value: 20,
                min: 5,
                max: 50,
                step: 5,
                defaultValue: 20,
              },
            ],
          },
          {
            id: "extend_height",
            name: "زيادة الطول",
            nameEn: "Extend Height",
            category: "body_scale",
            executable: "extend_height.exe",
            description: "إطالة القامة والساقين",
            icon: "📐",
            isActive: true,
            settings: [
              {
                id: "extension",
                name: "نسبة الإطالة",
                type: "slider",
                value: 10,
                min: 5,
                max: 30,
                step: 2,
                defaultValue: 10,
              },
            ],
          },
          {
            id: "shorten_height",
            name: "تقصير الطول",
            nameEn: "Shorten Height",
            category: "body_scale",
            executable: "shorten_height.exe",
            description: "تقصير القامة بشكل طبيعي",
            icon: "📉",
            isActive: true,
            settings: [
              {
                id: "reduction",
                name: "نسبة التقصير",
                type: "slider",
                value: 10,
                min: 5,
                max: 25,
                step: 2,
                defaultValue: 10,
              },
            ],
          },
          {
            id: "widen_body",
            name: "توسيع الجسم",
            nameEn: "Widen Body",
            category: "body_scale",
            executable: "widen_body.exe",
            description: "توسيع عرض الجسم",
            icon: "↔️",
            isActive: true,
            settings: [
              {
                id: "width_increase",
                name: "زيادة العرض",
                type: "slider",
                value: 15,
                min: 5,
                max: 40,
                step: 3,
                defaultValue: 15,
              },
            ],
          },
          {
            id: "narrow_body",
            name: "تضييق الجسم",
            nameEn: "Narrow Body",
            category: "body_scale",
            executable: "narrow_body.exe",
            description: "تضييق عرض الجسم",
            icon: "↕️",
            isActive: true,
            settings: [
              {
                id: "width_decrease",
                name: "تقليل العرض",
                type: "slider",
                value: 15,
                min: 5,
                max: 35,
                step: 3,
                defaultValue: 15,
              },
            ],
          },
        ],
      },
      {
        id: "waist_tools",
        name: "نحت ��لخصر والبطن",
        nameEn: "Waist & Belly",
        icon: "⚡",
        folderPath: "modules/waist_tools/",
        tools: [
          {
            id: "shrink_waist",
            name: "تصغير الخصر",
            nameEn: "Shrink Waist",
            category: "waist_tools",
            executable: "shrink_waist.exe",
            description: "تصغير محيط الخصر بشكل طبيعي",
            icon: "⭕",
            isActive: true,
            settings: [
              {
                id: "intensity",
                name: "شدة التصغير",
                type: "slider",
                value: 30,
                min: 10,
                max: 70,
                step: 5,
                defaultValue: 30,
              },
            ],
          },
          {
            id: "flatten_belly",
            name: "تسطيح البطن",
            nameEn: "Flatten Belly",
            category: "waist_tools",
            executable: "flatten_belly.exe",
            description: "تسطيح منطقة البطن والتخلص من الانتفاخ",
            icon: "🔥",
            isActive: true,
            settings: [
              {
                id: "flattening",
                name: "مستوى التسطيح",
                type: "slider",
                value: 40,
                min: 20,
                max: 80,
                step: 5,
                defaultValue: 40,
              },
            ],
          },
          {
            id: "curve_waist",
            name: "منحنى الخصر",
            nameEn: "Curve Waist",
            category: "waist_tools",
            executable: "curve_waist.exe",
            description: "إنشاء منحنى جذاب للخصر",
            icon: "🌙",
            isActive: true,
            settings: [
              {
                id: "curve_intensity",
                name: "شدة المنحنى",
                type: "slider",
                value: 35,
                min: 15,
                max: 65,
                step: 5,
                defaultValue: 35,
              },
            ],
          },
          {
            id: "expand_belly",
            name: "توسيع البطن",
            nameEn: "Expand Belly",
            category: "waist_tools",
            executable: "expand_belly.exe",
            description: "زيادة حجم البطن (للحمل أو التأثيرات)",
            icon: "🤰",
            isActive: true,
            settings: [
              {
                id: "expansion",
                name: "نسبة التوسيع",
                type: "slider",
                value: 25,
                min: 10,
                max: 60,
                step: 5,
                defaultValue: 25,
              },
            ],
          },
          {
            id: "tighten_core",
            name: "شد العضلات الأساسية",
            nameEn: "Tighten Core",
            category: "waist_tools",
            executable: "tighten_core.exe",
            description: "إظهار عضلات البطن والخصر المشدودة",
            icon: "💪",
            isActive: true,
            settings: [
              {
                id: "muscle_definition",
                name: "وضوح العضلات",
                type: "slider",
                value: 45,
                min: 20,
                max: 80,
                step: 5,
                defaultValue: 45,
              },
            ],
          },
          {
            id: "drop_hips",
            name: "خفض الأرداف",
            nameEn: "Drop Hips",
            category: "waist_tools",
            executable: "drop_hips.exe",
            description: "خفض موضع الأرداف لإطلالة أكثر انسيابية",
            icon: "⬇️",
            isActive: true,
            settings: [
              {
                id: "drop_amount",
                name: "مقدار الخفض",
                type: "slider",
                value: 20,
                min: 10,
                max: 40,
                step: 2,
                defaultValue: 20,
              },
            ],
          },
        ],
      },
      {
        id: "chest_tools",
        name: "الصدر",
        nameEn: "Chest",
        icon: "💎",
        folderPath: "modules/chest_tools/",
        tools: [
          {
            id: "lift_chest",
            name: "رفع الصدر",
            nameEn: "Lift Chest",
            category: "chest_tools",
            executable: "lift_chest.exe",
            description: "رفع الصدر وإظهاره بشكل أكثر جاذبية",
            icon: "⬆️",
            isActive: true,
            settings: [
              {
                id: "lift_amount",
                name: "مقدار الرفع",
                type: "slider",
                value: 30,
                min: 10,
                max: 60,
                step: 5,
                defaultValue: 30,
              },
            ],
          },
          {
            id: "shrink_chest",
            name: "تصغير الصدر",
            nameEn: "Shrink Chest",
            category: "chest_tools",
            executable: "shrink_chest.exe",
            description: "تقليل حجم الصدر بشكل طبيعي",
            icon: "🔽",
            isActive: true,
            settings: [
              {
                id: "reduction",
                name: "نسبة التصغير",
                type: "slider",
                value: 25,
                min: 10,
                max: 50,
                step: 5,
                defaultValue: 25,
              },
            ],
          },
          {
            id: "enlarge_chest",
            name: "تكبير الصدر",
            nameEn: "Enlarge Chest",
            category: "chest_tools",
            executable: "enlarge_chest.exe",
            description: "زيادة حجم الصدر بواقعية",
            icon: "🔺",
            isActive: true,
            settings: [
              {
                id: "enlargement",
                name: "نسبة التكبير",
                type: "slider",
                value: 30,
                min: 10,
                max: 70,
                step: 5,
                defaultValue: 30,
              },
            ],
          },
          {
            id: "reshape_chest",
            name: "إعادة تشكيل ��لصدر",
            nameEn: "Reshape Chest",
            category: "chest_tools",
            executable: "reshape_chest.exe",
            description: "تحسين شكل وتناسق الصدر",
            icon: "🔄",
            isActive: true,
            settings: [
              {
                id: "shape_type",
                name: "نوع الشكل",
                type: "select",
                value: "natural",
                options: ["natural", "round", "teardrop", "athletic"],
                defaultValue: "natural",
              },
            ],
          },
          {
            id: "symmetry_chest",
            name: "تماثل الصدر",
            nameEn: "Symmetry Chest",
            category: "chest_tools",
            executable: "symmetry_chest.exe",
            description: "جعل جانبي الصدر متماثلين",
            icon: "⚖️",
            isActive: true,
            settings: [
              {
                id: "symmetry_strength",
                name: "قوة التماثل",
                type: "slider",
                value: 50,
                min: 20,
                max: 90,
                step: 5,
                defaultValue: 50,
              },
            ],
          },
          {
            id: "flatten_chest",
            name: "تسطيح الصدر",
            nameEn: "Flatten Chest",
            category: "chest_tools",
            executable: "flatten_chest.exe",
            description: "تسطيح الصدر للمظهر الذكوري",
            icon: "📏",
            isActive: true,
            settings: [
              {
                id: "flattening",
                name: "مستوى التسطيح",
                type: "slider",
                value: 60,
                min: 30,
                max: 90,
                step: 5,
                defaultValue: 60,
              },
            ],
          },
        ],
      },
      {
        id: "hips_tools",
        name: "الأرداف والفخذين",
        nameEn: "Hips & Thighs",
        icon: "🍑",
        folderPath: "modules/hips_tools/",
        tools: [
          {
            id: "enlarge_hips",
            name: "تكبير الأرداف",
            nameEn: "Enlarge Hips",
            category: "hips_tools",
            executable: "enlarge_hips.exe",
            description: "زيادة حجم الأرداف بشكل طبيعي",
            icon: "🔺",
            isActive: true,
            settings: [
              {
                id: "enlargement",
                name: "نسبة التكبير",
                type: "slider",
                value: 35,
                min: 15,
                max: 70,
                step: 5,
                defaultValue: 35,
              },
            ],
          },
          {
            id: "lift_hips",
            name: "رفع الأرداف",
            nameEn: "Lift Hips",
            category: "hips_tools",
            executable: "lift_hips.exe",
            description: "رفع الأرداف لمظهر أكثر جاذبية",
            icon: "⬆️",
            isActive: true,
            settings: [
              {
                id: "lift_strength",
                name: "قوة الرفع",
                type: "slider",
                value: 40,
                min: 20,
                max: 70,
                step: 5,
                defaultValue: 40,
              },
            ],
          },
          {
            id: "shrink_hips",
            name: "تصغير الأرداف",
            nameEn: "Shrink Hips",
            category: "hips_tools",
            executable: "shrink_hips.exe",
            description: "تقليل حجم الأرداف",
            icon: "🔽",
            isActive: true,
            settings: [
              {
                id: "reduction",
                name: "نسبة التصغير",
                type: "slider",
                value: 25,
                min: 10,
                max: 50,
                step: 5,
                defaultValue: 25,
              },
            ],
          },
          {
            id: "smooth_thighs",
            name: "تنعيم الفخذين",
            nameEn: "Smooth Thighs",
            category: "hips_tools",
            executable: "smooth_thighs.exe",
            description: "إزالة النتوءات وتنعيم الفخذين",
            icon: "✨",
            isActive: true,
            settings: [
              {
                id: "smoothing",
                name: "مستوى التنعيم",
                type: "slider",
                value: 45,
                min: 20,
                max: 80,
                step: 5,
                defaultValue: 45,
              },
            ],
          },
          {
            id: "slim_thighs",
            name: "تنحيف الفخذين",
            nameEn: "Slim Thighs",
            category: "hips_tools",
            executable: "slim_thighs.exe",
            description: "تنحيف وتشكيل الفخذين",
            icon: "🦵",
            isActive: true,
            settings: [
              {
                id: "slimming",
                name: "شدة التنحيف",
                type: "slider",
                value: 30,
                min: 10,
                max: 60,
                step: 5,
                defaultValue: 30,
              },
            ],
          },
          {
            id: "enhance_hips_shape",
            name: "تحسين شكل الأرداف",
            nameEn: "enhance Hips Shape",
            category: "hips_tools",
            executable: "enhance_hips_shape.exe",
            description: "تحسين شكل ومنحنيات الأرداف",
            icon: "🌙",
            isActive: true,
            settings: [
              {
                id: "shape_enhancement",
                name: "تحسين الشكل",
                type: "slider",
                value: 40,
                min: 20,
                max: 75,
                step: 5,
                defaultValue: 40,
              },
            ],
          },
        ],
      },
      {
        id: "legs_tools",
        name: "الساقين والقدمين",
        nameEn: "Legs & Feet",
        icon: "🦵",
        folderPath: "modules/legs_tools/",
        tools: [
          {
            id: "lengthen_legs",
            name: "إطالة الساقين",
            nameEn: "Lengthen Legs",
            category: "legs_tools",
            executable: "lengthen_legs.exe",
            description: "زيادة طول الساقين لقامة أطول",
            icon: "��",
            isActive: true,
            settings: [
              {
                id: "lengthening",
                name: "نسبة الإطالة",
                type: "slider",
                value: 20,
                min: 5,
                max: 40,
                step: 3,
                defaultValue: 20,
              },
            ],
          },
          {
            id: "shorten_legs",
            name: "تقصير الساقين",
            nameEn: "Shorten Legs",
            category: "legs_tools",
            executable: "shorten_legs.exe",
            description: "تقصير الساقين للتناسق",
            icon: "📐",
            isActive: true,
            settings: [
              {
                id: "shortening",
                name: "نسبة التقصير",
                type: "slider",
                value: 15,
                min: 5,
                max: 30,
                step: 2,
                defaultValue: 15,
              },
            ],
          },
          {
            id: "slim_legs",
            name: "تنحيف الساقين",
            nameEn: "Slim Legs",
            category: "legs_tools",
            executable: "slim_legs.exe",
            description: "تنحيف الساقين وجعلها أكثر رشاقة",
            icon: "🔥",
            isActive: true,
            settings: [
              {
                id: "slimming",
                name: "شدة التنحيف",
                type: "slider",
                value: 25,
                min: 10,
                max: 50,
                step: 5,
                defaultValue: 25,
              },
            ],
          },
          {
            id: "thicken_legs",
            name: "تسمين الساقين",
            nameEn: "Thicken Legs",
            category: "legs_tools",
            executable: "thicken_legs.exe",
            description: "زيادة سماكة الساقين والعضلات",
            icon: "💪",
            isActive: true,
            settings: [
              {
                id: "thickening",
                name: "نسبة التسمين",
                type: "slider",
                value: 30,
                min: 10,
                max: 60,
                step: 5,
                defaultValue: 30,
              },
            ],
          },
          {
            id: "adjust_knees",
            name: "تعديل الركبتين",
            nameEn: "Adjust Knees",
            category: "legs_tools",
            executable: "adjust_knees.exe",
            description: "تحسين شكل ووضعية الركبتين",
            icon: "🔧",
            isActive: true,
            settings: [
              {
                id: "adjustment",
                name: "مستوى التعديل",
                type: "slider",
                value: 35,
                min: 15,
                max: 65,
                step: 5,
                defaultValue: 35,
              },
            ],
          },
          {
            id: "reduce_ankles",
            name: "تنحيف الكاحلين",
            nameEn: "Reduce Ankles",
            category: "legs_tools",
            executable: "reduce_ankles.exe",
            description: "تنحيف الكاحلين والقدمين",
            icon: "👠",
            isActive: true,
            settings: [
              {
                id: "reduction",
                name: "نسبة التنحيف",
                type: "slider",
                value: 20,
                min: 10,
                max: 40,
                step: 2,
                defaultValue: 20,
              },
            ],
          },
        ],
      },
      {
        id: "arms_tools",
        name: "الذراعين والكتفين",
        nameEn: "Arms & Shoulders",
        icon: "💪",
        folderPath: "modules/arms_tools/",
        tools: [
          {
            id: "tone_arms",
            name: "شد الذراعين",
            nameEn: "Tone Arms",
            category: "arms_tools",
            executable: "tone_arms.exe",
            description: "شد عضلات الذراعين وإظهارها",
            icon: "💪",
            isActive: true,
            settings: [
              {
                id: "toning",
                name: "مستوى الشد",
                type: "slider",
                value: 40,
                min: 20,
                max: 80,
                step: 5,
                defaultValue: 40,
              },
            ],
          },
          {
            id: "bulk_arms",
            name: "تضخيم الذراعين",
            nameEn: "Bulk Arms",
            category: "arms_tools",
            executable: "bulk_arms.exe",
            description: "زيادة حجم عضلات الذراعين",
            icon: "🏋️",
            isActive: true,
            settings: [
              {
                id: "bulking",
                name: "شدة التضخيم",
                type: "slider",
                value: 35,
                min: 15,
                max: 70,
                step: 5,
                defaultValue: 35,
              },
            ],
          },
          {
            id: "resize_shoulders",
            name: "تغيير حجم الكتفين",
            nameEn: "Resize Shoulders",
            category: "arms_tools",
            executable: "resize_shoulders.exe",
            description: "تعديل عرض وحجم الكتفين",
            icon: "📐",
            isActive: true,
            settings: [
              {
                id: "shoulder_width",
                name: "عرض الكتفين",
                type: "slider",
                value: 0,
                min: -30,
                max: 40,
                step: 3,
                defaultValue: 0,
              },
            ],
          },
          {
            id: "smooth_elbows",
            name: "تنعيم المرفقين",
            nameEn: "Smooth Elbows",
            category: "arms_tools",
            executable: "smooth_elbows.exe",
            description: "تنعيم شكل المرفقين والذراعين",
            icon: "✨",
            isActive: true,
            settings: [
              {
                id: "smoothing",
                name: "مستوى التنعيم",
                type: "slider",
                value: 45,
                min: 20,
                max: 80,
                step: 5,
                defaultValue: 45,
              },
            ],
          },
          {
            id: "shrink_hands",
            name: "تصغير اليدين",
            nameEn: "Shrink Hands",
            category: "arms_tools",
            executable: "shrink_hands.exe",
            description: "تصغير حجم اليدين والأصابع",
            icon: "🤏",
            isActive: true,
            settings: [
              {
                id: "shrinking",
                name: "نسبة التصغير",
                type: "slider",
                value: 15,
                min: 5,
                max: 35,
                step: 2,
                defaultValue: 15,
              },
            ],
          },
          {
            id: "stretch_arms",
            name: "إطالة الذراعين",
            nameEn: "Stretch Arms",
            category: "arms_tools",
            executable: "stretch_arms.exe",
            description: "زيادة طول الذراعين",
            icon: "📏",
            isActive: true,
            settings: [
              {
                id: "stretching",
                name: "نسبة الإطالة",
                type: "slider",
                value: 10,
                min: 5,
                max: 25,
                step: 2,
                defaultValue: 10,
              },
            ],
          },
        ],
      },
      {
        id: "face_tools",
        name: "الوجه والرأس",
        nameEn: "Head & Face",
        icon: "👤",
        folderPath: "modules/face_tools/",
        tools: [
          {
            id: "resize_face",
            name: "تغيير حجم الوجه",
            nameEn: "Resize Face",
            category: "face_tools",
            executable: "resize_face.exe",
            description: "تكبير أو تصغير الوجه بشكل عام",
            icon: "🔄",
            isActive: true,
            settings: [
              {
                id: "face_size",
                name: "حجم الوجه",
                type: "slider",
                value: 0,
                min: -30,
                max: 30,
                step: 2,
                defaultValue: 0,
              },
            ],
          },
          {
            id: "lift_cheeks",
            name: "رفع الخدود",
            nameEn: "Lift Cheeks",
            category: "face_tools",
            executable: "lift_cheeks.exe",
            description: "رفع الخدود لمظهر أكثر شباباً",
            icon: "😊",
            isActive: true,
            settings: [
              {
                id: "lift_amount",
                name: "مقدار الرفع",
                type: "slider",
                value: 25,
                min: 10,
                max: 50,
                step: 3,
                defaultValue: 25,
              },
            ],
          },
          {
            id: "shrink_jaw",
            name: "تصغير الفك",
            nameEn: "Shrink Jaw",
            category: "face_tools",
            executable: "shrink_jaw.exe",
            description: "تصغير عرض الفك السفلي",
            icon: "💎",
            isActive: true,
            settings: [
              {
                id: "jaw_reduction",
                name: "تصغير الفك",
                type: "slider",
                value: 20,
                min: 5,
                max: 40,
                step: 3,
                defaultValue: 20,
              },
            ],
          },
          {
            id: "widen_forehead",
            name: "توسيع الجبهة",
            nameEn: "Widen Forehead",
            category: "face_tools",
            executable: "widen_forehead.exe",
            description: "زيادة عرض الجبهة",
            icon: "🧠",
            isActive: true,
            settings: [
              {
                id: "forehead_width",
                name: "عرض الجبهة",
                type: "slider",
                value: 15,
                min: 5,
                max: 35,
                step: 2,
                defaultValue: 15,
              },
            ],
          },
          {
            id: "adjust_ears",
            name: "تعديل الأذنين",
            nameEn: "Adjust Ears",
            category: "face_tools",
            executable: "adjust_ears.exe",
            description: "تعديل حجم ووضعية الأذنين",
            icon: "👂",
            isActive: true,
            settings: [
              {
                id: "ear_adjustment",
                name: "تعديل الأذنين",
                type: "slider",
                value: 0,
                min: -25,
                max: 25,
                step: 2,
                defaultValue: 0,
              },
            ],
          },
          {
            id: "symmetry_face",
            name: "تماثل الوجه",
            nameEn: "Symmetry Face",
            category: "face_tools",
            executable: "symmetry_face.exe",
            description: "جعل جانبي الوجه متماثلين",
            icon: "⚖️",
            isActive: true,
            settings: [
              {
                id: "symmetry_strength",
                name: "قوة التماثل",
                type: "slider",
                value: 40,
                min: 20,
                max: 80,
                step: 5,
                defaultValue: 40,
              },
            ],
          },
        ],
      },
      {
        id: "misc_tools",
        name: "أدوات متفرقة",
        nameEn: "Misc",
        icon: "🛠️",
        folderPath: "modules/misc_tools/",
        tools: [
          {
            id: "mirror_flip",
            name: "انعكاس مرآة",
            nameEn: "Mirror Flip",
            category: "misc_tools",
            executable: "mirror_flip.exe",
            description: "انعكاس الصورة أفقياً أو عمودياً",
            icon: "🪞",
            isActive: true,
            settings: [
              {
                id: "flip_direction",
                name: "اتجاه الانعكاس",
                type: "select",
                value: "horizontal",
                options: ["horizontal", "vertical", "both"],
                defaultValue: "horizontal",
              },
            ],
          },
          {
            id: "manual_sculpt",
            name: "النحت اليدوي",
            nameEn: "Manual Sculpt",
            category: "misc_tools",
            executable: "manual_sculpt.exe",
            description: "أداة نحت حرة لتعد��ل أي منطقة يدوياً",
            icon: "🎨",
            isActive: true,
            settings: [
              {
                id: "brush_size",
                name: "حجم الفرشاة",
                type: "slider",
                value: 50,
                min: 10,
                max: 150,
                step: 5,
                defaultValue: 50,
              },
              {
                id: "strength",
                name: "قوة التأثير",
                type: "slider",
                value: 30,
                min: 10,
                max: 80,
                step: 5,
                defaultValue: 30,
              },
            ],
          },
          {
            id: "warp_tool",
            name: "أداة التشويه",
            nameEn: "Warp Tool",
            category: "misc_tools",
            executable: "warp_tool.exe",
            description: "تشويه وتحريك المناطق بحرية",
            icon: "🌊",
            isActive: true,
            settings: [
              {
                id: "warp_intensity",
                name: "شدة التشويه",
                type: "slider",
                value: 40,
                min: 15,
                max: 85,
                step: 5,
                defaultValue: 40,
              },
            ],
          },
          {
            id: "curve_tool",
            name: "أداة المنحنيات",
            nameEn: "Curve Tool",
            category: "misc_tools",
            executable: "curve_tool.exe",
            description: "إنشاء منحنيات ناعمة في المناطق المحددة",
            icon: "〰️",
            isActive: true,
            settings: [
              {
                id: "curve_strength",
                name: "قوة المنحنى",
                type: "slider",
                value: 35,
                min: 15,
                max: 70,
                step: 5,
                defaultValue: 35,
              },
            ],
          },
          {
            id: "reset_body",
            name: "إعادة تعيين",
            nameEn: "Reset Body",
            category: "misc_tools",
            executable: "reset_body.exe",
            description: "إعادة الصورة للحالة الأصلية",
            icon: "🔄",
            isActive: true,
            settings: [
              {
                id: "reset_type",
                name: "نوع الإعادة",
                type: "select",
                value: "full",
                options: ["full", "last_action", "partial"],
                defaultValue: "full",
              },
            ],
          },
          {
            id: "area_highlighter",
            name: "تحديد المناطق",
            nameEn: "Area Highlighter",
            category: "misc_tools",
            executable: "area_highlighter.exe",
            description: "تحديد مناطق معينة للتطبيق الانتقائي للأدوات",
            icon: "🔲",
            isActive: true,
            settings: [
              {
                id: "selection_mode",
                name: "نمط التحديد",
                type: "select",
                value: "rectangle",
                options: ["rectangle", "circle", "freehand", "polygon"],
                defaultValue: "rectangle",
              },
            ],
          },
        ],
      },
    ];

    categories.forEach((category) => {
      this.categories.set(category.id, category);
    });
  }

  // تحميل الإعدادات المحفوظة
  private loadPresets(): void {
    const saved = localStorage.getItem("knoux_morph_presets");
    if (saved) {
      try {
        const presets = JSON.parse(saved);
        Object.entries(presets).forEach(([key, value]) => {
          this.presets.set(key, value);
        });
      } catch (error) {
        console.warn("فشل في تحميل الإعدادات المحفوظة");
      }
    }
  }

  // حفظ الإعدادات
  private savePresets(): void {
    const presetsObj = Object.fromEntries(this.presets);
    localStorage.setItem("knoux_morph_presets", JSON.stringify(presetsObj));
  }

  // الحصول على جميع الفئات
  getCategories(): MorphCategory[] {
    return Array.from(this.categories.values());
  }

  // الحصول على فئة معينة
  getCategory(categoryId: string): MorphCategory | undefined {
    return this.categories.get(categoryId);
  }

  // الحصول على أداة معينة
  getTool(categoryId: string, toolId: string): MorphTool | undefined {
    const category = this.categories.get(categoryId);
    return category?.tools.find((tool) => tool.id === toolId);
  }

  // تطبيق أداة على الصورة
  async applyTool(
    categoryId: string,
    toolId: string,
    settings: any,
  ): Promise<ProcessResult> {
    const startTime = Date.now();
    const tool = this.getTool(categoryId, toolId);

    if (!tool || !this.currentImage) {
      return {
        success: false,
        error: "أداة غير موجودة أو لا توجد صورة محددة",
        processingTime: Date.now() - startTime,
      };
    }

    try {
      // محاكاة تشغيل الأداة
      await this.simulateToolExecution(tool, settings);

      // حفظ النتيجة
      const outputPath = `output/${toolId}_${Date.now()}.jpg`;
      this.outputHistory.push(outputPath);

      // تحديث وقت آخر استخدام
      tool.lastUsed = Date.now();

      return {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
        processingTime: Date.now() - startTime,
      };
    }
  }

  // محاكاة تنفيذ الأداة
  private async simulateToolExecution(
    tool: MorphTool,
    settings: any,
  ): Promise<void> {
    // محاكاة وقت المعالجة
    const processingTime = Math.random() * 2000 + 1000; // 1-3 ثواني
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    console.log(`تم تنفيذ أداة ${tool.name} بالإعدادات:`, settings);
  }

  // تعيين الصورة الحالية
  setCurrentImage(imagePath: string): void {
    this.currentImage = imagePath;
    if (!this.originalImage) {
      this.originalImage = imagePath;
    }
  }

  // إعادة تعيين للصورة الأصلية
  resetToOriginal(): void {
    if (this.originalImage) {
      this.currentImage = this.originalImage;
      this.outputHistory = [];
    }
  }

  // فتح مجلد الفئة
  openCategoryFolder(categoryId: string): void {
    const category = this.categories.get(categoryId);
    if (category) {
      console.log(`فتح مجلد: ${category.folderPath}`);
      // في التطبيق الحقيقي، سيتم فتح مستكشف الملفات
    }
  }

  // حفظ إعدادات مخصصة
  savePreset(
    name: string,
    categoryId: string,
    toolId: string,
    settings: any,
  ): void {
    const presetKey = `${categoryId}_${toolId}_${name}`;
    this.presets.set(presetKey, {
      name,
      categoryId,
      toolId,
      settings,
      createdAt: Date.now(),
    });
    this.savePresets();
  }

  // تحميل إعدادات مخصصة
  loadPreset(name: string, categoryId: string, toolId: string): any {
    const presetKey = `${categoryId}_${toolId}_${name}`;
    return this.presets.get(presetKey);
  }

  // الحصول على إحصائيات الاستخدام
  getUsageStats(): any {
    const categories = Array.from(this.categories.values());
    const totalTools = categories.reduce(
      (sum, cat) => sum + cat.tools.length,
      0,
    );
    const activeTools = categories.reduce(
      (sum, cat) => sum + cat.tools.filter((tool) => tool.isActive).length,
      0,
    );

    const recentlyUsed = categories
      .flatMap((cat) => cat.tools)
      .filter((tool) => tool.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, 5);

    return {
      totalCategories: categories.length,
      totalTools,
      activeTools,
      recentlyUsed,
      outputHistory: this.outputHistory.length,
      presets: this.presets.size,
    };
  }
}

// إنشاء مثيل وحيد
export const knouxMorphCore = new KnouxMorphCore();
export default KnouxMorphCore;
