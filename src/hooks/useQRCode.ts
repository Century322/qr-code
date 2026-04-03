import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import type { QRMatrix } from '../types';
import { CAMO_WIDTH, CAMO_HEIGHT, CAMO_MARGIN } from '../constants';
import { random } from '../utils';

export function useQRCode(settings: {
  text: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
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
}) {
  const [matrix, setMatrix] = useState<QRMatrix | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    text,
    errorCorrection,
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
  } = settings;

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

  const getDotStyleForPosition = useCallback((x: number, y: number) => {
    if (selectedDots.length === 0) return 'square';
    const index = Math.abs(x * 13 + y * 31) % selectedDots.length;
    return selectedDots[index];
  }, [selectedDots]);

  const isEye = useCallback((x: number, y: number, size: number) => {
    return (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  }, []);

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
    const width = enableCamo ? CAMO_WIDTH : matrix.size + padding * 2;
    const height = enableCamo ? CAMO_HEIGHT : matrix.size + padding * 2;
    
    canvas.width = width * scale;
    canvas.height = height * scale;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = matrix.size;
    
    const offsetX = enableCamo ? Math.floor((CAMO_WIDTH - size) / 2) * scale : padding * scale;
    const offsetY = enableCamo ? Math.floor((CAMO_HEIGHT - size) / 2) * scale : padding * scale;

    let gradient: CanvasGradient | null = null;
    if (colorMode === 'gradient') {
      if (gradientType === 'linear') {
        gradient = ctx.createLinearGradient(-offsetX, -offsetY, canvas.width - offsetX, canvas.height - offsetY);
      } else {
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
      const gap = 0.5;

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

    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    const qrCenterX = (size * scale) / 2;
    const qrCenterY = (size * scale) / 2;
    
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
          } else if (isTopRight) {
            if (!eyeDrawn.topRight) {
              drawEyeOuter(size - 7, 0, fill);
              drawEyeInner(size - 7, 0, fill);
              eyeDrawn.topRight = true;
            }
          } else if (isBottomLeft) {
            if (!eyeDrawn.bottomLeft) {
              drawEyeOuter(0, size - 7, fill);
              drawEyeInner(0, size - 7, fill);
              eyeDrawn.bottomLeft = true;
            }
          } else {
            drawDot(x, y, fill);
          }
        }
      }
    }

    if (enableCamo) {
      const qrDensity = matrix.data.filter(d => d === 1).length / matrix.data.length;
      
      const camoOffsetX = Math.floor((CAMO_WIDTH - size) / 2);
      const camoOffsetY = Math.floor((CAMO_HEIGHT - size) / 2);

      const canvasLeft = -camoOffsetX;
      const canvasRight = -camoOffsetX + CAMO_WIDTH;
      const canvasTop = -camoOffsetY;
      const canvasBottom = -camoOffsetY + CAMO_HEIGHT;

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

      const margin = CAMO_MARGIN;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          if (x >= -margin && x < size + margin && y >= -margin && y < size + margin) {
            continue;
          }

          const r = random(camoSeed + x * 1000 + y);
          if (r < qrDensity) {
            drawDot(x, y, getCamoFill());
          }
        }
      }
    }
    
    ctx.restore();
  }, [matrix, colorMode, fgColor, fgColor2, bgColor, selectedDots, eyeOuterStyle, eyeInnerStyle, enableCamo, camoSeed, qrScale, gradientType, getDotStyleForPosition]);

  const handleDownloadPNG = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const pngFile = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngFile;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    matrix,
    canvasRef,
    isEye,
    getDotStyleForPosition,
    handleDownloadPNG,
  };
}
