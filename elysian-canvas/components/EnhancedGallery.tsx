import React, { useState, useRef } from "react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  backgroundImage: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "master";
  tags: string[];
  tools: string[];
  data: any;
}

interface EnhancedGalleryProps {
  onTemplateSelect: (template: Template) => void;
  onImageUpload: (file: File) => void;
}

export const EnhancedGallery: React.FC<EnhancedGalleryProps> = ({
  onTemplateSelect,
  onImageUpload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates: Template[] = [
    {
      id: "vitruvian-form",
      name: "Vitruvian Form",
      category: "Body as Sculpture",
      description:
        "Perfect geometric proportions inspired by Leonardo da Vinci",
      backgroundImage:
        "linear-gradient(135deg, #f5f5dc 0%, #daa520 50%, #8b7355 100%)",
      difficulty: "intermediate",
      tags: ["classical", "geometry", "renaissance"],
      tools: ["Golden Ratio Guide", "Proportional Grid", "Classical Lighting"],
      data: {},
    },
    {
      id: "shadow-play",
      name: "Shadow Play Portrait",
      category: "Noir Atmosphere",
      description: "Dramatic use of shadow and light to create mystery",
      backgroundImage:
        "linear-gradient(135deg, #1a1a1a 0%, #333333 50%, #000000 100%)",
      difficulty: "advanced",
      tags: ["noir", "dramatic", "chiaroscuro"],
      tools: ["Shadow Mapper", "Contrast Enhancer", "Mood Lighting"],
      data: {},
    },
    {
      id: "celestial-body",
      name: "Celestial Body",
      category: "Mystical Realms",
      description: "Transform into a cosmic entity with stellar elements",
      backgroundImage:
        "linear-gradient(135deg, #4b0082 0%, #8a2be2 30%, #9370db 60%, #ffd700 100%)",
      difficulty: "master",
      tags: ["cosmic", "ethereal", "transcendent"],
      tools: ["Star Field Generator", "Cosmic Particles", "Ethereal Glow"],
      data: {},
    },
    {
      id: "earthen-texture",
      name: "Earthen Texture",
      category: "Primal Elements",
      description: "Connect with raw earth elements and natural materials",
      backgroundImage:
        "linear-gradient(135deg, #8b4513 0%, #a0522d 40%, #deb887 100%)",
      difficulty: "intermediate",
      tags: ["natural", "earthy", "organic"],
      tools: ["Texture Mapper", "Material Blender", "Natural Lighting"],
      data: {},
    },
    {
      id: "forbidden-kiss",
      name: "Forbidden Kiss",
      category: "Forbidden Fruits",
      description: "Intimate artistic expression with sophisticated sensuality",
      backgroundImage:
        "linear-gradient(135deg, #2d1b69 0%, #8b008b 50%, #ff1493 100%)",
      difficulty: "master",
      tags: ["intimate", "sensual", "artistic"],
      tools: ["Emotion Enhancer", "Intimacy Filter", "Soft Focus"],
      data: {},
    },
    {
      id: "smoke-mirrors",
      name: "Smoke & Mirrors",
      category: "Noir Atmosphere",
      description: "Mysterious atmosphere with smoke and reflective elements",
      backgroundImage:
        "linear-gradient(135deg, #1c1c1c 0%, #4a4a4a 50%, #2f2f2f 100%)",
      difficulty: "advanced",
      tags: ["mysterious", "atmospheric", "reflective"],
      tools: ["Smoke Generator", "Mirror Effects", "Atmospheric Haze"],
      data: {},
    },
  ];

  const categories = [
    "all",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: Template["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "#4ade80";
      case "intermediate":
        return "#fbbf24";
      case "advanced":
        return "#f97316";
      case "master":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="enhanced-gallery">
      {/* Header Section */}
      <div className="gallery-header">
        <div className="header-content">
          <h1 className="main-title">✨ Elysian Canvas Gallery</h1>
          <p className="subtitle">
            Choose your artistic vision from our curated collection of
            sophisticated templates
          </p>
        </div>

        <div className="upload-section">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
          >
            <span className="upload-icon">📤</span>
            Upload Your Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search templates, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-filter ${selectedCategory === category ? "active" : ""}`}
            >
              {category === "all" ? "All Categories" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`template-card ${hoveredCard === template.id ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredCard(template.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onTemplateSelect(template)}
          >
            {/* Background Image */}
            <div
              className="card-background"
              style={{ background: template.backgroundImage }}
            />

            {/* Overlay */}
            <div className="card-overlay" />

            {/* Content */}
            <div className="card-content">
              {/* Header */}
              <div className="card-header">
                <div
                  className="difficulty-badge"
                  style={{
                    backgroundColor: getDifficultyColor(template.difficulty),
                  }}
                >
                  {template.difficulty}
                </div>
                <div className="category-tag">{template.category}</div>
              </div>

              {/* Title and Description */}
              <div className="card-body">
                <h3 className="template-title">{template.name}</h3>
                <p className="template-description">{template.description}</p>

                {/* Tags */}
                <div className="tags-container">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="tag-more">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Tools Section */}
              <div className="tools-section">
                <h4 className="tools-title">Included Tools:</h4>
                <div className="tools-list">
                  {template.tools.map((tool) => (
                    <div key={tool} className="tool-item">
                      <span className="tool-icon">🛠️</span>
                      <span className="tool-name">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="card-footer">
                <button className="select-button">
                  <span className="button-text">Create Masterpiece</span>
                  <span className="button-icon">✨</span>
                </button>
              </div>
            </div>

            {/* Hover Effects */}
            {hoveredCard === template.id && (
              <div className="hover-effects">
                <div className="preview-hint">Click to start creating</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="quick-actions">
        <div className="action-card">
          <span className="action-icon">🎨</span>
          <h3>Custom Template</h3>
          <p>Start from scratch with a blank canvas</p>
          <button className="action-button">Create Custom</button>
        </div>

        <div className="action-card">
          <span className="action-icon">📚</span>
          <h3>Learn & Tutorials</h3>
          <p>Master the art with guided tutorials</p>
          <button className="action-button">View Tutorials</button>
        </div>

        <div className="action-card">
          <span className="action-icon">💎</span>
          <h3>Premium Collection</h3>
          <p>Access exclusive high-end templates</p>
          <button className="action-button">Unlock Premium</button>
        </div>
      </div>

      <style>{`
        .enhanced-gallery {
          min-height: 100vh;
          background: linear-gradient(135deg, rgba(26, 0, 51, 0.95), rgba(51, 0, 102, 0.98), rgba(40, 20, 60, 0.95));
          padding: 40px;
          color: white;
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content h1 {
          font-size: 3rem;
          background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 10px 0;
          font-weight: 700;
        }

        .header-content p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.2rem;
          margin: 0;
        }

        .upload-section {
          display: flex;
          align-items: center;
        }

        .upload-button {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 12px;
          color: white;
          padding: 15px 25px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
        }

        .filter-section {
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .search-container {
          position: relative;
          max-width: 500px;
        }

        .search-input {
          width: 100%;
          padding: 15px 50px 15px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: #4ecdc4;
          box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
        }

        .category-filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .category-filter {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 25px;
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .category-filter.active {
          background: rgba(78, 205, 196, 0.2);
          border-color: rgba(78, 205, 196, 0.4);
          color: #4ecdc4;
        }

        .category-filter:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }

        .template-card {
          position: relative;
          height: 500px;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .template-card.hovered {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.6) 50%,
            rgba(0, 0, 0, 0.9) 100%
          );
          z-index: 2;
        }

        .card-content {
          position: relative;
          z-index: 3;
          height: 100%;
          padding: 25px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .difficulty-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .category-tag {
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .card-body {
          flex-grow: 1;
        }

        .template-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: white;
        }

        .template-description {
          font-size: 1rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 20px 0;
        }

        .tags-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .tag {
          background: rgba(78, 205, 196, 0.2);
          color: #4ecdc4;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .tag-more {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .tools-section {
          margin-bottom: 20px;
        }

        .tools-title {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 10px 0;
          font-weight: 500;
        }

        .tools-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tool-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tool-icon {
          font-size: 0.8rem;
        }

        .tool-name {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .card-footer {
          margin-top: auto;
        }

        .select-button {
          width: 100%;
          background: linear-gradient(45deg, #ffd700, #ff6b6b);
          border: none;
          border-radius: 12px;
          color: white;
          padding: 15px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .select-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }

        .hover-effects {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 4;
          background: rgba(78, 205, 196, 0.9);
          padding: 15px 25px;
          border-radius: 25px;
          color: white;
          font-weight: 600;
          animation: pulseGlow 2s infinite;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-top: 40px;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .action-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
        }

        .action-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          display: block;
        }

        .action-card h3 {
          font-size: 1.3rem;
          margin: 0 0 10px 0;
          color: white;
        }

        .action-card p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 20px 0;
        }

        .action-button {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 10px;
          color: white;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
        }

        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.8; 
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        @media (max-width: 768px) {
          .enhanced-gallery {
            padding: 20px;
          }
          
          .gallery-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .header-content h1 {
            font-size: 2rem;
          }
          
          .templates-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-section {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedGallery;
