import { useState } from "react";
import { Briefcase, ArrowRight, Code, Database, Globe } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ProjectsPage() {
  const [role, setRole] = useState("ML Engineer");
  const [level, setLevel] = useState("Intermediate");

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/projects/generate-ideas", { role, level });
      return data.ideas;
    }
  });

  const projects = generateMutation.data || [
    {
      title: 'AI Resume Screener',
      description: 'An AI-powered resume screening tool that ranks candidates based on job descriptions using NLP embeddings.',
      tags: ['NLP', 'Python', 'Scikit-Learn', 'Streamlit']
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-accent-orange mx-auto flex items-center justify-center shadow-sm mb-4">
          <Briefcase size={32} className="text-white" />
        </div>
        <h1 className="font-display text-4xl font-semibold mb-2">AI Project Generator</h1>
        <p className="text-text-muted mb-4">Get project ideas tailored to your level and build your portfolio.</p>
        
        <div className="flex justify-center gap-4 mb-4">
          <select value={role} onChange={e => setRole(e.target.value)} className="bg-base-raised border border-border-glass rounded-lg px-4 py-2 text-text-primary outline-none">
            <option>ML Engineer</option>
            <option>Data Scientist</option>
            <option>Frontend Developer</option>
          </select>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {['Beginner', 'Intermediate', 'Advanced'].map(l => (
            <button 
              key={l} 
              onClick={() => setLevel(l)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${level === l ? 'bg-accent-orange text-white shadow-sm' : 'glass-card text-text-muted hover:text-text-primary'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <button 
          onClick={() => generateMutation.mutate()} 
          disabled={generateMutation.isPending}
          className="btn-primary"
        >
          {generateMutation.isPending ? "Generating Ideas..." : "Generate Ideas"}
        </button>
      </header>

      <div className="flex flex-col gap-8">
        {projects.map((proj: any, idx: number) => (
          <div key={idx} className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-glow opacity-30 rounded-full blur-3xl" />
            
            <div className="flex flex-col lg:flex-row gap-12 relative z-10">
              <div className="flex-1">
                <h2 className="text-3xl font-display font-semibold mb-4 text-text-primary">{proj.title}</h2>
                <p className="text-text-muted mb-6 text-lg">{proj.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {proj.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-md glass-card text-sm text-blue-300">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
