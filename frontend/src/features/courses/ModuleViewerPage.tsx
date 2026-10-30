import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Circle, Sparkles, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SYLLABUS_DATA } from "./moduleSyllabus";
import { getOfflineChapterContent, getOfflineFlashcards } from "./staticContent";
import FlashcardDeck from "./FlashcardDeck";
import { useAuthStore } from "@/stores/authStore";
import { LRUCache } from "@/lib/lruCache";
import { recordStudyActivity } from "@/lib/studyTracker";

// Global cache for flashcards to persist across component mounts
// Holds max 5 recent chapter flashcard decks
const flashcardCache = new LRUCache<string, { question: string, answer: string }[]>(5);

export default function ModuleViewerPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const moduleData = moduleId ? SYLLABUS_DATA[moduleId] : null;

  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    moduleData?.chapters[0]?.id || null
  );

  const chapterContents = useAuthStore((s) => s.chapterContents);
  const setChapterContent = useAuthStore((s) => s.setChapterContent);
  const setCourseProgress = useAuthStore((s) => s.setCourseProgress);
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState<any[] | null>(null);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const contentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moduleData) {
      navigate("/courses");
      return;
    }
  }, [moduleData, navigate]);

  useEffect(() => {
    if (!moduleData) return;
    const completedCount = moduleData.chapters.filter(c => !!chapterContents[c.id]).length;
    if (completedCount > 0) {
      const progressPct = Math.round((completedCount / moduleData.chapters.length) * 100);
      setCourseProgress(moduleData.id, progressPct);
      recordStudyActivity(completedCount);
    }
  }, [chapterContents, moduleData, setCourseProgress]);

  useEffect(() => {
    if (!activeChapterId || !moduleData) return;

    if (chapterContents[activeChapterId]) {
      // Already generated
      return;
    }

    generateChapterContent(activeChapterId);
  }, [activeChapterId]);

  async function generateChapterContent(chapterId: string) {
    if (isGenerating || !moduleData) return;
    setIsGenerating(true);
    
    const chapter = moduleData.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    try {
      // Simulate API streaming for a premium UX without actually needing an API key!
      const fullText = getOfflineChapterContent(chapter.id, chapter.title, moduleData.title);
      
      // We chunk by words to simulate typing
      const tokens = fullText.split(/(?=[ \n])/);
      
      setStreamingContent((prev) => ({ ...prev, [chapterId]: "" }));
      let currentText = "";
      for (let i = 0; i < tokens.length; i++) {
         currentText += tokens[i];
         setStreamingContent((prev) => ({ ...prev, [chapterId]: currentText }));
         await new Promise(r => setTimeout(r, 15)); // Fast 15ms stream
      }
      
      setIsGenerating(false);
      setChapterContent(chapterId, currentText); // Save to cloud once complete!
      setStreamingContent((prev) => {
        const next = { ...prev };
        delete next[chapterId];
        return next;
      });

    } catch (err) {
      setChapterContent(chapterId, "Error loading content. Please try again later.");
      setIsGenerating(false);
    }
  }

  if (!moduleData) return null;

  const activeChapter = moduleData.chapters.find((c) => c.id === activeChapterId);
  const content = activeChapterId ? chapterContents[activeChapterId] : "";

  const handleGenerateFlashcards = async () => {
    if (isGeneratingFlashcards || !activeChapter || !content || !moduleData) return;
    setIsGeneratingFlashcards(true);
    try {
      const cacheKey = `${moduleData.id}-${activeChapter.id}`;
      const cachedCards = flashcardCache.get(cacheKey);

      if (cachedCards) {
        // O(1) instant return from LRU Cache
        setFlashcards(cachedCards);
      } else {
        // Simulate a small AI thinking delay for UX
        await new Promise(r => setTimeout(r, 600));
        const offlineCards = getOfflineFlashcards(activeChapter.title, moduleData.title);
        
        // Save to LRU Cache
        flashcardCache.put(cacheKey, offlineCards);
        setFlashcards(offlineCards);
      }
      
      setShowFlashcardsModal(true);
    } catch (err) {
      console.error("Failed to generate flashcards", err);
      alert("Failed to generate flashcards.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-base-bg overflow-hidden">
      {/* Sidebar Syllabus */}
      <aside className="w-80 shrink-0 border-r border-border-glass bg-base-panel/30 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-glass shrink-0">
          <button 
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors"
          >
            <ChevronLeft size={16} /> Back to Modules
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${moduleData.color} flex items-center justify-center shadow-sm`}>
                <BookOpen size={20} className="text-white" />
            </div>
            <h2 className="font-display font-semibold leading-tight">{moduleData.title}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-1">
          {moduleData.chapters.map((chapter, index) => {
            const isActive = chapter.id === activeChapterId;
            const hasContent = !!chapterContents[chapter.id];
            
            return (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                  className={`flex gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    isActive 
                    ? "bg-accent-peach text-accent-brown shadow-sm ring-1 ring-accent-orange/20" 
                    : "text-text-muted hover:bg-base-raised hover:text-text-primary"
                  }`}
              >
                <div className="mt-0.5 shrink-0">
                  {hasContent && !isActive ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isActive && isGenerating ? (
                    <Sparkles size={16} className="text-accent-blue animate-pulse" />
                  ) : (
                    <Circle size={16} className={isActive ? "text-accent-blue" : "text-border-glass"} />
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-text-faint mb-1 uppercase tracking-wider">
                    Chapter {index + 1}
                  </div>
                  <div className={`text-sm font-medium leading-snug ${isActive ? "text-accent-brown" : ""}`}>
                    {chapter.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
        <div className="max-w-4xl mx-auto w-full px-12 py-16">
          {activeChapter && (
            <div className="mb-12">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block ${
                activeChapter.level === 'Basic' ? 'bg-emerald-500/10 text-emerald-400' :
                activeChapter.level === 'Intermediate' ? 'bg-blue-500/10 text-blue-400' :
                'bg-indigo-500/10 text-indigo-400'
              }`}>
                {activeChapter.level}
              </span>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-display font-semibold">{activeChapter.title}</h1>
                {content && !isGenerating && (
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-orange to-accent-peach text-accent-brown font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Sparkles size={18} className={isGeneratingFlashcards ? "animate-spin" : ""} />
                    {isGeneratingFlashcards ? "Generating..." : "Generate Flashcards"}
                  </button>
                )}
              </div>
              <div className="w-full h-px bg-border-glass" />
            </div>
          )}

          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-a:text-accent-blue">
            {!content && !isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                <Sparkles size={40} className="mb-4 opacity-50" />
                <p>Loading AI curriculum...</p>
              </div>
            ) : (() => {
              const isStreaming = activeChapterId && !!streamingContent[activeChapterId];
              const contentToRender = isStreaming ? streamingContent[activeChapterId] : (activeChapterId ? chapterContents[activeChapterId] : "");
              
              return (
                <div key={activeChapterId} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code: ({node, inline, className, children, ...props}: any) => {
                        return !inline ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={className?.replace('language-', '') || 'python'}
                            PreTag="div"
                            className="rounded-xl my-6"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent-peach font-mono text-sm" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {contentToRender || "Generating content..."}
                  </ReactMarkdown>
                </div>
              );
            })()}
            {isGenerating && (
              <div className="flex items-center gap-2 text-accent-blue mt-8 animate-pulse">
                <Sparkles size={18} />
                <span className="text-sm font-medium">AI is generating study material...</span>
              </div>
            )}
          </div>
          <div ref={contentEndRef} className="h-20" />
        </div>
      </main>

      {/* Flashcards Modal */}
      {showFlashcardsModal && flashcards && (
        <FlashcardDeck
          flashcards={flashcards}
          onClose={() => setShowFlashcardsModal(false)}
        />
      )}
    </div>
  );
}
