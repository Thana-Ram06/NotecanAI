import type { Block, DrawingPath } from '@/store/useStore';

export function exportAsPNG(blocks: Block[], drawings: DrawingPath[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const block of blocks) {
    const w = block.width ?? 200;
    const h = block.height ?? 80;
    minX = Math.min(minX, block.x);
    minY = Math.min(minY, block.y);
    maxX = Math.max(maxX, block.x + w);
    maxY = Math.max(maxY, block.y + h);
  }

  for (const path of drawings) {
    for (const pt of path.points) {
      minX = Math.min(minX, pt.x);
      minY = Math.min(minY, pt.y);
      maxX = Math.max(maxX, pt.x);
      maxY = Math.max(maxY, pt.y);
    }
  }

  if (minX === Infinity) return;

  const pad = 60;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const width = Math.max(maxX - minX, 200);
  const height = Math.max(maxY - minY, 200);

  const cvs = document.createElement('canvas');
  cvs.width = width;
  cvs.height = height;
  const ctx = cvs.getContext('2d')!;

  // Background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);

  // Dot grid
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  const step = 24;
  for (let x = step; x < width; x += step) {
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw blocks
  for (const block of blocks) {
    const x = block.x - minX;
    const y = block.y - minY;
    const w = block.width ?? 200;
    const h = block.height ?? 80;
    const r = 8;

    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = block.color || '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;

    if (block.type === 'circle') {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Text content
    if (block.content) {
      ctx.fillStyle = '#1a1a1a';
      ctx.font = '13px Inter, system-ui, sans-serif';
      const lines = block.content.split('\n').slice(0, 6);
      const lineH = 18;
      const startY = y + 20;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].length > 36 ? lines[i].slice(0, 35) + '…' : lines[i];
        ctx.fillText(line, x + 12, startY + i * lineH);
      }
    }
  }

  // Draw strokes
  for (const path of drawings) {
    if (path.points.length < 2) continue;
    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(path.points[0].x - minX, path.points[0].y - minY);
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x - minX, path.points[i].y - minY);
    }
    ctx.stroke();
  }

  const link = document.createElement('a');
  link.download = `notecanai-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = cvs.toDataURL('image/png');
  link.click();
}

export function exportAsJSON(blocks: Block[], drawings: DrawingPath[]) {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    blocks,
    drawings,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `notecanai-${new Date().toISOString().slice(0, 10)}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
