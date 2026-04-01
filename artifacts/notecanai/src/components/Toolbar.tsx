import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Type, Square, Circle, Trash2, Wand2, Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ui/theme-provider';

const COLORS = [
  '#ffffff', '#f8f9fa', '#f1f5f9', '#e2e8f0', 
  '#fecaca', '#fef08a', '#d9f99d', '#bbf7d0', 
  '#a5f3fc', '#bfdbfe', '#e9d5ff', '#fbcfe8'
];

interface ToolbarProps {
  onGenerateNote: () => void;
  onImproveNote: (blockId: string, content: string) => void;
  onGenerateDiagram: () => void;
  isImproving: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onGenerateNote, 
  onImproveNote, 
  onGenerateDiagram,
  isImproving 
}) => {
  const { theme, setTheme } = useTheme();
  const { blocks, selectedBlockIds, addBlock, updateBlock, removeBlock } = useStore();
  
  const selectedBlock = selectedBlockIds.length > 0 
    ? blocks.find(b => b.id === selectedBlockIds[0]) 
    : null;

  const handleAddBlock = (type: "text" | "rectangle" | "circle") => {
    // Determine center of current viewport
    const x = window.scrollX + window.innerWidth / 2;
    const y = window.scrollY + window.innerHeight / 2;
    
    addBlock({
      type,
      x,
      y,
      width: type !== 'text' ? 160 : undefined,
      height: type !== 'text' ? 100 : undefined,
      color: '#ffffff',
      font: 'inter',
      content: type === 'text' ? '' : undefined
    });
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md border rounded-full px-4 py-2 shadow-sm flex items-center gap-4 z-50 transition-all">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-sm mr-2 select-none">NoteCanAI</span>
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => handleAddBlock('text')} data-testid="add-text">
          <Type className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => handleAddBlock('rectangle')} data-testid="add-rect">
          <Square className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => handleAddBlock('circle')} data-testid="add-circle">
          <Circle className="w-4 h-4" />
        </Button>
      </div>

      {selectedBlock && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-full px-3">
                  <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: selectedBlock.color }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2 flex gap-1 flex-wrap w-40">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className="w-6 h-6 rounded-full border hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => updateBlock(selectedBlock.id, { color: c })}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 rounded-full font-medium">
                  {selectedBlock.font.charAt(0).toUpperCase() + selectedBlock.font.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="font-sans" onClick={() => updateBlock(selectedBlock.id, { font: 'inter' })}>Inter</DropdownMenuItem>
                <DropdownMenuItem className="font-serif" onClick={() => updateBlock(selectedBlock.id, { font: 'serif' })}>Serif</DropdownMenuItem>
                <DropdownMenuItem className="font-mono" onClick={() => updateBlock(selectedBlock.id, { font: 'mono' })}>Mono</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => removeBlock(selectedBlock.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      <div className="w-px h-6 bg-border mx-1" />
      
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-8 gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10">
              <Wand2 className="w-3.5 h-3.5 text-primary" />
              <span>AI</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onGenerateNote}>Generate Note</DropdownMenuItem>
            <DropdownMenuItem 
              disabled={!selectedBlock || selectedBlock.type !== 'text' || !selectedBlock.content || isImproving}
              onClick={() => {
                if (selectedBlock?.type === 'text' && selectedBlock.content) {
                  onImproveNote(selectedBlock.id, selectedBlock.content);
                }
              }}
            >
              {isImproving ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
              Improve Selected Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onGenerateDiagram}>Generate Diagram</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full w-8 h-8 ml-1" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
