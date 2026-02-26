"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

export default function DualRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  className = "",
}: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Helper to get percentage from value
  const getPercent = useCallback(
    (val: number) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  // Helper to get value from percentage
  const getValue = useCallback(
    (percent: number) => {
      const rawValue = min + (percent / 100) * (max - min);
      // Snap to step
      const steppedValue = Math.round(rawValue / step) * step;
      // Clamp
      return Math.min(Math.max(steppedValue, min), max);
    },
    [min, max, step]
  );

  const handleMouseDown = (thumb: "min" | "max") => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1) * 100;
      const newValue = getValue(percent);

      if (isDragging === "min") {
        const nextMin = Math.min(newValue, value[1] - step);
        if (nextMin !== value[0]) onChange([nextMin, value[1]]);
      } else {
        const nextMax = Math.max(newValue, value[0] + step);
        if (nextMax !== value[1]) onChange([value[0], nextMax]);
      }
    };

    const handleUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, getValue, value, onChange, step]);

  const minPercent = getPercent(value[0]);
  const maxPercent = getPercent(value[1]);

  return (
    <div className={`relative h-6 w-full touch-none select-none ${className}`}>
      {/* Track Background */}
      <div
        ref={sliderRef}
        className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-surface-highlight"
      >
        {/* Active Range */}
        <div
          className="absolute h-full rounded-full bg-primary-600"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
      </div>

      {/* Min Thumb */}
      <div
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary-600 bg-white shadow-md transition-transform hover:scale-110 active:cursor-grabbing active:scale-125"
        style={{ left: `${minPercent}%`, zIndex: value[0] > max - 10 ? 5 : 3 }}
        onMouseDown={handleMouseDown("min")}
        onTouchStart={handleMouseDown("min")}
        role="slider"
        aria-valuenow={value[0]}
        aria-valuemin={min}
        aria-valuemax={value[1]}
        aria-label="Minimum price"
        tabIndex={0}
      />

      {/* Max Thumb */}
      <div
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary-600 bg-white shadow-md transition-transform hover:scale-110 active:cursor-grabbing active:scale-125"
        style={{ left: `${maxPercent}%`, zIndex: 4 }}
        onMouseDown={handleMouseDown("max")}
        onTouchStart={handleMouseDown("max")}
        role="slider"
        aria-valuenow={value[1]}
        aria-valuemin={value[0]}
        aria-valuemax={max}
        aria-label="Maximum price"
        tabIndex={0}
      />
    </div>
  );
}
