import React, { useState, useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import { useQRCode } from './hooks/useQRCode';
import { MobileLayout } from './components/mobile';
import { DesktopLayout } from './components/desktop';
import { ThemeTransitionOverlay } from './components/shared/ThemeTransitionOverlay';

const MOBILE_BREAKPOINT = 1024;

function App() {
  const settings = useSettings();
  const [isMobile, setIsMobile] = useState(false);
  const [themeTransition, setThemeTransition] = useState<'none' | 'exit'>('none');
  const [prevTheme, setPrevTheme] = useState<boolean | null>(null);

  const { matrix, canvasRef, handleDownloadPNG } = useQRCode({
    text: settings.text,
    errorCorrection: settings.errorCorrection,
    colorMode: settings.colorMode,
    gradientType: settings.gradientType,
    fgColor: settings.fgColor,
    fgColor2: settings.fgColor2,
    bgColor: settings.bgColor,
    selectedDots: settings.selectedDots,
    eyeOuterStyle: settings.eyeOuterStyle,
    eyeInnerStyle: settings.eyeInnerStyle,
    enableCamo: settings.enableCamo,
    camoSeed: settings.camoSeed,
    qrScale: settings.qrScale,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleThemeChange = (newTheme: boolean) => {
    if (newTheme === settings.isDarkMode || themeTransition !== 'none') return;
    
    setPrevTheme(settings.isDarkMode);
    settings.setIsDarkMode(newTheme);
    setThemeTransition('exit');
    
    setTimeout(() => {
      setThemeTransition('none');
      setPrevTheme(null);
    }, 400);
  };

  return (
    <>
      {themeTransition === 'exit' && prevTheme !== null && (
        <ThemeTransitionOverlay 
          isDarkMode={settings.isDarkMode}
          prevTheme={prevTheme}
          onAnimationEnd={() => setThemeTransition('none')}
        />
      )}
      <div 
        style={{
          animation: themeTransition === 'exit' ? 'themeSlideIn 0.4s ease-out forwards' : undefined
        }}
      >
        {isMobile ? (
          <MobileLayout 
            settings={settings}
            matrix={matrix}
            canvasRef={canvasRef}
            onDownload={handleDownloadPNG}
            onThemeChange={handleThemeChange}
          />
        ) : (
          <DesktopLayout 
            settings={settings}
            matrix={matrix}
            canvasRef={canvasRef}
            onDownload={handleDownloadPNG}
            onThemeChange={handleThemeChange}
          />
        )}
      </div>
    </>
  );
}

export default App;
