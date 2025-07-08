// Template System Types for KNOUX REC
export interface TemplateElement {
  id: string;
  type: "text" | "image" | "video" | "audio" | "logo";
  placeholder_key: string;
  default_value: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: {
    font_family?: string;
    font_size?: number;
    color?: string;
    font_weight?: string;
    text_align?: "left" | "center" | "right";
    animation?: string;
    duration?: number;
    media_picker_mode?: "image" | "video" | "both";
    opacity?: number;
    rotation?: number;
  };
}

export interface VideoTemplate {
  template_id: string;
  name: string;
  category: TemplateCategory;
  aspect_ratio: "16:9" | "9:16" | "1:1" | "4:3";
  preview_thumbnail: string;
  preview_video?: string;
  duration: number; // in seconds
  difficulty: "easy" | "medium" | "advanced";
  tags: string[];
  elements: TemplateElement[];
  description: string;
  premium: boolean;
  popular: boolean;
  trending: boolean;
  created_at: string;
  updated_at: string;
}

export type TemplateCategory =
  | "for-you"
  | "education"
  | "birthday"
  | "festival"
  | "intro"
  | "vlog"
  | "business"
  | "social-media"
  | "marketing"
  | "tutorial"
  | "gaming"
  | "music"
  | "travel"
  | "food"
  | "fitness"
  | "technology"
  | "news"
  | "entertainment";

export interface TemplateProject {
  id: string;
  template_id: string;
  name: string;
  customizations: Record<string, any>;
  created_at: string;
  last_modified: string;
  render_status: "draft" | "rendering" | "completed" | "failed";
  output_url?: string;
}

export interface TemplateFilter {
  category?: TemplateCategory;
  aspect_ratio?: "16:9" | "9:16" | "1:1" | "4:3";
  difficulty?: "easy" | "medium" | "advanced";
  duration?: "short" | "medium" | "long"; // <30s, 30-60s, >60s
  premium?: boolean;
  search_query?: string;
}

// Toolbox Types
export interface AITool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  ai_powered: boolean;
  credits_cost: number;
  processing_time: "fast" | "medium" | "slow"; // <30s, 30s-2min, >2min
  input_types: ("text" | "image" | "video" | "audio")[];
  output_types: ("text" | "image" | "video" | "audio")[];
  features: string[];
  premium: boolean;
  popular: boolean;
  beta: boolean;
}

export type ToolCategory =
  | "all"
  | "video"
  | "audio"
  | "image"
  | "text"
  | "ai-tools";

export interface ToolJob {
  id: string;
  tool_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  input_data: any;
  output_data?: any;
  error_message?: string;
  credits_used: number;
  processing_time?: number;
  created_at: string;
  completed_at?: string;
}

export interface UserCredits {
  total: number;
  used: number;
  remaining: number;
  subscription_tier: "free" | "pro" | "enterprise";
  renewal_date?: string;
}
