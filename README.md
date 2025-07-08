# 🎬 KNOUX REC - Luxury AI-Powered Screen Recorder

![KNOUX REC Banner](https://via.placeholder.com/1200x400/8B5CF6/FFFFFF?text=KNOUX+REC+-+Luxury+Screen+Recorder)

## ✨ Overview

**KNOUX REC** is a premium, offline-first screen recording application featuring:

- 🎨 **Luxury Glassmorphism UI** with purple neon aesthetics
- 🧠 **Offline AI Processing** powered by TensorFlow.js
- ⚡ **Real-time Performance Monitoring**
- 🚀 **Hardware Acceleration** support
- 🎯 **Zero External Dependencies** for AI (completely offline)

## 🌟 Key Features

### 🎨 **Luxury Design**

- Glassmorphism interface with purple neon theme
- Interactive hover effects and glow animations
- Premium Orbitron & Rajdhani fonts
- Responsive design for all devices

### 🧠 **Advanced AI (100% Offline)**

- ✅ **Speech Analysis** - Real-time transcription and analysis
- ✅ **Keyword Extraction** - Smart content tagging
- ✅ **Smart Summarization** - Automatic content summaries
- ✅ **Language Detection** - Multi-language support
- ✅ **Sentiment Analysis** - Content mood detection
- 🚧 **OCR** - Text recognition (Tesseract.js integration coming soon)
- 🚧 **Face Detection** - MediaPipe integration planned
- 🚧 **Object Detection** - YOLO integration planned

### ⚡ **Performance**

- Real-time system monitoring
- Hardware acceleration detection
- Memory and CPU optimization
- Frame drop detection and prevention
- Quality assessment and recommendations

### 📹 **Recording Features**

- Screen, window, and region recording
- Webcam Picture-in-Picture
- Multiple quality options (480p, 720p, 1080p)
- Variable frame rates (30/60 FPS)
- Live filters and effects
- Countdown timer
- Scheduled recording
- Instant trimming

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Modern browser with WebRTC support
- Hardware acceleration recommended

### Installation

```bash
# Clone the repository
git clone https://github.com/Knouxai/Knouxrec.git
cd Knouxrec

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Frontend Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Ultra-fast build tool
- **Tailwind CSS** - Utility-first styling

### AI & ML Stack

- **TensorFlow.js** - Browser-based machine learning
- **Web Audio API** - Audio processing and analysis
- **Canvas API** - Real-time video processing
- **Web Speech API** - Speech recognition

### Performance Tools

- Custom performance monitoring
- Real-time metrics tracking
- Hardware acceleration detection
- Memory usage optimization

## 📁 Project Structure

```
KNOUX REC/
├── components/           # React components
│   ├── Header.tsx       # Main navigation header
│   ├── VideoPreview.tsx # Recording preview
│   ├── Actions.tsx      # Recording controls
│   ├── AIPanel.tsx      # AI tools interface
│   ├── PerformancePanel.tsx # System monitoring
│   ├── FileManager.tsx  # File operations
│   └── ...
├── services/            # Core services
│   ├── offlineAI.ts     # AI processing engine
│   ├── performanceMonitor.ts # Performance tracking
│   └── geminiService.ts # AI interface
├── hooks/               # React hooks
│   └── useRecorder.ts   # Recording functionality
├── types.ts            # TypeScript definitions
├── utils.ts            # Utility functions
└── App.tsx             # Main application
```

## 🎯 Core Components

### 🎬 Recording Engine

- WebRTC-based screen capture
- Multiple source support (screen/window/camera)
- Real-time encoding and compression
- Quality optimization based on system performance

### 🧠 AI Processing Engine

```typescript
// Example AI processing
import { processAdvancedTranscript } from "./services/offlineAI";

const result = await processAdvancedTranscript(transcript, audioBuffer);
console.log(result.title); // Smart title generation
console.log(result.summary); // Intelligent summary
console.log(result.keywords); // Extracted keywords
console.log(result.sentiment); // Sentiment analysis
```

### ⚡ Performance Monitoring

```typescript
import { performanceMonitor } from "./services/performanceMonitor";

// Start monitoring
performanceMonitor.startMonitoring();

// Get real-time metrics
const metrics = performanceMonitor.getCurrentMetrics();
console.log(`FPS: ${metrics.fps}, Memory: ${metrics.memoryUsage}%`);
```

## 🎨 Styling System

### Color Palette

- **Primary Purple**: `#8B5CF6` (knoux-purple)
- **Neon Blue**: `#00D9FF` (knoux-neon)
- **Dark Glass**: `rgba(255, 255, 255, 0.05)`
- **Gradient**: Purple to neon blue transitions

### Glassmorphism Classes

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
}
```

## 🔧 Configuration

### AI Settings

```typescript
// Customize AI processing
const settings = {
  aiProcessingEnabled: true,
  realTimeTranscription: true,
  sentimentAnalysis: true,
  languageDetection: true,
  keywordExtraction: true,
  smartSummarization: true,
};
```

### Performance Settings

```typescript
// Optimize performance
const performanceConfig = {
  targetFPS: 60,
  memoryThreshold: 80,
  cpuThreshold: 75,
  enableHardwareAcceleration: true,
  qualityAdjustment: "auto",
};
```

## 🌐 Browser Support

- ✅ **Chrome 90+** (Recommended)
- ✅ **Firefox 88+**
- ✅ **Safari 14+**
- ✅ **Edge 90+**

### Required APIs

- WebRTC (screen recording)
- Web Audio API (audio processing)
- Canvas API (video processing)
- Web Speech API (transcription)
- WebAssembly (AI acceleration)

## 📊 Performance Benchmarks

| System           | FPS   | Memory | Quality   |
| ---------------- | ----- | ------ | --------- |
| High-end Desktop | 60    | <50%   | Excellent |
| Mid-range Laptop | 45-55 | <70%   | Good      |
| Basic System     | 30-40 | <85%   | Fair      |

## 🛠️ Development

### Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run type-check # TypeScript validation
```

### Adding New AI Features

1. Extend `offlineAI.ts` service
2. Update AI panel interface
3. Add processing functions
4. Update types and interfaces

### Custom Themes

```css
/* Add to index.html */
:root {
  --knoux-primary: #your-color;
  --knoux-secondary: #your-color;
  --glass-bg: rgba(your-color, 0.05);
}
```

## 🔒 Privacy & Security

- ✅ **100% Offline Processing** - No data sent to external servers
- ✅ **Local Storage Only** - Recordings stay on your device
- ✅ **No Tracking** - Zero analytics or telemetry
- ✅ **Open Source** - Full transparency

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain glassmorphism design consistency
- Add tests for new AI features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** - Machine learning in the browser
- **React Team** - Amazing framework
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool

## 🔮 Roadmap

### Version 2.0 (Coming Soon)

- 🔍 **OCR Integration** with Tesseract.js
- 👥 **Face Detection** with MediaPipe
- 🎯 **Object Detection** with YOLO
- 🎵 **Advanced Audio Analysis**
- 📱 **Mobile App** (React Native)

### Version 3.0 (Future)

- 🌐 **Real-time Collaboration**
- ☁️ **Optional Cloud Sync**
- 🎮 **Game Recording Optimization**
- 🔴 **Live Streaming Integration**

---

<div align="center">

**Made with ❤️ by the KNOUX Team**

[Website](https://knoux.ai) • [Documentation](https://docs.knoux.ai) • [Support](https://support.knoux.ai)

</div>
