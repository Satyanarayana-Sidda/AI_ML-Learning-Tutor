import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import { api } from "@/lib/api";

interface PathItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  lesson_count: number;
}

export default function PathsPage() {
  const { data: paths, isLoading } = useQuery({
    queryKey: ["paths"],
    queryFn: async () => (await api.get<PathItem[]>("/paths")).data,
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Learning Paths</h1>
        <p className="text-text-muted mt-1">Structured tracks across ML, DL, NLP, and LLMs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)
          : paths?.map((path) => (
              <div key={path.id} className="glass-card p-5 hover:border-accent-blue/40 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <ArrowRight size={16} className="text-text-faint group-hover:text-accent-blue group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-display font-semibold">{path.name}</h3>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">{path.description}</p>
                <p className="text-xs text-accent-blue mt-3">{path.lesson_count} lessons</p>
              </div>
            ))}
      </div>
    </div>
  );
}
