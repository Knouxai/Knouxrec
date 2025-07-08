import React, { useCallback, useEffect, useState, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, value, onChange, step = 1 }) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef<HTMLDivElement>(null);
  const isDraggingMin = useRef(false);
  const isDraggingMax = useRef(false);

  // Convert to percentage
  const getPercent = useCallback((val: number) => Math.round(((val - min) / (max - min)) * 100), [min, max]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  useEffect(() => {
    minValRef.current = value[0];
    maxValRef.current = value[1];
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const handleMouseUp = () => {
    if (isDraggingMin.current || isDraggingMax.current) {
        onChange([minValRef.current, maxValRef.current]);
    }
    isDraggingMin.current = false;
    isDraggingMax.current = false;
  };
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingMin.current && !isDraggingMax.current) return;
    
    const slider = event.currentTarget as HTMLDivElement;
    const rect = slider.getBoundingClientRect();
    const clientX = event.clientX;
    
    let newValue = min + ((clientX - rect.left) / rect.width) * (max - min);
    newValue = Math.max(min, Math.min(max, newValue));
    newValue = Math.round(newValue / step) * step;

    if (isDraggingMin.current) {
        const newMinVal = Math.min(newValue, maxValRef.current - step);
        minValRef.current = newMinVal;
        setMinVal(newMinVal);
    } else if (isDraggingMax.current) {
        const newMaxVal = Math.max(newValue, minValRef.current + step);
        maxValRef.current = newMaxVal;
        setMaxVal(newMaxVal);
    }
  }, [min, max, step]);

  useEffect(() => {
    const sliderElement = document.getElementById('slider-container');
    if (sliderElement) {
        sliderElement.addEventListener('mousemove', handleMouseMove);
        sliderElement.addEventListener('mouseup', handleMouseUp);
        sliderElement.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
        if (sliderElement) {
            sliderElement.removeEventListener('mousemove', handleMouseMove);
            sliderElement.removeEventListener('mouseup', handleMouseUp);
            sliderElement.removeEventListener('mouseleave', handleMouseUp);
        }
    };
  }, [handleMouseMove, handleMouseUp]);


  return (
    <div id="slider-container" className="relative h-10 flex items-center">
      <div className="relative w-full">
        <div className="absolute w-full h-1.5 bg-[var(--card-border)] rounded-full z-0"></div>
        <div ref={range} className="absolute h-1.5 bg-knoux-neon-blue rounded-full z-10"></div>

        <button 
          onMouseDown={() => isDraggingMin.current = true}
          className="absolute w-4 h-4 bg-white rounded-full shadow-md cursor-pointer -top-1.5 focus:outline-none focus:ring-2 focus:ring-knoux-neon-blue z-20"
          style={{ left: `calc(${getPercent(minVal)}% - 8px)` }}
          aria-label="Minimum value"
        />
        <button 
          onMouseDown={() => isDraggingMax.current = true}
          className="absolute w-4 h-4 bg-white rounded-full shadow-md cursor-pointer -top-1.5 focus:outline-none focus:ring-2 focus:ring-knoux-neon-blue z-20"
          style={{ left: `calc(${getPercent(maxVal)}% - 8px)` }}
          aria-label="Maximum value"
        />
      </div>
    </div>
  );
};

export default RangeSlider;
