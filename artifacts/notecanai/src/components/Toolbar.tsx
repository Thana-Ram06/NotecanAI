import React from 'react';
import { useStore } from '@/store/useStore';
import { Type, Square, Circle, Trash2, Wand2, Moon, Sun, Loader2, Pencil, MousePointer, Eraser, Paintbrush, ScanLine, Download, FileImage, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import { exportAsPNG, exportAsJSON } from '@/lib/export';

const BLOCK_COLORS = [
  '#ffffff', '#f8f9fa', '#f1f5f9', '#e2e8f0',
  '#fecaca', '#fef08a', '#d9f99d', '#bbf7d0',
  '#a5f3fc', '#bfdbfe', '#e9d5ff', '#fbcfe8'
];

const STROKE_COLORS = [
  '#1a1a1a', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ffffff', '#94a3b8'
];

const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12];
const ERASE_SIZES = [10, 20, 35, 55, 80];

const FONTS = [
  { key: 'inter', label: 'Inter', style: { fontFamily: 'Inter, sans-serif' } },
  { key: 'serif', label: 'Serif', style: { fontFamily: 'Georgia, serif' } },
  { key: 'mono', label: 'Mono', style: { fontFamily: 'Menlo, monospace' } },
  { key: 'patrick-hand', label: 'Patrick Hand', style: { fontFamily: "'Patrick Hand', cursive" } },
  { key: 'caveat', label: 'Caveat', style: { fontFamily: "'Caveat', cursive" } },
  { key: 'indie-flower', label: 'Indie Flower', style: { fontFamily: "'Indie Flower', cursive" } },
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
  const {
    blocks, drawings, selectedBlockIds, addBlock, updateBlock, removeBlock,
    mode, setMode, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth,
    clearDrawings, eraseRadius, setEraseRadius
  } = useStore();

  const selectedBlock = selectedBlockIds.length > 0
    ? blocks.find(b => b.id === selectedBlockIds[0])
    : null;

  const isDrawMode = mode === 'draw';
  const isEraseMode = mode === 'erase-area' || mode === 'erase-line';

  const handleAddBlock = (type: "text" | "rectangle" | "circle") => {
    if (mode !== 'select') setMode('select');
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

  const currentFontLabel = FONTS.find(f => f.key === selectedBlock?.font)?.label ?? 'Inter';

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md border rounded-full px-4 py-2 shadow-sm flex items-center gap-3 z-50 transition-all"
      data-testid="toolbar"
    >
      {/* Brand */}
      <span className="font-semibold text-sm select-none mr-1">NoteCanAI</span>

      {/* Mode toggle */}
      <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full w-7 h-7", mode === 'select' && "bg-background shadow-sm")}
          onClick={() => setMode('select')}
          title="Select mode"
          data-testid="mode-select"
        >
          <MousePointer className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full w-7 h-7", isDrawMode && "bg-background shadow-sm")}
          onClick={() => setMode('draw')}
          title="Draw mode"
          data-testid="mode-draw"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>

        {/* Eraser mode dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-full w-7 h-7", isEraseMode && "bg-background shadow-sm")}
              title="Eraser tools"
              data-testid="mode-erase"
            >
              <Eraser className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem
              onClick={() => setMode('erase-area')}
              className={cn("gap-2", mode === 'erase-area' && "bg-accent")}
              data-testid="erase-area"
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Area Eraser
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setMode('erase-line')}
              className={cn("gap-2", mode === 'erase-line' && "bg-accent")}
              data-testid="erase-line"
            >
              <ScanLine className="w-3.5 h-3.5" />
              Line Eraser
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={clearDrawings}
              className="gap-2 text-destructive focus:text-destructive"
              data-testid="clear-drawings"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Block creation tools */}
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => handleAddBlock('text')} title="Add text note" data-testid="add-text">
          <Type className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => handleAddBlock('rectangle')} title="Add rectangle" data-testid="add-rect">
          <Square className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => handleAddBlock('circle')} title="Add circle" data-testid="add-circle">
          <Circle className="w-4 h-4" />
        </Button>
      </div>

      {/* Draw mode controls */}
      {isDrawMode && (
        <>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            {/* Stroke color */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-full px-2" title="Stroke color" data-testid="stroke-color-picker">
                  <div className="w-5 h-5 rounded-full border-2 border-border shadow-sm" style={{ backgroundColor: strokeColor }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2 flex gap-1 flex-wrap w-40">
                {STROKE_COLORS.map(c => (
                  <button
                    key={c}
                    className={cn("w-6 h-6 rounded-full border hover:scale-110 transition-transform", c === strokeColor && "ring-2 ring-primary ring-offset-1")}
                    style={{ backgroundColor: c }}
                    onClick={() => setStrokeColor(c)}
                    data-testid={`stroke-color-${c}`}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Stroke width */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 gap-1" title="Stroke width" data-testid="stroke-width-picker">
                  <div className="flex items-center justify-center w-5">
                    <div className="w-4 rounded-full bg-foreground" style={{ height: Math.min(strokeWidth, 8) }} />
                  </div>
                  <span className="text-xs">{strokeWidth}px</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2 w-28">
                {STROKE_WIDTHS.map(w => (
                  <DropdownMenuItem key={w} className="flex items-center gap-3" onClick={() => setStrokeWidth(w)} data-testid={`stroke-width-${w}`}>
                    <div className="w-12 rounded-full bg-foreground" style={{ height: Math.min(w, 10) }} />
                    <span className="text-xs">{w}px</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      {/* Erase mode controls */}
      {isEraseMode && (
        <>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            {mode === 'erase-area' ? (
              <>
                <span className="text-xs text-muted-foreground">Size:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 gap-1" title="Eraser size" data-testid="erase-size-picker">
                      <Eraser className="w-3.5 h-3.5" />
                      <span className="text-xs">{eraseRadius * 2}px</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="p-2 w-32">
                    {ERASE_SIZES.map(r => (
                      <DropdownMenuItem
                        key={r}
                        className={cn("flex items-center gap-2", eraseRadius === r && "bg-accent")}
                        onClick={() => setEraseRadius(r)}
                        data-testid={`erase-size-${r}`}
                      >
                        <div
                          className="rounded-full bg-foreground/30 border border-foreground/20 shrink-0"
                          style={{ width: Math.min(r, 32), height: Math.min(r, 32) }}
                        />
                        <span className="text-xs">{r * 2}px</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Click a stroke to erase it</span>
            )}
          </div>
        </>
      )}

      {/* Block styling (select mode with selected block) */}
      {mode === 'select' && selectedBlock && (
        <>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1.5">
            {/* Color picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-full px-2" data-testid="block-color-picker">
                  <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: selectedBlock.color }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2 flex gap-1 flex-wrap w-40">
                {BLOCK_COLORS.map(c => (
                  <button
                    key={c}
                    className={cn("w-6 h-6 rounded-full border hover:scale-110 transition-transform", selectedBlock.color === c && "ring-2 ring-primary ring-offset-1")}
                    style={{ backgroundColor: c }}
                    onClick={() => updateBlock(selectedBlock.id, { color: c })}
                    data-testid={`block-color-${c}`}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-sm" data-testid="font-picker">
                  {currentFontLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {FONTS.map(f => (
                  <DropdownMenuItem
                    key={f.key}
                    style={f.style}
                    onClick={() => updateBlock(selectedBlock.id, { font: f.key })}
                    data-testid={`font-${f.key}`}
                  >
                    {f.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-8 h-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => removeBlock(selectedBlock.id)}
              data-testid="delete-block"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      <div className="w-px h-5 bg-border" />

      {/* Download */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" title="Download / Export" data-testid="download-menu">
            <Download className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            className="gap-2"
            onClick={() => exportAsPNG(blocks, drawings)}
            data-testid="export-png"
          >
            <FileImage className="w-3.5 h-3.5" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => exportAsJSON(blocks, drawings)}
            data-testid="export-json"
          >
            <FileJson className="w-3.5 h-3.5" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AI & theme */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-8 gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10" data-testid="ai-menu">
              <Wand2 className="w-3.5 h-3.5 text-primary" />
              <span>AI</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onGenerateNote} data-testid="ai-generate">Generate Note</DropdownMenuItem>
            <DropdownMenuItem
              disabled={!selectedBlock || selectedBlock.type !== 'text' || !selectedBlock.content || isImproving}
              onClick={() => {
                if (selectedBlock?.type === 'text' && selectedBlock.content) {
                  onImproveNote(selectedBlock.id, selectedBlock.content);
                }
              }}
              data-testid="ai-improve"
            >
              {isImproving ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
              Improve Selected Note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onGenerateDiagram} data-testid="ai-diagram">Generate Diagram</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 ml-1"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-testid="theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
