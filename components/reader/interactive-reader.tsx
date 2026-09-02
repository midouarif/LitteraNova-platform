"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { saveReadingProgress, saveAnnotation, deleteAnnotation, updateAnnotation } from "@/app/actions/reader";
import { Button } from "@/components/ui/button";
import { Highlighter, MessageSquare, PenTool, Check, X, Edit, Trash } from "lucide-react";

type Annotation = {
  id: string;
  type: string;
  text_selection: string | null;
  start_offset: number | null;
  end_offset: number | null;
  note_content: string | null;
};

interface InteractiveReaderProps {
  workId: string;
  contentText: string;
  initialAnnotations: Annotation[];
  initialProgress: number;
}

export default function InteractiveReader({ workId, contentText: rawContentText, initialAnnotations, initialProgress }: InteractiveReaderProps) {
  const contentText = rawContentText.replace(/\r\n/g, '\n');
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Selection Toolbar State
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [currentSelection, setCurrentSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  
  // Note Input State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  
  // Existing Annotation Click State
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editNoteText, setEditNoteText] = useState("");
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Restore progress on mount
  useEffect(() => {
    if (initialProgress > 0 && containerRef.current) {
      const scrollContainer = containerRef.current.closest('.overflow-auto') || window;
      const isWindow = scrollContainer === window;
      
      const scrollHeight = isWindow ? document.documentElement.scrollHeight : (scrollContainer as HTMLElement).scrollHeight;
      const clientHeight = isWindow ? window.innerHeight : (scrollContainer as HTMLElement).clientHeight;
      
      const scrollY = (scrollHeight - clientHeight) * (initialProgress / 100);
      scrollContainer.scrollTo({ top: scrollY, behavior: "auto" });
    }
  }, [initialProgress]);

  // Track progress on scroll
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!containerRef.current) return;
    const scrollContainer = containerRef.current.closest('.overflow-auto') || window;
    const isWindow = scrollContainer === window;
    
    const handleScroll = (e: Event) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const target = isWindow ? document.documentElement : (e.target as HTMLElement);
        const scrollTop = isWindow ? window.scrollY : target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = isWindow ? window.innerHeight : target.clientHeight;
        
        const docHeight = scrollHeight - clientHeight;
        if (docHeight > 0) {
          const percentage = (scrollTop / docHeight) * 100;
          saveReadingProgress(workId, parseFloat(percentage.toFixed(2)));
        }
      }, 2000); // Debounce 2 seconds
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [workId]);

  // Handle Text Selection
  const handleMouseUp = () => {
    if (!containerRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setToolbarVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Check if selection is within our container
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setToolbarVisible(false);
      return;
    }

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    const start = preSelectionRange.toString().length;
    const text = range.toString();
    const end = start + text.length;

    setCurrentSelection({ start, end, text });
    setToolbarPos({
      top: rect.top - 50, // 50px above selection (viewport relative)
      left: rect.left + (rect.width / 2),
    });
    setToolbarVisible(true);
  };

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setToolbarVisible(false);
    setCurrentSelection(null);
    setIsAddingNote(false);
    setNoteText("");
    setActiveAnnotation(null);
    setIsEditingNote(false);
  };

  const handleHighlight = async () => {
    if (!currentSelection) return;
    const { start, end, text } = currentSelection;
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newAnnotation: Annotation = {
      id: tempId,
      type: "highlight",
      text_selection: text,
      start_offset: start,
      end_offset: end,
      note_content: null
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    clearSelection();
    
    // Save to DB
    const res = await saveAnnotation(workId, "highlight", text, start, end);
    if (res.success && res.annotation) {
      setAnnotations(prev => prev.map(a => a.id === tempId ? res.annotation as Annotation : a));
    } else {
      // Revert if error
      setAnnotations(prev => prev.filter(a => a.id !== tempId));
      alert("Erreur lors de l'enregistrement du surlignage.");
    }
  };

  const handleAddNote = async () => {
    if (!currentSelection || !noteText.trim()) return;
    const { start, end, text } = currentSelection;
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newAnnotation: Annotation = {
      id: tempId,
      type: "note",
      text_selection: text,
      start_offset: start,
      end_offset: end,
      note_content: noteText
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    clearSelection();
    
    // Save to DB
    const res = await saveAnnotation(workId, "note", text, start, end, noteText);
    if (res.success && res.annotation) {
      setAnnotations(prev => prev.map(a => a.id === tempId ? res.annotation as Annotation : a));
    } else {
      // Revert if error
      setAnnotations(prev => prev.filter(a => a.id !== tempId));
      alert("Erreur lors de l'enregistrement de la note.");
    }
  };

  const handleAnnotationClick = (e: React.MouseEvent, ann: Annotation) => {
    e.stopPropagation();
    clearSelection();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({
      top: rect.top, // We will translate Y -100% to push it above this rect
      left: rect.left + (rect.width / 2),
    });
    setActiveAnnotation(ann);
    setEditNoteText(ann.note_content || "");
    setIsEditingNote(false);
  };

  const handleUpdateNote = async () => {
    if (!activeAnnotation) return;
    
    // Optimistic
    setAnnotations(prev => prev.map(a => a.id === activeAnnotation.id ? { ...a, note_content: editNoteText } : a));
    setIsEditingNote(false);
    
    const res = await updateAnnotation(activeAnnotation.id, workId, editNoteText);
    if (!res.success) {
      alert("Erreur lors de la mise à jour de la note.");
    }
  };

  const handleDeleteAnnotation = async () => {
    if (!activeAnnotation) return;
    
    // Optimistic
    setAnnotations(prev => prev.filter(a => a.id !== activeAnnotation.id));
    setActiveAnnotation(null);
    
    const res = await deleteAnnotation(activeAnnotation.id, workId);
    if (!res.success) {
      alert("Erreur lors de la suppression.");
    }
  };

  // Render text with highlights
  const renderText = () => {
    if (annotations.length === 0) {
      return contentText;
    }

    // Sort annotations by start_offset
    const sorted = [...annotations]
      .filter(a => a.start_offset !== null && a.end_offset !== null)
      .sort((a, b) => (a.start_offset || 0) - (b.start_offset || 0));

    const nodes = [];
    let currentIndex = 0;

    for (let i = 0; i < sorted.length; i++) {
      const ann = sorted[i];
      if (ann.start_offset === null || ann.end_offset === null) continue;
      
      // Handle overlapping annotations (simplification: skip if it overlaps previous)
      if (ann.start_offset < currentIndex) continue;

      // Text before highlight
      if (ann.start_offset > currentIndex) {
        nodes.push(<span key={`text-${currentIndex}`}>{contentText.slice(currentIndex, ann.start_offset)}</span>);
      }

      // The highlight
      nodes.push(
        <mark 
          key={`mark-${ann.id}`} 
          onClick={(e) => handleAnnotationClick(e, ann)}
          className={`rounded px-1 -mx-1 cursor-pointer transition-colors ${
            ann.type === 'note' 
              ? 'bg-red-200 bg-opacity-40 hover:bg-opacity-60 border-b border-red-500 border-dashed' 
              : 'bg-yellow-200 bg-opacity-50 hover:bg-opacity-70'
          }`}
          title={ann.type === 'note' ? ann.note_content || '' : ''}
        >
          {contentText.slice(ann.start_offset, ann.end_offset)}
        </mark>
      );
      
      currentIndex = ann.end_offset;
    }

    // Remaining text
    if (currentIndex < contentText.length) {
      nodes.push(<span key={`text-end`}>{contentText.slice(currentIndex)}</span>);
    }

    return nodes;
  };

  return (
    <div className="relative font-serif text-lg leading-relaxed text-[var(--color-ink)]" onMouseUp={handleMouseUp}>
      {/* Floating Toolbar */}
      {toolbarVisible && (
        <div 
          className="fixed z-50 flex items-center gap-1 bg-[var(--color-ink)] text-white p-1 rounded-lg shadow-xl"
          style={{ 
            top: toolbarPos.top, 
            left: toolbarPos.left,
            transform: 'translateX(-50%)' // Center above selection
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent selection loss when clicking
          onMouseUp={(e) => e.stopPropagation()} // Prevent bubble to text container
        >
          {isAddingNote ? (
            <div className="flex items-center gap-2 px-2 py-1">
              <input 
                type="text"
                autoFocus
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNote();
                  if (e.key === 'Escape') setIsAddingNote(false);
                }}
                placeholder="Votre note..."
                className="bg-[var(--color-paper-card)] text-[var(--color-ink)] px-2 py-1 text-sm rounded border-none focus:outline-none focus:ring-1 focus:ring-[var(--color-garnet)] w-48 font-sans"
              />
              <button 
                className="flex items-center justify-center h-8 w-8 rounded text-white hover:bg-white/20 hover:text-green-400 transition-colors disabled:opacity-50" 
                onClick={handleAddNote} 
                disabled={!noteText.trim()}
              >
                <Check size={16} />
              </button>
              <button 
                className="flex items-center justify-center h-8 w-8 rounded text-white hover:bg-white/20 hover:text-red-400 transition-colors" 
                onClick={() => setIsAddingNote(false)}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <button className="flex items-center h-8 px-2 rounded text-sm text-white hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors font-sans" onClick={handleHighlight}>
                <Highlighter size={16} className="mr-2" />
                Surligner
              </button>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button className="flex items-center h-8 px-2 rounded text-sm text-white hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors font-sans" onClick={() => setIsAddingNote(true)}>
                <MessageSquare size={16} className="mr-2" />
                Note
              </button>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button className="flex items-center h-8 px-2 rounded text-sm text-white hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors font-sans" onClick={() => {
                const event = new CustomEvent('open-ai-assistant', { detail: { text: currentSelection?.text, offset: currentSelection?.start } });
                window.dispatchEvent(event);
                clearSelection();
              }}>
                <PenTool size={16} className="mr-2" />
                Assistant IA
              </button>
            </>
          )}
        </div>
      )}

      {/* Popover for Existing Annotation */}
      {activeAnnotation && (
        <div 
          className="fixed z-50 flex flex-col gap-2 bg-[var(--color-ink)] text-white p-2 rounded-lg shadow-xl min-w-[200px] max-w-[300px]"
          style={{ 
            top: popoverPos.top, 
            left: popoverPos.left,
            transform: 'translateX(-50%) translateY(-100%)', // Above the element entirely
            marginTop: '-10px' // Add a little gap
          }}
          onMouseDown={(e) => e.stopPropagation()} 
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono text-[var(--color-brass)] opacity-80 uppercase tracking-wider">
              {activeAnnotation.type === 'note' ? 'Note' : 'Surlignage'}
            </span>
            <div className="flex gap-1">
              {activeAnnotation.type === 'note' && (
                <button className="flex items-center justify-center h-6 w-6 rounded text-white hover:bg-white/20 hover:text-[var(--color-brass)] transition-colors" onClick={() => setIsEditingNote(!isEditingNote)}>
                  <Edit size={14} />
                </button>
              )}
              <button className="flex items-center justify-center h-6 w-6 rounded text-white hover:bg-white/20 hover:text-red-400 transition-colors" onClick={handleDeleteAnnotation}>
                <Trash size={14} />
              </button>
              <button className="flex items-center justify-center h-6 w-6 rounded text-white hover:bg-white/20 hover:text-gray-300 transition-colors" onClick={() => setActiveAnnotation(null)}>
                <X size={14} />
              </button>
            </div>
          </div>
          
          {activeAnnotation.type === 'note' && (
            <div className="bg-[var(--color-paper)] text-[var(--color-ink)] rounded p-2 text-sm font-sans">
              {isEditingNote ? (
                <div className="flex flex-col gap-2">
                  <textarea 
                    autoFocus
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--color-garnet)] focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-1">
                    <button className="h-6 px-3 rounded text-xs bg-[var(--color-garnet)] hover:bg-[var(--color-garnet-dark)] text-white transition-colors" onClick={handleUpdateNote}>
                      Sauvegarder
                    </button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{activeAnnotation.note_content}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reader Content */}
      <div ref={containerRef} className="whitespace-pre-wrap">
        {renderText()}
      </div>
    </div>
  );
}
