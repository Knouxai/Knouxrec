import React, { useState, useEffect } from "react";
import { useRecorder } from "../hooks/useRecorder";
import { formatTime } from "../utils";
import ToggleSwitch from "./ToggleSwitch";
import { ScreenIcon, MicIcon, SystemAudioIcon, CameraIcon } from "./icons";

const ControlCard = ({
  icon,
  label,
  description,
  enabled,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled: boolean;
}) => (
  <div
    className={`glass-card p-4 rounded-xl transition-all duration-300 flex items-center justify-between border ${
      enabled && !disabled
        ? "border-knoux-purple bg-knoux-purple/10"
        : "border-knoux-purple/20 hover:border-knoux-purple/40"
    } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "interactive"}`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`flex-shrink-0 text-2xl ${enabled ? "text-knoux-purple" : "text-knoux-neon"}`}
      >
        {icon}
      </div>
      <div className="flex-grow">
        <h4 className="font-rajdhani font-bold text-white">{label}</h4>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
    <ToggleSwitch enabled={enabled} onChange={onToggle} disabled={disabled} />
  </div>
);

const SelectControl = <T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
  icon,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled: boolean;
  icon?: React.ReactNode;
}) => (
  <div
    className={`glass-card p-4 rounded-xl transition-all duration-300 flex items-center justify-between border border-knoux-purple/20 ${
      disabled
        ? "opacity-50 cursor-not-allowed pointer-events-none"
        : "hover:border-knoux-purple/40"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon && <div className="text-knoux-neon text-xl">{icon}</div>}
      <label className="font-rajdhani font-bold text-white">{label}</label>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      disabled={disabled}
      className="p-2 rounded-lg bg-black/30 border border-knoux-purple/30 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-knoux-purple focus:border-knoux-purple min-w-[120px]"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-black text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export function Controls() {
  const { state, actions } = useRecorder();
  const [recordingMode, setRecordingMode] = useState<
    "screen" | "webcam" | "window"
  >("screen");

  useEffect(() => {
    if (!state.isInitialized) {
      actions.initialize();
    }
  }, [state.isInitialized, actions]);

  const handleStartRecording = async () => {
    try {
      switch (recordingMode) {
        case "screen":
          await actions.startRecording();
          break;
        case "webcam":
          await actions.startWebcamRecording();
          break;
        case "window":
          await actions.recordSpecificWindow();
          break;
      }
    } catch (error) {
      console.error("خطأ في بدء التسجيل:", error);
    }
  };

  const videoQualityOptions = [
    { value: "low" as const, label: "منخفضة (720p)" },
    { value: "medium" as const, label: "متوسطة (1080p)" },
    { value: "high" as const, label: "عالية (1440p)" },
    { value: "ultra" as const, label: "فائقة (4K)" },
  ];

  const fpsOptions = [
    { value: 15 as const, label: "15 FPS" },
    { value: 30 as const, label: "30 FPS" },
    { value: 60 as const, label: "60 FPS" },
  ];

  const bitRateOptions = [
    { value: 2500000 as const, label: "2.5 Mbps" },
    { value: 5000000 as const, label: "5 Mbps" },
    { value: 8000000 as const, label: "8 Mbps" },
    { value: 15000000 as const, label: "15 Mbps" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4 rounded-xl border border-knoux-purple/30">
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">
          🎛️ أدوات التسجيل المتقدمة
        </h3>
        <p className="text-white/70">نظام تسجيل احترافي مع ذكاء اصطناعي</p>
      </div>

      {/* Recording Mode Selection */}
      <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
        <h4 className="font-orbitron font-bold text-white mb-4">
          📹 نوع التسج��ل
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setRecordingMode("screen")}
            disabled={state.isRecording}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              recordingMode === "screen"
                ? "border-knoux-purple bg-knoux-purple/20 text-knoux-purple"
                : "border-knoux-purple/30 text-white hover:border-knoux-purple/50"
            } ${state.isRecording ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-2xl mb-2">🖥️</div>
            <div className="text-sm font-medium">الشاشة</div>
          </button>
          <button
            onClick={() => setRecordingMode("webcam")}
            disabled={state.isRecording}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              recordingMode === "webcam"
                ? "border-knoux-purple bg-knoux-purple/20 text-knoux-purple"
                : "border-knoux-purple/30 text-white hover:border-knoux-purple/50"
            } ${state.isRecording ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-2xl mb-2">📹</div>
            <div className="text-sm font-medium">الكاميرا</div>
          </button>
          <button
            onClick={() => setRecordingMode("window")}
            disabled={state.isRecording}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              recordingMode === "window"
                ? "border-knoux-purple bg-knoux-purple/20 text-knoux-purple"
                : "border-knoux-purple/30 text-white hover:border-knoux-purple/50"
            } ${state.isRecording ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-2xl mb-2">🪟</div>
            <div className="text-sm font-medium">نافذة</div>
          </button>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="glass-card p-6 rounded-xl border border-knoux-purple/20">
        <div className="flex items-center justify-center mb-6">
          {!state.isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={!state.isInitialized}
              className="glass-button-primary px-8 py-4 rounded-2xl text-white font-semibold text-lg hover:scale-105 transform transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔴 بدء التسجيل
            </button>
          ) : (
            <div className="flex space-x-3">
              {!state.isPaused ? (
                <button
                  onClick={actions.pauseRecording}
                  className="glass-button-secondary px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transform transition-all duration-200"
                >
                  ⏸️ إيقاف مؤقت
                </button>
              ) : (
                <button
                  onClick={actions.resumeRecording}
                  className="glass-button-accent px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transform transition-all duration-200"
                >
                  ▶️ استئناف
                </button>
              )}
              <button
                onClick={actions.stopRecording}
                className="glass-button-danger px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transform transition-all duration-200"
              >
                ⏹️ إيقاف
              </button>
              <button
                onClick={() => actions.takeScreenshot()}
                className="glass-button-accent px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transform transition-all duration-200"
              >
                📸 لقطة
              </button>
            </div>
          )}
        </div>

        {/* Recording Timer */}
        {state.isRecording && (
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-white mb-3 font-mono">
              {formatTime(state.recordingTime)}
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full animate-pulse w-full"></div>
            </div>
            <div className="text-sm text-white/70">
              {state.isPaused ? "⏸️ متوقف مؤقتاً" : "🔴 يسجل الآن..."}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {state.recordingBlob && (
          <div className="flex space-x-3 justify-center mb-6">
            <button
              onClick={actions.downloadRecording}
              className="glass-button-success px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transform transition-all duration-200"
            >
              💾 تحميل التسجيل
            </button>
            <button
              onClick={actions.clearRecording}
              className="glass-button-secondary px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transform transition-all duration-200"
            >
              🗑️ مسح
            </button>
          </div>
        )}
      </div>

      {/* Audio Settings */}
      <div className="space-y-4">
        <h4 className="font-orbitron font-bold text-white mb-3">
          🔊 إعدادات الصوت
        </h4>

        <ControlCard
          icon={<SystemAudioIcon />}
          label="صوت النظام"
          description="تسجيل صوت الك��بيوتر والتطبيقات"
          enabled={state.includeAudio}
          onToggle={actions.setIncludeAudio}
          disabled={state.isRecording}
        />

        <ControlCard
          icon={<MicIcon />}
          label="الميكروفون"
          description="تسجيل صوت الميكروفون"
          enabled={state.includeMicrophone}
          onToggle={actions.setIncludeMicrophone}
          disabled={state.isRecording}
        />
      </div>

      {/* Quality Settings */}
      <div className="space-y-4">
        <h4 className="font-orbitron font-bold text-white mb-3">
          ⚡ إعدادات الجودة
        </h4>

        <SelectControl
          label="جودة الفيديو"
          value={state.recordingQuality}
          options={videoQualityOptions}
          onChange={actions.setRecordingQuality}
          disabled={state.isRecording}
          icon="🎥"
        />

        <SelectControl
          label="معدل الإطارات"
          value={state.frameRate}
          options={fpsOptions}
          onChange={actions.setFrameRate}
          disabled={state.isRecording}
          icon="📊"
        />

        <SelectControl
          label="معدل البت"
          value={state.bitRate}
          options={bitRateOptions}
          onChange={actions.setBitRate}
          disabled={state.isRecording}
          icon="💾"
        />
      </div>

      {/* Device Selection */}
      {state.devices.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-orbitron font-bold text-white mb-3">
            📹 أجهزة التسجيل
          </h4>

          <SelectControl
            label="الكاميرا"
            value={state.currentDevice || ""}
            options={state.devices.map((device) => ({
              value: device.deviceId,
              label: device.label || `كاميرا ${device.deviceId.slice(0, 8)}`,
            }))}
            onChange={actions.setDevice}
            disabled={state.isRecording}
            icon="📷"
          />
        </div>
      )}

      {/* Status Summary */}
      <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
        <h4 className="font-orbitron font-bold text-white mb-3">
          📊 ملخص الحالة
        </h4>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className={`p-3 rounded-lg text-center transition-all ${
              state.includeAudio
                ? "bg-knoux-purple/20 text-knoux-purple border border-knoux-purple/50"
                : "bg-gray-500/20 text-gray-500 border border-gray-500/30"
            }`}
          >
            <div className="text-lg mb-1">🔊</div>
            <div className="text-xs font-medium">صوت النظام</div>
          </div>

          <div
            className={`p-3 rounded-lg text-center transition-all ${
              state.includeMicrophone
                ? "bg-knoux-neon/20 text-knoux-neon border border-knoux-neon/50"
                : "bg-gray-500/20 text-gray-500 border border-gray-500/30"
            }`}
          >
            <div className="text-lg mb-1">🎤</div>
            <div className="text-xs font-medium">الميكروفون</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">الجودة:</span>
            <span className="text-knoux-purple font-medium capitalize">
              {state.recordingQuality}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">معدل الإطارات:</span>
            <span className="text-knoux-purple font-medium">
              {state.frameRate} FPS
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">معدل البت:</span>
            <span className="text-knoux-purple font-medium">
              {(state.bitRate / 1000000).toFixed(1)} Mbps
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">الحالة:</span>
            <span
              className={`font-medium ${
                state.isInitialized ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {state.isInitialized ? "✅ جاهز" : "⏳ يتم التحميل..."}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="glass-card p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <div className="flex items-center space-x-3">
            <div className="text-red-400 text-xl">❌</div>
            <div>
              <h4 className="text-red-400 font-medium">خطأ في التسجيل</h4>
              <p className="text-red-300 text-sm">{state.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Controls;
