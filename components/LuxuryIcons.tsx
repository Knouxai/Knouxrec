import React from "react";

// لوجو KNOUX REC الفاخر الجديد
export const KnouxLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 120,
  className = "",
}) => (
  <div
    className={`relative ${className}`}
    style={{ width: size, height: size }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="luxury-logo"
    >
      <defs>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7971e" />
          <stop offset="100%" stopColor="#ffd200" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="innerShadow">
          <feOffset dx="2" dy="2" />
          <feGaussianBlur stdDeviation="3" result="offset-blur" />
          <feFlood floodColor="#000000" floodOpacity="0.3" />
          <feComposite in2="offset-blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* الخلفية الدائرية */}
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="url(#primaryGrad)"
        filter="url(#glow)"
        opacity="0.9"
      />

      {/* الحلقة الداخلية */}
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* الحرف K */}
      <path
        d="M25 30 L25 90 M25 60 L55 30 M25 60 L55 90"
        stroke="url(#goldGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#innerShadow)"
      />

      {/* نقطة التسجيل */}
      <circle cx="85" cy="35" r="8" fill="#ff4757" filter="url(#glow)">
        <animate
          attributeName="r"
          values="6;10;6"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* خطوط الطاقة */}
      <g opacity="0.6">
        <path
          d="M70 45 Q80 50 85 60 Q80 70 70 75"
          stroke="url(#goldGrad)"
          strokeWidth="2"
          fill="none"
        >
          <animate
            attributeName="stroke-dasharray"
            values="0 100;50 50;100 0"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M75 40 Q85 45 90 55 Q85 65 75 70"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
          fill="none"
        >
          <animate
            attributeName="stroke-dasharray"
            values="0 80;40 40;80 0"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* تأثير البريق */}
      <path
        d="M20 20 L40 40 M30 15 L45 30 M15 30 L30 45"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0"
      >
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>

    {/* تأثير الهالة الخارجية */}
    <div
      className="absolute inset-0 rounded-full opacity-30"
      style={{
        background:
          "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
        animation: "pulse 3s ease-in-out infinite",
      }}
    />
  </div>
);

// أيقونة أدوات الذكاء الاصطناعي
export const AIToolsIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4facfe" />
        <stop offset="100%" stopColor="#00f2fe" />
      </linearGradient>
    </defs>

    {/* دماغ الذكاء الاصطناعي */}
    <path
      d="M32 8 C20 8, 12 16, 12 28 C12 32, 14 36, 16 38 L16 48 C16 52, 20 56, 24 56 L40 56 C44 56, 48 52, 48 48 L48 38 C50 36, 52 32, 52 28 C52 16, 44 8, 32 8 Z"
      fill="url(#aiGrad)"
      opacity="0.8"
    />

    {/* نواة الذكاء */}
    <circle cx="32" cy="28" r="8" fill="rgba(255,255,255,0.9)">
      <animate
        attributeName="r"
        values="6;10;6"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>

    {/* الدوائر المدارية */}
    <g>
      <circle
        cx="32"
        cy="28"
        r="14"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 32 28;360 32 28"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="46" cy="28" r="2" fill="rgba(255,255,255,0.8)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 32 28;360 32 28"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
    </g>

    {/* موجات الطاقة */}
    <g opacity="0.6">
      <path
        d="M20 20 Q32 24 44 20"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
        fill="none"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0 20;10 10;20 0"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M18 36 Q32 40 46 36"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
        fill="none"
      >
        <animate
          attributeName="stroke-dasharray"
          values="20 0;10 10;0 20"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  </svg>
);

// أيقونة Visual Patch Lab
export const VisualPatchIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 64, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="patchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="50%" stopColor="#764ba2" />
        <stop offset="100%" stopColor="#f093fb" />
      </linearGradient>
    </defs>

    {/* قطع الألغاز */}
    <g transform="translate(8,8)">
      <path
        d="M0 0 L20 0 Q24 0 24 4 L24 20 Q24 24 20 24 L0 24 Q-4 24 -4 20 L-4 4 Q-4 0 0 0 Z"
        fill="url(#patchGrad)"
        opacity="0.9"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;2,2;0,0"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      <path
        d="M24 0 L44 0 Q48 0 48 4 L48 20 Q48 24 44 24 L24 24 Q20 24 20 20 L20 4 Q20 0 24 0 Z"
        fill="url(#patchGrad)"
        opacity="0.8"
        transform="translate(0,0)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;-2,2;0,0"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      <path
        d="M0 24 L20 24 Q24 24 24 28 L24 44 Q24 48 20 48 L0 48 Q-4 48 -4 44 L-4 28 Q-4 24 0 24 Z"
        fill="url(#patchGrad)"
        opacity="0.7"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;2,-2;0,0"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      <path
        d="M24 24 L44 24 Q48 24 48 28 L48 44 Q48 48 44 48 L24 48 Q20 48 20 44 L20 28 Q20 24 24 24 Z"
        fill="url(#patchGrad)"
        opacity="0.9"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;-2,-2;0,0"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
    </g>

    {/* فرشاة التحرير */}
    <g transform="translate(45,10)">
      <path d="M0 0 L10 10 L8 12 L-2 2 Z" fill="rgba(255,255,255,0.9)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 4 6;15 4 6;0 4 6"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.7)" />
    </g>
  </svg>
);

// أيقونة القوالب
export const TemplatesIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="templateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f093fb" />
        <stop offset="100%" stopColor="#f5576c" />
      </linearGradient>
    </defs>

    {/* شاشة العرض */}
    <rect
      x="8"
      y="12"
      width="48"
      height="32"
      rx="4"
      fill="url(#templateGrad)"
      opacity="0.9"
    />
    <rect x="12" y="16" width="40" height="24" rx="2" fill="rgba(0,0,0,0.3)" />

    {/* أيقونة التشغيل */}
    <polygon points="28,24 28,32 36,28" fill="rgba(255,255,255,0.9)">
      <animateTransform
        attributeName="transform"
        type="scale"
        values="1;1.2;1"
        dur="2s"
        repeatCount="indefinite"
      />
    </polygon>

    {/* خطوط الإشارة */}
    <g opacity="0.6">
      <line
        x1="16"
        y1="20"
        x2="24"
        y2="20"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
      />
      <line
        x1="40"
        y1="20"
        x2="48"
        y2="20"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
      />
      <line
        x1="16"
        y1="36"
        x2="24"
        y2="36"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
      />
      <line
        x1="40"
        y1="36"
        x2="48"
        y2="36"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
      />
    </g>

    {/* القاعدة */}
    <rect
      x="24"
      y="44"
      width="16"
      height="4"
      rx="2"
      fill="url(#templateGrad)"
      opacity="0.7"
    />
    <rect
      x="20"
      y="48"
      width="24"
      height="8"
      rx="4"
      fill="url(#templateGrad)"
      opacity="0.5"
    />
  </svg>
);

// أيقونة التسجيلات
export const RecordingsIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 64, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="recordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a8edea" />
        <stop offset="100%" stopColor="#fed6e3" />
      </linearGradient>
    </defs>

    {/* الكاميرا */}
    <rect
      x="8"
      y="16"
      width="48"
      height="32"
      rx="6"
      fill="url(#recordGrad)"
      opacity="0.9"
    />
    <rect x="12" y="20" width="40" height="24" rx="4" fill="rgba(0,0,0,0.3)" />

    {/* العدسة */}
    <circle cx="32" cy="32" r="10" fill="rgba(0,0,0,0.5)" />
    <circle cx="32" cy="32" r="6" fill="rgba(255,255,255,0.2)" />

    {/* نقطة التسجيل */}
    <circle cx="48" cy="24" r="4" fill="#ff4757">
      <animate
        attributeName="r"
        values="3;5;3"
        dur="1.5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.7;1;0.7"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>

    {/* المقبض */}
    <rect
      x="24"
      y="8"
      width="16"
      height="8"
      rx="4"
      fill="url(#recordGrad)"
      opacity="0.7"
    />

    {/* أزرار التحكم */}
    <g transform="translate(16,52)">
      <circle cx="0" cy="0" r="3" fill="rgba(255,255,255,0.8)" />
      <circle cx="10" cy="0" r="3" fill="rgba(255,255,255,0.8)" />
      <circle cx="20" cy="0" r="3" fill="rgba(255,255,255,0.8)" />
    </g>
  </svg>
);

// أيقونة الملفات
export const FilesIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="fileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffecd2" />
        <stop offset="100%" stopColor="#fcb69f" />
      </linearGradient>
    </defs>

    {/* مجلد خلفي */}
    <path
      d="M8 16 L8 48 Q8 52 12 52 L52 52 Q56 52 56 48 L56 20 Q56 16 52 16 L28 16 L24 12 L12 12 Q8 12 8 16 Z"
      fill="url(#fileGrad)"
      opacity="0.7"
    />

    {/* مجلد أمامي */}
    <path
      d="M4 12 L4 44 Q4 48 8 48 L48 48 Q52 48 52 44 L52 16 Q52 12 48 12 L24 12 L20 8 L8 8 Q4 8 4 12 Z"
      fill="url(#fileGrad)"
      opacity="0.9"
    />

    {/* رقائق البيانات */}
    <g opacity="0.6">
      <rect
        x="12"
        y="20"
        width="32"
        height="2"
        rx="1"
        fill="rgba(255,255,255,0.8)"
      />
      <rect
        x="12"
        y="26"
        width="24"
        height="2"
        rx="1"
        fill="rgba(255,255,255,0.6)"
      />
      <rect
        x="12"
        y="32"
        width="28"
        height="2"
        rx="1"
        fill="rgba(255,255,255,0.7)"
      />
      <rect
        x="12"
        y="38"
        width="20"
        height="2"
        rx="1"
        fill="rgba(255,255,255,0.5)"
      />
    </g>

    {/* أيقونة البحث */}
    <g transform="translate(45,25)">
      <circle
        cx="0"
        cy="0"
        r="6"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
      />
      <line
        x1="4"
        y1="4"
        x2="8"
        y2="8"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

// أيقونة صندوق الأدوات
export const ToolboxIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="toolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d299c2" />
        <stop offset="100%" stopColor="#fef9d7" />
      </linearGradient>
    </defs>

    {/* صندوق الأدوات */}
    <rect
      x="8"
      y="20"
      width="48"
      height="28"
      rx="4"
      fill="url(#toolGrad)"
      opacity="0.9"
    />
    <rect x="12" y="24" width="40" height="20" rx="2" fill="rgba(0,0,0,0.2)" />

    {/* المقبض */}
    <rect
      x="24"
      y="16"
      width="16"
      height="8"
      rx="4"
      fill="url(#toolGrad)"
      opacity="0.7"
    />
    <rect
      x="28"
      y="18"
      width="8"
      height="4"
      rx="2"
      fill="rgba(255,255,255,0.3)"
    />

    {/* الأدوات */}
    <g transform="translate(16,28)">
      {/* مفتاح ربط */}
      <rect
        x="0"
        y="4"
        width="12"
        height="3"
        rx="1.5"
        fill="rgba(255,255,255,0.8)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 6 5.5;15 6 5.5;0 6 5.5"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>

      {/* مفك */}
      <rect
        x="16"
        y="2"
        width="2"
        height="8"
        rx="1"
        fill="rgba(255,255,255,0.7)"
      />
      <rect
        x="15"
        y="0"
        width="4"
        height="3"
        rx="1"
        fill="rgba(255,255,255,0.9)"
      />

      {/* مطرقة */}
      <rect
        x="24"
        y="6"
        width="8"
        height="2"
        rx="1"
        fill="rgba(255,255,255,0.8)"
      />
      <rect
        x="26"
        y="2"
        width="2"
        height="8"
        rx="1"
        fill="rgba(255,255,255,0.7)"
      />
    </g>

    {/* المسامير */}
    <g opacity="0.6">
      <circle cx="16" cy="44" r="1.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="24" cy="44" r="1.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="32" cy="44" r="1.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="40" cy="44" r="1.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="48" cy="44" r="1.5" fill="rgba(255,255,255,0.8)" />
    </g>
  </svg>
);

// أيقونة الإعدادات الفاخرة
export const LuxurySettingsIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 64, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="settingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#89fffd" />
        <stop offset="100%" stopColor="#ef32d9" />
      </linearGradient>
    </defs>

    {/* العجلة الرئيسية */}
    <g transform="translate(32,32)">
      <circle cx="0" cy="0" r="20" fill="url(#settingsGrad)" opacity="0.9">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0;360 0 0"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>

      {/* الثقوب */}
      <circle cx="0" cy="-12" r="3" fill="rgba(0,0,0,0.3)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0;360 0 0"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="12" cy="0" r="3" fill="rgba(0,0,0,0.3)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0;360 0 0"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="0" cy="12" r="3" fill="rgba(0,0,0,0.3)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0;360 0 0"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="-12" cy="0" r="3" fill="rgba(0,0,0,0.3)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0;360 0 0"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>

      {/* المركز */}
      <circle cx="0" cy="0" r="8" fill="rgba(255,255,255,0.9)" />
      <circle cx="0" cy="0" r="4" fill="rgba(0,0,0,0.2)" />
    </g>

    {/* العجلة الثانوية */}
    <g transform="translate(48,16)">
      <circle cx="0" cy="0" r="8" fill="url(#settingsGrad)" opacity="0.7">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="360 0 0;0 0 0"
          dur="6s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="0" cy="0" r="3" fill="rgba(255,255,255,0.8)" />
    </g>
  </svg>
);

// مكون الجسيمات المتحركة للخلفية
export const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 12}s`,
        animationDuration: `${8 + Math.random() * 8}s`,
      }}
    />
  ));

  return <div className="floating-particles">{particles}</div>;
};

// مكون تأثير الدخان
export const SmokeEffect: React.FC = () => {
  const smokeParticles = Array.from({ length: 15 }, (_, i) => (
    <div
      key={i}
      className="smoke-particle"
      style={{
        left: `${20 + Math.random() * 60}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${6 + Math.random() * 4}s`,
      }}
    />
  ));

  return <div className="smoke-effect">{smokeParticles}</div>;
};
