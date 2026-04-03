import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function random(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
