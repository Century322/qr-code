import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { cn } from '../../utils';
import { PRESET_COLORS } from '../../constants';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  isDarkMode: boolean;
}

export function ColorPicker({ color, onChange, label, isDarkMode }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [animationKey, setAnimationKey] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const dropdownWidth = Math.max(rect.width, 280);
      const dropdownHeight = 280;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      if (top + dropdownHeight > viewportHeight - 20) {
        top = rect.top - dropdownHeight - 8;
      }
      
      if (left + dropdownWidth > viewportWidth - 20) {
        left = viewportWidth - dropdownWidth - 20;
      }
      
      if (left < 20) {
        left = 20;
      }
      
      setPosition({
        top,
        left,
        width: dropdownWidth
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const dropdownWidth = Math.max(rect.width, 280);
        const dropdownHeight = 280;
        
        let top = rect.bottom + 8;
        let left = rect.left;
        
        if (top + dropdownHeight > viewportHeight - 20) {
          top = rect.top - dropdownHeight - 8;
        }
        
        if (left + dropdownWidth > viewportWidth - 20) {
          left = viewportWidth - dropdownWidth - 20;
        }
        
        if (left < 20) {
          left = 20;
        }
        
        setPosition({
          top,
          left,
          width: dropdownWidth
        });
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  const handleColorSelect = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor);
  };

  const dropdownContent = isOpen ? (
    <>
      <div 
        className="fixed inset-0 z-[9998] transition-opacity duration-300"
        style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }}
        onClick={() => setIsOpen(false)}
      />
      <div 
        key={animationKey}
        className="fixed z-[9999] overflow-hidden transition-all duration-300 origin-top"
        style={{ 
          top: position.top,
          left: position.left,
          width: position.width,
          animation: 'fadeInScale 0.2s ease-out'
        }}
      >
        <style>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-8px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
        <div className={cn(
          "backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 p-4 border",
          isDarkMode 
            ? "bg-[#2c2c2e]/95 border-[#3a3a3c]" 
            : "bg-white/95 border-[#E5E5EA]"
        )}>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => handleColorSelect(presetColor)}
                className={cn(
                  "w-full aspect-square rounded-xl transition-all duration-200 relative",
                  "hover:scale-110 active:scale-95",
                  presetColor === '#ffffff' && "ring-1 ring-inset ring-gray-300"
                )}
                style={{ backgroundColor: presetColor }}
              >
                {localColor.toLowerCase() === presetColor && (
                  <Check 
                    className={cn(
                      "absolute inset-0 m-auto w-5 h-5",
                      presetColor === '#ffffff' || presetColor === '#f97316' || presetColor === '#eab308' || presetColor === '#22c55e' || presetColor === '#14b8a6' || presetColor === '#06b6d4'
                        ? "text-gray-800"
                        : "text-white"
                    )} 
                  />
                )}
              </button>
            ))}
          </div>
          
          <div className={cn(
            "rounded-xl p-3 transition-all duration-200",
            isDarkMode ? "bg-[#3a3a3c]" : "bg-[#F2F2F7]"
          )}>
            <label className={cn("block text-xs font-medium mb-2", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>
              自定义颜色
            </label>
            <div className="flex items-center gap-3">
              <div className={cn(
                "relative w-12 h-12 rounded-xl overflow-hidden ring-2 transition-all duration-200",
                isDarkMode ? "ring-[#48484a] hover:ring-indigo-500/50" : "ring-[#C7C7CC] hover:ring-indigo-500/50"
              )}>
                <input
                  type="color"
                  value={localColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer border-0 p-0"
                  style={{ backgroundColor: 'transparent' }}
                />
              </div>
              <input
                type="text"
                value={localColor.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    setLocalColor(val);
                    if (val.length === 7) {
                      onChange(val);
                    }
                  }
                }}
                className={cn(
                  "flex-1 px-3 py-2.5 rounded-xl text-sm font-mono uppercase outline-none transition-all duration-200",
                  isDarkMode 
                    ? "bg-[#48484a] text-white focus:ring-2 focus:ring-indigo-500/50" 
                    : "bg-white text-[#1C1C1E] focus:ring-2 focus:ring-indigo-500/50 border border-[#E5E5EA]"
                )}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen) {
            setAnimationKey(prev => prev + 1);
          }
          setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full flex items-center gap-3 transition-all duration-200 active:scale-[0.98]",
          "rounded-2xl p-5",
          isDarkMode ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]"
        )}
      >
        <div 
          className="w-14 h-14 rounded-xl shadow-sm border-2 transition-transform duration-200"
          style={{ 
            backgroundColor: localColor,
            borderColor: isDarkMode ? '#48484a' : '#ffffff'
          }}
        />
        <div className="flex-1 text-left">
          <label className={cn("block text-xs font-medium mb-1", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>
            {label}
          </label>
          <span className={cn("text-sm font-mono uppercase font-medium", isDarkMode ? "text-slate-300" : "text-[#3C3C43]")}>
            {localColor.toUpperCase()}
          </span>
        </div>
        <svg 
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            isDarkMode ? "text-slate-400" : "text-[#8E8E93]",
            isOpen && "rotate-180"
          )} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  );
}
