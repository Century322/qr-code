import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils';

interface GradientTypeSelectorProps {
  value: 'linear' | 'radial';
  onChange: (value: 'linear' | 'radial') => void;
  isDarkMode: boolean;
}

export function GradientTypeSelector({ value, onChange, isDarkMode }: GradientTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  const options = [
    { value: 'linear', label: '线性渐变' },
    { value: 'radial', label: '径向渐变' }
  ];

  const selectedOption = options.find(o => o.value === value);

  const dropdownContent = isOpen ? (
    <>
      <div 
        className="fixed inset-0 z-[9998] transition-opacity duration-300"
        style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }}
        onClick={() => setIsOpen(false)}
      />
      <div 
        className="fixed z-[9999] overflow-hidden transition-all duration-300 origin-top animate-in fade-in zoom-in-95"
        style={{ 
          top: position.top,
          left: position.left,
          width: position.width
        }}
      >
        <div className={cn(
          "backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 p-3 border",
          isDarkMode 
            ? "bg-[#2c2c2e] border-[#3a3a3c]" 
            : "bg-white border-[#E5E5EA]"
        )}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value as 'linear' | 'radial');
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all duration-200",
                value === option.value
                  ? isDarkMode 
                    ? "bg-indigo-500/20 text-indigo-400" 
                    : "bg-indigo-50 text-indigo-600"
                  : isDarkMode
                    ? "text-slate-300 hover:bg-[#3a3a3c]"
                    : "text-[#3C3C43] hover:bg-[#F2F2F7]"
              )}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 transition-all duration-200 active:scale-[0.98]",
          "rounded-2xl p-4",
          isDarkMode ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]"
        )}
      >
        <div>
          <label className={cn("block text-xs font-medium mb-1", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>
            渐变类型
          </label>
          <span className={cn("text-sm font-medium", isDarkMode ? "text-slate-300" : "text-[#3C3C43]")}>
            {selectedOption?.label}
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
