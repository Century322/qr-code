import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { STORAGE_KEY } from '../constants';

const defaultSettings: AppSettings = {
  text: '',
  colorMode: 'gradient',
  gradientType: 'linear',
  fgColor: '#4f46e5',
  fgColor2: '#ec4899',
  bgColor: '#ffffff',
  selectedDots: ['rounded', 'star'],
  eyeOuterStyle: 'rounded',
  eyeInnerStyle: 'star',
  enableCamo: false,
  camoSeed: 1,
  qrScale: 1,
  errorCorrection: 'H',
  isDarkMode: false,
};

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function useSettings() {
  const savedSettings = loadSettings();
  
  const [text, setText] = useState(savedSettings.text);
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>(savedSettings.colorMode);
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>(savedSettings.gradientType);
  const [fgColor, setFgColor] = useState(savedSettings.fgColor);
  const [fgColor2, setFgColor2] = useState(savedSettings.fgColor2);
  const [bgColor, setBgColor] = useState(savedSettings.bgColor);
  const [selectedDots, setSelectedDots] = useState<string[]>(savedSettings.selectedDots);
  const [eyeOuterStyle, setEyeOuterStyle] = useState(savedSettings.eyeOuterStyle);
  const [eyeInnerStyle, setEyeInnerStyle] = useState(savedSettings.eyeInnerStyle);
  const [enableCamo, setEnableCamo] = useState(savedSettings.enableCamo);
  const [camoSeed, setCamoSeed] = useState(savedSettings.camoSeed);
  const [qrScale, setQrScale] = useState(Math.max(0.4, savedSettings.qrScale));
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>(savedSettings.errorCorrection);
  const [isDarkMode, setIsDarkMode] = useState(savedSettings.isDarkMode);

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

  const toggleDotStyle = (id: string) => {
    setSelectedDots(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(s => s !== id);
        return next.length > 0 ? next : ['square'];
      }
      return [...prev, id];
    });
  };

  return {
    text, setText,
    colorMode, setColorMode,
    gradientType, setGradientType,
    fgColor, setFgColor,
    fgColor2, setFgColor2,
    bgColor, setBgColor,
    selectedDots, setSelectedDots, toggleDotStyle,
    eyeOuterStyle, setEyeOuterStyle,
    eyeInnerStyle, setEyeInnerStyle,
    enableCamo, setEnableCamo,
    camoSeed, setCamoSeed,
    qrScale, setQrScale,
    errorCorrection, setErrorCorrection,
    isDarkMode, setIsDarkMode,
  };
}

export type Settings = ReturnType<typeof useSettings>;
