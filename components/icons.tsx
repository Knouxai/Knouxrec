

import React from 'react';

type IconProps = React.ComponentProps<'svg'>;

export const RecordIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-2c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"/></svg>
);

export const StopIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
);

export const PauseIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);

export const PlayIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

export const ScreenIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
);

export const MicIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
);

export const CameraIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
);

export const SystemAudioIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" strokeWidth="0"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49 1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
);

export const DownloadIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
);

export const DeleteIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
);

export const ScreenshotIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m14 15.5V5H5v13.5l4-4l3 3l4-4l3 3z"/></svg>
);

export const CloseIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
);

export const BellIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
);

export const SunIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.64 5.64c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41zm12.72 12.72c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41zM5.64 18.36c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0zM18.36 5.64c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0z"/></svg>
);

export const MoonIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/></svg>
);

export const ClockIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm4.25 6.75L13 14.57V9h-2v6l5.25 3.15.75-1.23z"/></svg>
);

export const GamepadIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zm7.5-3H22V9h-5.5l-3 3 3 3z"/></svg>
);

export const SpeedometerIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.07V15c0-.55-.45-1-1-1s-1 .45-1 1v1.07c-1.61-.44-3-1.85-3.43-3.57H9c.55 0 1-.45 1-1s-.45-1-1-1H7.57c.44-1.61 1.85-3 3.57-3.43V9c0 .55.45 1 1 1s1-.45 1-1V7.57c1.61.44 3 1.85 3.43 3.57H15c-.55 0-1 .45-1 1s.45 1 1 1h.93c-.43 1.72-1.82 3.13-3.43 3.57zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);

export const SparklesIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.09 2.61L16 6l-2.61 1.09L12 9.7l-1.39-2.61L8 6l2.91-1.09L12 2.5zm-8 4l1.09 2.61L8 10l-2.61 1.09L4 13.7l-1.39-2.61L0 10l2.91-1.09L4 6.5zm16 0l1.09 2.61L24 10l-2.61 1.09L20 13.7l-1.39-2.61L16 10l2.91-1.09L20 6.5zm-8 7.5l-1.09-2.61L8 14l2.61-1.09L12 10.3l1.39 2.61L16 14l-2.91 1.09L12 17.5zm0 4l-1.09-2.61L8 20l2.61-1.09L12 16.3l1.39 2.61L16 20l-2.91-1.09L12 21.5z"/></svg>
);

export const TagIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84l4.57-7.57c.36-.6.36-1.32 0-1.92l-4.57-7.63zM15 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
);

export const LoadingSpinner = ({ className, ...props }: IconProps) => (
  <svg {...props} className={`animate-spin ${className || ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const CutIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/></svg>
);

export const WorkflowIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v3h11zM7 9H4V5h3v4zm10 0h-3V5h3v4z"/></svg>
);

export const KeyboardIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
);

export const FilterIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
);

export const CropIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path>
        <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>
    </svg>
);

export const CursorClickIcon = (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="m13.64 21.97.62-4.22-2.03.51-.61 4.22a.999.999 0 0 0 1.2.82c.33-.17.55-.5.42-.83zM13 2.05c-1.21.37-2.35 1.04-3.35 1.95l1.42 1.42C11.72 4.8 12.35 4.49 13 4.28V2.05zm5.03 2.53 1.42-1.42C18.5 2.21 17.29 1.59 16 1.22v2.24c.73.22 1.4.56 2.03.96zM4.97 18.03l-1.42 1.42C4.5 20.41 5.71 21.03 7 21.4v-2.24c-.73-.22-1.4-.56-2.03-.96zM4.28 11H2.05c.37 1.21 1.04 2.35 1.95 3.35l1.42-1.42C4.8 12.28 4.49 11.65 4.28 11zm15.67 0c-.21.65-.52 1.28-1.13 1.92l1.42 1.42c.91-1 1.58-2.14 1.95-3.35h-2.24zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm6.95-3.03-1.42-1.42C16.57 2.6 15.34 2 14 2v2.1c1.02.22 1.98.66 2.79 1.28l1.16-1.16zM3.51 6.28l1.16 1.16C5.34 6.8 6.02 6.32 7 6.1V4c-1.34.3-2.57.9-3.49 1.87l-.01.01zM7 17.9c-1.02-.22-1.98-.66-2.79-1.28l-1.16 1.16C3.98 18.72 4.66 19.2 5.5 19.49V22c1.34-.3 2.57-.9 3.5-1.87l-1.99-1.98z"/>
    </svg>
);

export const TimerIcon = (props: IconProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
);