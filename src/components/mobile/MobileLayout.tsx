import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, FileCode2, Link as LinkIcon, Palette, Shapes, Sparkles, ChevronLeft, ChevronRight, X, Check, LayoutGrid, Moon, Sun } from 'lucide-react';
import { cn } from '../../utils';
import { DOT_STYLES, EYE_OUTER_STYLES, EYE_INNER_STYLES, CAMO_WIDTH, CAMO_HEIGHT, CAMO_MARGIN } from '../../constants';
import { ColorPicker, GradientTypeSelector } from '../shared';
import type { QRMatrix } from '../../types';
import type { Settings } from '../../hooks/useSettings';
import { random } from '../../utils';

interface MobileLayoutProps {
  settings: Settings;
  matrix: QRMatrix | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDownload: () => void;
}

const steps = [
  { id: 'content', title: '内容', icon: LinkIcon },
  { id: 'colors', title: '颜色', icon: Palette },
  { id: 'dots', title: '数据点', icon: Sparkles },
  { id: 'eyes', title: '定位眼', icon: Shapes },
  { id: 'preview', title: '预览', icon: ImageIcon },
];

export function MobileLayout({ settings, matrix, canvasRef, onDownload }: MobileLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const floatBtnRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);

  const {
    text, setText,
    colorMode, setColorMode,
    gradientType, setGradientType,
    fgColor, setFgColor,
    fgColor2, setFgColor2,
    bgColor, setBgColor,
    selectedDots, toggleDotStyle,
    eyeOuterStyle, setEyeOuterStyle,
    eyeInnerStyle, setEyeInnerStyle,
    enableCamo, setEnableCamo,
    camoSeed, setCamoSeed,
    qrScale, setQrScale,
    errorCorrection, setErrorCorrection,
    isDarkMode, setIsDarkMode,
  } = settings;

  const qrDensity = matrix ? matrix.data.filter(d => d === 1).length / matrix.data.length : 0.5;

  const handleNextStep = () => {
    setSlideDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevStep = () => {
    setSlideDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
      setIsAnimating(false);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (diff > threshold) {
      handleNextStep();
    } else if (diff < -threshold) {
      handlePrevStep();
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const getDotStyleForPosition = useCallback((x: number, y: number) => {
    if (selectedDots.length === 0) return 'square';
    const index = Math.abs(x * 13 + y * 31) % selectedDots.length;
    return selectedDots[index];
  }, [selectedDots]);

  const isEye = useCallback((x: number, y: number, size: number) => {
    return (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  }, []);

  const renderDot = useCallback((x: number, y: number, fill: string) => {
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
  }, [getDotStyleForPosition]);

  const renderEyeOuter = useCallback((ex: number, ey: number, fill: string, key: string) => {
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
      case 'leaf': 
        return <path key={key} d={`M${ex},${ey} C${ex+35},${ey} ${ex+70},${ey+35} ${ex+70},${ey+70} C${ex+35},${ey+70} ${ex},${ey+35} ${ex},${ey} Z M${ex+10},${ey+10} C${ex+10},${ey+35} ${ex+35},${ey+60} ${ex+60},${ey+60} C${ex+60},${ey+35} ${ex+35},${ey+10} ${ex+10},${ey+10} Z`} fill={fill} fillRule="evenodd" />;
      default:
        return null;
    }
  }, [eyeOuterStyle]);

  const renderEyeInner = useCallback((ex: number, ey: number, fill: string, key: string) => {
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
  }, [eyeInnerStyle]);

  const renderElements = useCallback((customGradientId?: string) => {
    if (!matrix) return null;
    const { size, data } = matrix;
    const elements: React.ReactNode[] = [];
    const cellSize = 10;
    const gradientId = customGradientId || 'qr-gradient-mobile';
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
      const offsetX = Math.floor((CAMO_WIDTH - size) / 2) * 10;
      const offsetY = Math.floor((CAMO_HEIGHT - size) / 2) * 10;

      const canvasLeft = -offsetX;
      const canvasRight = -offsetX + CAMO_WIDTH * 10;
      const canvasTop = -offsetY;
      const canvasBottom = -offsetY + CAMO_HEIGHT * 10;

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

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          if (x >= 0 && x < size && y >= 0 && y < size) {
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
  }, [matrix, colorMode, fgColor, enableCamo, camoSeed, qrScale, qrDensity, isEye, renderDot, renderEyeOuter, renderEyeInner]);

  const padding = enableCamo ? 0 : 4;
  const actualWidth = enableCamo ? CAMO_WIDTH : (matrix ? matrix.size + padding * 2 : 0);
  const actualHeight = enableCamo ? CAMO_HEIGHT : (matrix ? matrix.size + padding * 2 : 0);
  const viewBoxWidth = actualWidth * 10;
  const viewBoxHeight = actualHeight * 10;
  
  const offsetX = enableCamo ? Math.floor((CAMO_WIDTH - (matrix ? matrix.size : 0)) / 2) * 10 : padding * 10;
  const offsetY = enableCamo ? Math.floor((CAMO_HEIGHT - (matrix ? matrix.size : 0)) / 2) * 10 : padding * 10;

  const renderPreviewContent = () => (
    <div className="flex flex-col items-center justify-center w-full h-full flex-1">
      {matrix ? (
        <>
          <div 
            className="relative group rounded-xl shadow-2xl ring-1 ring-slate-900/5 transition-transform hover:scale-[1.02] duration-300 mx-auto overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <canvas
              ref={canvasRef}
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
              onClick={onDownload}
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
    <div className={cn(
      "min-h-screen font-sans p-4 transition-colors duration-300",
      isDarkMode ? "bg-[#1c1c1e] text-white" : "bg-[#F2F2F7] text-[#1C1C1E]"
    )}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="fixed top-0 left-0 right-0 z-40 px-4 bg-transparent p-4">
          <div className={cn(
            "backdrop-blur-xl rounded-2xl shadow-lg shadow-black/10 p-3 flex items-center justify-between w-full",
            isDarkMode ? "bg-[#2c2c2e]/90 border border-[#3a3a3c]" : "bg-white/90 border border-[#E5E5EA]"
          )}>
            <div className="flex items-center gap-3">
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
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isDarkMode ? "bg-[#3a3a3c] text-yellow-400 hover:bg-[#48484a]" : "bg-[#E5E5EA] text-slate-600 hover:bg-[#D1D1D6]"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative min-h-[calc(100vh-220px)] pt-24"
        >
          {/* Step 1: Content Input */}
          <div className={cn(
            "backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-black/5 transition-all duration-200 ease-out",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
            currentStep === 0 
              ? cn("flex flex-col justify-center min-h-[calc(100vh-220px)]", 
                  isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                ) 
              : "hidden"
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

          {/* Step 2: Colors */}
          <div className={cn(
            "backdrop-blur-xl rounded-3xl shadow-lg shadow-black/5 transition-all duration-300 ease-out",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
            currentStep === 1 
              ? cn("flex flex-col min-h-[calc(100vh-220px)]",
                  isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                ) 
              : "hidden"
          )}>
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

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <ColorPicker
                  color={fgColor}
                  onChange={setFgColor}
                  label={colorMode === 'gradient' ? '起始颜色' : '前景色'}
                  isDarkMode={isDarkMode}
                />
                
                {colorMode === 'gradient' && (
                  <ColorPicker
                    color={fgColor2}
                    onChange={setFgColor2}
                    label="结束颜色"
                    isDarkMode={isDarkMode}
                  />
                )}

                <ColorPicker
                  color={bgColor}
                  onChange={setBgColor}
                  label="背景色"
                  isDarkMode={isDarkMode}
                />

                {colorMode === 'gradient' && (
                  <GradientTypeSelector
                    value={gradientType}
                    onChange={setGradientType}
                    isDarkMode={isDarkMode}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Dots Pattern */}
          <div className={cn(
            "backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-black/5 transition-all duration-300 ease-out flex flex-col",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]",
            currentStep === 2 
              ? cn("min-h-[calc(100vh-220px)]",
                  isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                ) 
              : "hidden"
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
              ? cn("min-h-[calc(100vh-220px)]",
                  isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                ) 
              : "hidden"
          )}>
            <div className="space-y-5 pt-2">
              <div>
                <label className={cn("block text-xs font-medium mb-3", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>定位眼外框</label>
                <div className="grid grid-cols-4 gap-2">
                  {EYE_OUTER_STYLES.map((style) => (
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
                  {EYE_INNER_STYLES.map((style) => (
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
              ? cn("min-h-[calc(100vh-220px)] overflow-y-auto",
                  isAnimating ? (slideDirection === 'left' ? "opacity-0 scale-95 translate-x-8" : "opacity-0 scale-95 -translate-x-8") : "opacity-100 scale-100 translate-x-0"
                ) 
              : "hidden"
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
            
            {renderPreviewContent()}
            
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
              className="fixed z-[55] group touch-none select-none"
              style={{ bottom: '6rem', right: '1rem' }}
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
                e.preventDefault();
                isDragging.current = false;
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
                  moveEvent.preventDefault();
                  const touch = moveEvent.touches[0];
                  const deltaX = touch.clientX - startTouchX;
                  const deltaY = touch.clientY - startTouchY;
                  
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
                        {renderElements('qr-gradient-thumb')}
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
              className="fixed inset-0 z-[60] flex items-center justify-center p-6"
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
                        {renderElements('qr-gradient-modal')}
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

          {/* Stepper Navigation */}
          <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
            <div className={cn(
              "backdrop-blur-xl rounded-2xl shadow-lg shadow-black/10 p-3 flex items-center justify-between",
              isDarkMode ? "bg-[#2c2c2e]/90 border border-[#3a3a3c]" : "bg-white/90 border border-[#E5E5EA]"
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
      </div>
    </div>
  );
}
