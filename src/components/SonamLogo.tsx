import React from 'react';

interface SonamLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'green' | 'white' | 'dark';
}

export const SonamLogo: React.FC<SonamLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'green',
}) => {
  const sizeMap = {
    sm: { height: 28, textClass: 'text-xl tracking-tight' },
    md: { height: 36, textClass: 'text-2xl sm:text-3xl tracking-tight' },
    lg: { height: 44, textClass: 'text-3xl sm:text-4xl tracking-tight' },
    xl: { height: 56, textClass: 'text-4xl sm:text-5xl tracking-tight' },
  }[size];

  const colorConfig = {
    green: {
      primary: '#16a34a', // vibrant forest green
      secondary: '#22c55e',
      leaf: '#16a34a',
    },
    white: {
      primary: '#ffffff',
      secondary: '#f3f4f6',
      leaf: '#22c55e',
    },
    dark: {
      primary: '#18181b',
      secondary: '#27272a',
      leaf: '#16a34a',
    },
  }[variant];

  return (
    <div className={`inline-flex items-center select-none font-sans ${className}`} aria-label="SŌNAM Gear">
      <div className="relative flex items-center">
        {/* SVG Plant Sprout Leaf Icon positioned on top of the S */}
        <svg
          viewBox="0 0 200 60"
          className="h-8 sm:h-9 w-auto overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Leaf Sprout over the 'S' */}
          <g transform="translate(18, 6)">
            {/* Left Leaf */}
            <path
              d="M-8 -2 C-14 -12, -4 -16, 2 -10 C3 -7, 1 -3, -8 -2 Z"
              fill={colorConfig.leaf}
            />
            {/* Right Leaf */}
            <path
              d="M3 -4 C12 -12, 16 -4, 9 2 C6 4, 3 1, 3 -4 Z"
              fill={colorConfig.leaf}
            />
            {/* Stem */}
            <path
              d="M-1 -1 C0 4, 0 7, 0 9"
              stroke={colorConfig.leaf}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Letter S with macron over O: SŌNAM */}
          {/* S */}
          <path
            d="M 28 22 C 26 17, 12 17, 12 26 C 12 34, 28 34, 28 44 C 28 53, 14 54, 10 49"
            stroke={colorConfig.primary}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* O with macron line above */}
          <rect
            x="36"
            y="13"
            width="18"
            height="3.5"
            rx="1.5"
            fill={colorConfig.primary}
          />
          <ellipse
            cx="45"
            cy="35"
            rx="11"
            ry="14"
            stroke={colorConfig.primary}
            strokeWidth="5"
          />

          {/* N */}
          <path
            d="M 64 49 L 64 21 L 82 49 L 82 21"
            stroke={colorConfig.primary}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* A */}
          <path
            d="M 91 49 L 102 21 L 113 49"
            stroke={colorConfig.primary}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="95"
            y1="40"
            x2="109"
            y2="40"
            stroke={colorConfig.primary}
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* M */}
          <path
            d="M 122 49 L 122 21 L 134 37 L 146 21 L 146 49"
            stroke={colorConfig.primary}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
