import { useEffect, useRef, useState, memo } from "react";
import { Send, Sparkles, Clock, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { api, streamChatMessage } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MessageItem = memo(({ m }: { m: ChatMessage }) => (
  <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
    {m.role === 'assistant' && (
      <div className="w-8 h-8 rounded-full bg-accent-peach flex items-center justify-center shrink-0 mr-3 mt-1">
        <Sparkles size={14} className="text-accent-orange" />
      </div>
    )}
    <div
      className={`max-w-[85%] rounded-2xl p-4 prose prose-sm ${
        m.role === "user"
          ? "bg-accent-peach text-accent-brown prose-p:text-accent-brown rounded-tr-sm"
          : "bg-base-raised border border-border-glass text-text-primary prose-p:text-text-primary rounded-tl-sm"
      }`}
    >
      {m.role === "assistant" ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter style={oneDark as any} language={match[1]} PreTag="div" customStyle={{margin: '0.5em 0', borderRadius: '0.5rem', fontSize: '0.8em'}}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-base-raised px-1 py-0.5 rounded text-accent-cyan text-xs" {...props}>
                  {children}
                </code>
              );
            },
            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>
          }}
        >
          {m.content || "…"}
        </ReactMarkdown>
      ) : (
        m.content
      )}
    </div>
  </div>
));

export default function TutorChat({ inline = false }: { inline?: boolean }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const historyQuery = useQuery({
    queryKey: ["chat-history"],
    queryFn: async () => (await api.get("/conversations")).data,
    enabled: showHistory,
  });

  const loadConversation = async (id: string) => {
    try {
      const { data } = await api.get(`/conversations/${id}/messages`);
      setConversationId(id);
      setMessages(data);
      setShowHistory(false);
    } catch {
      toast.error("Failed to load conversation");
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await api.delete(`/conversations/${id}`);
      historyQuery.refetch();
      if (conversationId === id) startNewConversation();
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL your chat history? This cannot be undone.")) return;
    try {
      await api.delete('/conversations');
      historyQuery.refetch();
      startNewConversation();
    } catch {
      toast.error("Failed to clear history");
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  async function ensureConversation(): Promise<string> {
    if (conversationId) return conversationId;
    const { data } = await api.post("/conversations", { mode: "tutor" });
    setConversationId(data.id);
    return data.id;
  }

  async function handleSend() {
    if (!input.trim() || streaming) return;
    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: userText }]);

    try {
      const convoId = await ensureConversation();
      setStreaming(true);
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      await streamChatMessage(
        convoId,
        userText,
        (token) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
          );
        },
        () => setStreaming(false)
      );
    } catch {
      toast.error("The tutor couldn't respond. Please try again.");
      setStreaming(false);
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0, isDragging: false });

  // Instead of unmounting the component on the dashboard, we hide it with CSS
  // so we don't lose the local chat state (messages, input) when navigating.
  const isHidden = !inline && location.pathname === "/dashboard";

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      isDragging: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.isDragging = true;
      setIsDragging(true);
      setPosition({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    // We use a longer timeout (100ms) so that the subsequent 'click' event 
    // can read isDragging=true and cancel itself.
    setTimeout(() => {
      dragRef.current.isDragging = false;
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragRef.current.isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(!isOpen);
  };

  const chatUI = (
    <>
      <header className="border-b border-border-glass px-4 py-3 flex items-center justify-between bg-base-raised">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent-blue" />
          <h2 className="font-display font-semibold text-sm">AI Tutor Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-muted hover:text-text-primary'}`}>
            <Clock size={16} />
          </button>
          {!inline && (
             <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary p-1.5">✕</button>
          )}
        </div>
      </header>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-4 bg-base custom-scrollbar">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={startNewConversation} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg glass-card text-text-primary hover:border-accent-blue transition-colors">
              <Plus size={16} /> New Chat
            </button>
            <button onClick={handleDeleteAll} className="flex-none px-4 py-3 rounded-lg glass-card text-red-400 hover:text-red-300 hover:border-red-400/50 transition-colors" title="Clear All History">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {historyQuery.isLoading && <p className="text-center text-sm text-text-muted mt-4">Loading history...</p>}
            {historyQuery.data?.map((c: any) => (
              <button 
                key={c.id} 
                onClick={() => loadConversation(c.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-start justify-between gap-3 transition-colors group ${c.id === conversationId ? 'bg-accent-blue/10 border border-accent-blue/50' : 'glass-card hover:border-border-glass'}`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <MessageSquare size={16} className="text-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{c.title}</p>
                    <p className="text-xs text-text-muted mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div 
                  onClick={(e) => handleDeleteChat(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-red-400 transition-all rounded-md hover:bg-red-400/10 shrink-0"
                >
                  <Trash2 size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div 
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-base"
          >
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <p className="text-text-muted text-sm">Ask anything about ML, DL, Python, NLP, or LLMs.</p>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <MessageItem key={m.id} m={m} />
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border-glass bg-base-panel">
            <div className="relative flex items-center">
              <input
                className="w-full bg-base border border-border-glass rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange transition-colors"
                placeholder="Ask me anything about AI, ML, or coding..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={streaming}
              />
              <button onClick={handleSend} disabled={streaming || !input.trim()} className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-accent-brown text-white hover:brightness-110 transition-all disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="flex flex-col flex-1 min-h-[250px] glass-panel mt-8 overflow-hidden">
        {chatUI}
      </div>
    );
  }

  return (
    <div style={{ display: isHidden ? 'none' : 'block' }}>
      <button 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, touchAction: 'none' }}
        className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-sm flex items-center justify-center text-white z-50 cursor-grab active:cursor-grabbing ${isDragging ? 'scale-105' : 'hover:scale-105 transition-transform'} ${isOpen ? 'bg-white/10 glass-card text-text-muted opacity-0 pointer-events-none' : 'bg-accent-orange'}`}
      >
        <Sparkles size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[400px] h-[600px] max-h-[85vh] glass-panel flex flex-col z-50 shadow-2xl overflow-hidden border border-border-glass animate-in slide-in-from-bottom-5 fade-in duration-200">
          {chatUI}
        </div>
      )}
    </div>
  );
}
