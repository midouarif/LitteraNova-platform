"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, BookOpen, Languages, Minimize2 } from "lucide-react";

export default function AiAssistant({ workId }: { workId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Bonjour ! Je suis votre assistant littéraire. Comment puis-je vous aider avec votre lecture aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [contextText, setContextText] = useState<string | null>(null);
  const [contextOffset, setContextOffset] = useState<number | null>(null);

  useEffect(() => {
    const handleOpenAi = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsOpen(true);
      if (customEvent.detail?.text) {
        setContextText(customEvent.detail.text);
      } else {
        setContextText(null);
      }
      if (customEvent.detail?.offset !== undefined) {
        setContextOffset(customEvent.detail.offset);
      } else {
        setContextOffset(null);
      }
    };
    window.addEventListener('open-ai-assistant', handleOpenAi);
    return () => window.removeEventListener('open-ai-assistant', handleOpenAi);
  }, []);

  const callApi = async (action: string, inputString?: string) => {
    if (!workId) {
      return "Erreur: Identifiant de l'œuvre manquant.";
    }

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          workId,
          input: inputString,
          text_selection: contextText,
          offset: contextOffset
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return data.error || "L'assistant n'est pas disponible pour le moment, réessayez dans un instant.";
      }
      
      return data.reply;
    } catch (err) {
      return "L'assistant n'est pas disponible pour le moment, réessayez dans un instant.";
    }
  };

  const handleAction = async (actionId: string, displayType: string) => {
    const userMsg = contextText && (actionId === "explain_selection" || actionId === "vocab_selection" || actionId === "translate_selection")
      ? `Action: ${displayType}\nContexte: "${contextText}"`
      : `Action: ${displayType}`;
      
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    const response = await callApi(actionId);
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setLoading(true);
    const response = await callApi("free_question", userMsg);
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-[var(--color-garnet)] text-[var(--color-paper-card)] shadow-lg hover:bg-[var(--color-garnet-dark)] hover:shadow-xl transition-all flex items-center justify-center group"
      >
        <Sparkles size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[80vh] z-50">
      {/* Header */}
      <div className="bg-[var(--color-ink)] text-[var(--color-paper-card)] p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--color-brass)]" />
          <span className="font-sans font-medium text-sm tracking-wide">Assistant IA</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 hover:text-[var(--color-garnet)] transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-[var(--color-paper-faint)] bg-[var(--color-paper)] grid grid-cols-2 gap-2">
        {contextText && (
          <>
            <button onClick={() => handleAction("explain_selection", "Expliquer")} className="flex items-center gap-2 text-xs p-2 rounded bg-white/50 border border-[var(--color-paper-faint)] hover:border-[var(--color-garnet)] transition-colors font-sans text-left">
              <MessageSquare size={14} className="text-[var(--color-brass)]" /> Expliquer
            </button>
            <button onClick={() => handleAction("vocab_selection", "Vocabulaire")} className="flex items-center gap-2 text-xs p-2 rounded bg-white/50 border border-[var(--color-paper-faint)] hover:border-[var(--color-garnet)] transition-colors font-sans text-left">
              <BookOpen size={14} className="text-[var(--color-brass)]" /> Vocabulaire
            </button>
            <button onClick={() => handleAction("translate_selection", "Traduire")} className="flex items-center gap-2 text-xs p-2 rounded bg-white/50 border border-[var(--color-paper-faint)] hover:border-[var(--color-garnet)] transition-colors font-sans text-left">
              <Languages size={14} className="text-[var(--color-brass)]" /> Traduire
            </button>
          </>
        )}
        <button onClick={() => handleAction("summarize", "Résumer")} className="flex items-center gap-2 text-xs p-2 rounded bg-white/50 border border-[var(--color-paper-faint)] hover:border-[var(--color-garnet)] transition-colors font-sans text-left">
          <Minimize2 size={14} className="text-[var(--color-brass)]" /> Résumer
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm bg-white/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-[var(--color-ink-soft)] text-[var(--color-paper-card)] rounded-tr-sm' 
                : 'bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] text-[var(--color-ink-text)] rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] text-[var(--color-ink-text)] rounded-tl-sm p-3 rounded-lg shadow-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-[var(--color-brass)] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[var(--color-brass)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              <span className="w-1.5 h-1.5 bg-[var(--color-brass)] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--color-paper-faint)] bg-[var(--color-paper-card)] flex gap-2">
        <input 
          type="text" 
          placeholder="Posez une question..." 
          className="flex-1 bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-garnet)] transition-colors font-sans"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-[var(--color-garnet)] text-[var(--color-paper-card)] p-2 rounded-md hover:bg-[var(--color-garnet-dark)] transition-colors"
          disabled={loading || !input.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
