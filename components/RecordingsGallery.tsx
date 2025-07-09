import React, { useState } from "react";
import { Recording } from "../types";

interface RecordingsGalleryProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onUpdateRecording: (recording: Recording) => void;
  onSelectForPreview: (recording: Recording) => void;
}

const RecordingsGallery: React.FC<RecordingsGalleryProps> = ({
  recordings,
  onDelete,
  onUpdateRecording,
  onSelectForPreview,
}) => {
  const [hoveredRecording, setHoveredRecording] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (recording: Recording) => {
    const link = document.createElement("a");
    link.href = recording.url;
    link.download = recording.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRename = (recording: Recording) => {
    const newName = prompt(
      "Enter new name:",
      recording.name.replace(/\.[^/.]+$/, ""),
    );
    if (newName && newName.trim() !== "") {
      const extension = recording.name.split(".").pop();
      const updatedRecording = {
        ...recording,
        name: `${newName.trim()}.${extension}`,
      };
      onUpdateRecording(updatedRecording);
    }
  };

  if (recordings.length === 0) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center border border-knoux-purple/30">
        <div className="text-6xl mb-4">����</div>
        <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
          No Recordings Yet
        </h3>
        <p className="text-white/70 mb-6">
          Start recording to see your videos here
        </p>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-knoux-purple/20 border border-knoux-purple/30 rounded-lg text-knoux-purple">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Ready to Record</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-orbitron font-bold text-white">
            🎬 Recordings Gallery
          </h3>
          <p className="text-white/70">{recordings.length} recordings</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-knoux-purple/30 text-knoux-purple border border-knoux-purple"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-knoux-purple/30 text-knoux-purple border border-knoux-purple"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Recordings */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
            : "space-y-3"
        }
      >
        {recordings.map((recording) => (
          <div
            key={recording.id}
            onMouseEnter={() => setHoveredRecording(recording.id)}
            onMouseLeave={() => setHoveredRecording(null)}
            className={`interactive glass-card p-4 rounded-xl border border-knoux-purple/20 transition-all duration-300 ${
              hoveredRecording === recording.id
                ? "border-knoux-purple transform scale-105 shadow-neon-purple"
                : "hover:border-knoux-purple/40"
            }`}
          >
            {viewMode === "grid" ? (
              // Grid View
              <div className="space-y-3">
                {/* Thumbnail */}
                <div
                  className="relative aspect-video bg-black/30 rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => onSelectForPreview(recording)}
                >
                  <video
                    src={recording.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                      <svg
                        className="w-6 h-6 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {recording.duration > 0 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                      {formatDuration(recording.duration)}
                    </div>
                  )}

                  {/* Processing Indicator */}
                  {recording.isProcessing && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/80 rounded text-black text-xs font-medium">
                      Processing...
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h4
                    className="font-rajdhani font-bold text-white truncate"
                    title={recording.name}
                  >
                    {recording.name}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-white/70 mt-1">
                    <span>{formatFileSize(recording.size)}</span>
                    <span>{recording.date.toLocaleDateString()}</span>
                  </div>

                  {/* Summary */}
                  {recording.summary && (
                    <p className="text-xs text-white/60 mt-2 line-clamp-2">
                      {recording.summary}
                    </p>
                  )}

                  {/* Keywords */}
                  {recording.keywords && recording.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recording.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-knoux-purple/20 rounded text-xs text-knoux-purple"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    onClick={() => onSelectForPreview(recording)}
                    className="flex items-center space-x-1 px-3 py-1 bg-knoux-neon/20 rounded text-knoux-neon hover:bg-knoux-neon/30 transition-all text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDownload(recording)}
                      className="p-2 text-green-400 hover:bg-green-400/20 rounded transition-all"
                      title="Download"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRename(recording)}
                      className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded transition-all"
                      title="Rename"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(recording.id)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded transition-all"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <div className="flex items-center space-x-4">
                {/* Thumbnail */}
                <div
                  className="w-20 h-12 bg-black/30 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => onSelectForPreview(recording)}
                >
                  <video
                    src={recording.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <h4 className="font-rajdhani font-bold text-white truncate">
                    {recording.name}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <span>{formatFileSize(recording.size)}</span>
                    <span>{recording.date.toLocaleDateString()}</span>
                    {recording.duration > 0 && (
                      <span>{formatDuration(recording.duration)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => onSelectForPreview(recording)}
                    className="p-2 text-knoux-neon hover:bg-knoux-neon/20 rounded transition-all"
                    title="Preview"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDownload(recording)}
                    className="p-2 text-green-400 hover:bg-green-400/20 rounded transition-all"
                    title="Download"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(recording.id)}
                    className="p-2 text-red-400 hover:bg-red-400/20 rounded transition-all"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingsGallery;
