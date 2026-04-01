import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useStore, DrawingPath } from '@/store/useStore';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    drawings, addDrawing, removeDrawing, updateDrawings,
    strokeColor, strokeWidth,
    mode, eraseRadius,
  } = useStore();

  const isDrawing = useRef(false);
  const currentPath = useRef<{ x: number; y: number }[]>([]);
  const drawingsRef = useRef(drawings);
  const eraseRadiusRef = useRef(eraseRadius);
  const rafRef = useRef<number | null>(null);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);

  useEffect(() => { drawingsRef.current = drawings; }, [drawings]);
  useEffect(() => { eraseRadiusRef.current = eraseRadius; }, [eraseRadius]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const path of drawings) {
      if (path.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    }
  }, [drawings]);

  useEffect(() => {
    redrawAll();
  }, [redrawAll]);

  const getPos = (e: MouseEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'nativeEvent' in e ? (e as React.MouseEvent).clientX : (e as MouseEvent).clientX;
    const clientY = 'nativeEvent' in e ? (e as React.MouseEvent).clientY : (e as MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const applyAreaErase = useCallback((cursorX: number, cursorY: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = eraseRadiusRef.current;
      const r2 = r * r;
      const updated = drawingsRef.current
        .map(path => ({
          ...path,
          points: path.points.filter(p => {
            const dx = p.x - cursorX;
            const dy = p.y - cursorY;
            return dx * dx + dy * dy > r2;
          })
        }))
        .filter(path => path.points.length >= 2);
      updateDrawings(updated);
    });
  }, [updateDrawings]);

  const applyLineErase = useCallback((cursorX: number, cursorY: number) => {
    const threshold = 12;
    let minDist = Infinity;
    let nearestId: string | null = null;

    for (const path of drawingsRef.current) {
      for (let i = 0; i < path.points.length - 1; i++) {
        const d = pointToSegmentDist(
          cursorX, cursorY,
          path.points[i].x, path.points[i].y,
          path.points[i + 1].x, path.points[i + 1].y
        );
        if (d < minDist) {
          minDist = d;
          nearestId = path.id;
        }
      }
    }

    if (nearestId && minDist <= threshold) {
      removeDrawing(nearestId);
    }
  }, [removeDrawing]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);

    if (mode === 'draw') {
      isDrawing.current = true;
      currentPath.current = [pos];
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    } else if (mode === 'erase-area') {
      isDrawing.current = true;
      applyAreaErase(pos.x, pos.y);
    } else if (mode === 'erase-line') {
      applyLineErase(pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);

    if (mode === 'erase-area') {
      setCursorPos(pos);
      if (isDrawing.current) {
        applyAreaErase(pos.x, pos.y);
      }
      return;
    }

    if (mode === 'erase-line') {
      setCursorPos(pos);
      return;
    }

    if (!isDrawing.current || mode !== 'draw') return;

    currentPath.current.push(pos);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (mode === 'draw') {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      if (currentPath.current.length > 1) {
        const newPath: DrawingPath = {
          id: crypto.randomUUID(),
          points: [...currentPath.current],
          color: strokeColor,
          width: strokeWidth,
        };
        addDrawing(newPath);
      }
      currentPath.current = [];
    } else if (mode === 'erase-area') {
      isDrawing.current = false;
    }
  };

  const handleMouseLeave = () => {
    setCursorVisible(false);
    if (isDrawing.current) handleMouseUp();
  };

  const handleMouseEnter = () => {
    if (mode === 'erase-area' || mode === 'erase-line') {
      setCursorVisible(true);
    }
  };

  const getCursor = () => {
    if (mode === 'draw') return 'crosshair';
    if (mode === 'erase-area') return 'none';
    if (mode === 'erase-line') return 'pointer';
    return 'default';
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: getCursor(),
          zIndex: 20,
          pointerEvents: 'all',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        data-testid="drawing-canvas"
      />
      {mode === 'erase-area' && cursorVisible && (
        <div
          style={{
            position: 'absolute',
            left: cursorPos.x - eraseRadius,
            top: cursorPos.y - eraseRadius,
            width: eraseRadius * 2,
            height: eraseRadius * 2,
            borderRadius: '50%',
            border: '2px solid rgba(239,68,68,0.7)',
            backgroundColor: 'rgba(239,68,68,0.08)',
            pointerEvents: 'none',
            zIndex: 21,
          }}
        />
      )}
    </>
  );
};
