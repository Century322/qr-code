import React from 'react';

export interface QRMatrix {
  size: number;
  data: number[];
}

export interface AppSettings {
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

export interface StyleOption {
  id: string;
  label: string;
}
