import React, { useState, useEffect } from "react";
import {
  realContentAllocator,
  RealContent,
} from "../services/realContentAllocator";
import {
  realUserExperience,
  ProjectData,
  Achievement,
} from "../services/realUserExperience";

interface RealContentManagerProps {
  onContentUpdate?: (stats: any) => void;
}

const RealContentManager: React.FC<RealContentManagerProps> = ({
  onContentUpdate,
}) => {
  const [contentStats, setContentStats] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<ProjectData[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationComplete, setAllocationComplete] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    initializeRealContent();
  }, []);

  const initializeRealContent = async () => {
    setIsAllocating(true);

    try {
      // تطبيق المحتوى الحقيقي
      await realContentAllocator.applyContentToUser();

      // الحصول على الإحصائيات
      const stats = realContentAllocator.getContentStats();
      setContentStats(stats);

      // تحديث بيانات المستخدم
      updateUserData();

      setAllocationComplete(true);

      if (onContentUpdate) {
        onContentUpdate(stats);
      }

      console.log("✅ تم تهيئة جميع المحتوى الحقيقي للمستخدم");
    } catch (error) {
      console.error("فشل في تهيئة المحتوى:", error);
    } finally {
      setIsAllocating(false);
    }
  };

  const updateUserData = () => {
    const projects = realUserExperience.getAllProjects();
    const achievements = realUserExperience.getAllAchievements();
    const stats = realUserExperience.getUserStats();

    setUserProjects(projects);
    setUserAchievements(achievements);
    setUserStats(stats);
  };

  const createNewProject = () => {
    const projectName = `مشروع ${userProjects.length + 1}`;
    const projectId = realUserExperience.createProject(projectName, "video");

    updateUserData();

    // إشعار نجاح
    const event = new CustomEvent("showNotification", {
      detail: {
        message: `تم إنشاء مشروع جديد: ${projectName}`,
        type: "success",
      },
    });
    window.dispatchEvent(event);
  };

  const startRecording = async () => {
    const recorder = realUserExperience.getRealTimeFeature("screen-recorder");
    const success = await recorder.startRecording();

    if (success) {
      const event = new CustomEvent("showNotification", {
        detail: {
          message: "تم بدء التسجيل بنجاح",
          type: "success",
        },
      });
      window.dispatchEvent(event);
    } else {
      const event = new CustomEvent("showNotification", {
        detail: {
          message: "فشل في بدء التسجيل",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }

    updateUserData();
  };

  const stopRecording = () => {
    const recorder = realUserExperience.getRealTimeFeature("screen-recorder");
    recorder.stopRecording();

    const event = new CustomEvent("showNotification", {
      detail: {
        message: "تم إيقاف التسجيل",
        type: "info",
      },
    });
    window.dispatchEvent(event);

    updateUserData();
  };

  const exportProject = async (projectId: string) => {
    const success = await realUserExperience.exportProject(projectId, "mp4");

    if (success) {
      const event = new CustomEvent("showNotification", {
        detail: {
          message: "تم تصدير المشروع بنجاح",
          type: "success",
        },
      });
      window.dispatchEvent(event);
      updateUserData();
    }
  };

  if (isAllocating) {
    return (
      <div className="glass-card p-8 rounded-xl border border-knoux-purple/30 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
            تحضير المحتوى الحقيقي
          </h2>
          <p className="text-white/70 mb-6">
            جاري تخصيص وتفعيل جميع الأدوات والخدمات الحقيقية...
          </p>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-3 rounded-full transition-all duration-1000 animate-pulse w-full"></div>
          </div>
          <div className="text-sm text-white/60">
            تهيئة القوالب، الأدوات، الفلاتر، والتأثيرات...
          </div>
        </div>
      </div>
    );
  }

  if (!allocationComplete || !contentStats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات المحتوى */}
      <div className="glass-card p-6 rounded-xl border border-knoux-purple/30">
        <h3 className="text-xl font-orbitron font-bold text-white mb-4">
          📊 إحصائيات المحتوى الحقيقي
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {contentStats.total}
            </div>
            <div className="text-sm text-white/70">إجمالي المحتوى</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {contentStats.usable}
            </div>
            <div className="text-sm text-white/70">قابل للاستخدام</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Object.keys(contentStats.types).length}
            </div>
            <div className="text-sm text-white/70">أنواع المحتوى</div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {contentStats.categories.length}
            </div>
            <div className="text-sm text-white/70">فئات المحتوى</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(contentStats.types).map(([type, count]) => {
            const typeNames: Record<string, string> = {
              template: "القوالب",
              tool: "الأدوات",
              filter: "الفلاتر",
              effect: "التأثيرات",
              preset: "الإعدادات",
              asset: "الأصول",
            };

            return (
              <div key={type} className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {count as number}
                </div>
                <div className="text-xs text-white/60">
                  {typeNames[type] || type}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* أدوات التحكم السريع */}
      <div className="glass-card p-6 rounded-xl border border-knoux-purple/30">
        <h3 className="text-xl font-orbitron font-bold text-white mb-4">
          🎮 أدوات التحكم الحقيقية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={startRecording}
            className="flex items-center justify-center space-x-2 p-4 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg text-red-300 hover:text-white transition-all"
          >
            <span className="text-2xl">🔴</span>
            <span>بدء التسجيل</span>
          </button>

          <button
            onClick={stopRecording}
            className="flex items-center justify-center space-x-2 p-4 bg-gray-500/20 hover:bg-gray-500/40 border border-gray-500/30 rounded-lg text-gray-300 hover:text-white transition-all"
          >
            <span className="text-2xl">⏹️</span>
            <span>إيقاف التسجيل</span>
          </button>

          <button
            onClick={createNewProject}
            className="flex items-center justify-center space-x-2 p-4 bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 rounded-lg text-green-300 hover:text-white transition-all"
          >
            <span className="text-2xl">📝</span>
            <span>مشروع جديد</span>
          </button>

          <button
            onClick={() =>
              realUserExperience
                .getRealTimeFeature("screen-recorder")
                .startRecording()
            }
            className="flex items-center justify-center space-x-2 p-4 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded-lg text-blue-300 hover:text-white transition-all"
          >
            <span className="text-2xl">📸</span>
            <span>لقطة شاشة</span>
          </button>
        </div>
      </div>

      {/* مشاريع المستخدم */}
      <div className="glass-card p-6 rounded-xl border border-knoux-purple/30">
        <h3 className="text-xl font-orbitron font-bold text-white mb-4">
          📁 مشاريعي ({userProjects.length})
        </h3>

        {userProjects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-white/70 mb-4">لا توجد مشاريع بعد</p>
            <button
              onClick={createNewProject}
              className="px-6 py-3 bg-gradient-to-r from-knoux-purple to-knoux-neon rounded-xl font-bold text-white hover:scale-105 transition-all"
            >
              إنشاء أول مشروع
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProjects.map((project) => (
              <div key={project.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white">{project.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      project.status === "completed"
                        ? "bg-green-500/20 text-green-300"
                        : project.status === "editing"
                          ? "bg-blue-500/20 text-blue-300"
                          : project.status === "rendering"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {project.status === "completed"
                      ? "مكتمل"
                      : project.status === "editing"
                        ? "قيد التحرير"
                        : project.status === "rendering"
                          ? "قيد التصدير"
                          : "مسودة"}
                  </span>
                </div>

                <div className="text-sm text-white/60 mb-3">
                  <div>
                    النوع:{" "}
                    {project.type === "video"
                      ? "فيديو"
                      : project.type === "audio"
                        ? "صوت"
                        : "عرض تقديمي"}
                  </div>
                  <div>
                    تم الإنشاء:{" "}
                    {new Date(project.createdAt).toLocaleDateString("ar-SA")}
                  </div>
                  <div>المدة: {project.duration} ثانية</div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => exportProject(project.id)}
                    disabled={project.status === "rendering"}
                    className="flex-1 px-3 py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-lg text-knoux-purple hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {project.status === "rendering"
                      ? "جاري التصدير..."
                      : "تصدير"}
                  </button>
                  <button className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-300 hover:text-white transition-all text-sm">
                    تحرير
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* إنجازات المستخدم */}
      {userAchievements.length > 0 && (
        <div className="glass-card p-6 rounded-xl border border-knoux-purple/30">
          <h3 className="text-xl font-orbitron font-bold text-white mb-4">
            🏆 إنجازاتي ({userAchievements.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 text-center"
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-bold text-white mb-1">
                  {achievement.name}
                </h4>
                <p className="text-xs text-white/70 mb-2">
                  {achievement.description}
                </p>
                <div className="text-xs text-yellow-300">
                  {new Date(achievement.unlockedAt).toLocaleDateString("ar-SA")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* إحصائيات المستخدم */}
      {userStats && (
        <div className="glass-card p-6 rounded-xl border border-knoux-purple/30">
          <h3 className="text-xl font-orbitron font-bold text-white mb-4">
            📈 إحصائياتي
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {userStats.totalProjects}
              </div>
              <div className="text-sm text-white/70">إجمالي المشاريع</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {userStats.totalAchievements}
              </div>
              <div className="text-sm text-white/70">إجمالي الإنجازات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {userStats.currentSessionActions}
              </div>
              <div className="text-sm text-white/70">إجراءات الجلسة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(userStats.sessionDuration / 1000 / 60)}
              </div>
              <div className="text-sm text-white/70">دقائق النشاط</div>
            </div>
          </div>
        </div>
      )}

      {/* المساعدة السريعة */}
      <div className="glass-card p-6 rounded-xl border border-knoux-purple/30">
        <h3 className="text-xl font-orbitron font-bold text-white mb-4">
          💡 المساعدة السريعة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-bold text-knoux-neon mb-2">
              اختصارات لوحة المفاتيح:
            </h4>
            <div className="space-y-1 text-white/70">
              <div>
                <kbd className="bg-white/10 px-2 py-1 rounded">F9</kbd> -
                بدء/إيقاف التسجيل
              </div>
              <div>
                <kbd className="bg-white/10 px-2 py-1 rounded">F10</kbd> - إيقاف
                التسجيل
              </div>
              <div>
                <kbd className="bg-white/10 px-2 py-1 rounded">F11</kbd> - إيقاف
                مؤقت
              </div>
              <div>
                <kbd className="bg-white/10 px-2 py-1 rounded">F12</kbd> - لقطة
                شاشة
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-knoux-neon mb-2">نصائح سريعة:</h4>
            <div className="space-y-1 text-white/70">
              <div>• استخدم القوالب لتوفير الوقت</div>
              <div>• جرب الفلاتر والتأثيرات المختلفة</div>
              <div>• احفظ عملك بانتظام</div>
              <div>• اختر جودة مناسبة للتصدير</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealContentManager;
