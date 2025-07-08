
import React, { useRef, useEffect } from 'react';
import { CameraIcon, ScreenIcon } from './icons';
import { RecordingSettings } from '../types';

interface VideoPreviewProps {
  previewSource: MediaStream | string | null;
  isRecording: boolean;
  countdown: number;
  pipCameraStream: MediaStream | null;
  settings: RecordingSettings;
}

const VideoPreview = ({ previewSource, isRecording, countdown, pipCameraStream, settings }: VideoPreviewProps) => {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = mainVideoRef.current;
    if (!videoEl) return;

    if (typeof previewSource === 'string') {
      videoEl.srcObject = null;
      videoEl.src = previewSource;
      videoEl.muted = false;
      videoEl.play().catch(console.error);
    } else if (previewSource instanceof MediaStream) {
      videoEl.src = '';
      videoEl.srcObject = previewSource;
      videoEl.muted = true;
      videoEl.play().catch(console.error);
    } else {
      videoEl.srcObject = null;
      videoEl.src = '';
    }
  }, [previewSource]);

  useEffect(() => {
    if (pipVideoRef.current && pipCameraStream) {
      pipVideoRef.current.srcObject = pipCameraStream;
    }
  }, [pipCameraStream]);
  
  const getPipPositionClasses = () => {
      switch(settings.cameraPipPosition) {
          case 'topLeft': return 'top-4 left-4';
          case 'topRight': return 'top-4 right-4';
          case 'bottomLeft': return 'bottom-4 left-4';
          default: return 'bottom-4 right-4';
      }
  }
  
  const getPipSizeClasses = () => {
      switch(settings.cameraPipSize) {
          case 'small': return 'w-1/5 max-w-[160px]';
          case 'large': return 'w-1/3 max-w-[320px]';
          default: return 'w-1/4 max-w-[240px]';
      }
  }

  return (
    <div className="glass-card rounded-xl relative min-h-[200px] flex items-center justify-center overflow-hidden aspect-video bg-black/10 dark:bg-black/40">
      <video ref={mainVideoRef} className="w-full h-full object-contain" />

      {!previewSource && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[var(--secondary-text)]">
          <ScreenIcon className="w-16 h-16 mx-auto opacity-50" />
          <p className="mt-2 font-bold">KNOUX REC</p>
          <p className="text-xs">Your preview will appear here.</p>
        </div>
      )}

      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-9xl font-orbitron font-bold text-white drop-shadow-lg">{countdown}</span>
        </div>
      )}
      
      {settings.recordCamera && isRecording && pipCameraStream && (
        <div className={`absolute border-2 border-knoux-neon-blue rounded-lg shadow-lg overflow-hidden aspect-video bg-black z-10 ${getPipPositionClasses()} ${getPipSizeClasses()}`}>
            <video ref={pipVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
