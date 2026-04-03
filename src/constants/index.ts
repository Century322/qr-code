import type { StyleOption } from '../types';

export const DOT_STYLES: StyleOption[] = [
  { id: 'square', label: '方形' },
  { id: 'circle', label: '圆形' },
  { id: 'rounded', label: '圆角' },
  { id: 'diamond', label: '菱形' },
  { id: 'star', label: '星星' },
  { id: 'heart', label: '爱心' },
  { id: 'leaf', label: '叶子' }
];

export const EYE_OUTER_STYLES: StyleOption[] = [
  { id: 'square', label: '方形' },
  { id: 'circle', label: '圆形' },
  { id: 'rounded', label: '圆角' },
  { id: 'diamond', label: '菱形' },
  { id: 'leaf', label: '叶子' }
];

export const EYE_INNER_STYLES: StyleOption[] = [
  { id: 'square', label: '方形' },
  { id: 'circle', label: '圆形' },
  { id: 'rounded', label: '圆角' },
  { id: 'diamond', label: '菱形' },
  { id: 'star', label: '星星' },
  { id: 'leaf', label: '叶子' }
];

export const PRESET_COLORS = [
  '#4f46e5', '#7c3aed', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#1f2937',
  '#000000', '#ffffff'
];

export const STORAGE_KEY = 'qr-generator-settings';

export const CAMO_WIDTH = 50;
export const CAMO_HEIGHT = 50;
export const CAMO_MARGIN = 0;
