import React, { useState, useEffect, useCallback, useRef } from 'react';

interface HotkeyCaptureInputProps {
  value: string;
  onChange: (value: string) => void;
}

const formatKeys = (e: KeyboardEvent): string => {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Control');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  if (e.metaKey) parts.push('Meta');
  
  const keyName = e.key.toLowerCase();
  const aCode = 'a'.charCodeAt(0);
  const zCode = 'z'.charCodeAt(0);

  if (!['control', 'shift', 'alt', 'meta', ' '].includes(keyName) && e.key.length === 1 && keyName.charCodeAt(0) >= aCode && keyName.charCodeAt(0) <= zCode) {
    parts.push(e.key.toUpperCase());
  } else if (!['control', 'shift', 'alt', 'meta'].includes(keyName)) {
      parts.push(e.key);
  }
  
  return parts.join('+');
};

const HotkeyCaptureInput: React.FC<HotkeyCaptureInputProps> = ({ value, onChange }) => {
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only register valid combinations
    const keyName = e.key.toLowerCase();
    if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        // Do not allow single key hotkeys unless it is a special key (e.g. F-keys)
        if(e.key.length === 1) return;
    }
    if (['control', 'shift', 'alt', 'meta'].includes(keyName)) return;


    onChange(formatKeys(e));
    setIsListening(false);
    inputRef.current?.blur();
  }, [onChange]);

  useEffect(() => {
    if (isListening) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isListening, handleKeyDown]);

  const handleFocus = () => {
    setIsListening(true);
  };

  const handleBlur = () => {
    setIsListening(false);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={isListening ? 'Listening...' : value}
      onFocus={handleFocus}
      onBlur={handleBlur}
      readOnly
      className="w-full text-center bg-black/20 dark:bg-knoux-dark-glass/50 border border-[var(--card-border)] rounded-md px-3 py-2 focus:ring-2 focus:ring-knoux-neon-blue focus:border-knoux-neon-blue transition cursor-pointer"
    />
  );
};

export default HotkeyCaptureInput;
