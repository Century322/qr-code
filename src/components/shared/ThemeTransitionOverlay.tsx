import React from 'react';

interface ThemeTransitionOverlayProps {
  isDarkMode: boolean;
  prevTheme: boolean | null;
  onAnimationEnd: () => void;
}

export function ThemeTransitionOverlay({ isDarkMode, prevTheme, onAnimationEnd }: ThemeTransitionOverlayProps) {
  return (
    <div 
      key={`exit-${prevTheme ? 'dark' : 'light'}`}
      className={
        prevTheme 
          ? "fixed inset-0 font-sans bg-[#1c1c1e] text-white z-50" 
          : "fixed inset-0 font-sans bg-[#F2F2F7] text-[#1C1C1E] z-50"
      }
      style={{
        animation: 'themeSlideOut 0.4s ease-out forwards',
      }}
    >
      <div className="max-w-6xl mx-auto p-8 opacity-50">
        <div className="h-20" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={prevTheme ? "h-12 rounded-2xl bg-[#3a3a3c]" : "h-12 rounded-2xl bg-[#E5E5EA]"} />
          <div className={prevTheme ? "h-64 rounded-3xl bg-[#3a3a3c]" : "h-64 rounded-3xl bg-[#E5E5EA]"} />
        </div>
        <div className="lg:col-span-5">
          <div className={prevTheme ? "h-80 rounded-3xl bg-[#3a3a3c]" : "h-80 rounded-3xl bg-[#E5E5EA]"} />
        </div>
      </div>
    </div>
  );
}
