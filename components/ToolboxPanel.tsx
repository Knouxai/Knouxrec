import React, { useState, useEffect } from "react";
import { AITool, ToolCategory, UserCredits } from "../types/templates";

const ToolboxPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>("all");
  const [tools, setTools] = useState<AITool[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredits>({
    total: 1000,
    used: 250,
    remaining: 750,
    subscription_tier: "pro",
    renewal_date: "2024-02-15",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Tools", icon: "🛠️", color: "knoux-purple" },
    { id: "video", name: "Video", icon: "🎥", color: "blue-400" },
    { id: "audio", name: "Audio", icon: "🎵", color: "green-400" },
    { id: "image", name: "Image", icon: "🖼️", color: "yellow-400" },
    { id: "text", name: "Text", icon: "📝", color: "purple-400" },
    { id: "ai-tools", name: "AI Tools", icon: "🤖", color: "knoux-neon" },
  ] as const;

  // Mock AI tools data
  useEffect(() => {
    const mockTools: AITool[] = [
      // AI Video Tools
      {
        id: "ai-video-generator",
        name: "AI Video Generator",
        description: "Transform text into stunning videos with AI narration",
        category: "ai-tools",
        icon: "🎬",
        ai_powered: true,
        credits_cost: 50,
        processing_time: "slow",
        input_types: ["text"],
        output_types: ["video"],
        features: ["Multi-language TTS", "Stock footage", "Custom voiceovers"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "ai-background-remover",
        name: "AI Background Remover",
        description: "Remove backgrounds from videos and images automatically",
        category: "ai-tools",
        icon: "🎭",
        ai_powered: true,
        credits_cost: 20,
        processing_time: "fast",
        input_types: ["image", "video"],
        output_types: ["image", "video"],
        features: [
          "Precision masking",
          "Green screen alternative",
          "Batch processing",
        ],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "speech-to-text",
        name: "AI Speech-to-Text",
        description: "Generate accurate subtitles automatically",
        category: "ai-tools",
        icon: "🗣️",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "medium",
        input_types: ["video", "audio"],
        output_types: ["text"],
        features: ["Multi-language support", "Timestamp sync", "SRT export"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "ai-voice-clone",
        name: "AI Voice Cloning",
        description: "Clone any voice from a short sample",
        category: "ai-tools",
        icon: "🎤",
        ai_powered: true,
        credits_cost: 40,
        processing_time: "medium",
        input_types: ["audio"],
        output_types: ["audio"],
        features: ["Voice synthesis", "Custom speech", "Emotion control"],
        premium: true,
        popular: false,
        beta: true,
      },
      {
        id: "ai-animation",
        name: "AI Animation",
        description: "Animate static images with AI motion",
        category: "ai-tools",
        icon: "🎨",
        ai_powered: true,
        credits_cost: 35,
        processing_time: "slow",
        input_types: ["image"],
        output_types: ["video"],
        features: ["Character animation", "Object motion", "Scene dynamics"],
        premium: true,
        popular: false,
        beta: true,
      },
      {
        id: "ai-upscaler",
        name: "AI Image Upscaler",
        description: "Enhance image quality up to 8K resolution",
        category: "ai-tools",
        icon: "📈",
        ai_powered: true,
        credits_cost: 10,
        processing_time: "fast",
        input_types: ["image"],
        output_types: ["image"],
        features: ["8K upscaling", "Noise reduction", "Detail enhancement"],
        premium: false,
        popular: true,
        beta: false,
      },

      // Traditional Video Tools
      {
        id: "video-trimmer",
        name: "Video Trimmer",
        description: "Cut and trim videos with precision",
        category: "video",
        icon: "✂️",
        ai_powered: false,
        credits_cost: 2,
        processing_time: "fast",
        input_types: ["video"],
        output_types: ["video"],
        features: [
          "Frame-perfect cuts",
          "Multiple formats",
          "Batch processing",
        ],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "video-merger",
        name: "Video Merger",
        description: "Combine multiple videos seamlessly",
        category: "video",
        icon: "🔗",
        ai_powered: false,
        credits_cost: 5,
        processing_time: "medium",
        input_types: ["video"],
        output_types: ["video"],
        features: ["Smooth transitions", "Audio sync", "Quality preservation"],
        premium: false,
        popular: false,
        beta: false,
      },

      // Audio Tools
      {
        id: "noise-remover",
        name: "Noise Remover",
        description: "Remove background noise from audio",
        category: "audio",
        icon: "🔇",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "fast",
        input_types: ["audio"],
        output_types: ["audio"],
        features: [
          "Adaptive filtering",
          "Preserve vocals",
          "Real-time preview",
        ],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "vocal-remover",
        name: "Vocal Remover",
        description: "Extract instrumentals from songs",
        category: "audio",
        icon: "🎼",
        ai_powered: true,
        credits_cost: 12,
        processing_time: "medium",
        input_types: ["audio"],
        output_types: ["audio"],
        features: ["AI separation", "Karaoke mode", "Stems isolation"],
        premium: false,
        popular: true,
        beta: false,
      },

      // Image Tools
      {
        id: "photo-enhancer",
        name: "Photo Enhancer",
        description: "Enhance photos with AI-powered adjustments",
        category: "image",
        icon: "✨",
        ai_powered: true,
        credits_cost: 6,
        processing_time: "fast",
        input_types: ["image"],
        output_types: ["image"],
        features: ["Auto enhance", "Color correction", "Lighting fix"],
        premium: false,
        popular: true,
        beta: false,
      },

      // Text Tools
      {
        id: "text-to-speech",
        name: "Text to Speech",
        description: "Convert text to natural-sounding speech",
        category: "text",
        icon: "📢",
        ai_powered: true,
        credits_cost: 5,
        processing_time: "fast",
        input_types: ["text"],
        output_types: ["audio"],
        features: ["50+ voices", "Emotion control", "SSML support"],
        premium: false,
        popular: true,
        beta: false,
      },
    ];

    setTools(mockTools);
  }, []);

  const filteredTools = tools.filter((tool) => {
    if (selectedCategory !== "all" && tool.category !== selectedCategory)
      return false;
    if (
      searchQuery &&
      !tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleToolSelect = (tool: AITool) => {
    if (tool.credits_cost > userCredits.remaining) {
      alert("Insufficient credits! Please upgrade your plan.");
      return;
    }

    // TODO: Open tool interface
    console.log("Selected tool:", tool);
  };

  const ToolCard = ({ tool }: { tool: AITool }) => (
    <div
      className="glass-card p-6 rounded-xl border border-knoux-purple/20 hover:border-knoux-purple/60 transition-all duration-300 cursor-pointer group interactive"
      onClick={() => handleToolSelect(tool)}
    >
      {/* Tool Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`text-3xl p-2 rounded-lg ${
              tool.ai_powered ? "bg-knoux-purple/20" : "bg-gray-500/20"
            }`}
          >
            {tool.icon}
          </div>
          <div>
            <h3 className="font-rajdhani font-bold text-white group-hover:text-knoux-purple transition-colors">
              {tool.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {tool.ai_powered && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-knoux-purple to-knoux-neon rounded text-xs font-bold text-white">
                  AI
                </span>
              )}
              {tool.premium && (
                <span className="px-2 py-0.5 bg-yellow-500/80 rounded text-xs font-bold text-black">
                  PRO
                </span>
              )}
              {tool.beta && (
                <span className="px-2 py-0.5 bg-orange-500/80 rounded text-xs font-bold text-white">
                  BETA
                </span>
              )}
              {tool.popular && (
                <span className="px-2 py-0.5 bg-green-500/80 rounded text-xs font-bold text-white">
                  🔥 Popular
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Credits Cost */}
        <div className="text-right">
          <div className="text-lg font-bold text-knoux-neon">
            {tool.credits_cost}
          </div>
          <div className="text-xs text-white/60">credits</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/70 text-sm mb-4 leading-relaxed">
        {tool.description}
      </p>

      {/* Features */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {tool.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-knoux-purple/10 border border-knoux-purple/20 rounded text-xs text-knoux-purple"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Processing Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full ${
              tool.processing_time === "fast"
                ? "bg-green-400"
                : tool.processing_time === "medium"
                  ? "bg-yellow-400"
                  : "bg-red-400"
            }`}
          ></span>
          <span className="text-xs text-white/60 capitalize">
            {tool.processing_time} processing
          </span>
        </div>

        <div className="flex space-x-1">
          {tool.input_types.map((type, idx) => (
            <span key={idx} className="text-xs text-white/50">
              {type === "text"
                ? "📝"
                : type === "image"
                  ? "🖼️"
                  : type === "video"
                    ? "🎥"
                    : "🎵"}
            </span>
          ))}
          <span className="text-white/30">→</span>
          {tool.output_types.map((type, idx) => (
            <span key={idx} className="text-xs text-knoux-neon">
              {type === "text"
                ? "📝"
                : type === "image"
                  ? "🖼️"
                  : type === "video"
                    ? "����"
                    : "🎵"}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        className={`w-full py-2 rounded-lg font-medium transition-all ${
          tool.credits_cost > userCredits.remaining
            ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
            : "bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white"
        }`}
        disabled={tool.credits_cost > userCredits.remaining}
      >
        {tool.credits_cost > userCredits.remaining
          ? "Insufficient Credits"
          : "Use Tool"}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
              🛠️ AI Toolbox
            </h2>
            <p className="text-white/70 mt-1">
              Powerful AI tools to enhance your content
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools..."
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

        {/* Credits Info */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-knoux-purple/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-purple">
              {userCredits.remaining}
            </div>
            <div className="text-sm text-white/70">Credits Left</div>
          </div>
          <div className="text-center p-3 bg-knoux-neon/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-neon">
              {tools.filter((t) => t.ai_powered).length}
            </div>
            <div className="text-sm text-white/70">AI Tools</div>
          </div>
          <div className="text-center p-3 bg-green-400/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {tools.filter((t) => t.popular).length}
            </div>
            <div className="text-sm text-white/70">Popular</div>
          </div>
          <div className="text-center p-3 bg-yellow-400/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 capitalize">
              {userCredits.subscription_tier}
            </div>
            <div className="text-sm text-white/70">Plan</div>
          </div>
        </div>

        {/* Credits Progress */}
        <div className="mt-4 p-4 bg-black/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Credits Usage</span>
            <span className="text-knoux-neon">
              {userCredits.used}/{userCredits.total}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(userCredits.used / userCredits.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="glass-card p-4 rounded-2xl border border-knoux-purple/20">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as ToolCategory)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? `bg-${category.color}/30 border border-${category.color} text-${category.color}`
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="text-xs opacity-75">
                (
                {
                  tools.filter(
                    (t) => category.id === "all" || t.category === category.id,
                  ).length
                }
                )
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-orbitron font-bold text-white">
            {categories.find((c) => c.id === selectedCategory)?.icon}{" "}
            {categories.find((c) => c.id === selectedCategory)?.name}
          </h3>
          <span className="text-white/70">{filteredTools.length} tools</span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">
              No Tools Found
            </h3>
            <p className="text-white/70">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Notice */}
      {userCredits.subscription_tier === "free" && (
        <div className="glass-card p-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/5">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">⭐</div>
            <div className="flex-grow">
              <h3 className="text-xl font-orbitron font-bold text-yellow-400 mb-1">
                Upgrade to Pro
              </h3>
              <p className="text-white/70">
                Get unlimited credits and access to premium AI tools
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-bold text-black hover:scale-105 transition-transform">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxPanel;
