import React, { useRef, useCallback } from 'react';
import { Image as ImageIcon, LayoutGrid, Moon, Sun } from 'lucide-react';
import { cn } from '../../utils';
import { DOT_STYLES, EYE_OUTER_STYLES, EYE_INNER_STYLES, CAMO_WIDTH, CAMO_HEIGHT } from '../../constants';
import { ColorPicker, GradientTypeSelector } from '../shared';
import type { QRMatrix } from '../../types';
import type { Settings } from '../../hooks/useSettings';
import { random } from '../../utils';

interface DesktopLayoutProps {
  settings: Settings;
  matrix: QRMatrix | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDownload: () => void;
}

export function DesktopLayout({ settings, matrix, canvasRef, onDownload }: DesktopLayoutProps) {
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
    const gradientId = customGradientId || 'qr-gradient-desktop';
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

  return (
    <div className={cn(
      "h-screen font-sans flex overflow-hidden",
      isDarkMode ? "bg-[#1c1c1e] text-white" : "bg-[#F2F2F7] text-[#1C1C1E]"
    )}>
      <aside className={cn(
        "w-[380px] h-screen flex-shrink-0 overflow-y-auto",
        isDarkMode ? "bg-[#1c1c1e] border-r border-[#3a3a3c]" : "bg-[#F2F2F7] border-r border-[#E5E5EA]"
      )}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn("text-2xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>QR code</h1>
              <p className={cn("mt-1 text-sm", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>支持全局渐变、自定义矢量图标拼接、独立定位眼设计。</p>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                isDarkMode ? "bg-[#3a3a3c] text-yellow-400 hover:bg-[#48484a]" : "bg-[#E5E5EA] text-slate-600 hover:bg-[#D1D1D6]"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className={cn(
            "backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-black/5",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]"
          )}>
            <label className={cn("block text-sm font-medium mb-3", isDarkMode ? "text-slate-300" : "text-[#3C3C43]")}>
              输入内容
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400 text-sm",
                isDarkMode 
                  ? "bg-[#3a3a3c] border-[#48484a] text-white focus:bg-[#48484a]" 
                  : "bg-[#E5E5EA] border-[#C7C7CC] text-[#1C1C1E] focus:bg-white"
              )}
              rows={3}
              placeholder="在此输入您的链接或文本..."
            />
          </div>

          <div className={cn(
            "backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-black/5",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]"
          )}>
            <h3 className={cn("text-base font-semibold mb-4", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>颜色设置</h3>
            
            <div className={cn("flex p-1 rounded-xl mb-4", isDarkMode ? "bg-[#3a3a3c]" : "bg-[#E5E5EA]")}>
              <button
                onClick={() => setColorMode('solid')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-out",
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
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-out",
                  colorMode === 'gradient' 
                    ? isDarkMode ? "bg-[#48484a] text-white shadow-md" : "bg-white text-indigo-600 shadow-md"
                    : isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-[#8E8E93] hover:text-[#3C3C43]"
                )}
              >
                渐变色
              </button>
            </div>

            <div className="space-y-3">
              <ColorPicker
                color={fgColor}
                onChange={setFgColor}
                label={colorMode === 'gradient' ? '起始颜色' : '前景色'}
                isDarkMode={isDarkMode}
              />
              
              {colorMode === 'gradient' && (
                <>
                  <ColorPicker
                    color={fgColor2}
                    onChange={setFgColor2}
                    label="结束颜色"
                    isDarkMode={isDarkMode}
                  />
                  <GradientTypeSelector
                    value={gradientType}
                    onChange={setGradientType}
                    isDarkMode={isDarkMode}
                  />
                </>
              )}

              <ColorPicker
                color={bgColor}
                onChange={setBgColor}
                label="背景色"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          <div className={cn(
            "backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-black/5",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]"
          )}>
            <h3 className={cn("text-base font-semibold mb-4", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>数据点样式</h3>
            
            <div className="mb-4">
              <label className={cn("block text-xs font-medium mb-2", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>基础形状</label>
              <div className="grid grid-cols-4 gap-1.5">
                {DOT_STYLES.filter(s => ['square', 'circle', 'rounded', 'diamond'].includes(s.id)).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleDotStyle(style.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200",
                      selectedDots.includes(style.id)
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                        : isDarkMode ? "bg-[#3a3a3c] text-slate-300 hover:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] hover:bg-[#D1D1D6]"
                    )}
                  >
                    <svg viewBox="0 0 20 20" className="w-4 h-4">
                      {style.id === 'square' && <rect x="2" y="2" width="16" height="16" fill="currentColor" />}
                      {style.id === 'circle' && <circle cx="10" cy="10" r="8" fill="currentColor" />}
                      {style.id === 'rounded' && <rect x="2" y="2" width="16" height="16" rx="5" fill="currentColor" />}
                      {style.id === 'diamond' && <polygon points="10,2 18,10 10,18 2,10" fill="currentColor" />}
                    </svg>
                    <span className="text-[10px]">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={cn("block text-xs font-medium mb-2", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>特殊形状</label>
              <div className="grid grid-cols-3 gap-1.5">
                {DOT_STYLES.filter(s => ['star', 'heart', 'leaf'].includes(s.id)).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleDotStyle(style.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200",
                      selectedDots.includes(style.id)
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                        : isDarkMode ? "bg-[#3a3a3c] text-slate-300 hover:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] hover:bg-[#D1D1D6]"
                    )}
                  >
                    <svg viewBox="0 0 20 20" className="w-4 h-4">
                      {style.id === 'star' && <path d="M10,2 L12.4,7.5 L18,8 L14,12 L15,18 L10,15 L5,18 L6,12 L2,8 L7.6,7.5 Z" fill="currentColor" />}
                      {style.id === 'heart' && <path d="M10,17 C10,17 3,12 3,7 C3,4 5,2 7.5,2 C9,2 10,3 10,3 C10,3 11,2 12.5,2 C15,2 17,4 17,7 C17,12 10,17 10,17 Z" fill="currentColor" />}
                      {style.id === 'leaf' && <path d="M2,2 C10,2 18,10 18,18 C10,18 2,10 2,2 Z" fill="currentColor" />}
                    </svg>
                    <span className="text-[10px]">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(
            "backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-black/5",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]"
          )}>
            <h3 className={cn("text-base font-semibold mb-4", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>定位眼样式</h3>
            
            <div className="mb-4">
              <label className={cn("block text-xs font-medium mb-2", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>外框样式</label>
              <div className="grid grid-cols-5 gap-1.5">
                {EYE_OUTER_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setEyeOuterStyle(style.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200",
                      eyeOuterStyle === style.id 
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                        : isDarkMode ? "bg-[#3a3a3c] text-slate-300 hover:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] hover:bg-[#D1D1D6]"
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      {style.id === 'square' && <path d="M2,2 h20 v20 h-20 Z M6,6 v12 h12 v-12 Z" fill="currentColor" fillRule="evenodd" />}
                      {style.id === 'circle' && <><circle cx="12" cy="12" r="10" fill="currentColor" /><circle cx="12" cy="12" r="5" fill={isDarkMode ? "#2c2c2e" : "white"} /></>}
                      {style.id === 'rounded' && <path d="M7,2 h10 a5,5 0 0 1 5,5 v10 a5,5 0 0 1 -5,5 h-10 a5,5 0 0 1 -5,-5 v-10 a5,5 0 0 1 5,-5 Z M7,6 a1,1 0 0 0 -1,1 v10 a1,1 0 0 0 1,1 h10 a1,1 0 0 0 1,-1 v-10 a1,1 0 0 0 -1,-1 Z" fill="currentColor" fillRule="evenodd" />}
                      {style.id === 'diamond' && <path d="M12,2 L22,12 L12,22 L2,12 Z M12,7 L17,12 L12,17 L7,12 Z" fill="currentColor" fillRule="evenodd" />}
                      {style.id === 'leaf' && <path d="M2,2 C12,2 22,12 22,22 C12,22 2,12 2,2 Z M6,6 C6,12 12,18 18,18 C18,12 12,6 6,6 Z" fill="currentColor" fillRule="evenodd" />}
                    </svg>
                    <span className="text-[10px]">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={cn("block text-xs font-medium mb-2", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>内点样式</label>
              <div className="grid grid-cols-6 gap-1.5">
                {EYE_INNER_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setEyeInnerStyle(style.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200",
                      eyeInnerStyle === style.id 
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                        : isDarkMode ? "bg-[#3a3a3c] text-slate-300 hover:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] hover:bg-[#D1D1D6]"
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                      {style.id === 'square' && <rect x="6" y="6" width="12" height="12" fill="currentColor" />}
                      {style.id === 'circle' && <circle cx="12" cy="12" r="6" fill="currentColor" />}
                      {style.id === 'rounded' && <rect x="6" y="6" width="12" height="12" rx="4" fill="currentColor" />}
                      {style.id === 'diamond' && <polygon points="12,6 18,12 12,18 6,12" fill="currentColor" />}
                      {style.id === 'star' && <path d="M12,4 L14,10 L20,10 L15,14 L17,20 L12,16 L7,20 L9,14 L4,10 L10,10 Z" fill="currentColor" />}
                      {style.id === 'leaf' && <path d="M6,6 C12,6 18,12 18,18 C12,18 6,12 6,6 Z" fill="currentColor" />}
                    </svg>
                    <span className="text-[10px]">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(
            "backdrop-blur-xl p-5 rounded-2xl shadow-lg shadow-black/5",
            isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]"
          )}>
            <h3 className={cn("text-base font-semibold mb-4", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>高级设置</h3>
            
            <div className="mb-4">
              <label className={cn("block text-xs font-medium mb-2", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>容错率级别</label>
              <div className="grid grid-cols-4 gap-1.5">
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
                      "flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-all duration-200",
                      errorCorrection === item.level 
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                        : isDarkMode ? "bg-[#3a3a3c] text-slate-300 hover:bg-[#48484a]" : "bg-[#E5E5EA] text-[#3C3C43] hover:bg-[#D1D1D6]"
                    )}
                  >
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className={cn("text-[10px]", errorCorrection === item.level ? "text-white/70" : isDarkMode ? "text-slate-500" : "text-[#8E8E93]")}>恢复{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={cn("pt-4 border-t", isDarkMode ? "border-[#3a3a3c]" : "border-[#E5E5EA]")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutGrid className={cn("w-4 h-4", isDarkMode ? "text-indigo-400" : "text-indigo-500")} />
                  <span className={cn("text-sm font-medium", isDarkMode ? "text-slate-300" : "text-[#1C1C1E]")}>迷彩背景</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={enableCamo} onChange={(e) => setEnableCamo(e.target.checked)} />
                  <div className={cn("w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500/50",
                    isDarkMode ? "bg-[#48484a] after:border-[#636366]" : "bg-[#E5E5EA] after:border-[#C7C7CC]"
                  )}></div>
                </label>
              </div>
              
              {enableCamo && (
                <div className="space-y-3 pt-3 mt-3 border-t animate-in slide-in-from-top-2 duration-300" style={{ borderColor: isDarkMode ? '#3a3a3c' : '#E5E5EA' }}>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className={cn("block text-sm font-medium", isDarkMode ? "text-slate-400" : "text-[#3C3C43]")}>二维码缩放</label>
                      <span className={cn("text-sm font-medium tabular-nums", isDarkMode ? "text-indigo-400" : "text-indigo-600")}>{Math.round((qrScale - 0.4) / 0.6 * 100)}%</span>
                    </div>
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
        </div>
      </aside>

      <main className="fixed left-[380px] right-0 top-0 bottom-0 flex items-center justify-center p-8 overflow-hidden">
        <div className={cn(
          "w-[580px] h-[580px] backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-black/5 flex flex-col",
          isDarkMode ? "bg-[#2c2c2e] border border-[#3a3a3c]" : "bg-white border border-[#E5E5EA]"
        )}>
          <h3 className={cn("text-lg font-semibold mb-4 text-center flex-shrink-0", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>预览与导出</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            {matrix ? (
              <>
                <div 
                  className="relative group rounded-2xl shadow-2xl ring-1 ring-slate-900/5 transition-transform hover:scale-[1.02] duration-300 overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: bgColor }}
                >
                  <canvas
                    ref={canvasRef}
                    style={{ 
                      backgroundColor: bgColor,
                      width: '420px',
                      height: '420px',
                      display: 'block'
                    }}
                  />
                </div>

                <div className="mt-4 w-[420px] flex-shrink-0">
                  <button
                    onClick={onDownload}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <ImageIcon className="w-5 h-5" />
                    导出 PNG 图片
                  </button>
                </div>
              </>
            ) : (
              <div className={cn(
                "flex flex-col items-center justify-center rounded-2xl w-[420px] h-[420px]",
                isDarkMode ? "bg-[#3a3a3c] text-slate-400" : "bg-[#E5E5EA] text-[#8E8E93]"
              )}>
                <ImageIcon className="w-16 h-16 opacity-30 mb-3" />
                <p className="text-base">输入内容生成二维码</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
