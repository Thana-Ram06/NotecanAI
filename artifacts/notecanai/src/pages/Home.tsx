import React, { useState, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { AIModal } from '@/components/AIModal';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  const { addBlock, updateBlock, setBlocks, blocks } = useStore();
  const { toast } = useToast();
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [improvingBlockId, setImprovingBlockId] = useState<string | null>(null);

  // Initialize canvas scroll to middle
  useEffect(() => {
    // Scroll to middle of the 5000x5000 canvas
    window.scrollTo({
      left: 2500 - window.innerWidth / 2,
      top: 2500 - window.innerHeight / 2,
      behavior: 'instant'
    });
  }, []);

  const getViewportCenter = () => {
    return {
      x: window.scrollX + window.innerWidth / 2,
      y: window.scrollY + window.innerHeight / 2
    };
  };

  const handleGenerateNote = async (prompt: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error('Failed to generate note');
      
      const data = await res.json();
      const center = getViewportCenter();
      
      addBlock({
        type: 'text',
        content: data.content,
        x: center.x,
        y: center.y,
        color: '#ffffff',
        font: 'inter'
      });
      
      toast({ title: "Note generated successfully" });
    } catch (error) {
      toast({ title: "Failed to generate note", variant: "destructive" });
      throw error;
    }
  };

  const handleImproveNote = async (blockId: string, content: string) => {
    setImprovingBlockId(blockId);
    try {
      const res = await fetch(`${BASE_URL}/api/ai/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to improve note');
      
      const data = await res.json();
      updateBlock(blockId, { content: data.content });
      
      toast({ title: "Note improved successfully" });
    } catch (error) {
      toast({ title: "Failed to improve note", variant: "destructive" });
    } finally {
      setImprovingBlockId(null);
    }
  };

  const handleGenerateDiagram = async (prompt: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/ai/diagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error('Failed to generate diagram');
      
      const data = await res.json();
      const newBlocks = data.blocks || [];
      
      const center = getViewportCenter();
      
      // Offset generated diagram blocks to appear at viewport center
      const offsetX = center.x - (newBlocks[0]?.x || 0);
      const offsetY = center.y - (newBlocks[0]?.y || 0);

      const adjustedBlocks = newBlocks.map((b: any) => ({
        ...b,
        id: crypto.randomUUID(), // ensure unique IDs
        x: b.x + offsetX,
        y: b.y + offsetY
      }));

      setBlocks([...blocks, ...adjustedBlocks]);
      toast({ title: "Diagram generated successfully" });
    } catch (error) {
      toast({ title: "Failed to generate diagram", variant: "destructive" });
      throw error;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col relative bg-background">
      <Toolbar 
        onGenerateNote={() => setIsNoteModalOpen(true)}
        onImproveNote={handleImproveNote}
        onGenerateDiagram={() => setIsDiagramModalOpen(true)}
        isImproving={!!improvingBlockId}
      />
      
      <Canvas improvingBlockId={improvingBlockId} />

      <AIModal 
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Generate Note with AI"
        description="Describe what you want the note to be about."
        onSubmit={handleGenerateNote}
      />

      <AIModal 
        isOpen={isDiagramModalOpen}
        onClose={() => setIsDiagramModalOpen(false)}
        title="Generate Diagram with AI"
        description="Describe the flow, process, or concept you want to diagram."
        onSubmit={handleGenerateDiagram}
      />
    </div>
  );
}
