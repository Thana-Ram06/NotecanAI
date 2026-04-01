import React, { useRef } from 'react';
import { useStore } from '@/store/useStore';
import { BlockComponent } from './Block';
import { DrawingCanvas } from './DrawingCanvas';

const CANVAS_WIDTH = 5000;
const CANVAS_HEIGHT = 5000;

interface CanvasProps {
  improvingBlockId: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ improvingBlockId }) => {
  const { blocks, selectedBlockIds, selectBlock, mode } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      selectBlock(null);
    }
  };

  const isDrawMode = mode === 'draw';

  return (
    <div
      className="w-full h-full overflow-auto bg-background flex-1 relative"
      data-testid="canvas-container"
    >
      <div
        ref={containerRef}
        className="dot-pattern relative"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        onMouseDown={handleCanvasClick}
        data-testid="canvas-surface"
      >
        {blocks.map(block => (
          <BlockComponent
            key={block.id}
            block={block}
            isSelected={selectedBlockIds.includes(block.id)}
            isImproving={block.id === improvingBlockId}
            disabled={isDrawMode}
          />
        ))}

        {isDrawMode && (
          <DrawingCanvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        )}
      </div>
    </div>
  );
};
