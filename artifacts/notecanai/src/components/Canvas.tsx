import React, { useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { BlockComponent } from './Block';

interface CanvasProps {
  improvingBlockId: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ improvingBlockId }) => {
  const { blocks, selectedBlockIds, selectBlock } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If we click directly on the canvas, deselect blocks
    if (e.target === containerRef.current) {
      selectBlock(null);
    }
  };

  return (
    <div 
      className="w-full h-full overflow-auto bg-background flex-1 relative"
      data-testid="canvas-container"
    >
      <div 
        ref={containerRef}
        className="w-[5000px] h-[5000px] dot-pattern relative overflow-hidden"
        onMouseDown={handleCanvasClick}
        data-testid="canvas-surface"
      >
        {blocks.map(block => (
          <BlockComponent 
            key={block.id} 
            block={block} 
            isSelected={selectedBlockIds.includes(block.id)}
            isImproving={block.id === improvingBlockId}
          />
        ))}
      </div>
    </div>
  );
};
