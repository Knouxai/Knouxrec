import React from "react";
import { ToolCategory } from "../types/visualPatchLab";

interface ToolCategorySelectorProps {
  selectedCategory: ToolCategory | "all";
  onCategoryChange: (category: ToolCategory | "all") => void;
  toolCounts: Record<ToolCategory, number>;
}

const ToolCategorySelector: React.FC<ToolCategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  toolCounts,
}) => {
  const categories = [
    {
      id: "all" as const,
      nameAr: "جميع الأدوات",
      name: "All Tools",
      icon: "🎨",
      gradient: "from-white/20 to-gray-400/20",
      border: "border-white/30",
      count: Object.values(toolCounts).reduce((sum, count) => sum + count, 0),
    },
    {
      id: "body-scale" as ToolCategory,
      nameAr: "تكبير/تصغير الجسم",
      name: "Body Scale",
      icon: "🔍",
      gradient: "from-green-500/30 to-emerald-600/30",
      border: "border-green-500/50",
      count: toolCounts["body-scale"] || 0,
    },
    {
      id: "waist-belly" as ToolCategory,
      nameAr: "الخصر والبطن",
      name: "Waist & Belly",
      icon: "⏳",
      gradient: "from-purple-500/30 to-violet-600/30",
      border: "border-purple-500/50",
      count: toolCounts["waist-belly"] || 0,
    },
    {
      id: "chest" as ToolCategory,
      nameAr: "الصدر",
      name: "Chest",
      icon: "💎",
      gradient: "from-pink-500/30 to-rose-600/30",
      border: "border-pink-500/50",
      count: toolCounts["chest"] || 0,
    },
    {
      id: "hips-thighs" as ToolCategory,
      nameAr: "الأرداف والفخذين",
      name: "Hips & Thighs",
      icon: "🍑",
      gradient: "from-orange-500/30 to-amber-600/30",
      border: "border-orange-500/50",
      count: toolCounts["hips-thighs"] || 0,
    },
    {
      id: "legs-feet" as ToolCategory,
      nameAr: "الساقين والقدمين",
      name: "Legs & Feet",
      icon: "🦵",
      gradient: "from-blue-500/30 to-cyan-600/30",
      border: "border-blue-500/50",
      count: toolCounts["legs-feet"] || 0,
    },
    {
      id: "arms-shoulders" as ToolCategory,
      nameAr: "الذراعين والكتفين",
      name: "Arms & Shoulders",
      icon: "💪",
      gradient: "from-teal-500/30 to-emerald-600/30",
      border: "border-teal-500/50",
      count: toolCounts["arms-shoulders"] || 0,
    },
    {
      id: "head-face" as ToolCategory,
      nameAr: "الرأس والوجه",
      name: "Head & Face",
      icon: "😀",
      gradient: "from-yellow-500/30 to-orange-600/30",
      border: "border-yellow-500/50",
      count: toolCounts["head-face"] || 0,
    },
    {
      id: "freeform" as ToolCategory,
      nameAr: "أدوات حرة",
      name: "Freeform Tools",
      icon: "🖌️",
      gradient: "from-indigo-500/30 to-purple-600/30",
      border: "border-indigo-500/50",
      count: toolCounts["freeform"] || 0,
    },
  ];

  return (
    <div className="mb-8">
      {/* Desktop Grid Layout */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              group relative overflow-hidden rounded-xl p-4 transition-all duration-300
              glass-card ${category.border}
              ${
                selectedCategory === category.id
                  ? `bg-gradient-to-br ${category.gradient} border-2 scale-105 shadow-xl`
                  : "hover:bg-white/5 border hover:border-white/30"
              }
              cursor-pointer hover:scale-102
            `}
          >
            {/* Background gradient effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
            />

            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="text-3xl mb-2">{category.icon}</div>

              {/* Names */}
              <div className="mb-2">
                <div className="font-bold text-white text-sm">
                  {category.nameAr}
                </div>
                <div className="text-xs text-white/70 font-medium">
                  {category.name}
                </div>
              </div>

              {/* Count Badge */}
              <div
                className={`
                inline-flex items-center justify-center w-8 h-6 rounded-full text-xs font-bold
                ${
                  selectedCategory === category.id
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/80"
                }
              `}
              >
                {category.count}
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedCategory === category.id && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet Horizontal Scroll */}
      <div className="lg:hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                group relative overflow-hidden rounded-xl p-3 transition-all duration-300 flex-shrink-0 min-w-28
                glass-card ${category.border}
                ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-br ${category.gradient} border-2 scale-105 shadow-xl`
                    : "hover:bg-white/5 border hover:border-white/30"
                }
                cursor-pointer hover:scale-102
              `}
            >
              {/* Background gradient effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
              />

              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="text-2xl mb-1">{category.icon}</div>

                {/* Names */}
                <div className="mb-1">
                  <div className="font-bold text-white text-xs">
                    {category.nameAr}
                  </div>
                  <div className="text-xs text-white/70 font-medium">
                    {category.name}
                  </div>
                </div>

                {/* Count Badge */}
                <div
                  className={`
                  inline-flex items-center justify-center w-6 h-4 rounded-full text-xs font-bold
                  ${
                    selectedCategory === category.id
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/80"
                  }
                `}
                >
                  {category.count}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedCategory === category.id && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Description */}
      {selectedCategory !== "all" && (
        <div className="mt-4 p-4 glass-card border border-white/20 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {categories.find((c) => c.id === selectedCategory)?.icon}
            </span>
            <div>
              <h3 className="font-bold text-white">
                {categories.find((c) => c.id === selectedCategory)?.nameAr}
              </h3>
              <p className="text-white/70 text-sm">
                {getCategoryDescription(selectedCategory)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getCategoryDescription(category: ToolCategory): string {
  switch (category) {
    case "body-scale":
      return "أدوات لتكبير وتصغير الجسم بالكامل أو أجزاء منه بشكل متناسب ومتوازن";
    case "waist-belly":
      return "أدوات متخصصة لتنحيف الخصر وتسطيح البطن وإبراز منحنيات الجسم الطبيعية";
    case "chest":
      return "أدوات لتعديل وتحسين منطقة الصدر بما يشمل الرفع والتشكيل والموازنة";
    case "hips-thighs":
      return "أدوات لتحسين شكل الأرداف والفخذين وإضافة المنحنيات المرغوبة";
    case "legs-feet":
      return "أدوات لتطويل الساقين وتنحيفها وتحسين الشكل العام للساقين والقدمين";
    case "arms-shoulders":
      return "أدوات لتنحيف الذراعين وتعديل عرض الكتفين وتحسين تناسق الجزء العلوي";
    case "head-face":
      return "أدوات لتعديل ملامح الوجه وتحسين التماثل ونسب الرأس والوجه";
    case "freeform":
      return "أدوات حرة للتحرير اليدوي والتشويه المتقدم والتأثيرات المخصصة";
    default:
      return "";
  }
}

export default ToolCategorySelector;
