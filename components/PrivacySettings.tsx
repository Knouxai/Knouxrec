import React, { useState, useEffect } from "react";

interface PrivacySettings {
  dataRetention: {
    autoDelete: boolean;
    retentionPeriod: number; // أيام
    deleteProcessedFiles: boolean;
    encryptStorage: boolean;
  };
  processing: {
    localOnly: boolean;
    blockExternalRequests: boolean;
    anonymizeMetadata: boolean;
    disableTelemetry: boolean;
  };
  security: {
    requireAuthentication: boolean;
    sessionTimeout: number; // دقائق
    encryptExports: boolean;
    auditLogging: boolean;
  };
  sharing: {
    allowExport: boolean;
    watermarkOutputs: boolean;
    restrictFormats: string[];
    requireConfirmation: boolean;
  };
}

interface SecurityLog {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  risk: "low" | "medium" | "high";
}

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataRetention: {
      autoDelete: true,
      retentionPeriod: 30,
      deleteProcessedFiles: true,
      encryptStorage: true,
    },
    processing: {
      localOnly: true,
      blockExternalRequests: true,
      anonymizeMetadata: true,
      disableTelemetry: true,
    },
    security: {
      requireAuthentication: false,
      sessionTimeout: 60,
      encryptExports: true,
      auditLogging: true,
    },
    sharing: {
      allowExport: true,
      watermarkOutputs: false,
      restrictFormats: [],
      requireConfirmation: true,
    },
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [activeTab, setActiveTab] = useState<
    "privacy" | "security" | "logs" | "advanced"
  >("privacy");

  // تحميل سجلات الأمان
  useEffect(() => {
    const generateLogs = (): SecurityLog[] => {
      return [
        {
          id: "log1",
          timestamp: new Date(),
          action: "معالجة ملف فيديو",
          user: "المستخدم الحالي",
          details: "تم معالجة ملف MP4 بحجم 15MB محلياً",
          risk: "low",
        },
        {
          id: "log2",
          timestamp: new Date(Date.now() - 3600000),
          action: "تصدير مشروع",
          user: "المستخدم الحالي",
          details: "تم تصدير مشروع مع تشفير",
          risk: "low",
        },
        {
          id: "log3",
          timestamp: new Date(Date.now() - 7200000),
          action: "تحديث النماذج",
          user: "النظام",
          details: "تم تحديث 3 نماذج ذكاء اصطناعي",
          risk: "medium",
        },
        {
          id: "log4",
          timestamp: new Date(Date.now() - 10800000),
          action: "حذف ملفات مؤقتة",
          user: "النظام",
          details: "تم حذف 1.2GB من الملفات المؤقتة",
          risk: "low",
        },
      ];
    };

    setSecurityLogs(generateLogs());
  }, []);

  // حفظ الإعدادات
  const saveSettings = () => {
    localStorage.setItem("knoux_privacy_settings", JSON.stringify(settings));
    alert("تم حفظ إعدادات الخصوصية بنجاح! 🔒");
  };

  // استعادة الإعدادات الافتراضية
  const resetToDefault = () => {
    if (confirm("هل أنت متأكد من استعادة الإعدادات الافتراضية؟")) {
      setSettings({
        dataRetention: {
          autoDelete: true,
          retentionPeriod: 30,
          deleteProcessedFiles: true,
          encryptStorage: true,
        },
        processing: {
          localOnly: true,
          blockExternalRequests: true,
          anonymizeMetadata: true,
          disableTelemetry: true,
        },
        security: {
          requireAuthentication: false,
          sessionTimeout: 60,
          encryptExports: true,
          auditLogging: true,
        },
        sharing: {
          allowExport: true,
          watermarkOutputs: false,
          restrictFormats: [],
          requireConfirmation: true,
        },
      });
    }
  };

  // تنظيف البيانات
  const cleanupData = () => {
    if (
      confirm(
        "سيتم حذف جميع الملفات المؤقتة والبيانات المعالجة. هل تريد المتابعة؟",
      )
    ) {
      // محاكاة عملية التنظيف
      alert("تم تنظيف البيانات بنجاح! تم توفير 2.3GB من المساحة.");
    }
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
      <div className="flex-grow">
        <div className="font-medium text-white mb-1">{label}</div>
        {description && (
          <div className="text-sm text-white/60">{description}</div>
        )}
      </div>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-knoux-purple" : "bg-gray-600"}`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-6" : ""}`}
          ></div>
        </div>
      </label>
    </div>
  );

  const SecurityLogCard = ({ log }: { log: SecurityLog }) => (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
      <div className="flex items-center space-x-4">
        <div
          className={`w-3 h-3 rounded-full ${
            log.risk === "high"
              ? "bg-red-400"
              : log.risk === "medium"
                ? "bg-yellow-400"
                : "bg-green-400"
          }`}
        ></div>
        <div>
          <div className="font-medium text-white">{log.action}</div>
          <div className="text-sm text-white/60">{log.details}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-white/50">{log.user}</div>
        <div className="text-xs text-white/40">
          {log.timestamp.toLocaleTimeString("ar")}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "privacy", name: "الخصوصية", icon: "🔒" },
    { id: "security", name: "الأمان", icon: "🛡️" },
    { id: "logs", name: "السجلات", icon: "📋" },
    { id: "advanced", name: "متقدم", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent mb-2">
          🔒 الخصوصية والأمان
        </h2>
        <p className="text-white/70">تحكم كامل في خصوصيتك وأمان بياناتك</p>
      </div>

      {/* Security Status */}
      <div className="glass-card p-6 rounded-2xl border border-green-400/30 bg-green-400/5">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">🛡️</div>
          <div className="flex-grow">
            <h3 className="text-xl font-rajdhani font-bold text-green-400 mb-1">
              الحماية نشطة
            </h3>
            <p className="text-white/70">
              جميع البيانات تتم معالجتها محلياً بدون إرسال أي معلومات للخارج
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-400 font-medium">100% آمن</div>
            <div className="text-xs text-white/50">معالجة محلية</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-4 rounded-2xl border border-knoux-purple/20">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "bg-knoux-purple/30 border border-knoux-purple text-knoux-purple"
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
              🔒 إعدادات الخصوصية
            </h3>

            {/* الاحتفاظ بالبيانات */}
            <div>
              <h4 className="font-bold text-white mb-4">
                📦 الاحتفاظ بالبيانات
              </h4>
              <div className="space-y-3">
                <ToggleSwitch
                  checked={settings.dataRetention.autoDelete}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      dataRetention: {
                        ...prev.dataRetention,
                        autoDelete: checked,
                      },
                    }))
                  }
                  label="حذف تلقائي للملفات"
                  description="حذف الملفات تلقائي��ً بعد فترة محددة"
                />

                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div>
                    <div className="font-medium text-white mb-1">
                      فترة الاحتفاظ
                    </div>
                    <div className="text-sm text-white/60">
                      عدد الأيام للاحتفاظ بالملفات
                    </div>
                  </div>
                  <select
                    value={settings.dataRetention.retentionPeriod}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        dataRetention: {
                          ...prev.dataRetention,
                          retentionPeriod: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-2 text-white"
                  >
                    <option value={7}>7 أيام</option>
                    <option value={30}>30 يوم</option>
                    <option value={90}>90 يوم</option>
                    <option value={365}>سنة واحدة</option>
                  </select>
                </div>

                <ToggleSwitch
                  checked={settings.dataRetention.deleteProcessedFiles}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      dataRetention: {
                        ...prev.dataRetention,
                        deleteProcessedFiles: checked,
                      },
                    }))
                  }
                  label="حذف الملفات المعالجة"
                  description="حذف الملفات الأصلية بعد المعالجة"
                />

                <ToggleSwitch
                  checked={settings.dataRetention.encryptStorage}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      dataRetention: {
                        ...prev.dataRetention,
                        encryptStorage: checked,
                      },
                    }))
                  }
                  label="تشفير التخزين"
                  description="تشفير جميع الملفات المحفوظة محلياً"
                />
              </div>
            </div>

            {/* المعالجة */}
            <div>
              <h4 className="font-bold text-white mb-4">⚡ إعدادات المعالجة</h4>
              <div className="space-y-3">
                <ToggleSwitch
                  checked={settings.processing.localOnly}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      processing: { ...prev.processing, localOnly: checked },
                    }))
                  }
                  label="معالجة محلية فقط"
                  description="عدم استخدام أي خدمات خارجية"
                />

                <ToggleSwitch
                  checked={settings.processing.blockExternalRequests}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      processing: {
                        ...prev.processing,
                        blockExternalRequests: checked,
                      },
                    }))
                  }
                  label="حظر الطلبات الخارجية"
                  description="منع جميع الاتصالات بالإنترنت"
                />

                <ToggleSwitch
                  checked={settings.processing.anonymizeMetadata}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      processing: {
                        ...prev.processing,
                        anonymizeMetadata: checked,
                      },
                    }))
                  }
                  label="إخفاء البيانات الوصفية"
                  description="إزالة المعلومات الشخصية من الملفات"
                />

                <ToggleSwitch
                  checked={settings.processing.disableTelemetry}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      processing: {
                        ...prev.processing,
                        disableTelemetry: checked,
                      },
                    }))
                  }
                  label="تعطيل جمع البيانات"
                  description="عدم جمع أي إحصائيات استخدام"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
              🛡️ إعدادات الأمان
            </h3>

            <div className="space-y-3">
              <ToggleSwitch
                checked={settings.security.requireAuthentication}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      requireAuthentication: checked,
                    },
                  }))
                }
                label="المصادقة المطلوبة"
                description="طلب كلمة مرور عند فتح التطبيق"
              />

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-medium text-white mb-1">مهلة الجلسة</div>
                  <div className="text-sm text-white/60">
                    إغلاق تلقائي بعد عدم النشاط
                  </div>
                </div>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        sessionTimeout: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="bg-knoux-purple/20 border border-knoux-purple/30 rounded px-3 py-2 text-white"
                >
                  <option value={15}>15 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                  <option value={60}>ساعة واحدة</option>
                  <option value={120}>ساعتان</option>
                </select>
              </div>

              <ToggleSwitch
                checked={settings.security.encryptExports}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    security: { ...prev.security, encryptExports: checked },
                  }))
                }
                label="تشفير الملفات المصدرة"
                description="تشفير جميع الملفات عند التصدير"
              />

              <ToggleSwitch
                checked={settings.security.auditLogging}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    security: { ...prev.security, auditLogging: checked },
                  }))
                }
                label="سجل التدقيق"
                description="تسجيل جميع العمليات والأنشطة"
              />
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-rajdhani font-bold text-white">
                📋 سجلات النشاط
              </h3>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white rounded-xl font-medium transition-all">
                  تصدير السجل
                </button>
                <button
                  onClick={() => setSecurityLogs([])}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-white rounded-xl font-medium transition-all"
                >
                  مسح السجل
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {securityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">���</div>
                  <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                    لا توجد سجلات
                  </h3>
                  <p className="text-white/70">
                    ستظهر سجلات النشاط هنا عند بدء الاستخدام
                  </p>
                </div>
              ) : (
                securityLogs.map((log) => (
                  <SecurityLogCard key={log.id} log={log} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-6">
            <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
              ⚙️ إعدادات متقدمة
            </h3>

            {/* تنظيف البيانات */}
            <div className="p-6 bg-yellow-400/10 rounded-xl border border-yellow-400/30">
              <h4 className="font-bold text-yellow-400 mb-3">
                🧹 تنظيف البيانات
              </h4>
              <p className="text-white/70 mb-4">
                إزالة الملفات المؤقتة والبيانات غير المستخدمة لتوفير مساحة
                التخزين
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cleanupData}
                  className="px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/40 text-yellow-400 hover:text-white rounded-xl font-medium transition-all"
                >
                  تنظيف الآن
                </button>
                <div className="text-sm text-white/50 flex items-center">
                  آخر تنظيف: منذ 3 أيام
                </div>
              </div>
            </div>

            {/* نسخ احتياطي */}
            <div className="p-6 bg-blue-400/10 rounded-xl border border-blue-400/30">
              <h4 className="font-bold text-blue-400 mb-3">
                💾 النسخ الاحتياطي
              </h4>
              <p className="text-white/70 mb-4">
                إنشاء نسخة احتياطية من الإعدادات والمشاريع
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-3 bg-blue-400/20 hover:bg-blue-400/30 rounded-lg text-left transition-all">
                  <div className="font-medium text-white">
                    إنشاء نسخة احتياطية
                  </div>
                  <div className="text-sm text-white/60">حفظ جميع البيانات</div>
                </button>
                <button className="p-3 bg-green-400/20 hover:bg-green-400/30 rounded-lg text-left transition-all">
                  <div className="font-medium text-white">استعادة النسخة</div>
                  <div className="text-sm text-white/60">
                    استيراد بيانات محفوظة
                  </div>
                </button>
              </div>
            </div>

            {/* مشاركة البيانات */}
            <div>
              <h4 className="font-bold text-white mb-4">📤 إعدادات المشاركة</h4>
              <div className="space-y-3">
                <ToggleSwitch
                  checked={settings.sharing.allowExport}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      sharing: { ...prev.sharing, allowExport: checked },
                    }))
                  }
                  label="السماح بالتصدير"
                  description="تمكين تصدير الملفات والمشاريع"
                />

                <ToggleSwitch
                  checked={settings.sharing.watermarkOutputs}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      sharing: { ...prev.sharing, watermarkOutputs: checked },
                    }))
                  }
                  label="علامة ��ائية على المخرجات"
                  description="إضافة علامة مائية لجميع الملفات المصدرة"
                />

                <ToggleSwitch
                  checked={settings.sharing.requireConfirmation}
                  onChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      sharing: {
                        ...prev.sharing,
                        requireConfirmation: checked,
                      },
                    }))
                  }
                  label="تأكيد المشاركة"
                  description="طلب تأكيد قبل تصدير أو مشاركة الملفات"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <button
            onClick={saveSettings}
            className="px-6 py-3 bg-knoux-purple hover:bg-knoux-purple/80 text-white rounded-xl font-medium transition-all"
          >
            حفظ الإعدادات
          </button>
          <button
            onClick={resetToDefault}
            className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 hover:text-white rounded-xl font-medium transition-all"
          >
            استعادة الافتراضي
          </button>
        </div>

        <div className="text-sm text-white/50">
          آخر حفظ: {new Date().toLocaleString("ar")}
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
