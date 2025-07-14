import React, { useState, useEffect, useCallback } from "react";
import AgeGate from "./AgeGate";
import AIBodyToolCard from "./AIBodyToolCard";
import {
  AI_BODY_TOOLS,
  AIBodyTool,
  ProcessingSettings,
  BatchProcessJob,
  FilterCriteria,
  DEFAULT_FILTER_CRITERIA,
} from "../types/aiBodyEditor";
import AgeVerificationService from "../services/ageVerificationService";
import AIModelsService from "../services/aiModelsService";
import BatchProcessorService from "../services/batchProcessorService";

interface ProcessingProgress {
  jobId: string;
  current: number;
  total: number;
  currentFile: string;
  estimatedTimeRemaining: number;
  averageProcessingTime: number;
}

const AIBodyEditorPanel: React.FC = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTool, setSelectedTool] = useState<AIBodyTool | null>(null);
  const [inputFolder, setInputFolder] = useState("");
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
  const [loadingModels, setLoadingModels] = useState<Set<string>>(new Set());
  const [activeJobs, setActiveJobs] = useState<BatchProcessJob[]>([]);
  const [processingProgress, setProcessingProgress] = useState<
    Map<string, ProcessingProgress>
  >(new Map());
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
    DEFAULT_FILTER_CRITERIA,
  );
  const [showJobManager, setShowJobManager] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState({
    used: 0,
    available: 4096,
    models: 0,
  });

  const ageService = AgeVerificationService.getInstance();
  const aiService = AIModelsService.getInstance();
  const batchService = BatchProcessorService.getInstance();

  useEffect(() => {
    const checkAccess = () => {
      const hasVerification = ageService.hasCompletedAgeVerification();
      setHasAccess(hasVerification);
    };

    checkAccess();

    // Update memory usage periodically
    const memoryInterval = setInterval(() => {
      setMemoryUsage(aiService.getMemoryUsage());
    }, 2000);

    return () => clearInterval(memoryInterval);
  }, []);

  useEffect(() => {
    // Update active jobs periodically
    const jobsInterval = setInterval(() => {
      setActiveJobs(batchService.getAllJobs());
    }, 1000);

    return () => clearInterval(jobsInterval);
  }, []);

  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  const handleAccessDenied = () => {
    setHasAccess(false);
    // Navigate back to main screen
    window.history.back();
  };

  const handleLoadModel = async (modelIds: string[]) => {
    for (const modelId of modelIds) {
      if (loadedModels.has(modelId)) continue;

      setLoadingModels((prev) => new Set([...prev, modelId]));

      try {
        const success = await aiService.loadModel(
          modelId,
          `models/${modelId}.pt`,
        );
        if (success) {
          setLoadedModels((prev) => new Set([...prev, modelId]));
        }
      } finally {
        setLoadingModels((prev) => {
          const newSet = new Set(prev);
          newSet.delete(modelId);
          return newSet;
        });
      }
    }
  };

  const handleToolSelect = async (
    tool: AIBodyTool,
    settings: ProcessingSettings,
  ) => {
    if (!inputFolder.trim()) {
      alert("يرجى تحديد مجلد الصور أولاً");
      return;
    }

    try {
      const jobId = await batchService.createBatchJob(
        tool.id,
        inputFolder,
        settings,
        filterCriteria,
      );

      // Set up progress callback
      batchService.setProgressCallback(jobId, (progress) => {
        setProcessingProgress((prev) => new Map(prev.set(jobId, progress)));
      });

      setSelectedTool(tool);
      setShowJobManager(true);
    } catch (error) {
      alert(
        `خطأ في بدء المعالجة: ${error instanceof Error ? error.message : "خطأ غير معروف"}`,
      );
    }
  };

  const categories = [
    { id: "all", name: "جميع الأدوات", nameEn: "All Tools", icon: "🧩" },
    { id: "chest", name: "الصدر", nameEn: "Chest", icon: "🩱" },
    { id: "waist", name: "الخصر والبطن", nameEn: "Waist & Belly", icon: "⏳" },
    { id: "hips", name: "الأرداف", nameEn: "Hips & Thighs", icon: "🍑" },
    { id: "full_body", name: "الجسم كاملًا", nameEn: "Full Body", icon: "⚖️" },
    { id: "privacy", name: "الخصوصية", nameEn: "Privacy", icon: "🔒" },
    { id: "style", name: "الأنماط", nameEn: "Style Transfer", icon: "🎨" },
    {
      id: "post_process",
      name: "المعالجة النهائية",
      nameEn: "Post Process",
      icon: "🔧",
    },
  ];

  const filteredTools =
    selectedCategory === "all"
      ? AI_BODY_TOOLS
      : AI_BODY_TOOLS.filter((tool) => tool.category === selectedCategory);

  const isToolModelLoaded = (tool: AIBodyTool): boolean => {
    return tool.models.every((model) => loadedModels.has(model.id));
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}س ${minutes % 60}د`;
    if (minutes > 0) return `${minutes}د ${seconds % 60}ث`;
    return `${seconds}ث`;
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#feca57";
      case "processing":
        return "#4ecdc4";
      case "completed":
        return "#1dd1a1";
      case "failed":
        return "#ff6b6b";
      default:
        return "#666";
    }
  };

  if (!hasAccess) {
    return (
      <AgeGate
        onAccessGranted={handleAccessGranted}
        onAccessDenied={handleAccessDenied}
      />
    );
  }

  return (
    <div className="ai-body-editor">
      <div className="editor-header">
        <div className="header-title">
          <h1>🧠 AI Batch Body Editor (18+)</h1>
          <p>محرر الجسم بالذكاء الصناعي (أوفلاين)</p>
        </div>

        <div className="system-info">
          <div className="memory-usage">
            <span>
              الذاكرة: {memoryUsage.used}MB / {memoryUsage.available}MB
            </span>
            <div className="memory-bar">
              <div
                className="memory-fill"
                style={{
                  width: `${(memoryUsage.used / memoryUsage.available) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="models-count">
            📦 النماذج المحملة: {memoryUsage.models}
          </div>
        </div>
      </div>

      <div className="editor-controls">
        <div className="input-section">
          <div className="folder-input">
            <label>📁 مجلد الصور:</label>
            <input
              type="text"
              value={inputFolder}
              onChange={(e) => setInputFolder(e.target.value)}
              placeholder="C:\Users\knoux\Pictures\model_batch"
              className="folder-path-input"
            />
            <button className="btn-browse">تصفح</button>
          </div>

          <div className="filter-controls">
            <div className="filter-item">
              <label>
                <input
                  type="checkbox"
                  checked={filterCriteria.femaleOnly}
                  onChange={(e) =>
                    setFilterCriteria({
                      ...filterCriteria,
                      femaleOnly: e.target.checked,
                    })
                  }
                />
                نساء فقط
              </label>
            </div>
            <div className="filter-item">
              <label>
                <input
                  type="checkbox"
                  checked={filterCriteria.fullBodyOnly}
                  onChange={(e) =>
                    setFilterCriteria({
                      ...filterCriteria,
                      fullBodyOnly: e.target.checked,
                    })
                  }
                />
                جسم كامل فقط
              </label>
            </div>
          </div>
        </div>

        <div className="job-controls">
          <button
            className="btn-job-manager"
            onClick={() => setShowJobManager(!showJobManager)}
          >
            📊 إدارة المهام ({activeJobs.length})
          </button>
          <button
            className="btn-preload-models"
            onClick={() => aiService.preloadAllModels()}
          >
            ⚡ تحميل جميع النماذج
          </button>
        </div>
      </div>

      <div className="category-selector">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-name-en">{category.nameEn}</span>
          </button>
        ))}
      </div>

      <div className="tools-grid">
        {filteredTools.map((tool) => (
          <AIBodyToolCard
            key={tool.id}
            tool={tool}
            onSelect={handleToolSelect}
            isSelected={selectedTool?.id === tool.id}
            isModelLoaded={isToolModelLoaded(tool)}
            onLoadModel={handleLoadModel}
          />
        ))}
      </div>

      {showJobManager && (
        <div className="job-manager-overlay">
          <div className="job-manager">
            <div className="job-manager-header">
              <h3>📊 إدارة مهام المعالجة</h3>
              <button
                className="btn-close-manager"
                onClick={() => setShowJobManager(false)}
              >
                ✕
              </button>
            </div>

            <div className="jobs-list">
              {activeJobs.length === 0 ? (
                <div className="no-jobs">
                  <p>لا توجد مهام معالجة حالياً</p>
                </div>
              ) : (
                activeJobs.map((job) => {
                  const progress = processingProgress.get(job.id);
                  const stats = batchService.getJobStatistics(job.id);

                  return (
                    <div key={job.id} className="job-item">
                      <div className="job-header">
                        <div className="job-info">
                          <h4>
                            {
                              AI_BODY_TOOLS.find((t) => t.id === job.toolId)
                                ?.nameAr
                            }
                          </h4>
                          <span className="job-id">#{job.id.slice(-8)}</span>
                        </div>
                        <div
                          className="job-status"
                          style={{ color: getJobStatusColor(job.status) }}
                        >
                          {job.status === "pending"
                            ? "⏳ في الانتظار"
                            : job.status === "processing"
                              ? "⚡ قيد المعالجة"
                              : job.status === "completed"
                                ? "✅ مكتمل"
                                : "❌ فشل"}
                        </div>
                      </div>

                      <div className="job-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${job.progress}%`,
                              background: getJobStatusColor(job.status),
                            }}
                          />
                        </div>
                        <span className="progress-text">{job.progress}%</span>
                      </div>

                      {progress && (
                        <div className="job-details">
                          <div className="detail-item">
                            <span>الملف الحالي:</span>
                            <span>{progress.currentFile}</span>
                          </div>
                          <div className="detail-item">
                            <span>التقدم:</span>
                            <span>
                              {progress.current} / {progress.total}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span>الوقت المتبقي:</span>
                            <span>
                              {formatTime(progress.estimatedTimeRemaining)}
                            </span>
                          </div>
                        </div>
                      )}

                      {stats && (
                        <div className="job-stats">
                          <div className="stat-item">
                            <span>نجح: {stats.processedImages}</span>
                          </div>
                          <div className="stat-item">
                            <span>فشل: {stats.failedImages}</span>
                          </div>
                          <div className="stat-item">
                            <span>
                              نسبة النجاح: {stats.successRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="job-actions">
                        {job.status === "pending" && (
                          <button
                            className="btn-cancel-job"
                            onClick={() => batchService.cancelJob(job.id)}
                          >
                            ❌ إلغاء
                          </button>
                        )}
                        {job.status === "completed" && (
                          <button
                            className="btn-export-results"
                            onClick={async () => {
                              const blob = await batchService.exportJobResults(
                                job.id,
                              );
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `job_${job.id}_results.json`;
                              a.click();
                            }}
                          >
                            📥 تصدير النتائج
                          </button>
                        )}
                        {(job.status === "completed" ||
                          job.status === "failed") && (
                          <button
                            className="btn-delete-job"
                            onClick={() => batchService.deleteJob(job.id)}
                          >
                            🗑️ حذف
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-body-editor {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #0c0c0c 0%,
            #1a1a2e 50%,
            #16213e 100%
          );
          color: white;
          padding: 20px;
          position: relative;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .header-title h1 {
          color: #ff6b6b;
          font-size: 28px;
          margin: 0;
          text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
        }

        .header-title p {
          color: #cccccc;
          font-size: 16px;
          margin: 5px 0 0 0;
          opacity: 0.9;
        }

        .system-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-end;
        }

        .memory-usage {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }

        .memory-bar {
          width: 100px;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .memory-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ecdc4, #ff6b6b);
          transition: width 0.3s ease;
        }

        .models-count {
          font-size: 12px;
          color: #4ecdc4;
        }

        .editor-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .input-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .folder-input {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .folder-input label {
          font-weight: bold;
          min-width: 100px;
        }

        .folder-path-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #4ecdc4;
          border-radius: 8px;
          background: rgba(78, 205, 196, 0.1);
          color: white;
          font-size: 14px;
        }

        .btn-browse {
          padding: 10px 20px;
          background: linear-gradient(145deg, #4ecdc4, #44a08d);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .filter-controls {
          display: flex;
          gap: 20px;
        }

        .filter-item label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .filter-item input[type="checkbox"] {
          accent-color: #4ecdc4;
        }

        .job-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-job-manager,
        .btn-preload-models {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-job-manager {
          background: linear-gradient(145deg, #ff6b6b, #ee5a52);
          color: white;
        }

        .btn-preload-models {
          background: linear-gradient(145deg, #feca57, #ff9f43);
          color: white;
        }

        .category-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          overflow-x: auto;
          padding: 10px 0;
        }

        .category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid transparent;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
          backdrop-filter: blur(10px);
        }

        .category-btn:hover {
          border-color: #4ecdc4;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(78, 205, 196, 0.3);
        }

        .category-btn.active {
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.2);
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
        }

        .category-icon {
          font-size: 24px;
        }

        .category-name {
          font-size: 14px;
          font-weight: bold;
        }

        .category-name-en {
          font-size: 12px;
          opacity: 0.7;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .job-manager-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .job-manager {
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border: 2px solid #4ecdc4;
          border-radius: 20px;
          padding: 30px;
          max-width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          width: 90%;
          animation: slideUp 0.5s ease;
        }

        .job-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .job-manager-header h3 {
          color: white;
          font-size: 20px;
          margin: 0;
        }

        .btn-close-manager {
          background: none;
          border: none;
          color: #ff6b6b;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background 0.3s ease;
        }

        .btn-close-manager:hover {
          background: rgba(255, 107, 107, 0.2);
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .no-jobs {
          text-align: center;
          padding: 40px;
          color: #cccccc;
        }

        .job-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .job-info h4 {
          color: white;
          font-size: 16px;
          margin: 0;
        }

        .job-id {
          color: #cccccc;
          font-size: 12px;
          opacity: 0.7;
        }

        .job-status {
          font-weight: bold;
          font-size: 14px;
        }

        .job-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: bold;
          min-width: 40px;
        }

        .job-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .detail-item span:first-child {
          color: #cccccc;
        }

        .detail-item span:last-child {
          color: white;
          font-weight: bold;
        }

        .job-stats {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 12px;
        }

        .stat-item {
          color: #4ecdc4;
          font-weight: bold;
        }

        .job-actions {
          display: flex;
          gap: 10px;
        }

        .btn-cancel-job,
        .btn-export-results,
        .btn-delete-job {
          padding: 8px 15px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel-job {
          background: linear-gradient(145deg, #ff6b6b, #ee5a52);
          color: white;
        }

        .btn-export-results {
          background: linear-gradient(145deg, #4ecdc4, #44a08d);
          color: white;
        }

        .btn-delete-job {
          background: linear-gradient(145deg, #666, #555);
          color: white;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AIBodyEditorPanel;
