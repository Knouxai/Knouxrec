interface LanguageDefinition {
  code: string;
  name: string;
  nameNative: string;
  flag: string;
  rtl: boolean;
  direction: "ltr" | "rtl";
  dateFormat: string;
  numberFormat: string;
  currency: string;
}

interface TranslationKeys {
  // Navigation
  home: string;
  templates: string;
  toolbox: string;
  recordings: string;
  files: string;
  settings: string;
  back: string;

  // Common actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  upload: string;
  download: string;
  close: string;
  open: string;

  // Settings
  general: string;
  appearance: string;
  language: string;
  theme: string;
  light: string;
  dark: string;
  notifications: string;
  autoSave: string;
  soundEffects: string;

  // Recording
  startRecording: string;
  stopRecording: string;
  pauseRecording: string;
  resumeRecording: string;
  screenshot: string;
  quality: string;
  frameRate: string;

  // AI
  aiProcessing: string;
  aiAnalysis: string;
  smartFeatures: string;
  offlineTools: string;

  // Status messages
  processing: string;
  completed: string;
  failed: string;
  loading: string;
  ready: string;

  // File operations
  fileName: string;
  fileSize: string;
  fileType: string;
  lastModified: string;

  // Time and date
  today: string;
  yesterday: string;
  minutes: string;
  hours: string;
  days: string;
  weeks: string;
  months: string;

  // Errors and confirmations
  error: string;
  warning: string;
  success: string;
  confirm: string;
  areYouSure: string;

  // Help and about
  help: string;
  about: string;
  version: string;
  support: string;
  documentation: string;

  // Visual Patch Lab
  visualPatchLab: string;
  bodyEditing: string;
  imageEffects: string;
  filters: string;

  // Descriptions
  professionalRecording: string;
  aiPoweredFeatures: string;
  realTimeEffects: string;
}

type Translations = {
  [key in keyof TranslationKeys]: string;
};

class LanguageService {
  private static instance: LanguageService;
  private currentLanguage: string = "ar";
  private fallbackLanguage: string = "en";
  private listeners: Array<(language: string) => void> = [];

  static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  private languages: LanguageDefinition[] = [
    {
      code: "ar",
      name: "Arabic",
      nameNative: "العربية",
      flag: "🇸🇦",
      rtl: true,
      direction: "rtl",
      dateFormat: "DD/MM/YYYY",
      numberFormat: "0,0.00",
      currency: "SAR",
    },
    {
      code: "en",
      name: "English",
      nameNative: "English",
      flag: "🇺🇸",
      rtl: false,
      direction: "ltr",
      dateFormat: "MM/DD/YYYY",
      numberFormat: "0,0.00",
      currency: "USD",
    },
    {
      code: "fr",
      name: "French",
      nameNative: "Français",
      flag: "🇫🇷",
      rtl: false,
      direction: "ltr",
      dateFormat: "DD/MM/YYYY",
      numberFormat: "0 0,00",
      currency: "EUR",
    },
    {
      code: "es",
      name: "Spanish",
      nameNative: "Español",
      flag: "🇪🇸",
      rtl: false,
      direction: "ltr",
      dateFormat: "DD/MM/YYYY",
      numberFormat: "0.0,00",
      currency: "EUR",
    },
    {
      code: "de",
      name: "German",
      nameNative: "Deutsch",
      flag: "🇩🇪",
      rtl: false,
      direction: "ltr",
      dateFormat: "DD.MM.YYYY",
      numberFormat: "0.0,00",
      currency: "EUR",
    },
    {
      code: "zh",
      name: "Chinese",
      nameNative: "中文",
      flag: "🇨🇳",
      rtl: false,
      direction: "ltr",
      dateFormat: "YYYY/MM/DD",
      numberFormat: "0,0.00",
      currency: "CNY",
    },
    {
      code: "ja",
      name: "Japanese",
      nameNative: "日本語",
      flag: "🇯🇵",
      rtl: false,
      direction: "ltr",
      dateFormat: "YYYY/MM/DD",
      numberFormat: "0,0.00",
      currency: "JPY",
    },
    {
      code: "ko",
      name: "Korean",
      nameNative: "한국어",
      flag: "🇰🇷",
      rtl: false,
      direction: "ltr",
      dateFormat: "YYYY.MM.DD",
      numberFormat: "0,0.00",
      currency: "KRW",
    },
    {
      code: "ru",
      name: "Russian",
      nameNative: "Русский",
      flag: "🇷🇺",
      rtl: false,
      direction: "ltr",
      dateFormat: "DD.MM.YYYY",
      numberFormat: "0 0,00",
      currency: "RUB",
    },
    {
      code: "tr",
      name: "Turkish",
      nameNative: "Türkçe",
      flag: "🇹🇷",
      rtl: false,
      direction: "ltr",
      dateFormat: "DD.MM.YYYY",
      numberFormat: "0.0,00",
      currency: "TRY",
    },
  ];

  private translations: Record<string, Translations> = {
    ar: {
      // Navigation
      home: "الرئيسية",
      templates: "القوالب",
      toolbox: "صندوق الأدوات",
      recordings: "التسجيلات",
      files: "الملفات",
      settings: "الإعدادات",
      back: "رجوع",

      // Common actions
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تحرير",
      create: "إنشاء",
      upload: "رفع",
      download: "تحميل",
      close: "إغلاق",
      open: "فتح",

      // Settings
      general: "عام",
      appearance: "المظهر",
      language: "اللغة",
      theme: "السمة",
      light: "فاتح",
      dark: "داكن",
      notifications: "الإشعارات",
      autoSave: "الحفظ التلقائي",
      soundEffects: "المؤثرات الصوتية",

      // Recording
      startRecording: "بدء التسجيل",
      stopRecording: "إيقاف التسجيل",
      pauseRecording: "إيقاف مؤقت",
      resumeRecording: "استئناف",
      screenshot: "لقطة شاشة",
      quality: "الجودة",
      frameRate: "معدل الإطارات",

      // AI
      aiProcessing: "معالجة بالذكاء الاصطناعي",
      aiAnalysis: "التحليل الذكي",
      smartFeatures: "الميزات الذكية",
      offlineTools: "أدوات أوفلاين",

      // Status messages
      processing: "جار المعالجة",
      completed: "مكتمل",
      failed: "فشل",
      loading: "جار التحميل",
      ready: "جاهز",

      // File operations
      fileName: "اسم الملف",
      fileSize: "حجم الملف",
      fileType: "نوع الملف",
      lastModified: "آخر تعديل",

      // Time and date
      today: "اليوم",
      yesterday: "أمس",
      minutes: "دقائق",
      hours: "ساعات",
      days: "أيام",
      weeks: "أسابيع",
      months: "أشهر",

      // Errors and confirmations
      error: "خطأ",
      warning: "تحذير",
      success: "نجح",
      confirm: "تأكيد",
      areYouSure: "هل أنت متأكد؟",

      // Help and about
      help: "المساعدة",
      about: "حول",
      version: "الإصدار",
      support: "الدعم",
      documentation: "التوثيق",

      // Visual Patch Lab
      visualPatchLab: "مختبر الرقع البصرية",
      bodyEditing: "تحرير الجسم",
      imageEffects: "تأثيرات الصور",
      filters: "المرشحات",

      // Descriptions
      professionalRecording: "تسجيل احترافي",
      aiPoweredFeatures: "ميزات مدعومة بالذكاء الاصطناعي",
      realTimeEffects: "تأثيرات فورية",
    },

    en: {
      // Navigation
      home: "Home",
      templates: "Templates",
      toolbox: "Toolbox",
      recordings: "Recordings",
      files: "Files",
      settings: "Settings",
      back: "Back",

      // Common actions
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      upload: "Upload",
      download: "Download",
      close: "Close",
      open: "Open",

      // Settings
      general: "General",
      appearance: "Appearance",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      notifications: "Notifications",
      autoSave: "Auto Save",
      soundEffects: "Sound Effects",

      // Recording
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      pauseRecording: "Pause Recording",
      resumeRecording: "Resume Recording",
      screenshot: "Screenshot",
      quality: "Quality",
      frameRate: "Frame Rate",

      // AI
      aiProcessing: "AI Processing",
      aiAnalysis: "AI Analysis",
      smartFeatures: "Smart Features",
      offlineTools: "Offline Tools",

      // Status messages
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      loading: "Loading",
      ready: "Ready",

      // File operations
      fileName: "File Name",
      fileSize: "File Size",
      fileType: "File Type",
      lastModified: "Last Modified",

      // Time and date
      today: "Today",
      yesterday: "Yesterday",
      minutes: "minutes",
      hours: "hours",
      days: "days",
      weeks: "weeks",
      months: "months",

      // Errors and confirmations
      error: "Error",
      warning: "Warning",
      success: "Success",
      confirm: "Confirm",
      areYouSure: "Are you sure?",

      // Help and about
      help: "Help",
      about: "About",
      version: "Version",
      support: "Support",
      documentation: "Documentation",

      // Visual Patch Lab
      visualPatchLab: "Visual Patch Lab",
      bodyEditing: "Body Editing",
      imageEffects: "Image Effects",
      filters: "Filters",

      // Descriptions
      professionalRecording: "Professional Recording",
      aiPoweredFeatures: "AI-Powered Features",
      realTimeEffects: "Real-Time Effects",
    },

    fr: {
      // Navigation
      home: "Accueil",
      templates: "Modèles",
      toolbox: "Boîte à outils",
      recordings: "Enregistrements",
      files: "Fichiers",
      settings: "Paramètres",
      back: "Retour",

      // Common actions
      save: "Sauvegarder",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      create: "Créer",
      upload: "Télécharger",
      download: "Télécharger",
      close: "Fermer",
      open: "Ouvrir",

      // Settings
      general: "Général",
      appearance: "Apparence",
      language: "Langue",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
      notifications: "Notifications",
      autoSave: "Sauvegarde automatique",
      soundEffects: "Effets sonores",

      // Recording
      startRecording: "Commencer l'enregistrement",
      stopRecording: "Arrêter l'enregistrement",
      pauseRecording: "Mettre en pause",
      resumeRecording: "Reprendre",
      screenshot: "Capture d'écran",
      quality: "Qualité",
      frameRate: "Fréquence d'images",

      // AI
      aiProcessing: "Traitement IA",
      aiAnalysis: "Analyse IA",
      smartFeatures: "Fonctionnalités intelligentes",
      offlineTools: "Outils hors ligne",

      // Status messages
      processing: "Traitement en cours",
      completed: "Terminé",
      failed: "Échoué",
      loading: "Chargement",
      ready: "Prêt",

      // File operations
      fileName: "Nom du fichier",
      fileSize: "Taille du fichier",
      fileType: "Type de fichier",
      lastModified: "Dernière modification",

      // Time and date
      today: "Aujourd'hui",
      yesterday: "Hier",
      minutes: "minutes",
      hours: "heures",
      days: "jours",
      weeks: "semaines",
      months: "mois",

      // Errors and confirmations
      error: "Erreur",
      warning: "Avertissement",
      success: "Succès",
      confirm: "Confirmer",
      areYouSure: "Êtes-vous sûr?",

      // Help and about
      help: "Aide",
      about: "À propos",
      version: "Version",
      support: "Support",
      documentation: "Documentation",

      // Visual Patch Lab
      visualPatchLab: "Laboratoire de patch visuel",
      bodyEditing: "Édition corporelle",
      imageEffects: "Effets d'image",
      filters: "Filtres",

      // Descriptions
      professionalRecording: "Enregistrement professionnel",
      aiPoweredFeatures: "Fonctionnalités alimentées par l'IA",
      realTimeEffects: "Effets en temps réel",
    },

    es: {
      // Navigation
      home: "Inicio",
      templates: "Plantillas",
      toolbox: "Caja de herramientas",
      recordings: "Grabaciones",
      files: "Archivos",
      settings: "Configuración",
      back: "Atrás",

      // Common actions
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      create: "Crear",
      upload: "Subir",
      download: "Descargar",
      close: "Cerrar",
      open: "Abrir",

      // Settings
      general: "General",
      appearance: "Apariencia",
      language: "Idioma",
      theme: "Tema",
      light: "Claro",
      dark: "Oscuro",
      notifications: "Notificaciones",
      autoSave: "Guardado automático",
      soundEffects: "Efectos de sonido",

      // Recording
      startRecording: "Iniciar grabación",
      stopRecording: "Detener grabación",
      pauseRecording: "Pausar grabación",
      resumeRecording: "Reanudar grabación",
      screenshot: "Captura de pantalla",
      quality: "Calidad",
      frameRate: "Tasa de fotogramas",

      // AI
      aiProcessing: "Procesamiento IA",
      aiAnalysis: "Análisis IA",
      smartFeatures: "Características inteligentes",
      offlineTools: "Herramientas sin conexión",

      // Status messages
      processing: "Procesando",
      completed: "Completado",
      failed: "Fallido",
      loading: "Cargando",
      ready: "Listo",

      // File operations
      fileName: "Nombre del archivo",
      fileSize: "Tamaño del archivo",
      fileType: "Tipo de archivo",
      lastModified: "Última modificación",

      // Time and date
      today: "Hoy",
      yesterday: "Ayer",
      minutes: "minutos",
      hours: "horas",
      days: "días",
      weeks: "semanas",
      months: "meses",

      // Errors and confirmations
      error: "Error",
      warning: "Advertencia",
      success: "Éxito",
      confirm: "Confirmar",
      areYouSure: "¿Estás seguro?",

      // Help and about
      help: "Ayuda",
      about: "Acerca de",
      version: "Versión",
      support: "Soporte",
      documentation: "Documentación",

      // Visual Patch Lab
      visualPatchLab: "Laboratorio de parches visuales",
      bodyEditing: "Edición corporal",
      imageEffects: "Efectos de imagen",
      filters: "Filtros",

      // Descriptions
      professionalRecording: "Grabación profesional",
      aiPoweredFeatures: "Características impulsadas por IA",
      realTimeEffects: "Efectos en tiempo real",
    },
  };

  constructor() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("knoux_language");
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    }

    // Apply language settings to document
    this.applyLanguageSettings();
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(languageCode: string): boolean {
    if (!this.isLanguageSupported(languageCode)) {
      console.warn(`Language ${languageCode} is not supported`);
      return false;
    }

    this.currentLanguage = languageCode;
    localStorage.setItem("knoux_language", languageCode);
    this.applyLanguageSettings();
    this.notifyListeners();
    return true;
  }

  getLanguages(): LanguageDefinition[] {
    return this.languages;
  }

  getCurrentLanguageInfo(): LanguageDefinition | null {
    return (
      this.languages.find((lang) => lang.code === this.currentLanguage) || null
    );
  }

  isLanguageSupported(languageCode: string): boolean {
    return this.languages.some((lang) => lang.code === languageCode);
  }

  translate(key: keyof TranslationKeys): string {
    const currentTranslations = this.translations[this.currentLanguage];
    const fallbackTranslations = this.translations[this.fallbackLanguage];

    return currentTranslations?.[key] || fallbackTranslations?.[key] || key;
  }

  // Shorthand method for translation
  t(key: keyof TranslationKeys): string {
    return this.translate(key);
  }

  // Get translation with interpolation
  translateWithParams(
    key: keyof TranslationKeys,
    params: Record<string, string | number>,
  ): string {
    let translation = this.translate(key);

    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{{${param}}}`, String(value));
    });

    return translation;
  }

  // Format number according to current language
  formatNumber(number: number): string {
    const langInfo = this.getCurrentLanguageInfo();
    if (!langInfo) return number.toString();

    try {
      return new Intl.NumberFormat(langInfo.code).format(number);
    } catch {
      return number.toString();
    }
  }

  // Format date according to current language
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const langInfo = this.getCurrentLanguageInfo();
    if (!langInfo) return date.toLocaleDateString();

    try {
      return new Intl.DateTimeFormat(langInfo.code, options).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMinutes < 1) return this.t("ready");
    if (diffMinutes < 60) return `${diffMinutes} ${this.t("minutes")}`;
    if (diffHours < 24) return `${diffHours} ${this.t("hours")}`;
    if (diffDays === 1) return this.t("yesterday");
    if (diffDays < 7) return `${diffDays} ${this.t("days")}`;
    if (diffWeeks < 4) return `${diffWeeks} ${this.t("weeks")}`;
    return `${diffMonths} ${this.t("months")}`;
  }

  // Format file size
  formatFileSize(bytes: number): string {
    const units =
      this.currentLanguage === "ar"
        ? ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"]
        : ["B", "KB", "MB", "GB", "TB"];

    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Apply language settings to document
  private applyLanguageSettings(): void {
    const langInfo = this.getCurrentLanguageInfo();
    if (!langInfo) return;

    // Set document direction
    document.documentElement.dir = langInfo.direction;
    document.documentElement.lang = langInfo.code;

    // Add language class to body
    document.body.classList.remove(
      ...this.languages.map((lang) => `lang-${lang.code}`),
    );
    document.body.classList.add(`lang-${langInfo.code}`);

    // Add RTL class if needed
    if (langInfo.rtl) {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }

  // Add language change listener
  onLanguageChange(callback: (language: string) => void): void {
    this.listeners.push(callback);
  }

  // Remove language change listener
  offLanguageChange(callback: (language: string) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  // Notify all listeners of language change
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentLanguage));
  }

  // Add new translation key dynamically
  addTranslation(key: string, translations: Record<string, string>): void {
    Object.entries(translations).forEach(([langCode, translation]) => {
      if (this.translations[langCode]) {
        (this.translations[langCode] as any)[key] = translation;
      }
    });
  }

  // Get all translations for a specific language
  getAllTranslations(languageCode?: string): Translations {
    const langCode = languageCode || this.currentLanguage;
    return (
      this.translations[langCode] || this.translations[this.fallbackLanguage]
    );
  }

  // Check if RTL is enabled
  isRTL(): boolean {
    const langInfo = this.getCurrentLanguageInfo();
    return langInfo?.rtl || false;
  }

  // Get direction for CSS
  getDirection(): "ltr" | "rtl" {
    const langInfo = this.getCurrentLanguageInfo();
    return langInfo?.direction || "ltr";
  }

  // Export translations for external use
  exportTranslations(): Record<string, Translations> {
    return { ...this.translations };
  }

  // Import translations from external source
  importTranslations(translations: Record<string, Translations>): void {
    Object.entries(translations).forEach(([langCode, langTranslations]) => {
      if (this.isLanguageSupported(langCode)) {
        this.translations[langCode] = {
          ...this.translations[langCode],
          ...langTranslations,
        };
      }
    });
  }
}

export default LanguageService;
export type { LanguageDefinition, TranslationKeys, Translations };
