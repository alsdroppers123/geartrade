import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface GeartradeLogoProps {
  variant?: 'full' | 'mark' | 'badge' | 'horizontal' | 'icon-only';
  theme?: 'dark' | 'light' | 'mono' | 'white' | 'black' | 'green' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const GeartradeLogo: React.FC<GeartradeLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  let isDarkMode = false;
  try {
    const themeCtx = useTheme();
    isDarkMode = themeCtx.isDark;
  } catch {
    if (typeof document !== 'undefined') {
      isDarkMode = document.documentElement.classList.contains('dark');
    }
  }

  // Determine styling based on theme setting
  let textColorClass = 'text-stone-900 dark:text-white';
  let fillColor = 'currentColor';

  if (theme === 'white') {
    textColorClass = 'text-white';
  } else if (theme === 'black') {
    textColorClass = 'text-stone-900';
  } else if (theme === 'green') {
    textColorClass = 'text-[#16a34a]';
  } else if (theme === 'dark') {
    textColorClass = 'text-white';
  } else if (theme === 'light') {
    textColorClass = 'text-stone-900';
  }

  const isDarkCanvas = theme === 'white' || (theme === 'auto' && isDarkMode);

  const sizeConfigs = {
    sm: { iconWidth: 32, iconHeight: 18, textClass: 'text-xs tracking-[0.2em]', heightClass: 'h-6' },
    md: { iconWidth: 44, iconHeight: 24, textClass: 'text-sm sm:text-base tracking-[0.22em]', heightClass: 'h-8' },
    lg: { iconWidth: 56, iconHeight: 30, textClass: 'text-lg sm:text-xl tracking-[0.24em]', heightClass: 'h-10' },
    xl: { iconWidth: 72, iconHeight: 38, textClass: 'text-2xl sm:text-3xl tracking-[0.26em]', heightClass: 'h-12' },
  }[size];

  // Official GEARTRADE "GT" Aerodynamic Speed Emblem
  const GTEmblemSVG = (
    <svg
      viewBox="0 0 138 72"
      width={sizeConfigs.iconWidth}
      height={sizeConfigs.iconHeight}
      className={`shrink-0 transition-colors duration-200 ${textColorClass}`}
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GEARTRADE Official GT Emblem"
    >
      {/* The Iconic Stylized 'G' Loop */}
      <path
        d="M74 12 L38 12 C 18 12, 6 22, 6 36 C 6 50, 18 60, 38 60 L62 60 L62 50 L38 50 C 24 50, 16 44, 16 36 C 16 28, 24 22, 38 22 L67.5 22 L74 12 Z"
      />

      {/* Speed Stripe 1 (Top Bar of 'T') */}
      <path
        d="M58 24.5 L132 24.5 L127.5 30 L54 30 Z"
      />

      {/* Speed Stripe 2 (Middle Bar of 'T') */}
      <path
        d="M52.5 33 L126.5 33 L122 38.5 L48.5 38.5 Z"
      />

      {/* Speed Stripe 3 (Bottom Bar of 'T') */}
      <path
        d="M47 41.5 L121 41.5 L116.5 47 L43 47 Z"
      />

      {/* Vertical 'T' Stem with Bottom Chiseled Contour */}
      <path
        d="M73 47 L82.5 47 L82.5 68 L73 72 Z"
      />
      <path
        d="M82.5 58 L84 62 L84 66 L82.5 68 Z"
        opacity="0.6"
      />
    </svg>
  );

  if (variant === 'mark' || variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{GTEmblemSVG}</div>;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center p-2 transition-colors duration-200 ${
          isDarkCanvas ? 'bg-white/10 text-white' : 'bg-stone-900 text-white'
        } ${className}`}
      >
        {GTEmblemSVG}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {GTEmblemSVG}
      <div className="flex flex-col justify-center">
        <span
          className={`font-black uppercase font-sans leading-none ${sizeConfigs.textClass} ${textColorClass} transition-colors duration-200`}
        >
          GEARTRADE
        </span>
        {showTagline && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500 font-semibold mt-1">
            Nepal Mountain Gear
          </span>
        )}
      </div>
    </div>
  );
};

