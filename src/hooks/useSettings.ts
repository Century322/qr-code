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
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
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
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const text = settings.text;
  const colorMode = settings.colorMode;
  const gradientType = settings.gradientType;
  const fgColor = settings.fgColor;
  const fgColor2 = settings.fgColor2;
  const bgColor = settings.bgColor;
  const selectedDots = settings.selectedDots;
  const eyeOuterStyle = settings.eyeOuterStyle;
  const eyeInnerStyle = settings.eyeInnerStyle;
  const enableCamo = settings.enableCamo;
  const camoSeed = settings.camoSeed;
  const qrScale = settings.qrScale;
  const errorCorrection = settings.errorCorrection;
  const isDarkMode = settings.isDarkMode;

  const setText = (v: string) => setSettings(s => ({ ...s, text: v }));
  const setColorMode = (v: 'solid' | 'gradient') => setSettings(s => ({ ...s, colorMode: v }));
  const setGradientType = (v: 'linear' | 'radial') => setSettings(s => ({ ...s, gradientType: v }));
  const setFgColor = (v: string) => setSettings(s => ({ ...s, fgColor: v }));
  const setFgColor2 = (v: string) => setSettings(s => ({ ...s, fgColor2: v }));
  const setBgColor = (v: string) => setSettings(s => ({ ...s, bgColor: v }));
  const setSelectedDots = (v: string[]) => setSettings(s => ({ ...s, selectedDots: v }));
  const setEyeOuterStyle = (v: string) => setSettings(s => ({ ...s, eyeOuterStyle: v }));
  const setEyeInnerStyle = (v: string) => setSettings(s => ({ ...s, eyeInnerStyle: v }));
  const setEnableCamo = (v: boolean) => setSettings(s => ({ ...s, enableCamo: v }));
  const setCamoSeed = (v: number) => setSettings(s => ({ ...s, camoSeed: v }));
  const setQrScale = (v: number) => setSettings(s => ({ ...s, qrScale: Math.max(0.4, v) }));
  const setErrorCorrection = (v: 'L' | 'M' | 'Q' | 'H') => setSettings(s => ({ ...s, errorCorrection: v }));
  const setIsDarkMode = (v: boolean) => setSettings(s => ({ ...s, isDarkMode: v }));

  const toggleDotStyle = (id: string) => {
    setSettings(s => {
      const prev = s.selectedDots;
      const next = prev.includes(id) ? prev.filter(st => st !== id) : [...prev, id];
      return { ...s, selectedDots: next.length > 0 ? next : ['square'] };
    });
  };

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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
