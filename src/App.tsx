/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { Image as ImageIcon, FileCode2, Settings, Link as LinkIcon, Palette, LayoutGrid, Shapes, Sparkles, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UpdateModal } from './components/UpdateModal';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QRMatrix {
  size: number;
  data: number[];
}

const DOT_STYLES = [
  { id: 'square', label: '方形' },
  { id: 'circle', label: '圆形' },
  { id: 'rounded', label: '圆角' },
  { id: 'diamond', label: '菱形' },
  { id: 'star', label: '星星' },
  { id: 'heart', label: '爱心' },
  { id: 'leaf', label: '叶子' }
];

const EYE_OUTER_STYLES = [
  { id: 'square', label: '方形' },
  { id: 'circle', label: '圆形' },
  { id: 'rounded', label: '圆角' },
  { id: 'diamond', label: '菱形' },
  { id: 'leaf', label: '叶子' }
];

const EYE_INNER_STYLES = [
  { id: 'square', label: '方形' },
  { id: 'circle', label: '圆形' },
  { id: 'rounded', label: '圆角' },
  { id: 'diamond', label: '菱形' },
  { id: 'star', label: '星星' },
  { id: 'leaf', label: '叶子' }
];

const PRESET_COLORS = [
  '#4f46e5', '#7c3aed', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#1f2937',
  '#000000', '#ffffff'
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  isDarkMode: boolean;
}

function ColorPicker({ color, onChange, label, isDarkMode }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [animationKey, setAnimationKey] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getViewportDimensions = () => {
    if (window.visualViewport) {
      return {
        width: window.visualViewport.width,
        height: window.visualViewport.height
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewport = getViewportDimensions();
      
      const dropdownWidth = Math.max(rect.width, 280);
      const dropdownHeight = 280;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      if (top + dropdownHeight > viewport.height - 20) {
        top = rect.top - dropdownHeight - 8;
      }
      
      if (left + dropdownWidth > viewport.width - 20) {
        left = viewport.width - dropdownWidth - 20;
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
  }, []);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleScroll = () => {
      updatePosition();
    };
    
    const handleResize = () => {
      updatePosition();
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isOpen, updatePosition]);

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

interface GradientTypeSelectorProps {
  value: 'linear' | 'radial';
  onChange: (value: 'linear' | 'radial') => void;
  isDarkMode: boolean;
}

function GradientTypeSelector({ value, onChange, isDarkMode }: GradientTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getViewportDimensions = () => {
    if (window.visualViewport) {
      return {
        width: window.visualViewport.width,
        height: window.visualViewport.height
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewport = getViewportDimensions();
      const dropdownHeight = 120;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      const width = rect.width;
      
      if (top + dropdownHeight > viewport.height - 20) {
        top = rect.top - dropdownHeight - 8;
      }
      
      if (left + width > viewport.width - 20) {
        left = viewport.width - width - 20;
      }
      
      if (left < 20) {
        left = 20;
      }
      
      setPosition({
        top,
        left,
        width
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleScroll = () => {
      updatePosition();
    };
    
    const handleResize = () => {
      updatePosition();
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isOpen, updatePosition]);

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

const STORAGE_KEY = 'qr-generator-settings';

interface AppSettings {
  text: string;
  colorMode: 'solid' | 'gradient';
  gradientType: 'linear' | 'radial';
  fgColor: string;
  fgColor2: string;
  bgColor: string;
  selectedDots: string[];
  eyeOuterStyle: string;
  eyeInnerStyle: string;
  enableCamo: boolean;
  camoSeed: number;
  qrScale: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  isDarkMode: boolean;
}

function loadSettings(): AppSettings | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return null;
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export default function App() {
  const savedSettings = loadSettings();
  
  const [text, setText] = useState(savedSettings?.text ?? '');
  
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>(savedSettings?.colorMode ?? 'gradient');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>(savedSettings?.gradientType ?? 'linear');
  const [fgColor, setFgColor] = useState(savedSettings?.fgColor ?? '#4f46e5');
  const [fgColor2, setFgColor2] = useState(savedSettings?.fgColor2 ?? '#ec4899');
  const [bgColor, setBgColor] = useState(savedSettings?.bgColor ?? '#ffffff');
  
  const [selectedDots, setSelectedDots] = useState<string[]>(savedSettings?.selectedDots ?? ['rounded', 'star']);
  const [eyeOuterStyle, setEyeOuterStyle] = useState<string>(savedSettings?.eyeOuterStyle ?? 'rounded');
  const [eyeInnerStyle, setEyeInnerStyle] = useState<string>(savedSettings?.eyeInnerStyle ?? 'star');
  
  const [enableCamo, setEnableCamo] = useState(savedSettings?.enableCamo ?? false);
  const camoWidth = 50;
  const camoHeight = 50;
  const camoMargin = 0;
  const [camoSeed, setCamoSeed] = useState(savedSettings?.camoSeed ?? 1);
  const [qrScale, setQrScale] = useState(Math.max(0.4, savedSettings?.qrScale ?? 1));
  
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>(savedSettings?.errorCorrection ?? 'H');
  
  const [matrix, setMatrix] = useState<QRMatrix | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isDarkMode, setIsDarkMode] = useState(savedSettings?.isDarkMode ?? false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [themeTransition, setThemeTransition] = useState<'none' | 'exit'>('none');
  const [prevTheme, setPrevTheme] = useState<boolean | null>(null);
  
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isNative, setIsNative] = useState(false);

  const qrDensity = matrix ? matrix.data.filter(d => d === 1).length / matrix.data.length : 0.5;
  
  const floatBtnRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const isSwiping = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveSettings({
      text,
      colorMode,
      gradientType,
      fgColor,
      fgColor2,
      bgColor,
      selectedDots,
      eyeOuterStyle,
      eyeInnerStyle,
      enableCamo,
      camoSeed,
      qrScale,
      errorCorrection,
      isDarkMode,
    });
  }, [text, colorMode, gradientType, fgColor, fgColor2, bgColor, selectedDots, eyeOuterStyle, eyeInnerStyle, enableCamo, camoSeed, qrScale, errorCorrection, isDarkMode]);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    
    if (native) {
      const updateSafeArea = () => {
        const computedStyle = getComputedStyle(document.documentElement);
        const top = parseInt(computedStyle.getPropertyValue('--safe-area-top') || '0', 10);
        const bottom = parseInt(computedStyle.getPropertyValue('--safe-area-bottom') || '0', 10);
        const left = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10);
        const right = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10);
        
        const cssTop = parseInt(getComputedStyle(document.body).paddingTop || '0', 10);
        const cssBottom = parseInt(getComputedStyle(document.body).paddingBottom || '0', 10);
        
        setSafeAreaInsets({
          top: top || cssTop || 24,
          bottom: bottom || cssBottom || 24,
          left: left || 0,
          right: right || 0
        });
      };
      
      updateSafeArea();
      window.addEventListener('resize', updateSafeArea);
      
      return () => {
        window.removeEventListener('resize', updateSafeArea);
      };
    }
  }, []);

  useEffect(() => {
    if (!isNative) return;
    
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardH = Math.max(0, windowHeight - viewportHeight);
        setKeyboardHeight(keyboardH);
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isNative]);

  const updateStatusBar = useCallback(async (dark: boolean) => {
    if (!isNative) return;
    
    try {
      await StatusBar.setStyle({
        style: dark ? Style.Dark : Style.Light
      });
      
      const bgColor = dark ? '#1c1c1e' : '#F2F2F7';
      await StatusBar.setBackgroundColor({
        color: bgColor
      });
    } catch (e) {
      console.log('StatusBar not available:', e);
    }
  }, [isNative]);

  useEffect(() => {
    updateStatusBar(isDarkMode);
  }, [isDarkMode, updateStatusBar]);

  const random = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const handleThemeChange = (newTheme: boolean) => {
    if (newTheme === isDarkMode || themeTransition !== 'none') return;
    
    setPrevTheme(isDarkMode);
    setIsDarkMode(newTheme);
    setThemeTransition('exit');
    
    setTimeout(() => {
      setThemeTransition('none');
      setPrevTheme(null);
    }, 400);
  };

  useEffect(() => {
    try {
      if (!text) {
        setMatrix(null);
        return;
      }
      const qr = QRCode.create(text, { errorCorrectionLevel: errorCorrection });
      setMatrix({
        size: qr.modules.size,
        data: Array.from(qr.modules.data),
      });
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  }, [text, errorCorrection]);

  const getDotStyleForPosition = (x: number, y: number) => {
    if (selectedDots.length === 0) return 'square';
    const index = Math.abs(x * 13 + y * 31) % selectedDots.length;
    return selectedDots[index];
  };

  useEffect(() => {
    if (!matrix || !canvasRef.current) {
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const scale = 10;
    const padding = enableCamo ? 0 : 4;
    const width = enableCamo ? camoWidth : matrix.size + padding * 2;
    const height = enableCamo ? camoHeight : matrix.size + padding * 2;
    
    canvas.width = width * scale;
    canvas.height = height * scale;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = matrix.size;
    
    // 与 SVG 完全一致的偏移计算
    const offsetX = enableCamo ? Math.floor((camoWidth - size) / 2) * scale : padding * scale;
    const offsetY = enableCamo ? Math.floor((camoHeight - size) / 2) * scale : padding * scale;

    // 在变换之前创建渐变，与 SVG 渐变一致
    let gradient: CanvasGradient | null = null;
    if (colorMode === 'gradient') {
      if (gradientType === 'linear') {
        // 线性渐变：与 SVG 一致
        gradient = ctx.createLinearGradient(-offsetX, -offsetY, canvas.width - offsetX, canvas.height - offsetY);
      } else {
        // 径向渐变：从中心向外
        gradient = ctx.createRadialGradient(
          canvas.width / 2 - offsetX,
          canvas.height / 2 - offsetY,
          0,
          canvas.width / 2 - offsetX,
          canvas.height / 2 - offsetY,
          Math.max(canvas.width, canvas.height) / 2
        );
      }
      gradient.addColorStop(0, fgColor);
      gradient.addColorStop(1, fgColor2);
    }

    const getFill = () => {
      if (colorMode === 'solid') return fgColor;
      return gradient;
    };

    const getCamoFill = () => {
      if (colorMode === 'solid') return fgColor;
      return gradient;
    };

    const drawDot = (x: number, y: number, fill: string | CanvasGradient | null) => {
      const style = getDotStyleForPosition(x, y);
      const dx = x * scale;
      const dy = y * scale;
      const s = scale;
      const gap = 0.5; // 与 SVG 一致的间距

      ctx.fillStyle = fill;
      
      switch (style) {
        case 'square':
          ctx.fillRect(dx + gap, dy + gap, s - gap * 2, s - gap * 2);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(dx + s/2, dy + s/2, s/2 - gap, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rounded':
          ctx.beginPath();
          ctx.roundRect(dx + gap, dy + gap, s - gap * 2, s - gap * 2, s * 0.25);
          ctx.fill();
          break;
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(dx + s/2, dy + gap);
          ctx.lineTo(dx + s - gap, dy + s/2);
          ctx.lineTo(dx + s/2, dy + s - gap);
          ctx.lineTo(dx + gap, dy + s/2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'star': {
          ctx.beginPath();
          const cx = dx + s/2;
          const cy = dy + s/2;
          const outerR = s/2 - gap;
          const innerR = s/5;
          for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
            if (i === 0) {
              ctx.moveTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
            } else {
              ctx.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
            }
            ctx.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle));
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'heart': {
          ctx.beginPath();
          const hx = dx + s/2;
          const hy = dy + s * 0.3;
          ctx.moveTo(hx, hy + s * 0.1);
          ctx.bezierCurveTo(hx, hy, hx - s/2 + gap, hy, hx - s/2 + gap, hy + s * 0.25);
          ctx.bezierCurveTo(hx - s/2 + gap, hy + s * 0.5, hx, hy + s * 0.65, hx, hy + s * 0.7);
          ctx.bezierCurveTo(hx, hy + s * 0.65, hx + s/2 - gap, hy + s * 0.5, hx + s/2 - gap, hy + s * 0.25);
          ctx.bezierCurveTo(hx + s/2 - gap, hy, hx, hy, hx, hy + s * 0.1);
          ctx.fill();
          break;
        }
        case 'leaf': {
          ctx.beginPath();
          ctx.moveTo(dx + gap, dy + gap);
          ctx.bezierCurveTo(dx + s/2, dy + gap, dx + s - gap, dy + s/2, dx + s - gap, dy + s - gap);
          ctx.bezierCurveTo(dx + s/2, dy + s - gap, dx + gap, dy + s/2, dx + gap, dy + gap);
          ctx.fill();
          break;
        }
        default:
          ctx.fillRect(dx + gap, dy + gap, s - gap * 2, s - gap * 2);
      }
    };

    const drawEyeOuter = (ex: number, ey: number, fill: string | CanvasGradient | null) => {
      const s = 7 * scale;
      const baseX = ex * scale;
      const baseY = ey * scale;
      ctx.fillStyle = fill;
      
      switch (eyeOuterStyle) {
        case 'square':
          ctx.fillRect(baseX, baseY, s, s);
          ctx.fillStyle = bgColor;
          ctx.fillRect(baseX + scale, baseY + scale, s - 2 * scale, s - 2 * scale);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(baseX + s/2, baseY + s/2, s/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.arc(baseX + s/2, baseY + s/2, s/2 - scale, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rounded':
          ctx.beginPath();
          ctx.roundRect(baseX, baseY, s, s, s * 0.3);
          ctx.fill();
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.roundRect(baseX + scale, baseY + scale, s - 2 * scale, s - 2 * scale, s * 0.2);
          ctx.fill();
          break;
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(baseX + s/2, baseY);
          ctx.lineTo(baseX + s, baseY + s/2);
          ctx.lineTo(baseX + s/2, baseY + s);
          ctx.lineTo(baseX, baseY + s/2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.moveTo(baseX + s/2, baseY + scale);
          ctx.lineTo(baseX + s - scale, baseY + s/2);
          ctx.lineTo(baseX + s/2, baseY + s - scale);
          ctx.lineTo(baseX + scale, baseY + s/2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'star': {
          ctx.beginPath();
          const cx = baseX + s/2;
          const cy = baseY + s/2;
          const outerR = s/2;
          const innerR = s/4;
          for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
            if (i === 0) {
              ctx.moveTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
            } else {
              ctx.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
            }
            ctx.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle));
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          const innerOuterR = s/2 - scale;
          const innerInnerR = s/4 - scale/2;
          for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
            if (i === 0) {
              ctx.moveTo(cx + innerOuterR * Math.cos(outerAngle), cy + innerOuterR * Math.sin(outerAngle));
            } else {
              ctx.lineTo(cx + innerOuterR * Math.cos(outerAngle), cy + innerOuterR * Math.sin(outerAngle));
            }
            ctx.lineTo(cx + innerInnerR * Math.cos(innerAngle), cy + innerInnerR * Math.sin(innerAngle));
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'heart': {
          ctx.beginPath();
          const hx = baseX + s/2;
          const hy = baseY + s * 0.3;
          ctx.moveTo(hx, hy + s * 0.1);
          ctx.bezierCurveTo(hx, hy, hx - s/2, hy, hx - s/2, hy + s * 0.25);
          ctx.bezierCurveTo(hx - s/2, hy + s * 0.5, hx, hy + s * 0.65, hx, hy + s * 0.7);
          ctx.bezierCurveTo(hx, hy + s * 0.65, hx + s/2, hy + s * 0.5, hx + s/2, hy + s * 0.25);
          ctx.bezierCurveTo(hx + s/2, hy, hx, hy, hx, hy + s * 0.1);
          ctx.fill();
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          const innerHx = baseX + s/2;
          const innerHy = baseY + s * 0.35;
          const innerS = s - 2 * scale;
          ctx.moveTo(innerHx, innerHy + innerS * 0.1);
          ctx.bezierCurveTo(innerHx, innerHy, innerHx - innerS/2, innerHy, innerHx - innerS/2, innerHy + innerS * 0.25);
          ctx.bezierCurveTo(innerHx - innerS/2, innerHy + innerS * 0.5, innerHx, innerHy + innerS * 0.65, innerHx, innerHy + innerS * 0.7);
          ctx.bezierCurveTo(innerHx, innerHy + innerS * 0.65, innerHx + innerS/2, innerHy + innerS * 0.5, innerHx + innerS/2, innerHy + innerS * 0.25);
          ctx.bezierCurveTo(innerHx + innerS/2, innerHy, innerHx, innerHy, innerHx, innerHy + innerS * 0.1);
          ctx.fill();
          break;
        }
        case 'leaf':
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.bezierCurveTo(baseX + s/2, baseY, baseX + s, baseY + s/2, baseX + s, baseY + s);
          ctx.bezierCurveTo(baseX + s/2, baseY + s, baseX, baseY + s/2, baseX, baseY);
          ctx.fill();
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.moveTo(baseX + scale, baseY + scale);
          ctx.bezierCurveTo(baseX + s/2, baseY + scale, baseX + s - scale, baseY + s/2, baseX + s - scale, baseY + s - scale);
          ctx.bezierCurveTo(baseX + s/2, baseY + s - scale, baseX + scale, baseY + s/2, baseX + scale, baseY + scale);
          ctx.fill();
          break;
        default:
          ctx.fillRect(baseX, baseY, s, s);
          ctx.fillStyle = bgColor;
          ctx.fillRect(baseX + scale, baseY + scale, s - 2 * scale, s - 2 * scale);
      }
    };

    const drawEyeInner = (ex: number, ey: number, fill: string | CanvasGradient | null) => {
      const s = 3 * scale;
      const baseX = ex * scale;
      const baseY = ey * scale;
      ctx.fillStyle = fill;
      
      switch (eyeInnerStyle) {
        case 'square':
          ctx.fillRect(baseX + 2 * scale, baseY + 2 * scale, s, s);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(baseX + 3.5 * scale, baseY + 3.5 * scale, s/2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rounded':
          ctx.beginPath();
          ctx.roundRect(baseX + 2 * scale, baseY + 2 * scale, s, s, s * 0.3);
          ctx.fill();
          break;
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(baseX + 3.5 * scale, baseY + 2 * scale);
          ctx.lineTo(baseX + 5 * scale, baseY + 3.5 * scale);
          ctx.lineTo(baseX + 3.5 * scale, baseY + 5 * scale);
          ctx.lineTo(baseX + 2 * scale, baseY + 3.5 * scale);
          ctx.closePath();
          ctx.fill();
          break;
        case 'star': {
          ctx.beginPath();
          const cx = baseX + 3.5 * scale;
          const cy = baseY + 3.5 * scale;
          const outerR = 1.5 * scale;
          const innerR = 0.6 * scale;
          for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
            if (i === 0) {
              ctx.moveTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
            } else {
              ctx.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
            }
            ctx.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle));
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'leaf':
          ctx.beginPath();
          ctx.moveTo(baseX + 2 * scale, baseY + 2 * scale);
          ctx.bezierCurveTo(baseX + 3.5 * scale, baseY + 2 * scale, baseX + 5 * scale, baseY + 3.5 * scale, baseX + 5 * scale, baseY + 5 * scale);
          ctx.bezierCurveTo(baseX + 3.5 * scale, baseY + 5 * scale, baseX + 2 * scale, baseY + 3.5 * scale, baseX + 2 * scale, baseY + 2 * scale);
          ctx.fill();
          break;
        default:
          ctx.fillRect(baseX + 2 * scale, baseY + 2 * scale, s, s);
      }
    };

    // 与 SVG 完全一致的变换：先 translate(offsetX, offsetY)，然后 scale(qrScale)
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // 计算缩放中心（二维码中心）
    const qrCenterX = (size * scale) / 2;
    const qrCenterY = (size * scale) / 2;
    
    // 从二维码中心进行缩放
    ctx.translate(qrCenterX, qrCenterY);
    ctx.scale(qrScale, qrScale);
    ctx.translate(-qrCenterX, -qrCenterY);

    let eyeDrawn = { topLeft: false, topRight: false, bottomLeft: false };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (matrix.data[y * size + x] === 1) {
          const fill = getFill();
          
          const isTopLeft = x < 7 && y < 7;
          const isTopRight = x >= size - 7 && y < 7;
          const isBottomLeft = x < 7 && y >= size - 7;
          
          if (isTopLeft) {
            if (!eyeDrawn.topLeft) {
              drawEyeOuter(0, 0, fill);
              drawEyeInner(0, 0, fill);
              eyeDrawn.topLeft = true;
            }
            // 跳过码眼区域内的其他点
          } else if (isTopRight) {
            if (!eyeDrawn.topRight) {
              drawEyeOuter(size - 7, 0, fill);
              drawEyeInner(size - 7, 0, fill);
              eyeDrawn.topRight = true;
            }
            // 跳过码眼区域内的其他点
          } else if (isBottomLeft) {
            if (!eyeDrawn.bottomLeft) {
              drawEyeOuter(0, size - 7, fill);
              drawEyeInner(0, size - 7, fill);
              eyeDrawn.bottomLeft = true;
            }
            // 跳过码眼区域内的其他点
          } else {
            drawDot(x, y, fill);
          }
        }
      }
    }

    // 迷彩背景 - 在同一个缩放上下文中渲染
    if (enableCamo) {
      const qrDensity = matrix.data.filter(d => d === 1).length / matrix.data.length;
      
      const camoOffsetX = Math.floor((camoWidth - size) / 2);
      const camoOffsetY = Math.floor((camoHeight - size) / 2);

      const canvasLeft = -camoOffsetX;
      const canvasRight = -camoOffsetX + camoWidth;
      const canvasTop = -camoOffsetY;
      const canvasBottom = -camoOffsetY + camoHeight;

      const qrCenterXCamo = size / 2;
      const qrCenterYCamo = size / 2;

      const minUnscaledX = qrCenterXCamo + (canvasLeft - qrCenterXCamo) / qrScale;
      const maxUnscaledX = qrCenterXCamo + (canvasRight - qrCenterXCamo) / qrScale;
      const minUnscaledY = qrCenterYCamo + (canvasTop - qrCenterYCamo) / qrScale;
      const maxUnscaledY = qrCenterYCamo + (canvasBottom - qrCenterYCamo) / qrScale;

      const startX = Math.floor(minUnscaledX);
      const endX = Math.ceil(maxUnscaledX);
      const startY = Math.floor(minUnscaledY);
      const endY = Math.ceil(maxUnscaledY);

      const margin = camoMargin;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          if (x >= -margin && x < size + margin && y >= -margin && y < size + margin) {
            continue;
          }

          const r = random(camoSeed + x * 1000 + y);
          if (r < qrDensity) {
            const style = getDotStyleForPosition(x, y);
            const dx = x * scale;
            const dy = y * scale;
            const s = scale;
            const gap = 0.5; // 与主二维码一致的间距

            ctx.fillStyle = getCamoFill();
            
            switch (style) {
              case 'square':
                ctx.fillRect(dx + gap, dy + gap, s - gap * 2, s - gap * 2);
                break;
              case 'circle':
                ctx.beginPath();
                ctx.arc(dx + s/2, dy + s/2, s/2 - gap, 0, Math.PI * 2);
                ctx.fill();
                break;
              case 'rounded':
                ctx.beginPath();
                ctx.roundRect(dx + gap, dy + gap, s - gap * 2, s - gap * 2, s * 0.25);
                ctx.fill();
                break;
              case 'diamond':
                ctx.beginPath();
                ctx.moveTo(dx + s/2, dy + gap);
                ctx.lineTo(dx + s - gap, dy + s/2);
                ctx.lineTo(dx + s/2, dy + s - gap);
                ctx.lineTo(dx + gap, dy + s/2);
                ctx.closePath();
                ctx.fill();
                break;
              case 'star': {
                ctx.beginPath();
                const cx = dx + s/2;
                const cy = dy + s/2;
                const outerR = s/2 - gap;
                const innerR = s/5;
                for (let i = 0; i < 5; i++) {
                  const outerAngle = (i * 72 - 90) * Math.PI / 180;
                  const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
                  if (i === 0) {
                    ctx.moveTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
                  } else {
                    ctx.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
                  }
                  ctx.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle));
                }
                ctx.closePath();
                ctx.fill();
                break;
              }
              case 'heart': {
                ctx.beginPath();
                const hx = dx + s/2;
                const hy = dy + s * 0.3;
                ctx.moveTo(hx, hy + s * 0.1);
                ctx.bezierCurveTo(hx, hy, hx - s/2 + gap, hy, hx - s/2 + gap, hy + s * 0.25);
                ctx.bezierCurveTo(hx - s/2 + gap, hy + s * 0.5, hx, hy + s * 0.65, hx, hy + s * 0.7);
                ctx.bezierCurveTo(hx, hy + s * 0.65, hx + s/2 - gap, hy + s * 0.5, hx + s/2 - gap, hy + s * 0.25);
                ctx.bezierCurveTo(hx + s/2 - gap, hy, hx, hy, hx, hy + s * 0.1);
                ctx.fill();
                break;
              }
              case 'leaf': {
                ctx.beginPath();
                ctx.moveTo(dx + gap, dy + gap);
                ctx.bezierCurveTo(dx + s/2, dy + gap, dx + s - gap, dy + s/2, dx + s - gap, dy + s - gap);
                ctx.bezierCurveTo(dx + s/2, dy + s - gap, dx + gap, dy + s/2, dx + gap, dy + gap);
                ctx.fill();
                break;
              }
              default:
                ctx.fillRect(dx + gap, dy + gap, s - gap * 2, s - gap * 2);
            }
          }
        }
      }
    }
    
    ctx.restore();
  }, [matrix, colorMode, fgColor, fgColor2, bgColor, selectedDots, eyeOuterStyle, eyeInnerStyle, enableCamo, camoWidth, camoHeight, camoMargin, camoSeed, qrScale, gradientType, currentStep, isDarkMode]);

  const isEye = (x: number, y: number, size: number) => {
    return (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  };

  const toggleDotStyle = (id: string) => {
    setSelectedDots(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(s => s !== id);
        return next.length > 0 ? next : ['square'];
      }
      return [...prev, id];
    });
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const pngFile = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngFile;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDot = (x: number, y: number, fill: string) => {
    const style = getDotStyleForPosition(x, y);
    const cx = x * 10 + 5;
    const cy = y * 10 + 5;
    const dx = x * 10;
    const dy = y * 10;

    switch (style) {
      case 'square': return <rect key={`${x}-${y}`} x={dx} y={dy} width="10" height="10" fill={fill} />;
      case 'circle': return <circle key={`${x}-${y}`} cx={cx} cy={cy} r="4.5" fill={fill} />;
      case 'rounded': return <rect key={`${x}-${y}`} x={dx+0.5} y={dy+0.5} width="9" height="9" rx="3" fill={fill} />;
      case 'diamond': return <polygon key={`${x}-${y}`} points={`${cx},${dy} ${dx+10},${cy} ${cx},${dy+10} ${dx},${cy}`} fill={fill} />;
      case 'star': return <path key={`${x}-${y}`} d={`M${dx+5},${dy} L${dx+6.1},${dy+3.5} L${dx+9.8},${dy+3.5} L${dx+6.8},${dy+5.7} L${dx+7.9},${dy+9.1} L${dx+5},${dy+7} L${dx+2.1},${dy+9.1} L${dx+3.2},${dy+5.7} L${dx+0.2},${dy+3.5} L${dx+3.9},${dy+3.5} Z`} fill={fill} />;
      case 'heart': return <path key={`${x}-${y}`} d={`M${dx+5},${dy+9.5} C${dx+5},${dy+9.5} ${dx+0.5},${dy+6} ${dx+0.5},${dy+3} C${dx+0.5},${dy+1.5} ${dx+1.5},${dy+0.5} ${dx+3},${dy+0.5} C${dx+4},${dy+0.5} ${dx+4.5},${dy+1} ${dx+5},${dy+2} C${dx+5.5},${dy+1} ${dx+6},${dy+0.5} ${dx+7},${dy+0.5} C${dx+8.5},${dy+0.5} ${dx+9.5},${dy+1.5} ${dx+9.5},${dy+3} C${dx+9.5},${dy+6} ${dx+5},${dy+9.5} ${dx+5},${dy+9.5} Z`} fill={fill} />;
      case 'leaf': return <path key={`${x}-${y}`} d={`M${dx},${dy} C${dx+5},${dy} ${dx+10},${dy+5} ${dx+10},${dy+10} C${dx+5},${dy+10} ${dx},${dy+5} ${dx},${dy} Z`} fill={fill} />;
      default:
        return null;
    }
  };

  const renderEyeOuter = (ex: number, ey: number, fill: string, key: string) => {
    const s = 70;
    switch (eyeOuterStyle) {
      case 'square': 
        return <path key={key} d={`M${ex},${ey} h${s} v${s} h-${s} Z M${ex+10},${ey+10} v50 h50 v-50 Z`} fill={fill} fillRule="evenodd" />;
      case 'circle': 
        return <path key={key} d={`M${ex+35},${ey} a35,35 0 1,0 0,70 a35,35 0 1,0 0,-70 M${ex+35},${ey+10} a25,25 0 1,1 0,50 a25,25 0 1,1 0,-50`} fill={fill} fillRule="evenodd" />;
      case 'rounded': 
        return <path key={key} d={`M${ex+20},${ey} h30 a20,20 0 0 1 20,20 v30 a20,20 0 0 1 -20,20 h-30 a20,20 0 0 1 -20,-20 v-30 a20,20 0 0 1 20,-20 Z M${ex+20},${ey+10} a10,10 0 0 0 -10,10 v30 a10,10 0 0 0 10,10 h30 a10,10 0 0 0 10,-10 v-30 a10,10 0 0 0 -10,-10 Z`} fill={fill} fillRule="evenodd" />;
      case 'diamond':
        return <path key={key} d={`M${ex+35},${ey} L${ex+70},${ey+35} L${ex+35},${ey+70} L${ex},${ey+35} Z M${ex+35},${ey+10} L${ex+60},${ey+35} L${ex+35},${ey+60} L${ex+10},${ey+35} Z`} fill={fill} fillRule="evenodd" />;
      case 'star': {
        const cx = ex + 35;
        const cy = ey + 35;
        const outerR = 35;
        const innerR = 17;
        let pathD = '';
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 72 - 90) * Math.PI / 180;
          const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
          const ox = cx + outerR * Math.cos(outerAngle);
          const oy = cy + outerR * Math.sin(outerAngle);
          const ix = cx + innerR * Math.cos(innerAngle);
          const iy = cy + innerR * Math.sin(innerAngle);
          if (i === 0) pathD += `M${ox},${oy} `;
          else pathD += `L${ox},${oy} `;
          pathD += `L${ix},${iy} `;
        }
        pathD += 'Z';
        let innerPathD = '';
        const innerOuterR = 25;
        const innerInnerR = 12;
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 72 - 90) * Math.PI / 180;
          const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
          const ox = cx + innerOuterR * Math.cos(outerAngle);
          const oy = cy + innerOuterR * Math.sin(outerAngle);
          const ix = cx + innerInnerR * Math.cos(innerAngle);
          const iy = cy + innerInnerR * Math.sin(innerAngle);
          if (i === 0) innerPathD += `M${ox},${oy} `;
          else innerPathD += `L${ox},${oy} `;
          innerPathD += `L${ix},${iy} `;
        }
        innerPathD += 'Z';
        return <path key={key} d={`${pathD} ${innerPathD}`} fill={fill} fillRule="evenodd" />;
      }
      case 'heart': {
        const hx = ex + 35;
        const hy = ey + 21;
        return <path key={key} d={`M${hx},${hy+7} C${hx},${hy+7} ${hx-35},${hy+42} ${hx-35},${hy+56} C${hx-35},${hy+70} ${hx},${hy+91} ${hx},${hy+98} C${hx},${hy+91} ${hx+35},${hy+70} ${hx+35},${hy+56} C${hx+35},${hy+42} ${hx},${hy+7} Z M${hx},${hy+21} C${hx},${hy+21} ${hx-25},${hy+46} ${hx-25},${hy+56} C${hx-25},${hy+66} ${hx},${hy+81} ${hx},${hy+84} C${hx},${hy+81} ${hx+25},${hy+66} ${hx+25},${hy+56} C${hx+25},${hy+46} ${hx},${hy+21} Z`} fill={fill} fillRule="evenodd" />;
      }
      case 'leaf': 
        return <path key={key} d={`M${ex},${ey} C${ex+35},${ey} ${ex+70},${ey+35} ${ex+70},${ey+70} C${ex+35},${ey+70} ${ex},${ey+35} ${ex},${ey} Z M${ex+10},${ey+10} C${ex+10},${ey+35} ${ex+35},${ey+60} ${ex+60},${ey+60} C${ex+60},${ey+35} ${ex+35},${ey+10} ${ex+10},${ey+10} Z`} fill={fill} fillRule="evenodd" />;
      default:
        return null;
    }
  };

  const renderEyeInner = (ex: number, ey: number, fill: string, key: string) => {
    switch (eyeInnerStyle) {
      case 'square': return <rect key={key} x={ex+20} y={ey+20} width="30" height="30" fill={fill} />;
      case 'circle': return <circle key={key} cx={ex+35} cy={ey+35} r="15" fill={fill} />;
      case 'rounded': return <rect key={key} x={ex+20} y={ey+20} width="30" height="30" rx="10" fill={fill} />;
      case 'diamond':
        return <polygon key={key} points={`${ex+35},${ey+20} ${ex+50},${ey+35} ${ex+35},${ey+50} ${ex+20},${ey+35}`} fill={fill} />;
      case 'star': return <path key={key} d={`M${ex+35},${ey+15} L${ex+39.4},${ey+29} L${ex+54.2},${ey+29} L${ex+42.2},${ey+37.8} L${ex+46.6},${ey+51.4} L${ex+35},${ey+43} L${ex+23.4},${ey+51.4} L${ex+27.8},${ey+37.8} L${ex+15.8},${ey+29} L${ex+30.6},${ey+29} Z`} fill={fill} />;
      case 'leaf': return <path key={key} d={`M${ex+20},${ey+20} C${ex+35},${ey+20} ${ex+50},${ey+35} ${ex+50},${ey+50} C${ex+35},${ey+50} ${ex+20},${ey+35} ${ex+20},${ey+20} Z`} fill={fill} />;
      default:
        return null;
    }
  };

  const renderElements = (isDesktop: boolean = true, customGradientId?: string) => {
    if (!matrix) return null;
    const { size, data } = matrix;
    const elements: React.ReactNode[] = [];
    const cellSize = 10;
    const gradientId = customGradientId || (isDesktop ? 'qr-gradient-desktop' : 'qr-gradient-mobile');
    const fill = colorMode === 'gradient' ? `url(#${gradientId})` : fgColor;

    const renderedEyes = new Set<string>();

    const qrElements: React.ReactNode[] = [];
    const camoElements: React.ReactNode[] = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isDark = data[y * size + x] === 1;
        if (!isDark) continue;

        if (isEye(x, y, size)) {
          const eyeKey = x < 7 ? (y < 7 ? 'tl' : 'bl') : 'tr';
          if (!renderedEyes.has(eyeKey)) {
            renderedEyes.add(eyeKey);
            const ex = (x < 7 ? 0 : size - 7) * cellSize;
            const ey = (y < 7 ? 0 : size - 7) * cellSize;
            
            qrElements.push(
              <g key={`eye-${eyeKey}`}>
                {renderEyeOuter(ex, ey, fill, `eye-outer-${eyeKey}`)}
                {renderEyeInner(ex, ey, fill, `eye-inner-${eyeKey}`)}
              </g>
            );
          }
        } else {
          qrElements.push(renderDot(x, y, fill));
        }
      }
    }

    if (enableCamo) {
      const offsetX = Math.floor((camoWidth - size) / 2) * 10;
      const offsetY = Math.floor((camoHeight - size) / 2) * 10;

      const canvasLeft = -offsetX;
      const canvasRight = -offsetX + camoWidth * 10;
      const canvasTop = -offsetY;
      const canvasBottom = -offsetY + camoHeight * 10;

      const qrCenterX = (size * 10) / 2;
      const qrCenterY = (size * 10) / 2;

      const minUnscaledX = qrCenterX + (canvasLeft - qrCenterX) / qrScale;
      const maxUnscaledX = qrCenterX + (canvasRight - qrCenterX) / qrScale;
      const minUnscaledY = qrCenterY + (canvasTop - qrCenterY) / qrScale;
      const maxUnscaledY = qrCenterY + (canvasBottom - qrCenterY) / qrScale;

      const startX = Math.floor(minUnscaledX / 10);
      const endX = Math.ceil(maxUnscaledX / 10);
      const startY = Math.floor(minUnscaledY / 10);
      const endY = Math.ceil(maxUnscaledY / 10);

      const margin = camoMargin;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          if (x >= -margin && x < size + margin && y >= -margin && y < size + margin) {
            continue;
          }

          const r = random(camoSeed + x * 1000 + y);
          if (r < qrDensity) {
            camoElements.push(renderDot(x, y, fill));
          }
        }
      }
    }

    const qrCenterX = (size * 10) / 2;
    const qrCenterY = (size * 10) / 2;

    elements.push(
      <g key="scaled-layer" transform={`translate(${qrCenterX}, ${qrCenterY}) scale(${qrScale}) translate(${-qrCenterX}, ${-qrCenterY})`}>
        {camoElements}
        {qrElements}
      </g>
    );

    return elements;
  };

  const padding = enableCamo ? 0 : 4;
  const actualWidth = enableCamo ? camoWidth : (matrix ? matrix.size + padding * 2 : 0);
  const actualHeight = enableCamo ? camoHeight : (matrix ? matrix.size + padding * 2 : 0);
  const viewBoxWidth = actualWidth * 10;
  const viewBoxHeight = actualHeight * 10;
  
  const offsetX = enableCamo ? Math.floor((camoWidth - (matrix ? matrix.size : 0)) / 2) * 10 : padding * 10;
  const offsetY = enableCamo ? Math.floor((camoHeight - (matrix ? matrix.size : 0)) / 2) * 10 : padding * 10;

  const steps = [
    { id: 'content', title: '内容', icon: LinkIcon },
    { id: 'colors', title: '颜色', icon: Palette },
    { id: 'dots', title: '数据点', icon: Sparkles },
    { id: 'eyes', title: '定位眼', icon: Shapes },
    { id: 'preview', title: '预览', icon: ImageIcon },
  ];

  const handleNextStep = () => {
    setSlideDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevStep = () => {
    setSlideDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
      setIsAnimating(false);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    const diffY = Math.abs(touchStartY.current - touchEndY.current);
    
    if (diffX > 10 && diffX > diffY * 1.5) {
      isSwiping.current = true;
    } else if (diffY > diffX) {
      isSwiping.current = false;
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      touchStartY.current = 0;
      touchEndY.current = 0;
      return;
    }
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleNextStep();
      } else {
        handlePrevStep();
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
    isSwiping.current = false;
  };

  const renderPreviewContent = (isDesktop: boolean) => (
    <div className="flex flex-col items-center justify-center w-full h-full flex-1">
      {matrix ? (
        <>
          <div 
            className="relative group rounded-xl shadow-2xl ring-1 ring-slate-900/5 transition-transform hover:scale-[1.02] duration-300 mx-auto overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <canvas
              ref={isDesktop ? null : canvasRef}
              style={{ 
                backgroundColor: bgColor,
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                aspectRatio: '1/1',
                display: 'block'
              }}
            />
          </div>

          <div className="mt-4 w-full">
            <button
              onClick={handleDownloadPNG}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all text-sm active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              导出 PNG
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 min-h-[200px]">
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 旧主题页面 - 滑出 */}
      {themeTransition === 'exit' && prevTheme !== null && (
        <div 
          key={`exit-${prevTheme ? 'dark' : 'light'}`}
          className={cn(
            "fixed inset-0 font-sans p-4 md:p-8 z-50",
            prevTheme 
              ? "bg-[#1c1c1e] text-white" 
              : "bg-[#F2F2F7] text-[#1C1C1E]"
          )}
          style={{
            animation: 'themeSlideOut 0.4s ease-out forwards'
          }}
        >
          <div className="max-w-6xl mx-auto space-y-8 opacity-50">
            <div className="h-20" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <div className={cn("h-12 rounded-2xl", prevTheme ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]")} />
                <div className={cn("h-64 rounded-3xl", prevTheme ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]")} />
              </div>
              <div className="lg:col-span-5">
                <div className={cn("h-80 rounded-3xl", prevTheme ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]")} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新主题页面 - 滑入 */}
      <div 
        key={isDarkMode ? 'dark' : 'light'}
        className={cn(
          "min-h-screen font-sans",
          isDarkMode 
            ? "bg-[#1c1c1e] text-white" 
            : "bg-[#F2F2F7] text-[#1C1C1E]"
        )}
        style={{
          animation: themeTransition === 'exit' ? 'themeSlideIn 0.4s ease-out forwards' : undefined
        }}
      >
        {/* 顶部固定区域 - 包含安全区域 */}
        <div 
          className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 bg-transparent"
          style={{ paddingTop: `${safeAreaInsets.top}px` }}
        >
          <div className={cn(
            "backdrop-blur-xl rounded-2xl shadow-lg shadow-black/10 p-3 flex items-center justify-between w-full max-w-6xl mx-auto",
            isDarkMode ? "bg-[#2c2c2e]/90 border border-[#3a3a3c]" : "bg-white/90 border border-[#E5E5EA]",
            !CSS.supports('backdrop-filter', 'blur(20px)') && (isDarkMode ? "bg-[#2c2c2e]" : "bg-white")
          )}>
          <div className="hidden md:block">
            <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>QR code</h1>
            <p className={cn("mt-1", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>支持全局渐变、自定义矢量图标拼接、独立定位眼设计。</p>
          </div>
          
          <div className="md:hidden flex items-center gap-3">
            {(() => {
              const step = steps[currentStep];
              const Icon = step.icon;
              return (
                <>
                  <div className={cn("rounded-xl flex items-center justify-center py-2.5 px-3", isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100")}>
                    <Icon className={cn("w-5 h-5", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />
                  </div>
                  <h2 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>{step.title}</h2>
                </>
              );
            })()}
          </div>
          
          <button 
            onClick={() => handleThemeChange(!isDarkMode)}
            disabled={themeTransition !== 'none'}
            className={cn(
              "rounded-xl flex items-center justify-center active:scale-95 transition-all py-2.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed",
              isDarkMode 
                ? "bg-[#3a3a3c] border border-[#48484a]" 
                : "bg-white border border-[#E5E5EA]"
            )}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
          </div>
        </div>

        {/* 中间可滚动内容区域 - 添加顶部和底部padding避免被遮挡 */}
        <div 
          className="px-4 md:px-8 py-4 md:mt-0 md:mb-0"
          style={{ 
            marginTop: `${80 + safeAreaInsets.top}px`,
            marginBottom: `${keyboardHeight > 0 ? keyboardHeight : 80 + safeAreaInsets.bottom}px`
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div 
              ref={containerRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4"
            >
            
            {/* Step 1: Content Input */}
            <div className={cn(
              "backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-black/5 transition-all duration-200 ease-out",
              isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
              currentStep === 0 
                ? cn("flex flex-col justify-center", 
                    isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                  ) 
                : "hidden md:block"
            )}>
              <div>
                <label className={cn("block text-sm font-medium mb-3", isDarkMode ? "text-slate-300" : "text-[#3C3C43]")}>
                  输入内容
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={cn(
                    "w-full px-4 py-4 rounded-2xl border focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400",
                    isDarkMode 
                      ? "bg-[#3a3a3c] border-[#48484a] text-white focus:bg-[#48484a]" 
                      : "bg-[#E5E5EA] border-[#C7C7CC] text-[#1C1C1E] focus:bg-white"
                  )}
                  rows={6}
                  placeholder="在此输入您的链接或文本..."
                />
              </div>
            </div>

            {/* Step 2: Colors - 优化布局 */}
            <div className={cn(
              "backdrop-blur-xl rounded-3xl shadow-lg shadow-black/5 transition-all duration-300 ease-out",
              isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
              currentStep === 1 
                ? cn("flex flex-col",
                    isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                  ) 
                : "hidden md:block"
            )}>
              {/* 纯色/渐变色切换 - 移到最上面 */}
              <div className="p-6 pb-0">
                <div className={cn("flex p-1.5 rounded-2xl", isDarkMode ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]")}>
                  <button
                    onClick={() => setColorMode('solid')}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ease-out",
                      colorMode === 'solid' 
                        ? isDarkMode ? "bg-[#48484a] text-white shadow-md" : "bg-white text-indigo-600 shadow-md"
                        : isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-[#8E8E93] hover:text-[#3C3C43]"
                    )}
                  >
                    纯色
                  </button>
                  <button
                    onClick={() => setColorMode('gradient')}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ease-out",
                      colorMode === 'gradient' 
                        ? isDarkMode ? "bg-[#48484a] text-white shadow-md" : "bg-white text-indigo-600 shadow-md"
                        : isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-[#8E8E93] hover:text-[#3C3C43]"
                    )}
                  >
                    渐变色
                  </button>
                </div>
              </div>

              {/* 颜色选择区域 */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div 
                    key="fgColor"
                    className="transition-all duration-300 ease-out"
                  >
                    <ColorPicker
                      color={fgColor}
                      onChange={setFgColor}
                      label={colorMode === 'gradient' ? '起始颜色' : '前景色'}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  
                  <div 
                    key="fgColor2"
                    className={cn(
                      "transition-all duration-300 ease-out",
                      colorMode === 'gradient' 
                        ? "opacity-100 translate-y-0" 
                        : "hidden opacity-0 -translate-y-4"
                    )}
                  >
                    <ColorPicker
                      color={fgColor2}
                      onChange={setFgColor2}
                      label="结束颜色"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <div 
                    key="bgColor"
                    className="transition-all duration-300 ease-out"
                  >
                    <ColorPicker
                      color={bgColor}
                      onChange={setBgColor}
                      label="背景色"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <div 
                    key="gradientType"
                    className={cn(
                      "transition-all duration-300 ease-out",
                      colorMode === 'gradient' 
                        ? "opacity-100 translate-y-0" 
                        : "hidden opacity-0 -translate-y-4"
                    )}
                  >
                    <GradientTypeSelector
                      value={gradientType}
                      onChange={setGradientType}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Dots Pattern */}
            <div className={cn(
              "backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-black/5 transition-all duration-300 ease-out flex flex-col",
              isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
              currentStep === 2 
                ? cn("",
                    isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                  ) 
                : "hidden md:block"
            )}>
              <div className="space-y-4 pt-2">
                <div>
                  <label className={cn("block text-xs font-medium mb-3", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>基础形状</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DOT_STYLES.filter(s => ['square', 'circle', 'rounded', 'diamond'].includes(s.id)).map((style) => (
                      <button
                        key={style.id}
                        onClick={() => toggleDotStyle(style.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-200 active:scale-95",
                          selectedDots.includes(style.id)
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                            : isDarkMode ? "bg-[#3a3a3c] text-slate-300 active:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] active:bg-[#D1D1D6]"
                        )}
                      >
                        <svg viewBox="0 0 20 20" className="w-6 h-6">
                          {style.id === 'square' && <rect x="2" y="2" width="16" height="16" fill="currentColor" />}
                          {style.id === 'circle' && <circle cx="10" cy="10" r="8" fill="currentColor" />}
                          {style.id === 'rounded' && <rect x="2" y="2" width="16" height="16" rx="5" fill="currentColor" />}
                          {style.id === 'diamond' && <polygon points="10,2 18,10 10,18 2,10" fill="currentColor" />}
                        </svg>
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={cn("block text-xs font-medium mb-3", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>特殊形状</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DOT_STYLES.filter(s => ['star', 'heart', 'leaf'].includes(s.id)).map((style) => (
                      <button
                        key={style.id}
                        onClick={() => toggleDotStyle(style.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-200 active:scale-95",
                          selectedDots.includes(style.id)
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                            : isDarkMode ? "bg-[#3a3a3c] text-slate-300 active:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] active:bg-[#D1D1D6]"
                        )}
                      >
                        <svg viewBox="0 0 20 20" className="w-6 h-6">
                          {style.id === 'star' && <path d="M10,2 L12.4,7.5 L18,8 L14,12 L15,18 L10,15 L5,18 L6,12 L2,8 L7.6,7.5 Z" fill="currentColor" />}
                          {style.id === 'heart' && <path d="M10,17 C10,17 3,12 3,7 C3,4 5,2 7.5,2 C9,2 10,3 10,3 C10,3 11,2 12.5,2 C15,2 17,4 17,7 C17,12 10,17 10,17 Z" fill="currentColor" />}
                          {style.id === 'leaf' && <path d="M2,2 C10,2 18,10 18,18 C10,18 2,10 2,2 Z" fill="currentColor" />}
                        </svg>
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <p className={cn("text-xs text-center", isDarkMode ? "text-slate-500" : "text-[#8E8E93]")}>选择多个形状，它们将随机分布在二维码中</p>
              </div>
            </div>

            {/* Step 4: Eyes Pattern */}
            <div className={cn(
              "backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-black/5 transition-all duration-300 ease-out flex flex-col",
              isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
              currentStep === 3 
                ? cn("",
                    isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                  ) 
                : "hidden md:block"
            )}>
              <div className="space-y-5 pt-2">
                <div>
                  <label className={cn("block text-xs font-medium mb-3", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>定位眼外框</label>
                  <div className="grid grid-cols-4 gap-2">
                    {EYE_OUTER_STYLES.filter(s => s.id !== 'custom').map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setEyeOuterStyle(style.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-200 active:scale-95",
                          eyeOuterStyle === style.id 
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                            : isDarkMode ? "bg-[#3a3a3c] text-slate-300 active:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] active:bg-[#D1D1D6]"
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          {style.id === 'square' && <path d="M2,2 h20 v20 h-20 Z M6,6 v12 h12 v-12 Z" fill="currentColor" fillRule="evenodd" />}
                          {style.id === 'circle' && <><circle cx="12" cy="12" r="10" fill="currentColor" /><circle cx="12" cy="12" r="5" fill={isDarkMode ? "#2c2c2e" : "white"} /></>}
                          {style.id === 'rounded' && <path d="M7,2 h10 a5,5 0 0 1 5,5 v10 a5,5 0 0 1 -5,5 h-10 a5,5 0 0 1 -5,-5 v-10 a5,5 0 0 1 5,-5 Z M7,6 a1,1 0 0 0 -1,1 v10 a1,1 0 0 0 1,1 h10 a1,1 0 0 0 1,-1 v-10 a1,1 0 0 0 -1,-1 Z" fill="currentColor" fillRule="evenodd" />}
                          {style.id === 'diamond' && <path d="M12,2 L22,12 L12,22 L2,12 Z M12,7 L17,12 L12,17 L7,12 Z" fill="currentColor" fillRule="evenodd" />}
                          {style.id === 'leaf' && <path d="M2,2 C12,2 22,12 22,22 C12,22 2,12 2,2 Z M6,6 C6,12 12,18 18,18 C18,12 12,6 6,6 Z" fill="currentColor" fillRule="evenodd" />}
                        </svg>
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={cn("block text-xs font-medium mb-3", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>定位眼内点</label>
                  <div className="grid grid-cols-4 gap-2">
                    {EYE_INNER_STYLES.filter(s => s.id !== 'custom').map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setEyeInnerStyle(style.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-200 active:scale-95",
                          eyeInnerStyle === style.id 
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                            : isDarkMode ? "bg-[#3a3a3c] text-slate-300 active:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] active:bg-[#D1D1D6]"
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                          {style.id === 'square' && <rect x="6" y="6" width="12" height="12" fill="currentColor" />}
                          {style.id === 'circle' && <circle cx="12" cy="12" r="6" fill="currentColor" />}
                          {style.id === 'rounded' && <rect x="6" y="6" width="12" height="12" rx="4" fill="currentColor" />}
                          {style.id === 'diamond' && <polygon points="12,6 18,12 12,18 6,12" fill="currentColor" />}
                          {style.id === 'star' && <path d="M12,4 L14,10 L20,10 L15,14 L17,20 L12,16 L7,20 L9,14 L4,10 L10,10 Z" fill="currentColor" />}
                          {style.id === 'heart' && <path d="M12,18 C12,18 6,14 6,10 C6,7 8,5 10,5 C11,5 12,6 12,6 C12,6 13,5 14,5 C16,5 18,7 18,10 C18,14 12,18 12,18 Z" fill="currentColor" />}
                          {style.id === 'leaf' && <path d="M6,6 C12,6 18,12 18,18 C12,18 6,12 6,6 Z" fill="currentColor" />}
                        </svg>
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Preview & Export */}
            <div className={cn(
              "backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-black/5 transition-all duration-300 ease-out flex flex-col",
              isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
              currentStep === 4 
                ? cn("overflow-y-auto",
                    isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                  ) 
                : "hidden md:block"
            )}>
              <div className="space-y-5 pt-2">
                <div className={cn(
                  "transition-all duration-300 ease-out overflow-hidden",
                  !enableCamo ? "max-h-[300px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"
                )}>
                  <div>
                    <label className={cn("block text-xs font-medium mb-3", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>容错率级别</label>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { level: 'L', label: 'L', desc: '7%' },
                        { level: 'M', label: 'M', desc: '15%' },
                        { level: 'Q', label: 'Q', desc: '25%' },
                        { level: 'H', label: 'H', desc: '30%' }
                      ] as const).map((item) => (
                        <button
                          key={item.level}
                          onClick={() => setErrorCorrection(item.level)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-200 active:scale-95",
                            errorCorrection === item.level 
                              ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                              : isDarkMode ? "bg-[#3a3a3c] text-slate-300 active:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] active:bg-[#D1D1D6]"
                          )}
                        >
                          <span className="text-lg font-bold">{item.label}</span>
                          <span className={cn("text-xs", errorCorrection === item.level ? "text-white/70" : isDarkMode ? "text-slate-500" : "text-[#8E8E93]")}>恢复{item.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className={cn("mt-3 text-center", isDarkMode ? "text-amber-400/80" : "text-amber-600")}>
                      <p className="text-xs">💡 使用复杂形状时，建议保持 H 级别以确保可扫码性</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {renderPreviewContent(false)}
              
              <div className={cn("pt-4 border-t", isDarkMode ? "border-[#3a3a3c]" : "border-[#E5E5EA]")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className={cn("w-4 h-4", isDarkMode ? "text-indigo-400" : "text-indigo-500")} />
                    <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-slate-300" : "text-[#1C1C1E]")}>迷彩背景</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={enableCamo} onChange={(e) => setEnableCamo(e.target.checked)} />
                    <div className={cn("w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500/50",
                      isDarkMode ? "bg-[#48484a] after:border-[#636366]" : "bg-[#E5E5EA] after:border-[#C7C7CC]"
                    )}></div>
                  </label>
                </div>
                
                {enableCamo && (
                  <div className="space-y-3 pt-3 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className={cn("block text-sm font-medium", isDarkMode ? "text-slate-400" : "text-[#3C3C43]")}>二维码缩放</label>
                        <span className={cn("text-sm font-medium tabular-nums", isDarkMode ? "text-indigo-400" : "text-indigo-600")}>{Math.round((qrScale - 0.4) / 0.6 * 100)}%</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="range" 
                          min="0.4" 
                          max="1" 
                          step="0.05" 
                          value={qrScale} 
                          onChange={(e) => setQrScale(Math.max(0.4, parseFloat(e.target.value)))}
                          className={cn(
                            "w-full h-2 rounded-lg appearance-none cursor-pointer",
                            isDarkMode ? "bg-[#48484a]" : "bg-[#E5E5EA]"
                          )}
                          style={{
                            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(qrScale - 0.4) / 0.6 * 100}%, ${isDarkMode ? '#48484a' : '#E5E5EA'} ${(qrScale - 0.4) / 0.6 * 100}%, ${isDarkMode ? '#48484a' : '#E5E5EA'} 100%)`
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-slate-400" : "text-[#3C3C43]")}>随机种子</label>
                      <input 
                        type="number" 
                        value={camoSeed} 
                        onChange={(e) => setCamoSeed(parseInt(e.target.value) || 0)}
                        className={cn("w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none",
                          isDarkMode ? "bg-[#3a3a3c] border border-[#48484a] text-white" : "bg-white border border-[#C7C7CC] text-[#1C1C1E]"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Preview Button */}
            {currentStep < 4 && (
              <button
                ref={floatBtnRef}
                className="md:hidden fixed z-[55] group touch-none select-none"
                style={{ 
                  bottom: `${96 + safeAreaInsets.bottom}px`, 
                  right: '1rem' 
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  isDragging.current = false;
                  const btn = e.currentTarget;
                  const startRect = btn.getBoundingClientRect();
                  const startX = startRect.left;
                  const startY = startRect.top;
                  const btnWidth = startRect.width;
                  const btnHeight = startRect.height;

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.clientX - e.clientX;
                    const deltaY = moveEvent.clientY - e.clientY;
                    
                    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                      isDragging.current = true;
                    }
                    
                    if (isDragging.current) {
                      let newX = startX + deltaX;
                      let newY = startY + deltaY;
                      newX = Math.max(0, Math.min(newX, window.innerWidth - btnWidth));
                      newY = Math.max(0, Math.min(newY, window.innerHeight - btnHeight));
                      btn.style.left = `${newX}px`;
                      btn.style.top = `${newY}px`;
                      btn.style.bottom = 'auto';
                      btn.style.right = 'auto';
                    }
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    if (!isDragging.current) {
                      setShowPreviewModal(true);
                    }
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
                onTouchStart={(e) => {
                  const btn = e.currentTarget;
                  const startRect = btn.getBoundingClientRect();
                  const startX = startRect.left;
                  const startY = startRect.top;
                  const btnWidth = startRect.width;
                  const btnHeight = startRect.height;
                  const touch = e.touches[0];
                  const startTouchX = touch.clientX;
                  const startTouchY = touch.clientY;

                  const handleTouchMove = (moveEvent: TouchEvent) => {
                    const touch = moveEvent.touches[0];
                    const deltaX = touch.clientX - startTouchX;
                    const deltaY = touch.clientY - startTouchY;
                    
                    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                      isDragging.current = true;
                    }
                    
                    if (isDragging.current) {
                      moveEvent.preventDefault();
                      let newX = startX + deltaX;
                      let newY = startY + deltaY;
                      newX = Math.max(0, Math.min(newX, window.innerWidth - btnWidth));
                      newY = Math.max(0, Math.min(newY, window.innerHeight - btnHeight));
                      btn.style.left = `${newX}px`;
                      btn.style.top = `${newY}px`;
                      btn.style.bottom = 'auto';
                      btn.style.right = 'auto';
                    }
                  };

                  const handleTouchEnd = () => {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                    if (!isDragging.current) {
                      setShowPreviewModal(true);
                    }
                  };

                  document.addEventListener('touchmove', handleTouchMove, { passive: false });
                  document.addEventListener('touchend', handleTouchEnd);
                }}
              >
                <div className="relative">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl shadow-lg shadow-black/10 overflow-hidden backdrop-blur-xl transition-all duration-200 group-active:scale-95",
                    isDarkMode ? "bg-[#3a3a3c] border border-[#48484a]" : "bg-white border border-[#E5E5EA]"
                  )}>
                    {matrix ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                        className="w-full h-full"
                        style={{ backgroundColor: bgColor }}
                      >
                        <defs>
                          {colorMode === 'gradient' && (
                            gradientType === 'linear' ? (
                              <linearGradient id="qr-gradient-thumb" x1={-offsetX} y1={-offsetY} x2={viewBoxWidth - offsetX} y2={viewBoxHeight - offsetY} gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={fgColor} />
                                <stop offset="100%" stopColor={fgColor2} />
                              </linearGradient>
                            ) : (
                              <radialGradient id="qr-gradient-thumb" cx={viewBoxWidth/2 - offsetX} cy={viewBoxHeight/2 - offsetY} r={Math.max(viewBoxWidth, viewBoxHeight)/2} gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={fgColor} />
                                <stop offset="100%" stopColor={fgColor2} />
                              </radialGradient>
                            )
                          )}
                        </defs>
                        <g transform={`translate(${offsetX}, ${offsetY})`}>
                          {renderElements(false, 'qr-gradient-thumb')}
                        </g>
                      </svg>
                    ) : (
                      <div className={cn("w-full h-full flex items-center justify-center", isDarkMode ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]")}>
                        <ImageIcon className={cn("w-6 h-6", isDarkMode ? "text-slate-500" : "text-[#8E8E93]")} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
              <div 
                className="md:hidden fixed inset-0 z-[60] flex items-center justify-center p-6"
                onClick={() => setShowPreviewModal(false)}
              >
                <div 
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    isDarkMode ? "bg-black/80 backdrop-blur-sm" : "bg-black/60 backdrop-blur-sm"
                  )}
                />
                <div 
                  className={cn(
                    "relative p-5 max-w-[280px] w-full rounded-3xl shadow-2xl shadow-black/20",
                    "transition-all duration-300 ease-out",
                    "animate-in zoom-in-95 fade-in",
                    isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100")}>
                        <ImageIcon className={cn("w-4 h-4", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />
                      </div>
                      <h3 className={cn("text-base font-semibold", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>实时预览</h3>
                    </div>
                    <button 
                      onClick={() => setShowPreviewModal(false)}
                      className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isDarkMode ? "bg-[#3a3a3c] active:bg-[#48484a]" : "bg-[#E5E5EA] active:bg-[#D1D1D6]"
                      )}
                    >
                      <X className={cn("w-4 h-4", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")} />
                    </button>
                  </div>
                  {matrix ? (
                    <div 
                      className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5"
                      style={{ backgroundColor: bgColor }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                        className="w-full h-auto"
                        style={{ backgroundColor: bgColor }}
                      >
                        <defs>
                          {colorMode === 'gradient' && (
                            gradientType === 'linear' ? (
                              <linearGradient id="qr-gradient-modal" x1={-offsetX} y1={-offsetY} x2={viewBoxWidth - offsetX} y2={viewBoxHeight - offsetY} gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={fgColor} />
                                <stop offset="100%" stopColor={fgColor2} />
                              </linearGradient>
                            ) : (
                              <radialGradient id="qr-gradient-modal" cx={viewBoxWidth/2 - offsetX} cy={viewBoxHeight/2 - offsetY} r={Math.max(viewBoxWidth, viewBoxHeight)/2} gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={fgColor} />
                                <stop offset="100%" stopColor={fgColor2} />
                              </radialGradient>
                            )
                          )}
                        </defs>
                        <g transform={`translate(${offsetX}, ${offsetY})`}>
                          {renderElements(false, 'qr-gradient-modal')}
                        </g>
                      </svg>
                    </div>
                  ) : (
                    <div className={cn("flex flex-col items-center justify-center py-10 rounded-2xl", isDarkMode ? "bg-[#3a3a3c] text-slate-400" : "bg-[#E5E5EA] text-[#8E8E93]")}>
                      <ImageIcon className="w-10 h-10 opacity-30" />
                      <p className="text-sm mt-2">输入内容生成二维码</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 底部导航 - 固定定位 */}
        <div 
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 md:px-8 bg-transparent"
          style={{ paddingBottom: `${safeAreaInsets.bottom}px` }}
        >
          <div className={cn(
            "backdrop-blur-xl rounded-2xl shadow-lg shadow-black/10 p-3 flex items-center justify-between w-full max-w-6xl mx-auto",
            isDarkMode ? "bg-[#2c2c2e]/90 border border-[#3a3a3c]" : "bg-white/90 border border-[#E5E5EA]",
            !CSS.supports('backdrop-filter', 'blur(20px)') && (isDarkMode ? "bg-[#2c2c2e]" : "bg-white")
          )}>
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-200",
                currentStep === 0 
                  ? isDarkMode ? "text-slate-600 cursor-not-allowed" : "text-[#C7C7CC] cursor-not-allowed"
                  : isDarkMode 
                    ? "bg-[#3a3a3c] text-slate-300 active:scale-95 active:bg-[#48484a]"
                    : "bg-[#E5E5EA] text-[#3C3C43] active:scale-95 active:bg-[#D1D1D6]"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">上一步</span>
            </button>
            
            <div className="flex items-center gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    index === currentStep 
                      ? "w-2 h-2 bg-indigo-500" 
                      : isDarkMode ? "w-1.5 h-1.5 bg-slate-600" : "w-1.5 h-1.5 bg-[#C7C7CC]"
                  )}
                />
              ))}
            </div>
            
            <button
              onClick={handleNextStep}
              disabled={currentStep === steps.length - 1}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-200",
                currentStep === steps.length - 1 
                  ? isDarkMode ? "text-slate-600 cursor-not-allowed" : "text-[#C7C7CC] cursor-not-allowed"
                  : "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 active:scale-95 active:bg-indigo-600"
              )}
            >
              <span className="text-sm">下一步</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <UpdateModal isDarkMode={isDarkMode} />
    </>
  );
}
