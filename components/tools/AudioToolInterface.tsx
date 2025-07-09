import React, { useState, useRef, useCallback, useEffect } from "react";
import { AITool } from "../../types/templates";
import AdvancedFileBrowser from "../AdvancedFileBrowser";
import { toolboxService } from "../../services/toolboxService";

interface AudioToolInterfaceProps {
  tool: AITool;
  onClose: () => void;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const AudioToolInterface: React.FC<AudioToolInterfaceProps> = ({
  tool,
  onClose,
  onSuccess,
  onError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Audio tool specific settings
  const [settings, setSettings] = useState({
    quality: "high" as "fast" | "balanced" | "high",
    format: "mp3" as "mp3" | "wav" | "flac" | "aac",
    bitrate: 320 as 128 | 192 | 256 | 320,
    sampleRate: 44100 as 22050 | 44100 | 48000 | 96000,
    channels: "stereo" as "mono" | "stereo",
    voiceEffect: "none" as
      | "none"
      | "robot"
      | "deep"
      | "high"
      | "echo"
      | "reverb",
    noiseReduction: 80,
    volume: 100,
    speed: 1.0,
    pitch: 0,
    bassBoost: 0,
    trebleBoost: 0,
    text: "",
    voice: "arabic_female" as
      | "arabic_female"
      | "arabic_male"
      | "english_female"
      | "english_male",
    separationMode: "vocals" as "vocals" | "drums" | "bass" | "piano" | "other",
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setShowFileBrowser(false);

    // Generate simple waveform visualization
    generateWaveform(file);
  }, []);

  const generateWaveform = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of samples for waveform
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum = sum + Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      setWaveformData(filteredData);
    } catch (error) {
      console.warn("Failed to generate waveform:", error);
    }
  };

  const handleProcessTool = async () => {
    if (!selectedFile && !tool.input_types.includes("text")) {
      onError("يرجى اختيار ملف صوتي أولاً");
      return;
    }

    if (tool.input_types.includes("text") && !settings.text && !selectedFile) {
      onError("يرجى إدخال نص أو اختيار ملف صوتي");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    const totalTime =
      tool.processing_time === "fast"
        ? 2000
        : tool.processing_time === "medium"
          ? 5000
          : 8000;

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 8;
      });
    }, totalTime / 15);

    try {
      const input: any = {
        file: selectedFile,
        text: settings.text,
        options: {
          quality: settings.quality,
          format: settings.format,
          bitrate: settings.bitrate,
          sampleRate: settings.sampleRate,
          channels: settings.channels,
          voiceEffect: settings.voiceEffect,
          noiseReduction: settings.noiseReduction,
          volume: settings.volume,
          speed: settings.speed,
          pitch: settings.pitch,
          bassBoost: settings.bassBoost,
          trebleBoost: settings.trebleBoost,
          voice: settings.voice,
          separationMode: settings.separationMode,
        },
      };

      const result = await toolboxService.executeTool(tool.id, input);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (result.success) {
        onSuccess(result);

        // عرض النتيجة في المشغل إذا كانت صوت
        if (result.output instanceof Blob) {
          setAudioUrl(URL.createObjectURL(result.output));
        }
      } else {
        onError(result.error || "فشل في معالجة الصوت");
      }
    } catch (error) {
      clearInterval(progressInterval);
      onError(error instanceof Error ? error.message : "خطأ غير متوقع");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const downloadResult = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = `${tool.name}_result.${settings.format}`;
      a.click();
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setAudioUrl("");
    setWaveformData([]);
    setSettings({
      ...settings,
      text: "",
      noiseReduction: 80,
      volume: 100,
      speed: 1.0,
      pitch: 0,
      bassBoost: 0,
      trebleBoost: 0,
    });
  };

  // Draw waveform
  useEffect(() => {
    if (canvasRef.current && waveformData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#7C3AED";

      const barWidth = width / waveformData.length;

      waveformData.forEach((value, index) => {
        const barHeight = (value * height) / 2;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;

        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });

      // Draw progress line
      if (duration > 0) {
        const progressX = (currentTime / duration) * width;
        ctx.strokeStyle = "#06FFA5";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, height);
        ctx.stroke();
      }
    }
  }, [waveformData, currentTime, duration]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-6xl w-full max-h-[95vh] overflow-auto rounded-2xl border border-knoux-purple/30">
        {/* Header */}
        <div className="p-6 border-b border-knoux-purple/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{tool.icon}</span>
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white">
                  {tool.name}
                </h2>
                <p className="text-white/70">{tool.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Panel - File & Controls */}
          <div className="space-y-6">
            {/* File Selection */}
            <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
              <h3 className="font-rajdhani font-bold text-white mb-3">
                📁 اختيار الملف
              </h3>

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-sm font-medium text-green-400">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-white/70">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFileBrowser(true)}
                    className="w-full py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-lg text-knoux-purple hover:text-white transition-all text-sm"
                  >
                    تغيير الملف
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowFileBrowser(true)}
                  className="w-full py-8 border-2 border-dashed border-knoux-purple/50 hover:border-knoux-purple rounded-xl text-center transition-all"
                >
                  <div className="text-3xl mb-2">🎵</div>
                  <div className="text-white/70">انقر لاختيار ملف صوتي</div>
                </button>
              )}
            </div>

            {/* Text Input for TTS */}
            {tool.input_types.includes("text") && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  📝 النص
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={settings.text}
                    onChange={(e) =>
                      setSettings({ ...settings, text: e.target.value })
                    }
                    placeholder="اكتب النص المراد تحويله لكلام..."
                    className="w-full h-24 px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-knoux-purple"
                  />

                  {tool.id === "text-to-speech" && (
                    <select
                      value={settings.voice}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          voice: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                    >
                      <option value="arabic_female">عربي - أنثى</option>
                      <option value="arabic_male">عربي - ذكر</option>
                      <option value="english_female">إنجليزي - أنثى</option>
                      <option value="english_male">إنجليزي - ذكر</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Audio Effects */}
            {tool.id === "voice-change" && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  🎛️ تأثيرات الصوت
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      نوع التأثير
                    </label>
                    <select
                      value={settings.voiceEffect}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          voiceEffect: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                    >
                      <option value="none">بدون تأثير</option>
                      <option value="robot">روبوت</option>
                      <option value="deep">عميق</option>
                      <option value="high">حاد</option>
                      <option value="echo">صدى</option>
                      <option value="reverb">رنين</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      طبقة الصوت: {settings.pitch}
                    </label>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      value={settings.pitch}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pitch: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-knoux-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      السرعة: {settings.speed}x
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={settings.speed}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          speed: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-knoux-purple"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Audio Separation */}
            {tool.id === "vocal-remover" && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  🎼 فصل الأصوات
                </h3>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    نوع الفصل
                  </label>
                  <select
                    value={settings.separationMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        separationMode: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value="vocals">الغناء</option>
                    <option value="drums">الطبول</option>
                    <option value="bass">الباس</option>
                    <option value="piano">البيانو</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={handleProcessTool}
                disabled={isProcessing || (!selectedFile && !settings.text)}
                className="w-full py-3 bg-gradient-to-r from-knoux-purple to-knoux-neon hover:from-knoux-purple/80 hover:to-knoux-neon/80 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    <span>جار المعالجة...</span>
                  </div>
                ) : (
                  `تشغيل ${tool.name}`
                )}
              </button>

              {audioUrl && (
                <button
                  onClick={downloadResult}
                  className="w-full py-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 hover:text-white transition-all"
                >
                  تحميل النتيجة
                </button>
              )}

              <button
                onClick={resetTool}
                className="w-full py-2 bg-gray-500/20 hover:bg-gray-500/40 rounded-lg text-gray-400 hover:text-white transition-all"
              >
                إعادة تعيين
              </button>
            </div>
          </div>

          {/* Center & Right Panel - Audio Player & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            <div className="glass-card p-6 rounded-xl border border-knoux-purple/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-rajdhani font-bold text-white text-lg">
                  🎵 مشغل الصوت
                </h3>
                {isProcessing && (
                  <div className="text-sm text-knoux-neon">
                    {processingProgress.toFixed(0)}%
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Waveform Visualization */}
              <div className="mb-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={120}
                  className="w-full h-24 bg-black/30 rounded-lg cursor-pointer"
                  onClick={handleSeek}
                />
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={togglePlayPause}
                  disabled={!audioUrl}
                  className="w-12 h-12 bg-knoux-purple/20 hover:bg-knoux-purple/40 disabled:bg-gray-500/20 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-xl transition-all"
                >
                  {isPlaying ? "⏸️" : "▶️"}
                </button>

                <div className="text-white/70 text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-sm">🔊</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.volume}
                    onChange={(e) => {
                      const vol = parseInt(e.target.value);
                      setSettings({ ...settings, volume: vol });
                      if (audioRef.current) {
                        audioRef.current.volume = vol / 100;
                      }
                    }}
                    className="w-20 accent-knoux-purple"
                  />
                </div>
              </div>

              {/* Hidden Audio Element */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
              />
            </div>

            {/* Advanced Settings */}
            <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
              <h3 className="font-rajdhani font-bold text-white mb-3">
                ⚙️ إعدادات متقدمة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    جودة المعالجة
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quality: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value="fast">سريع</option>
                    <option value="balanced">متوازن</option>
                    <option value="high">عالي الجودة</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    صيغة الإخراج
                  </label>
                  <select
                    value={settings.format}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        format: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                    <option value="flac">FLAC</option>
                    <option value="aac">AAC</option>
                  </select>
                </div>

                {/* Bitrate */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    معدل البت
                  </label>
                  <select
                    value={settings.bitrate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bitrate: parseInt(e.target.value) as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value={128}>128 kbps</option>
                    <option value={192}>192 kbps</option>
                    <option value={256}>256 kbps</option>
                    <option value={320}>320 kbps</option>
                  </select>
                </div>

                {/* Sample Rate */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    معدل العينة
                  </label>
                  <select
                    value={settings.sampleRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sampleRate: parseInt(e.target.value) as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value={22050}>22.05 kHz</option>
                    <option value={44100}>44.1 kHz</option>
                    <option value={48000}>48 kHz</option>
                    <option value={96000}>96 kHz</option>
                  </select>
                </div>
              </div>

              {/* EQ Settings */}
              {tool.ai_powered && (
                <div className="mt-4 pt-4 border-t border-knoux-purple/20">
                  <h4 className="font-medium text-white mb-3">
                    🎚️ التوازن الصوتي
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        تعزيز الباس: {settings.bassBoost}dB
                      </label>
                      <input
                        type="range"
                        min={-10}
                        max={10}
                        value={settings.bassBoost}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bassBoost: parseInt(e.target.value),
                          })
                        }
                        className="w-full accent-knoux-purple"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        تعزيز الترب: {settings.trebleBoost}dB
                      </label>
                      <input
                        type="range"
                        min={-10}
                        max={10}
                        value={settings.trebleBoost}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            trebleBoost: parseInt(e.target.value),
                          })
                        }
                        className="w-full accent-knoux-purple"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Noise Reduction */}
              {tool.id === "noise-reduction" && (
                <div className="mt-4 pt-4 border-t border-knoux-purple/20">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      قوة تقليل الضوضاء: {settings.noiseReduction}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.noiseReduction}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          noiseReduction: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-knoux-purple"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Browser Modal */}
      {showFileBrowser && (
        <AdvancedFileBrowser
          title={`اختر ملف صوتي لـ ${tool.name}`}
          supportedTypes={["audio"]}
          onFileSelect={handleFileSelect}
          onClose={() => setShowFileBrowser(false)}
          maxSize={100}
        />
      )}
    </div>
  );
};

export default AudioToolInterface;
