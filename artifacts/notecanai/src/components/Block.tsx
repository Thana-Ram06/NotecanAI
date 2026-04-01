import React, { useRef, useEffect, useState } from 'react';
import { Block, useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface BlockProps {
  block: Block;
  isSelected: boolean;
  isImproving?: boolean;
}

export const BlockComponent: React.FC<BlockProps> = ({ block, isSelected, isImproving }) => {
  const { updateBlock, selectBlock } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: block.x, y: block.y });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    e.stopPropagation();
    selectBlock(block.id);
    
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: block.x, y: block.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = moveEvent.clientX - dragStart.current.x;
      const dy = moveEvent.clientY - dragStart.current.y;
      
      const newX = Math.max(0, initialPos.current.x + dx);
      const newY = Math.max(0, initialPos.current.y + dy);
      
      updateBlock(block.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeElementListener('mousemove', handleMouseMove);
      document.removeElementListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.focus();
        // Move cursor to end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  const handleContentBlur = () => {
    setIsEditing(false);
    if (contentEditableRef.current) {
      updateBlock(block.id, { content: contentEditableRef.current.textContent || '' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      contentEditableRef.current?.blur();
    }
  };

  const fontClass = {
    'inter': 'font-sans',
    'serif': 'font-serif',
    'mono': 'font-mono'
  }[block.font] || 'font-sans';

  const shapeClasses = {
    'text': 'p-4 min-w-[200px] min-h-[50px] bg-transparent',
    'rectangle': 'flex items-center justify-center p-4 rounded-md shadow-sm',
    'circle': 'flex items-center justify-center p-4 rounded-full shadow-sm'
  };

  const dynamicStyle: React.CSSProperties = {
    position: 'absolute',
    left: block.x,
    top: block.y,
    transform: 'translate(-50%, -50%)',
    backgroundColor: block.type !== 'text' ? block.color : undefined,
    color: block.type !== 'text' && block.color !== '#ffffff' ? '#ffffff' : 'inherit',
    width: block.type !== 'text' ? (block.width || 160) : undefined,
    height: block.type !== 'text' ? (block.height || 100) : undefined,
    zIndex: isSelected ? 10 : 1,
    cursor: isEditing ? 'text' : 'grab'
  };

  return (
    <div
      ref={blockRef}
      style={dynamicStyle}
      className={cn(
        shapeClasses[block.type],
        fontClass,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isImproving && "animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]",
        "transition-shadow duration-200"
      )}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      data-testid={`block-${block.type}-${block.id}`}
    >
      <div
        ref={contentEditableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleContentBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "outline-none max-w-full break-words",
          block.type !== 'text' ? "text-center w-full max-h-full overflow-hidden" : "w-full"
        )}
        data-placeholder={block.type === 'text' ? "Type something..." : ""}
        style={{ color: block.type !== 'text' ? (isDarkColor(block.color) ? '#ffffff' : '#000000') : 'inherit' }}
      >
        {block.content}
      </div>
    </div>
  );
};

// Helper to determine text color based on background
function isDarkColor(hex: string) {
  if (!hex) return false;
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128;
}
