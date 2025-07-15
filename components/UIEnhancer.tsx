import React, { useEffect } from "react";

// مكون تحسين الواجهة الشامل
const UIEnhancer: React.FC = () => {
  useEffect(() => {
    // إضافة الكلاسات الفاخرة لجميع العناصر النصية
    const enhanceTextElements = () => {
      // العناوين
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((heading) => {
        if (
          heading.textContent &&
          /[\u0600-\u06FF]/.test(heading.textContent)
        ) {
          heading.classList.add("luxury-title-ar");
        }
      });

      // النصوص العادية
      const paragraphs = document.querySelectorAll("p, span, div");
      paragraphs.forEach((p) => {
        if (p.textContent && /[\u0600-\u06FF]/.test(p.textContent)) {
          p.classList.add("luxury-text-ar");
        }
      });

      // الأزرار
      const buttons = document.querySelectorAll("button");
      buttons.forEach((button) => {
        if (button.textContent && /[\u0600-\u06FF]/.test(button.textContent)) {
          button.classList.add("luxury-button-ar");
        }
      });

      // المدخلات
      const inputs = document.querySelectorAll("input, textarea");
      inputs.forEach((input) => {
        if (input.placeholder && /[\u0600-\u06FF]/.test(input.placeholder)) {
          input.classList.add("luxury-input-ar");
        }
      });
    };

    // تشغيل التحسينات
    enhanceTextElements();

    // مراقبة التغييرات في DOM
    const observer = new MutationObserver(enhanceTextElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // تنظيف
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // إضافة تأثيرات الماوس
    const addMouseEffects = () => {
      document.addEventListener("mousemove", (e) => {
        // إنشاء أثر الماوس المضيء
        const trail = document.createElement("div");
        trail.className = "mouse-trail";
        trail.style.cssText = `
          position: fixed;
          width: 8px;
          height: 8px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.8), transparent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          left: ${e.clientX - 4}px;
          top: ${e.clientY - 4}px;
          animation: fadeOut 0.8s ease-out forwards;
        `;

        document.body.appendChild(trail);

        setTimeout(() => {
          trail.remove();
        }, 800);
      });
    };

    addMouseEffects();

    // إضافة تأثيرات الكيبورد
    const addKeyboardEffects = () => {
      document.addEventListener("keydown", (e) => {
        // تأثير الضغط على المفاتيح
        const ripple = document.createElement("div");
        ripple.className = "keyboard-ripple";
        ripple.style.cssText = `
          position: fixed;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: rippleExpand 0.6s ease-out forwards;
        `;

        document.body.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    };

    addKeyboardEffects();
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0);
          }
        }

        @keyframes rippleExpand {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }

        /* تحسينات إضافية للواجهة */
        * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* تحسين الانتقالات */
        .glass-card,
        .luxury-glass-card,
        .luxury-card-ar {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        /* تحسين الخطوط */
        body {
          font-feature-settings:
            "kern" 1,
            "liga" 1,
            "calt" 1;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* تحسين التمرير */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #06d6a0);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #059669);
        }

        /* تحسين التركيز */
        *:focus {
          outline: 2px solid rgba(139, 92, 246, 0.6);
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* تحسين التحديد */
        ::selection {
          background: rgba(139, 92, 246, 0.3);
          color: white;
        }

        ::-moz-selection {
          background: rgba(139, 92, 246, 0.3);
          color: white;
        }

        /* تأثيرات الحركة للأزرار */
        button:not(:disabled) {
          cursor: pointer;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        /* تحسين العناصر التفاعلية */
        .interactive,
        .interactive-hover,
        .interactive-ar {
          will-change: transform;
        }

        /* تحسين الصور */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        /* تحسين الفيديو */
        video {
          object-fit: cover;
        }

        /* تحسين الرسوم المتحركة */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* تحسين الطباعة */
        @media print {
          * {
            background: transparent !important;
            color: black !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }

        /* تحسين الألوان عالية التباين */
        @media (prefers-contrast: high) {
          .luxury-glass-card,
          .glass-card {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.5);
          }
        }

        /* تحسين الوضع المظلم */
        @media (prefers-color-scheme: dark) {
          html {
            color-scheme: dark;
          }
        }
      `}</style>
    </>
  );
};

export default UIEnhancer;
