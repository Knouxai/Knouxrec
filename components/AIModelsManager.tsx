import React, { useState, useEffect } from "react";

interface AIModel {
  id: string;
  name: string;
  size_mb: number;
  type: string;
  status: "available" | "downloading" | "installed" | "error";
  progress?: number;
  use_cases: string[];
  performance: "fast" | "medium" | "slow";
  description: string;
}

interface PerformanceProfile {
  id: string;
  name: string;
  description: string;
  max_memory_gb: number;
  recommended_models: string[];
  processing_time_multiplier: number;
}

const AIModelsManager: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("balanced");
  const [totalStorage, setTotalStorage] = useState({ used: 0, available: 50 });
  const [activeDownloads, setActiveDownloads] = useState<Set<string>>(
    new Set(),
  );

  const performanceProfiles: PerformanceProfile[] = [
    {
      id: "light",
      name: "خفيف",
      description: "للأجهزة محدودة الموارد (أقل من 4GB RAM)",
      max_memory_gb: 4,
      recommended_models: ["yolov8", "u2net", "rnnoise", "bark_tts"],
      processing_time_multiplier: 1.5,
    },
    {
      id: "balanced",
      name: "متوازن",
      description: "للأجهزة متوسطة الموارد (4-8GB RAM)",
      max_memory_gb: 8,
      recommended_models: ["whisper_large", "real_esrgan", "modnet", "simswap"],
      processing_time_multiplier: 1.0,
    },
    {
      id: "high_performance",
      name: "أداء عالي",
      description: "للأجهزة القوية (8-16GB RAM)",
      max_memory_gb: 16,
      recommended_models: [
        "stable_diffusion",
        "animatediff",
        "gpt4all",
        "videocrafter",
      ],
      processing_time_multiplier: 0.7,
    },
    {
      id: "workstation",
      name: "محطة عمل",
      description: "لأقوى الأجهزة (16GB+ RAM)",
      max_memory_gb: 32,
      recommended_models: ["all_models"],
      processing_time_multiplier: 0.5,
    },
  ];

  // تحميل بيا��ات النماذج
  useEffect(() => {
    const loadModels = async () => {
      try {
        // محاكاة تحميل بيانات النماذج
        const sampleModels: AIModel[] = [
          {
            id: "yolov8",
            name: "YOLOv8 Object Detection",
            size_mb: 12,
            type: "object_detection",
            status: "installed",
            use_cases: ["ai_effects", "ai_transition"],
            performance: "fast",
            description: "نموذج كشف الكائنات للتأثيرات الذكية",
          },
          {
            id: "whisper_large",
            name: "Whisper Large v3",
            size_mb: 3100,
            type: "speech_to_text",
            status: "installed",
            use_cases: ["speech_to_text", "subtitle_maker"],
            performance: "medium",
            description: "نموذج تحويل الكلام لنص متعدد اللغات",
          },
          {
            id: "stable_diffusion",
            name: "Stable Diffusion XL",
            size_mb: 3500,
            type: "image_generation",
            status: "available",
            use_cases: ["text_to_image"],
            performance: "slow",
            description: "نموذج توليد الصور من النص",
          },
          {
            id: "animatediff",
            name: "AnimateDiff Motion Generator",
            size_mb: 2800,
            type: "video_generation",
            status: "available",
            use_cases: ["ai_animation"],
            performance: "slow",
            description: "نموذج توليد الحركة والرسوم المتحركة",
          },
          {
            id: "real_esrgan",
            name: "Real-ESRGAN Image Upscaler",
            size_mb: 65,
            type: "super_resolution",
            status: "installed",
            use_cases: ["photo_enhancer"],
            performance: "fast",
            description: "نموذج تحسين وتكبير جودة الصور",
          },
          {
            id: "gpt4all",
            name: "GPT4All Arabic Model",
            size_mb: 8200,
            type: "language_model",
            status: "downloading",
            progress: 65,
            use_cases: ["ai_copywriting"],
            performance: "medium",
            description: "نموذج لغوي كبير للكتابة الإبداعية",
          },
        ];

        setModels(sampleModels);

        // حساب استخدام التخزين
        const installedSize = sampleModels
          .filter((m) => m.status === "installed")
          .reduce((total, m) => total + m.size_mb, 0);

        setTotalStorage({
          used: Math.round((installedSize / 1024) * 100) / 100,
          available: 50,
        });
      } catch (error) {
        console.error("خطأ في تحميل بيانات النماذج:", error);
      }
    };

    loadModels();
  }, []);

  // تحميل نموذج
  const downloadModel = async (modelId: string) => {
    setActiveDownloads((prev) => new Set(prev).add(modelId));

    // تحديث حالة النموذج
    setModels((prev) =>
      prev.map((model) =>
        model.id === modelId
          ? { ...model, status: "downloading" as const, progress: 0 }
          : model,
      ),
    );

    // محاكاة عملية التحميل
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setModels((prev) =>
        prev.map((model) =>
          model.id === modelId ? { ...model, progress } : model,
        ),
      );
    }

    // إنهاء التحميل
    setModels((prev) =>
      prev.map((model) =>
        model.id === modelId
          ? { ...model, status: "installed" as const, progress: undefined }
          : model,
      ),
    );

    setActiveDownloads((prev) => {
      const newSet = new Set(prev);
      newSet.delete(modelId);
      return newSet;
    });

    // تحديث استخدام التخزين
    const model = models.find((m) => m.id === modelId);
    if (model) {
      setTotalStorage((prev) => ({
        ...prev,
        used: prev.used + model.size_mb / 1024,
      }));
    }
  };

  // حذف نموذج
  const deleteModel = async (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId ? { ...m, status: "available" as const } : m,
      ),
    );

    setTotalStorage((prev) => ({
      ...prev,
      used: Math.max(0, prev.used - model.size_mb / 1024),
    }));
  };

  // تطبيق ملف تعريف الأداء
  const applyPerformanceProfile = (profileId: string) => {
    setSelectedProfile(profileId);

    const profile = performanceProfiles.find((p) => p.id === profileId);
    if (!profile) return;

    // عرض رسالة تأكيد
    alert(`تم تطبيق ملف تعريف: ${profile.name}\n${profile.description}`);
  };

  const ModelCard = ({ model }: { model: AIModel }) => (
    <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-grow">
          <h4 className="font-rajdhani font-bold text-white mb-1">
            {model.name}
          </h4>
          <p className="text-white/70 text-sm mb-2 line-clamp-2">
            {model.description}
          </p>

          {/* معلومات النموذج */}
          <div className="flex items-center space-x-4 text-xs text-white/50 mb-2">
            <span>📦 {model.size_mb}MB</span>
            <span
              className={`px-2 py-1 rounded ${
                model.performance === "fast"
                  ? "bg-green-500/20 text-green-400"
                  : model.performance === "medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
              }`}
            >
              {model.performance === "fast"
                ? "سريع"
                : model.performance === "medium"
                  ? "متوسط"
                  : "بطيء"}
            </span>
          </div>

          {/* حالات الاستخدام */}
          <div className="flex flex-wrap gap-1 mb-3">
            {model.use_cases.slice(0, 2).map((useCase, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-knoux-purple/10 border border-knoux-purple/20 rounded text-xs text-knoux-purple"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>

        {/* حالة النموذج */}
        <div className="ml-4">
          {model.status === "installed" && (
            <div className="flex flex-col space-y-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <button
                onClick={() => deleteModel(model.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                حذف
              </button>
            </div>
          )}

          {model.status === "available" && (
            <button
              onClick={() => downloadModel(model.id)}
              className="px-3 py-1 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-lg text-sm transition-all"
            >
              تحميل
            </button>
          )}

          {model.status === "downloading" && (
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mb-2"></div>
              <div className="text-xs text-white/70">{model.progress}%</div>
            </div>
          )}
        </div>
      </div>

      {/* شريط التقدم */}
      {model.status === "downloading" && model.progress !== undefined && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-2 rounded-full transition-all duration-300"
            style={{ width: `${model.progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent mb-2">
          🧠 إدارة نماذج الذكاء الاصطناعي
        </h2>
        <p className="text-white/70">
          إدارة وتحسين نماذج الذكاء الاصطناعي المحلية لأفضل أداء
        </p>
      </div>

      {/* Performance Profiles */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
          ⚙️ ملفات تعريف الأداء
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => applyPerformanceProfile(profile.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedProfile === profile.id
                  ? "border-knoux-purple bg-knoux-purple/20"
                  : "border-white/20 hover:border-knoux-purple/50 bg-white/5"
              }`}
            >
              <h4 className="font-bold text-white mb-2">{profile.name}</h4>
              <p className="text-white/70 text-sm mb-2">
                {profile.description}
              </p>
              <div className="text-xs text-knoux-neon">
                حتى {profile.max_memory_gb}GB RAM
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Storage Info */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
          💾 استخدام التخزين
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-knoux-purple/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-purple">
              {totalStorage.used} GB
            </div>
            <div className="text-sm text-white/70">مُستخدم</div>
          </div>
          <div className="text-center p-3 bg-green-400/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {totalStorage.available - totalStorage.used} GB
            </div>
            <div className="text-sm text-white/70">متاح</div>
          </div>
          <div className="text-center p-3 bg-yellow-400/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {models.filter((m) => m.status === "installed").length}
            </div>
            <div className="text-sm text-white/70">نماذج مثبتة</div>
          </div>
        </div>

        {/* Storage Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-3 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((totalStorage.used / totalStorage.available) * 100, 100)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>0 GB</span>
          <span>{totalStorage.available} GB</span>
        </div>
      </div>

      {/* Models Grid */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-rajdhani font-bold text-white">
            📚 مكتبة النماذج
          </h3>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
              {models.filter((m) => m.status === "installed").length} مثبت
            </span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
              {activeDownloads.size} يُحمل
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
              {models.filter((m) => m.status === "available").length} متاح
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
          ⚡ إجراءات سريعة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-xl text-left transition-all">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-bold text-white mb-1">تحديث جميع النماذج</h4>
            <p className="text-white/70 text-sm">البحث عن تحديثات متاحة</p>
          </button>

          <button className="p-4 bg-green-500/20 hover:bg-green-500/40 rounded-xl text-left transition-all">
            <div className="text-2xl mb-2">📥</div>
            <h4 className="font-bold text-white mb-1">تحميل الأساسيات</h4>
            <p className="text-white/70 text-sm">تحميل النماذج الأساسية</p>
          </button>

          <button className="p-4 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-left transition-all">
            <div className="text-2xl mb-2">🧹</div>
            <h4 className="font-bold text-white mb-1">تنظيف التخزين</h4>
            <p className="text-white/70 text-sm">حذف النماذج غير المستخدمة</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModelsManager;
