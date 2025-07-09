import React, { useState, useEffect } from "react";
import {
  VideoTemplate,
  TemplateCategory,
  TemplateFilter,
} from "../types/templates";

const TemplatesPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>("for-you");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<
    "16:9" | "9:16" | "1:1" | "4:3" | "all"
  >("all");
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "for-you", name: "For You", icon: "✨", color: "knoux-purple" },
    { id: "education", name: "Education", icon: "📚", color: "blue-400" },
    { id: "birthday", name: "Birthday", icon: "🎂", color: "pink-400" },
    { id: "festival", name: "Festival", icon: "🎉", color: "yellow-400" },
    { id: "intro", name: "Intro", icon: "🎬", color: "knoux-neon" },
    { id: "vlog", name: "Vlog", icon: "📹", color: "green-400" },
    { id: "business", name: "Business", icon: "💼", color: "gray-400" },
    { id: "social-media", name: "Social", icon: "📱", color: "purple-400" },
    { id: "marketing", name: "Marketing", icon: "📈", color: "orange-400" },
    { id: "tutorial", name: "Tutorial", icon: "🎓", color: "indigo-400" },
    { id: "gaming", name: "Gaming", icon: "🎮", color: "red-400" },
    { id: "music", name: "Music", icon: "🎵", color: "teal-400" },
  ] as const;

  const aspectRatios = [
    { value: "all", label: "All Ratios", icon: "📐" },
    { value: "16:9", label: "16:9 (YouTube)", icon: "🖥️" },
    { value: "9:16", label: "9:16 (TikTok)", icon: "📱" },
    { value: "1:1", label: "1:1 (Instagram)", icon: "⬜" },
    { value: "4:3", label: "4:3 (Classic)", icon: "📺" },
  ] as const;

  // Mock templates data
  useEffect(() => {
    const generateMockTemplates = (): VideoTemplate[] => {
      const mockTemplates: VideoTemplate[] = [];

      categories.forEach((category) => {
        for (let i = 1; i <= 12; i++) {
          mockTemplates.push({
            template_id: `${category.id}-${i}`,
            name: `${category.name} Template ${i}`,
            category: category.id as TemplateCategory,
            aspect_ratio: ["16:9", "9:16", "1:1", "4:3"][
              Math.floor(Math.random() * 4)
            ] as any,
            preview_thumbnail: `https://picsum.photos/300/200?random=${category.id}-${i}`,
            duration: Math.floor(Math.random() * 60) + 15,
            difficulty: ["easy", "medium", "advanced"][
              Math.floor(Math.random() * 3)
            ] as any,
            tags: [`${category.name.toLowerCase()}`, "modern", "professional"],
            elements: [],
            description: `Professional ${category.name.toLowerCase()} template with modern design`,
            premium: Math.random() > 0.7,
            popular: Math.random() > 0.8,
            trending: Math.random() > 0.9,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });

      return mockTemplates;
    };

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTemplates(generateMockTemplates());
      setLoading(false);
    }, 800);
  }, []);

  const filteredTemplates = templates.filter((template) => {
    if (
      selectedCategory !== "for-you" &&
      template.category !== selectedCategory
    )
      return false;
    if (
      selectedAspectRatio !== "all" &&
      template.aspect_ratio !== selectedAspectRatio
    )
      return false;
    if (
      searchQuery &&
      !template.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleTemplateSelect = (template: VideoTemplate) => {
    // إنشاء إشعار عن اختيار القالب
    alert(`تم اختيار قالب: ${template.name}`);

    // تسجيل للمطورين
    console.log("تم اختيار القالب:", template);

    // يمكن إضافة منطق لفتح محرر القالب هنا
    // مثل: navigate to template editor with template data
  };

  const TemplateCard = ({ template }: { template: VideoTemplate }) => (
    <div
      className="glass-card rounded-xl overflow-hidden border border-knoux-purple/20 hover:border-knoux-purple/60 transition-all duration-300 cursor-pointer group interactive"
      onClick={() => handleTemplateSelect(template)}
    >
      {/* Template Preview */}
      <div className="relative aspect-video bg-black/30 overflow-hidden">
        <img
          src={template.preview_thumbnail}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">
                {template.duration}s
              </span>
              <div className="flex space-x-1">
                {template.premium && (
                  <span className="px-2 py-1 bg-yellow-500/80 rounded text-xs font-bold text-black">
                    PRO
                  </span>
                )}
                {template.trending && (
                  <span className="px-2 py-1 bg-red-500/80 rounded text-xs font-bold text-white">
                    🔥
                  </span>
                )}
                {template.popular && (
                  <span className="px-2 py-1 bg-green-500/80 rounded text-xs font-bold text-white">
                    ⭐
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-knoux-purple/80 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>

        {/* Aspect Ratio Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium">
            {template.aspect_ratio}
          </span>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-rajdhani font-bold text-white mb-1 truncate">
          {template.name}
        </h3>
        <p className="text-sm text-white/70 mb-2 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-knoux-purple/20 rounded text-xs text-knoux-purple"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span
              className={`w-2 h-2 rounded-full ${
                template.difficulty === "easy"
                  ? "bg-green-400"
                  : template.difficulty === "medium"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
            ></span>
            <span className="text-xs text-white/60 capitalize">
              {template.difficulty}
            </span>
          </div>

          <button className="px-3 py-1 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-lg text-xs text-knoux-purple font-medium transition-all">
            Use Template
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
              📽️ Video Templates
            </h2>
            <p className="text-white/70 mt-1">
              Professional templates to kickstart your creativity
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن القوالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 pl-10 bg-black/30 border border-knoux-purple/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-knoux-purple focus:border-knoux-purple"
            />
            <svg
              className="w-5 h-5 text-white/50 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-knoux-purple/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-purple">
              {templates.length}
            </div>
            <div className="text-sm text-white/70">Total Templates</div>
          </div>
          <div className="text-center p-3 bg-knoux-neon/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-neon">
              {categories.length}
            </div>
            <div className="text-sm text-white/70">Categories</div>
          </div>
          <div className="text-center p-3 bg-green-400/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {templates.filter((t) => t.popular).length}
            </div>
            <div className="text-sm text-white/70">Popular</div>
          </div>
          <div className="text-center p-3 bg-yellow-400/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {templates.filter((t) => t.premium).length}
            </div>
            <div className="text-sm text-white/70">Premium</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl border border-knoux-purple/20">
        {/* Categories */}
        <div className="mb-4">
          <h3 className="text-lg font-orbitron font-bold text-white mb-3">
            📂 Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(category.id as TemplateCategory)
                }
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? `bg-${category.color}/30 border border-${category.color} text-${category.color}`
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <h3 className="text-lg font-orbitron font-bold text-white mb-3">
            📐 Aspect Ratio
          </h3>
          <div className="flex space-x-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setSelectedAspectRatio(ratio.value as any)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedAspectRatio === ratio.value
                    ? "bg-knoux-neon/30 border border-knoux-neon text-knoux-neon"
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"
                }`}
              >
                <span>{ratio.icon}</span>
                <span>{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-orbitron font-bold text-white">
            {selectedCategory === "for-you"
              ? "✨ Recommended for You"
              : `${categories.find((c) => c.id === selectedCategory)?.icon} ${categories.find((c) => c.id === selectedCategory)?.name} Templates`}
          </h3>
          <span className="text-white/70">
            {filteredTemplates.length} templates
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-knoux-purple/20"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-knoux-purple/20 rounded"></div>
                  <div className="h-3 bg-knoux-purple/10 rounded w-2/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-knoux-purple/10 rounded w-16"></div>
                    <div className="h-6 bg-knoux-purple/10 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">
              No Templates Found
            </h3>
            <p className="text-white/70">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.template_id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPanel;
