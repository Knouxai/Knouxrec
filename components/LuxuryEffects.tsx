import React, { useEffect, useRef } from "react";

// تأثير الجسيمات النجمية
export const StarfieldEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      color: string;
    }> = [];

    // إنشاء النجوم
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        color: ["#8b5cf6", "#06d6a0", "#f093fb", "#4facfe", "#ffd200"][
          Math.floor(Math.random() * 5)
        ],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // تحريك النجوم
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = -10;
          star.x = Math.random() * canvas.width;
        }

        // رسم النجوم
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // تأثير الوميض
        star.opacity += (Math.random() - 0.5) * 0.1;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));

        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

// تأثير موجات الطاقة
export const EnergyWavesEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // رسم موجات الطاقة
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = `hsl(${270 + i * 20}, 70%, 60%)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 2) {
          const y =
            canvas.height / 2 +
            Math.sin(x * 0.01 + time * 2 + i * 0.5) * (50 + i * 20) +
            Math.sin(x * 0.02 + time * 1.5 + i * 0.3) * (30 + i * 10);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "overlay" }}
    />
  );
};

// تأثير الشرر الكهربائي
export const ElectricSparksEffect: React.FC<{ intensity?: number }> = ({
  intensity = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sparks: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    const createSpark = (x: number, y: number) => {
      for (let i = 0; i < 3; i++) {
        sparks.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 30,
          maxLife: 30,
          color: ["#00d4ff", "#8b5cf6", "#f093fb", "#ffd200"][
            Math.floor(Math.random() * 4)
          ],
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // إنشاء شرر عشوائي
      if (Math.random() < intensity * 0.1) {
        createSpark(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
        );
      }

      // تحديث الشرر
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];

        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life--;

        if (spark.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        // رسم الشرر
        const alpha = spark.life / spark.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = spark.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = spark.color;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // خط الشرر
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(spark.x - spark.vx * 3, spark.y - spark.vy * 3);
        ctx.stroke();

        ctx.restore();
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

// تأثير الدوائر المضيئة
export const GlowingOrbsEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const orbs: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      opacity: number;
      targetOpacity: number;
    }> = [];

    // إنشاء الدوائر المضيئة
    for (let i = 0; i < 8; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 100 + 50,
        color: ["#8b5cf6", "#06d6a0", "#f093fb", "#4facfe", "#ffd200"][
          Math.floor(Math.random() * 5)
        ],
        opacity: 0.1,
        targetOpacity: Math.random() * 0.3 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        // تحريك الدوائر
        orb.x += orb.vx;
        orb.y += orb.vy;

        // انعكاس عند الحواف
        if (orb.x < 0 || orb.x > canvas.width) orb.vx *= -1;
        if (orb.y < 0 || orb.y > canvas.height) orb.vy *= -1;

        // تغيير الشفافية
        orb.opacity += (orb.targetOpacity - orb.opacity) * 0.02;
        if (Math.abs(orb.opacity - orb.targetOpacity) < 0.01) {
          orb.targetOpacity = Math.random() * 0.3 + 0.1;
        }

        // رسم الدائرة المضيئة
        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius,
        );
        gradient.addColorStop(
          0,
          `${orb.color}${Math.floor(orb.opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        );
        gradient.addColorStop(1, `${orb.color}00`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "multiply" }}
    />
  );
};

// تأثير المصفوفة الرقمية
export const MatrixEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01أبجدهوزحطيكلمنسعفصقرشتثخذضظغ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // تهيئة القطرات
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#8b5cf6";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i]);

        drops[i] += fontSize;

        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-20"
    />
  );
};

// مكون شامل للتأثيرات
export const LuxuryBackgroundEffects: React.FC<{
  effects?: Array<"starfield" | "waves" | "sparks" | "orbs" | "matrix">;
  intensity?: number;
}> = ({ effects = ["starfield", "orbs"], intensity = 0.5 }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {effects.includes("starfield") && <StarfieldEffect />}
      {effects.includes("waves") && <EnergyWavesEffect />}
      {effects.includes("sparks") && (
        <ElectricSparksEffect intensity={intensity} />
      )}
      {effects.includes("orbs") && <GlowingOrbsEffect />}
      {effects.includes("matrix") && <MatrixEffect />}
    </div>
  );
};

export default LuxuryBackgroundEffects;
