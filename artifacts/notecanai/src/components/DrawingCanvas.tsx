import React, { useRef, useEffect, useCallback } from 'react';
import { useStore, DrawingPath } from '@/store/useStore';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { drawings, addDrawing, strokeColor, strokeWidth } = useStore();
  const isDrawing = useRef(false);
  const currentPath = useRef<{ x: number; y: number }[]>([]);

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

  const getPos = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e.nativeEvent, canvas);
    currentPath.current = [pos];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e.nativeEvent, canvas);
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
  };

  const handleMouseLeave = () => {
    if (isDrawing.current) {
      handleMouseUp();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'crosshair',
        zIndex: 20,
        pointerEvents: 'all',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      data-testid="drawing-canvas"
    />
  );
};
