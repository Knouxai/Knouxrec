import React, { useState } from "react";
import { Recording } from "../types";

interface FileManagerProps {
  recordings: Recording[];
  onDeleteRecording: (id: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  recordings,
  onDeleteRecording,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [filterBy, setFilterBy] = useState<"all" | "today" | "week" | "month">(
    "all",
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSelectFile = (id: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === recordings.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(recordings.map((r) => r.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedFiles.size} selected recordings?`)) {
      selectedFiles.forEach((id) => onDeleteRecording(id));
      setSelectedFiles(new Set());
    }
  };

  const handleDownload = (recording: Recording) => {
    const link = document.createElement("a");
    link.href = recording.url;
    link.download = recording.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDownload = () => {
    recordings
      .filter((r) => selectedFiles.has(r.id))
      .forEach((recording) => handleDownload(recording));
  };

  const filteredRecordings = recordings
    .filter((recording) => {
      if (filterBy === "all") return true;
      const now = new Date();
      const recordingDate = recording.date;

      switch (filterBy) {
        case "today":
          return recordingDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordingDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return recordingDate >= monthAgo;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.size - a.size;
        case "date":
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });

  const totalSize = recordings.reduce((sum, r) => sum + r.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-orbitron font-bold text-white">
            📁 File Manager
          </h2>
          <div className="text-right">
            <div className="text-lg font-bold text-knoux-purple">
              {recordings.length} Files
            </div>
            <div className="text-sm text-white/70">
              {formatFileSize(totalSize)} Total
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-white/70">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass bg-black/30 border border-knoux-purple/30 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-white/70">Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="glass bg-black/30 border border-knoux-purple/30 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {recordings.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-knoux-neon/20 border border-knoux-neon/30 rounded-lg text-knoux-neon text-sm hover:bg-knoux-neon/30 transition-all"
            >
              {selectedFiles.size === recordings.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <div className="mt-4 p-4 bg-knoux-purple/20 rounded-lg border border-knoux-purple/30">
            <div className="flex items-center justify-between">
              <span className="text-white">
                {selectedFiles.size} files selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDownload}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-all"
                >
                  Download Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-all"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {filteredRecordings.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-orbitron font-bold text-white mb-2">
            No Files Found
          </h3>
          <p className="text-white/70">
            {recordings.length === 0
              ? "Start recording to see your files here"
              : "No files match your current filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className={`glass-card p-4 rounded-xl transition-all duration-300 ${
                selectedFiles.has(recording.id)
                  ? "bg-knoux-purple/20 border-knoux-purple"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedFiles.has(recording.id)}
                  onChange={() => handleSelectFile(recording.id)}
                  className="w-4 h-4 rounded border-knoux-purple/30 bg-black/30 text-knoux-purple focus:ring-knoux-purple"
                />

                {/* File Icon */}
                <div className="text-2xl">🎬</div>

                {/* File Info */}
                <div className="flex-grow">
                  <h3 className="font-rajdhani font-bold text-white">
                    {recording.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <span>{formatFileSize(recording.size)}</span>
                    <span>{recording.date.toLocaleDateString()}</span>
                    <span>{recording.date.toLocaleTimeString()}</span>
                    {recording.duration > 0 && (
                      <span>{Math.round(recording.duration)}s</span>
                    )}
                  </div>
                  {recording.summary && (
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">
                      {recording.summary}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(recording)}
                    className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-all"
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = recording.url;
                      link.target = "_blank";
                      link.click();
                    }}
                    className="p-2 bg-knoux-neon/20 border border-knoux-neon/30 rounded-lg text-knoux-neon hover:bg-knoux-neon/30 transition-all"
                    title="Preview"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${recording.name}"?`)) {
                        onDeleteRecording(recording.id);
                      }
                    }}
                    className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage Info */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-orbitron font-bold text-white mb-4">
          💾 Storage Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-knoux-purple/20 rounded-lg">
            <div className="text-2xl font-bold text-knoux-purple">
              {recordings.length}
            </div>
            <div className="text-sm text-white/70">Total Files</div>
          </div>
          <div className="p-4 bg-knoux-neon/20 rounded-lg">
            <div className="text-2xl font-bold text-knoux-neon">
              {formatFileSize(totalSize)}
            </div>
            <div className="text-sm text-white/70">Total Size</div>
          </div>
          <div className="p-4 bg-green-400/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {recordings.length > 0
                ? formatFileSize(totalSize / recordings.length)
                : "0 MB"}
            </div>
            <div className="text-sm text-white/70">Average Size</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
