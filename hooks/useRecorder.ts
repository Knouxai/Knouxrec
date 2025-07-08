
import { useState, useRef, useEffect, useCallback } from 'react';
import { RecordingSettings, RecordingState, ClickEffect } from '../types';
import { generateFileName } from '../utils';

export const useRecorder = (
  settings: RecordingSettings,
  onComplete: (blob: Blob, transcript: string) => void,
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
) => {
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.Idle);
  const [timer, setTimer] = useState('00:00:00');
  const [fps, setFps] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [scheduleStatus, setScheduleStatus] = useState('');
  const [previewSource, setPreviewSource] = useState<MediaStream | null>(null);
  const [pipCameraStream, setPipCameraStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const scheduleTimeoutRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition to avoid extensive typing
  const transcriptRef = useRef<string>('');
  
  // Canvas and Effects Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: -100, y: -100 });
  const clickEffectsRef = useRef<ClickEffect[]>([]);
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);
  const sourceCameraRef = useRef<HTMLVideoElement | null>(null);


  const cleanup = useCallback(() => {
    // Stop all tracks from all streams
    if (sourceVideoRef.current?.srcObject) (sourceVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    if (sourceCameraRef.current?.srcObject) (sourceCameraRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    if (pipCameraStream) pipCameraStream.getTracks().forEach(track => track.stop());
    if (canvasStreamRef.current) canvasStreamRef.current.getTracks().forEach(track => track.stop());
    
    // Clean up refs
    sourceVideoRef.current = null;
    sourceCameraRef.current = null;
    canvasStreamRef.current = null;
    setPipCameraStream(null);
    setPreviewSource(null);

    // Stop recording and cleanup recorder instance
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    
    // Cleanup audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    audioContextRef.current = null;

    // Cleanup timers and animations
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    timerIntervalRef.current = null;
    animationFrameRef.current = null;
    
    // Cleanup speech recognition
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }
    transcriptRef.current = '';

    // Cleanup mouse listeners
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mousedown', handleMouseDown);
    
    // Reset states
    recordedChunksRef.current = [];
    clickEffectsRef.current = [];
    mousePosRef.current = { x: -100, y: -100 };
    setTimer('00:00:00');
    setFps(0);
    setCountdown(0);
  }, [pipCameraStream]);


  const handleMouseMove = (e: MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        clickEffectsRef.current.push({
            id: Date.now(),
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            radius: 15,
            opacity: 1,
            maxRadius: 50,
        });
    }
  };

  const startRecording = useCallback(async () => {
    cleanup();
    setRecordingState(RecordingState.Starting);

    try {
      if (!settings.recordScreen && !settings.recordCamera) {
          throw new Error("No video source selected.");
      }
      
      const requiresCanvas = settings.liveFilter !== 'none' || settings.highlightMouse || (settings.recordScreen && settings.recordCamera);
      
      // Get streams
      const screenStream = settings.recordScreen 
        ? await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: settings.fps, cursor: settings.highlightMouse ? 'never' : 'motion' } as any,
            audio: settings.recordSystemAudio,
          }) 
        : null;
        
      const micStream = settings.recordMic 
        ? await navigator.mediaDevices.getUserMedia({ audio: true }) 
        : null;
        
      const cameraStream = settings.recordCamera
        ? await navigator.mediaDevices.getUserMedia({ video: true })
        : null;

      let videoTrack: MediaStreamTrack | null = null;
      const audioTracks: MediaStreamTrack[] = [];
      
      if (screenStream?.getAudioTracks()[0]) audioTracks.push(screenStream.getAudioTracks()[0]);
      if (micStream?.getAudioTracks()[0]) audioTracks.push(micStream.getAudioTracks()[0]);

      if (requiresCanvas) {
        // Setup canvas and sources
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context failed");
        
        sourceVideoRef.current = document.createElement('video');
        sourceVideoRef.current.muted = true;
        sourceVideoRef.current.autoplay = true;

        if (screenStream) {
            sourceVideoRef.current.srcObject = screenStream;
            const trackSettings = screenStream.getVideoTracks()[0].getSettings();
            canvas.width = trackSettings.width || 1920;
            canvas.height = trackSettings.height || 1080;
        } else if (cameraStream) {
            sourceVideoRef.current.srcObject = cameraStream;
            const trackSettings = cameraStream.getVideoTracks()[0].getSettings();
            canvas.width = trackSettings.width || 1280;
            canvas.height = trackSettings.height || 720;
        }
        await sourceVideoRef.current.play();

        if (settings.recordScreen && cameraStream) {
            sourceCameraRef.current = document.createElement('video');
            sourceCameraRef.current.muted = true;
            sourceCameraRef.current.autoplay = true;
            sourceCameraRef.current.srcObject = cameraStream;
            setPipCameraStream(cameraStream);
            await sourceCameraRef.current.play();
        }

        if (settings.highlightMouse) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mousedown', handleMouseDown);
        }
        
        // Drawing loop
        const drawFrame = () => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            // Draw main video
            if (sourceVideoRef.current) {
                ctx.filter = settings.liveFilter !== 'none' ? `grayscale(${settings.liveFilter === 'grayscale' ? 1:0}) sepia(...)` : 'none';
                ctx.drawImage(sourceVideoRef.current, 0, 0, canvas.width, canvas.height);
            }
            // Draw PIP
            if (sourceCameraRef.current) {
                // ... drawing logic for PIP ...
                const pipWidth = 320;
                const pipHeight = 180;
                ctx.drawImage(sourceCameraRef.current, canvas.width - pipWidth - 20, canvas.height - pipHeight - 20, pipWidth, pipHeight);
            }
            // Draw mouse effects
            if(settings.highlightMouse) {
                clickEffectsRef.current = clickEffectsRef.current.filter(effect => {
                    effect.radius += (effect.maxRadius - effect.radius) * 0.1;
                    effect.opacity -= 0.04;
                    if (effect.opacity <= 0) return false;
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, effect.radius, 0, 2 * Math.PI);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${effect.opacity})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    return true;
                });
                ctx.beginPath();
                ctx.arc(mousePosRef.current.x, mousePosRef.current.y, 15, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0, 240, 255, 0.2)";
                ctx.fill();
            }
            animationFrameRef.current = requestAnimationFrame(drawFrame);
        };
        drawFrame();

        canvasStreamRef.current = canvas.captureStream(settings.fps);
        videoTrack = canvasStreamRef.current.getVideoTracks()[0];

      } else {
        videoTrack = screenStream?.getVideoTracks()[0] || cameraStream?.getVideoTracks()[0] || null;
        if(cameraStream) setPipCameraStream(cameraStream);
      }
      
      if (!videoTrack) throw new Error("Could not get a video track.");
      
      const finalStream = new MediaStream([videoTrack]);
      setPreviewSource(finalStream);
      
      // Mix audio tracks if needed
      if (audioTracks.length > 1) {
        audioContextRef.current = new AudioContext();
        const destination = audioContextRef.current.createMediaStreamDestination();
        audioTracks.forEach(track => {
            audioContextRef.current!.createMediaStreamSource(new MediaStream([track])).connect(destination)
        });
        finalStream.addTrack(destination.stream.getAudioTracks()[0]);
      } else if (audioTracks.length === 1) {
          finalStream.addTrack(audioTracks[0]);
      }

      mediaRecorderRef.current = new MediaRecorder(finalStream, { mimeType: 'video/webm; codecs=vp9,opus' });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        onComplete(blob, transcriptRef.current);
        cleanup();
        setRecordingState(RecordingState.Idle);
      };
      
      // Countdown logic
      if (settings.countdownEnabled) {
          let count = settings.countdownSeconds;
          setCountdown(count);
          const interval = setInterval(() => {
              count--;
              setCountdown(count);
              if (count === 0) {
                  clearInterval(interval);
                  mediaRecorderRef.current?.start();
                  setRecordingState(RecordingState.Recording);
              }
          }, 1000);
      } else {
          mediaRecorderRef.current.start();
          setRecordingState(RecordingState.Recording);
      }

      // Start timer, fps, speech recognition etc.
      // ... (logic from App.tsx would go here)
      
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "An unknown error occurred", 'error');
      cleanup();
      setRecordingState(RecordingState.Idle);
    }
  }, [settings, cleanup, onComplete, addNotification]);

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    // onstop handler will do the rest
  };
  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    setRecordingState(RecordingState.Paused);
  };
  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    setRecordingState(RecordingState.Recording);
  };
  const takeScreenshot = () => {
    // Screenshot logic...
    addNotification('Screenshot captured!', 'success');
  };

  return {
    recordingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    takeScreenshot,
    previewSource,
    pipCameraStream,
    timer,
    fps,
    countdown,
    scheduleStatus,
  };
};