// KNOUX REC - Advanced Feedback & Notification Service
// نظام الإشعارات وردود الفعل المتقدم

export interface NotificationOptions {
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "loading";
  duration?: number; // milliseconds, 0 for persistent
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center";
  sound?: boolean;
  vibration?: boolean;
  icon?: string;
  actions?: {
    label: string;
    action: () => void;
    style?: "primary" | "secondary" | "danger";
  }[];
  onClose?: () => void;
  progress?: number; // 0-100 for loading notifications
}

export interface ToastNotification {
  id: string;
  options: NotificationOptions;
  createdAt: Date;
  isVisible: boolean;
}

export interface FeedbackOptions {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  sound?: boolean;
  vibration?: boolean;
  visual?: boolean;
}

export class FeedbackService {
  private notifications: Map<string, ToastNotification> = new Map();
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;
  private visualEnabled: boolean = true;
  private container: HTMLElement | null = null;

  // Sound URLs للأصوات المختلفة
  private sounds = {
    success:
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEQDVqu4si4ZBoELILM8txrJAUbbrjt5Z1PER...",
    error:
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEQDVqu4si4ZBoELILM8txrJAUbbrjt5Z1PER...",
    warning:
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEQDVqu4si4ZBoELILM8txrJAUbbrjt5Z1PER...",
    info: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEQDVqu4si4ZBoELILM8txrJAUbbrjt5Z1PER...",
    click:
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEQDVqu4si4ZBoELILM8txrJAUbbrjt5Z1PER...",
  };

  constructor() {
    this.init();
  }

  private init(): void {
    // إنشاء container للإشعارات
    this.container = document.createElement("div");
    this.container.id = "knoux-notifications";
    this.container.className =
      "fixed top-4 right-4 z-[10000] space-y-3 pointer-events-none";
    document.body.appendChild(this.container);

    // تحميل الإعدادات من localStorage
    this.loadSettings();
  }

  private loadSettings(): void {
    const settings = localStorage.getItem("knoux-feedback-settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      this.soundEnabled = parsed.sound ?? true;
      this.vibrationEnabled = parsed.vibration ?? true;
      this.visualEnabled = parsed.visual ?? true;
    }
  }

  private saveSettings(): void {
    localStorage.setItem(
      "knoux-feedback-settings",
      JSON.stringify({
        sound: this.soundEnabled,
        vibration: this.vibrationEnabled,
        visual: this.visualEnabled,
      }),
    );
  }

  // إشعار عام
  notify(options: NotificationOptions): string {
    const id = this.generateId();
    const notification: ToastNotification = {
      id,
      options: {
        duration: 5000,
        position: "top-right",
        sound: true,
        vibration: false,
        ...options,
      },
      createdAt: new Date(),
      isVisible: false,
    };

    this.notifications.set(id, notification);

    if (this.visualEnabled) {
      this.showVisualNotification(notification);
    }

    if (this.soundEnabled && options.sound) {
      this.playSound(options.type);
    }

    if (this.vibrationEnabled && options.vibration && "vibrate" in navigator) {
      this.vibrate(options.type);
    }

    // إزالة تلقائية
    if (notification.options.duration && notification.options.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.options.duration);
    }

    return id;
  }

  // ردود فعل سريعة
  success(message: string, options?: Partial<NotificationOptions>): string {
    return this.notify({
      title: "نجح!",
      message,
      type: "success",
      icon: "✅",
      sound: true,
      ...options,
    });
  }

  error(message: string, options?: Partial<NotificationOptions>): string {
    return this.notify({
      title: "خطأ!",
      message,
      type: "error",
      icon: "❌",
      sound: true,
      vibration: true,
      duration: 8000,
      ...options,
    });
  }

  warning(message: string, options?: Partial<NotificationOptions>): string {
    return this.notify({
      title: "تحذير!",
      message,
      type: "warning",
      icon: "⚠️",
      sound: true,
      ...options,
    });
  }

  info(message: string, options?: Partial<NotificationOptions>): string {
    return this.notify({
      title: "معلومة",
      message,
      type: "info",
      icon: "ℹ️",
      ...options,
    });
  }

  loading(message: string, progress?: number): string {
    return this.notify({
      title: "جار المعالجة...",
      message,
      type: "loading",
      icon: "⏳",
      duration: 0, // persistent
      progress,
    });
  }

  // تحديث progress للإشعارات
  updateProgress(id: string, progress: number, message?: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.options.progress = progress;
      if (message) {
        notification.options.message = message;
      }
      this.updateVisualNotification(notification);
    }
  }

  // إزالة إشعار
  dismiss(id: string): boolean {
    const notification = this.notifications.get(id);
    if (notification) {
      this.hideVisualNotification(notification);
      this.notifications.delete(id);
      return true;
    }
    return false;
  }

  // إزالة جميع الإشعارات
  clear(): void {
    this.notifications.forEach((notification) => {
      this.hideVisualNotification(notification);
    });
    this.notifications.clear();
  }

  // عرض الإشعار البصري
  private showVisualNotification(notification: ToastNotification): void {
    if (!this.container) return;

    const element = this.createNotificationElement(notification);
    this.container.appendChild(element);

    // Animation in
    requestAnimationFrame(() => {
      element.style.transform = "translateX(0)";
      element.style.opacity = "1";
      notification.isVisible = true;
    });
  }

  // إنشاء عنصر الإشعار
  private createNotificationElement(
    notification: ToastNotification,
  ): HTMLElement {
    const { options } = notification;

    const element = document.createElement("div");
    element.id = notification.id;
    element.className = `
      pointer-events-auto transform translate-x-full opacity-0 transition-all duration-300 ease-out
      max-w-sm w-full bg-black/90 backdrop-blur-sm border rounded-xl shadow-2xl overflow-hidden
      ${this.getTypeStyles(options.type)}
    `;

    element.innerHTML = `
      <div class="p-4">
        <div class="flex items-start space-x-3">
          ${options.icon ? `<div class="text-2xl flex-shrink-0">${options.icon}</div>` : ""}
          <div class="flex-1 min-w-0">
            <div class="font-orbitron font-bold text-white text-sm">${options.title}</div>
            <div class="text-white/80 text-sm mt-1 leading-relaxed">${options.message}</div>
            ${options.progress !== undefined ? this.createProgressBar(options.progress) : ""}
          </div>
          <button 
            class="text-white/60 hover:text-white transition-colors ml-2"
            onclick="window.feedbackService.dismiss('${notification.id}')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        ${options.actions ? this.createActionButtons(options.actions) : ""}
      </div>
      
      ${options.duration && options.duration > 0 ? this.createTimerBar(options.duration) : ""}
    `;

    return element;
  }

  // تحديث الإشعار البصري
  private updateVisualNotification(notification: ToastNotification): void {
    const element = document.getElementById(notification.id);
    if (element && notification.options.progress !== undefined) {
      const progressBar = element.querySelector(
        ".progress-fill",
      ) as HTMLElement;
      if (progressBar) {
        progressBar.style.width = `${notification.options.progress}%`;
      }

      const messageElement = element.querySelector(".text-white\\/80");
      if (messageElement) {
        messageElement.textContent = notification.options.message;
      }
    }
  }

  // إخفاء الإشعار البصري
  private hideVisualNotification(notification: ToastNotification): void {
    const element = document.getElementById(notification.id);
    if (element) {
      element.style.transform = "translateX(full)";
      element.style.opacity = "0";

      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 300);
    }
  }

  // أنماط الأنواع المختلفة
  private getTypeStyles(type: string): string {
    switch (type) {
      case "success":
        return "border-green-500/50 shadow-green-500/20";
      case "error":
        return "border-red-500/50 shadow-red-500/20";
      case "warning":
        return "border-yellow-500/50 shadow-yellow-500/20";
      case "info":
        return "border-blue-500/50 shadow-blue-500/20";
      case "loading":
        return "border-purple-500/50 shadow-purple-500/20";
      default:
        return "border-gray-500/50 shadow-gray-500/20";
    }
  }

  // إنشاء شريط التقدم
  private createProgressBar(progress: number): string {
    return `
      <div class="mt-2 w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          class="progress-fill h-full bg-gradient-to-r from-knoux-purple to-knoux-neon transition-all duration-300" 
          style="width: ${progress}%"
        ></div>
      </div>
    `;
  }

  // إنشاء أزرار الإجراءات
  private createActionButtons(actions: NotificationOptions["actions"]): string {
    if (!actions || actions.length === 0) return "";

    return `
      <div class="mt-3 flex space-x-2">
        ${actions
          .map(
            (action, index) => `
          <button 
            onclick="window.feedbackService.executeAction('${index}')"
            class="${this.getActionButtonStyles(action.style)}"
          >
            ${action.label}
          </button>
        `,
          )
          .join("")}
      </div>
    `;
  }

  // أنماط أزرار الإجراءات
  private getActionButtonStyles(style?: string): string {
    const baseClasses =
      "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200";

    switch (style) {
      case "primary":
        return `${baseClasses} bg-knoux-purple hover:bg-knoux-purple/80 text-white`;
      case "danger":
        return `${baseClasses} bg-red-500 hover:bg-red-600 text-white`;
      default:
        return `${baseClasses} bg-white/20 hover:bg-white/30 text-white`;
    }
  }

  // إنشاء شريط العداد
  private createTimerBar(duration: number): string {
    return `
      <div class="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          class="h-full bg-gradient-to-r from-knoux-purple to-knoux-neon"
          style="animation: countdown ${duration}ms linear forwards"
        ></div>
      </div>
      <style>
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      </style>
    `;
  }

  // تشغيل الصوت
  private playSound(type: string): void {
    try {
      const audio = new Audio();

      // استخدام Web Audio API لتوليد أصوات بسيطة
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // تكوين الصوت حسب النوع
      switch (type) {
        case "success":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            1000,
            audioContext.currentTime + 0.1,
          );
          break;
        case "error":
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            200,
            audioContext.currentTime + 0.2,
          );
          break;
        case "warning":
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          break;
        case "info":
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
          break;
        default:
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }

  // الاهتزاز
  private vibrate(type: string): void {
    if (!("vibrate" in navigator)) return;

    switch (type) {
      case "success":
        navigator.vibrate([100]);
        break;
      case "error":
        navigator.vibrate([200, 100, 200]);
        break;
      case "warning":
        navigator.vibrate([150]);
        break;
      default:
        navigator.vibrate([50]);
    }
  }

  // تنفيذ إجراء
  executeAction(actionIndex: string): void {
    // هذه الدالة ستُربط بالنوافذ العامة
    console.log("Executing action:", actionIndex);
  }

  // توليد معرف فريد
  private generateId(): string {
    return `knoux-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // إعدادات الخدمة
  enableSound(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.saveSettings();
  }

  enableVibration(enabled: boolean): void {
    this.vibrationEnabled = enabled;
    this.saveSettings();
  }

  enableVisual(enabled: boolean): void {
    this.visualEnabled = enabled;
    this.saveSettings();
  }

  // الحصول على الإشعارات النشطة
  getActiveNotifications(): ToastNotification[] {
    return Array.from(this.notifications.values());
  }

  // إشعارات النظام (Desktop Notifications)
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // إشعار نظام
  showSystemNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: options?.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "knoux-rec",
        requireInteraction: options?.duration === 0,
      });

      if (options?.duration && options.duration > 0) {
        setTimeout(() => {
          notification.close();
        }, options.duration);
      }
    }
  }

  // تنظيف الموارد
  cleanup(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.notifications.clear();
  }
}

// إنشاء مثيل واحد للخدمة وجعلها متاحة عالمياً
export const feedbackService = new FeedbackService();

// جعل الخدمة متاحة في النافذة العامة للوصول إليها من HTML
(window as any).feedbackService = feedbackService;
