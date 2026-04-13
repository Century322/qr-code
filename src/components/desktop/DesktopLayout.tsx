import React from 'react';
import { Image as ImageIcon, LayoutGrid, Moon, Sun } from 'lucide-react';
import { cn } from '../../utils';
import { DOT_STYLES, EYE_OUTER_STYLES, EYE_INNER_STYLES } from '../../constants';
import { ColorPicker, GradientTypeSelector } from '../shared';
import type { QRMatrix } from '../../types';
import type { Settings } from '../../hooks/useSettings';

interface DesktopLayoutProps {
  settings: Settings;
  matrix: QRMatrix | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDownload: () => void;
  onThemeChange: (isDark: boolean) => void;
}

export function DesktopLayout({ settings, matrix, canvasRef, onDownload, onThemeChange }: DesktopLayoutProps) {
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
    isDarkMode,
  } = settings;

  return (
    <div className={cn(
      "h-screen font-sans flex overflow-hidden",
      isDarkMode ? "bg-[#1c1c1e] text-white" : "bg-[#F2F2F7] text-[#1C1C1E]"
    )}>
      <aside className={cn(
        "w-[380px] h-screen flex-shrink-0 overflow-y-auto scrollbar-thin",
        isDarkMode ? "bg-[#1c1c1e] border-r border-[#3a3a3c]" : "bg-[#F2F2F7] border-r border-[#E5E5EA]"
      )}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn("text-2xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-[#1C1C1E]")}>QR code</h1>
              <p className={cn("mt-1 text-sm", isDarkMode ? "text-slate-400" : "text-[#8E8E93]")}>支持全局渐变、自定义矢量图标拼接、独立定位眼设计。</p>
            </div>
            <button
              onClick={() => onThemeChange(!isDarkMode)}
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
