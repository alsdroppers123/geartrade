import React from 'react';

interface GeartradeLogoProps {
  variant?: 'full' | 'mark' | 'badge' | 'horizontal';
  theme?: 'dark' | 'light' | 'mono' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const GeartradeLogo: React.FC<GeartradeLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  // Color palette matching Image 1
  const isWhite = theme === 'white';
  const isMono = theme === 'mono';

  const navyColor = isWhite ? '#FFFFFF' : isMono ? '#111827' : '#102A45';
  const redColor = isWhite ? '#FFFFFF' : isMono ? '#4B5563' : '#DE4B56';
  const goldColor = isWhite ? '#FFFFFF' : isMono ? '#9CA3AF' : '#F5A623';
  const textColor = isWhite ? '#FFFFFF' : '#102A45';

  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-xs', height: 28 },
    md: { icon: 'w-8 h-8', text: 'text-sm', height: 38 },
    lg: { icon: 'w-11 h-11', text: 'text-lg', height: 50 },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', height: 72 },
  }[size];

  // SVG representation of the exact GT Monogram from Image 1
  const GTMarkSVG = (
    <svg
      viewBox="0 0 160 120"
      className={`${sizeClasses.icon} shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GEARTRADE Logo Mark"
    >
      {/* Outer Curved 'G' body in Navy Blue */}
      <path
        d="M80 16C50 16 26 36 26 64C26 92 50 112 80 112H90V88H76C60 88 48 76 48 64C48 52 60 40 76 40H88L96 16H80Z"
        fill={navyColor}
      />

      {/* Top Stripe (Navy Blue) */}
      <polygon
        points="70,24 148,24 148,38 64,38"
        fill={navyColor}
      />

      {/* Middle Stripe (Coral / Crimson Red) */}
      <polygon
        points="60,44 144,44 144,58 54,58"
        fill={redColor}
      />

      {/* Bottom Stripe (Warm Gold / Amber) */}
      <polygon
        points="50,64 140,64 140,78 44,78"
        fill={goldColor}
      />

      {/* Vertical 'T' stem with angled cut at bottom */}
      <polygon
        points="96,44 116,44 116,112 96,112 96,44"
        fill={navyColor}
      />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{GTMarkSVG}</div>;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center p-2.5 rounded-2xl bg-[#102A45] shadow-lg border border-slate-700/50 ${className}`}
      >
        <svg
          viewBox="0 0 160 120"
          className={sizeClasses.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M80 16C50 16 26 36 26 64C26 92 50 112 80 112H90V88H76C60 88 48 76 48 64C48 52 60 40 76 40H88L96 16H80Z"
            fill="#FFFFFF"
          />
          <polygon points="70,24 148,24 148,38 64,38" fill="#FFFFFF" />
          <polygon points="60,44 144,44 144,58 54,58" fill="#DE4B56" />
          <polygon points="50,64 140,64 140,78 44,78" fill="#F5A623" />
          <polygon points="96,44 116,44 116,112 96,112 96,44" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
      {GTMarkSVG}
      <div className="flex flex-col">
        <span
          className={`font-black uppercase tracking-[0.22em] font-sans leading-none ${sizeClasses.text}`}
          style={{ color: textColor }}
        >
          GEARTRADE
        </span>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold mt-0.5">
            Outdoor Performance Nepal
          </span>
        )}
      </div>
    </div>
  );
};
