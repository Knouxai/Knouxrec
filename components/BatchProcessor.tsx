import React, { useState, useEffect } from "react";

interface BatchJob {
  id: string;
  name: string;
  files: File[];
  tool: string;
  parameters: Record<string, any>;
  status: "pending" | "processing" | "completed" | "error" | "paused";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  results?: any[];
  errors?: string[];
}

interface BatchTemplate {
  id: string;
  name: string;
  description: string;
  tools: string[];
  parameters: Record<string, any>;
  estimatedTime: string;
}

const BatchProcessor: React.FC = () => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [templates, setTemplates] = useState<BatchTemplate[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedTool, setSelectedTool] =
    useState<string>("ai-video-generator");
  const [isProcessing, setIsProcessing] = useState(false);

  // قوالب المعالجة الدفعية
  useEffect(() => {
    setTemplates([
      {
        id: "video-enhancement",
        name: "تحسين الفيديوهات",
        description: "تحسين جودة وتثبيت مجموعة من الفيديوهات",
        tools: ["video-stabilization", "photo-enhancer", "noise-reduction"],
        parameters: { quality: "high", format: "mp4" },
        estimatedTime: "5-10 دقائق لكل فيديو",
      },
      {
        id: "content-creation",
        name: "إنشاء المحتوى",
        description: "تحويل نصوص إلى فيديوهات مع ترجمات",
        tools: ["text-to-video", "text-to-speech", "subtitle-maker"],
        parameters: { voice: "arabic_female", style: "modern" },
        estimatedTime: "10-15 دقيقة لكل نص",
      },
      {
        id: "social-media",
        name: "محتوى وسائل التواصل",
        description: "إنشاء مقاطع قصيرة للمنصات الاجتماعية",
        tools: ["ai-shorts", "auto-bg-removal", "text-overlay"],
        parameters: { format: "vertical", duration: 30 },
        estimatedTime: "3-5 دقائق لكل مقطع",
      },
      {
        id: "podcast-processing",
        name: "معالجة البودكاست",
        description: "تنظيف الصوت وإنشاء ترجمات",
        tools: ["noise-reduction", "speech-to-text", "audio-enhancement"],
        parameters: { quality: "podcast", language: "arabic" },
        estimatedTime: "2-4 دقائق لكل حلقة",
      },
    ]);
  }, []);

  // معالجة إسقاط الملفات
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      createBatchJob(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  // إنشاء مهمة دفعية جديدة
  const createBatchJob = (files: File[]) => {
    const newJob: BatchJob = {
      id: `job_${Date.now()}`,
      name: `معالجة دفعية - ${files.length} ملف`,
      files,
      tool: selectedTool,
      parameters: {},
      status: "pending",
      progress: 0,
    };

    setJobs((prev) => [newJob, ...prev]);
  };

  // تشغيل مهمة دفعية
  const startBatchJob = async (jobId: string) => {
    setIsProcessing(true);
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "processing" as const,
              startTime: new Date(),
              progress: 0,
            }
          : job,
      ),
    );

    // محاكاة المعالجة
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    for (let i = 0; i < job.files.length; i++) {
      // محاكاة معالجة كل ملف
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const overallProgress = (i * 100 + progress) / job.files.length;
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, progress: overallProgress } : j,
          ),
        );
      }
    }

    // إكمال المهمة
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "completed" as const,
              progress: 100,
              endTime: new Date(),
              results: job.files.map((f) => ({ name: f.name, size: f.size })),
            }
          : job,
      ),
    );

    setIsProcessing(false);
  };

  // إيقاف مهمة
  const pauseJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status:
                job.status === "paused"
                  ? ("processing" as const)
                  : ("paused" as const),
            }
          : job,
      ),
    );
  };

  // حذف مهمة
  const deleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  // تطبيق قالب
  const applyTemplate = (template: BatchTemplate) => {
    // فتح حوار اختيار الملفات
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "video/*,audio/*,image/*";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        const newJob: BatchJob = {
          id: `template_${Date.now()}`,
          name: template.name,
          files,
          tool: template.tools[0],
          parameters: template.parameters,
          status: "pending",
          progress: 0,
        };
        setJobs((prev) => [newJob, ...prev]);
      }
    };
    input.click();
  };

  const JobCard = ({ job }: { job: BatchJob }) => (
    <div className="glass-card p-6 rounded-xl border border-knoux-purple/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-grow">
          <h3 className="font-rajdhani font-bold text-white text-lg mb-2">
            {job.name}
          </h3>

          <div className="flex items-center space-x-4 text-sm text-white/70 mb-3">
            <span>📁 {job.files.length} ملف</span>
            <span>🛠️ {job.tool}</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                job.status === "completed"
                  ? "bg-green-500/20 text-green-400"
                  : job.status === "processing"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : job.status === "error"
                      ? "bg-red-500/20 text-red-400"
                      : job.status === "paused"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {job.status === "completed"
                ? "مكتمل"
                : job.status === "processing"
                  ? "جاري المعالجة"
                  : job.status === "error"
                    ? "خطأ"
                    : job.status === "paused"
                      ? "متوقف"
                      : "في الانتظار"}
            </span>
          </div>

          {/* شريط التقدم */}
          {(job.status === "processing" || job.status === "completed") && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>التقدم</span>
                <span>{Math.round(job.progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* الوقت */}
          {job.startTime && (
            <div className="text-xs text-white/50">
              {job.status === "completed" && job.endTime ? (
                <>
                  ⏱️ مكتمل في{" "}
                  {Math.round(
                    (job.endTime.getTime() - job.startTime.getTime()) / 1000,
                  )}{" "}
                  ثانية
                </>
              ) : (
                <>
                  🕒 بدأ منذ{" "}
                  {Math.round((Date.now() - job.startTime.getTime()) / 1000)}{" "}
                  ثانية
                </>
              )}
            </div>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="flex flex-col space-y-2">
          {job.status === "pending" && (
            <button
              onClick={() => startBatchJob(job.id)}
              disabled={isProcessing}
              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 hover:text-white rounded-lg text-sm transition-all disabled:opacity-50"
            >
              تشغيل
            </button>
          )}

          {job.status === "processing" && (
            <button
              onClick={() => pauseJob(job.id)}
              className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 hover:text-white rounded-lg text-sm transition-all"
            >
              إيقاف
            </button>
          )}

          {job.status === "paused" && (
            <button
              onClick={() => pauseJob(job.id)}
              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 hover:text-white rounded-lg text-sm transition-all"
            >
              متابعة
            </button>
          )}

          {job.status === "completed" && (
            <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 hover:text-white rounded-lg text-sm transition-all">
              تحميل
            </button>
          )}

          <button
            onClick={() => deleteJob(job.id)}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-white rounded-lg text-sm transition-all"
          >
            حذف
          </button>
        </div>
      </div>

      {/* ملفات المهمة */}
      {job.files.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <div className="text-xs text-white/50 mb-2">الملفات:</div>
          <div className="flex flex-wrap gap-2">
            {job.files.slice(0, 3).map((file, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-knoux-purple/10 border border-knoux-purple/20 rounded text-xs text-knoux-purple"
              >
                {file.name}
              </span>
            ))}
            {job.files.length > 3 && (
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                +{job.files.length - 3} أخرى
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const TemplateCard = ({ template }: { template: BatchTemplate }) => (
    <div
      className="glass-card p-4 rounded-xl border border-knoux-purple/20 hover:border-knoux-purple/60 transition-all duration-300 cursor-pointer group"
      onClick={() => applyTemplate(template)}
    >
      <h4 className="font-rajdhani font-bold text-white mb-2 group-hover:text-knoux-purple transition-colors">
        {template.name}
      </h4>
      <p className="text-white/70 text-sm mb-3 line-clamp-2">
        {template.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {template.tools.slice(0, 2).map((tool, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-knoux-neon/10 border border-knoux-neon/20 rounded text-xs text-knoux-neon"
          >
            {tool}
          </span>
        ))}
      </div>

      <div className="text-xs text-white/50">⏱️ {template.estimatedTime}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent mb-2">
          ⚡ المعالجة الدفعية
        </h2>
        <p className="text-white/70">
          معالجة مجموعات كبيرة من الملفات بكفاءة وسرعة
        </p>
      </div>

      {/* قوالب سريعة */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
          🚀 قوالب سريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>

      {/* منطقة إسقاط الملفات */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? "border-knoux-purple bg-knoux-purple/10"
              : "border-white/20 hover:border-knoux-purple/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-rajdhani font-bold text-white mb-2">
            اسحب وأفلت الملفات هنا
          </h3>
          <p className="text-white/70 mb-4">
            أو انقر لاختيار الملفات للمعالجة الدفعية
          </p>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-4 py-2 text-white"
            >
              <option value="ai-video-generator">مولد الفيديو الذكي</option>
              <option value="photo-enhancer">محسن الصور</option>
              <option value="speech-to-text">الكلام إلى نص</option>
              <option value="noise-reduction">تقليل الضوضاء</option>
              <option value="auto-bg-removal">إزالة الخلفية</option>
            </select>

            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = "*/*";
                input.onchange = (e) => {
                  const files = Array.from(
                    (e.target as HTMLInputElement).files || [],
                  );
                  if (files.length > 0) createBatchJob(files);
                };
                input.click();
              }}
              className="px-6 py-2 bg-knoux-purple hover:bg-knoux-purple/80 text-white rounded-xl font-medium transition-all"
            >
              اختيار الملفات
            </button>
          </div>

          <div className="text-sm text-white/50">
            يدعم: MP4, MP3, PNG, JPG, PDF وأكثر
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-knoux-purple/20 text-center">
          <div className="text-2xl font-bold text-knoux-purple">
            {jobs.length}
          </div>
          <div className="text-sm text-white/70">إجمالي المهام</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-knoux-purple/20 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {jobs.filter((j) => j.status === "processing").length}
          </div>
          <div className="text-sm text-white/70">قيد المعالجة</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-knoux-purple/20 text-center">
          <div className="text-2xl font-bold text-green-400">
            {jobs.filter((j) => j.status === "completed").length}
          </div>
          <div className="text-sm text-white/70">مكتملة</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-knoux-purple/20 text-center">
          <div className="text-2xl font-bold text-red-400">
            {jobs.filter((j) => j.status === "error").length}
          </div>
          <div className="text-sm text-white/70">أخطاء</div>
        </div>
      </div>

      {/* قائمة المهام */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-rajdhani font-bold text-white">
            📋 مهام المعالجة
          </h3>

          {jobs.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => setJobs([])}
                className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 hover:text-white rounded-xl font-medium transition-all"
              >
                مسح الكل
              </button>
              <button
                onClick={() =>
                  setJobs((prev) =>
                    prev.filter((j) => j.status !== "completed"),
                  )
                }
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 hover:text-white rounded-xl font-medium transition-all"
              >
                مسح المكتملة
              </button>
            </div>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">
              لا توجد مهام حالياً
            </h3>
            <p className="text-white/70">
              ابدأ بإسقاط ملفات أو استخدام القوالب السريعة
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchProcessor;
