import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/resume/analyze", { resume_text: resumeText, role: "ML Engineer" });
      return data;
    }
  });

  const analysis = analyzeMutation.data;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Resume Analyzer</h1>
        <p className="text-text-muted mt-1">Improve your resume with AI.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col h-[400px]">
          <h3 className="font-medium text-lg mb-2 text-center">Paste Resume Text</h3>
          <textarea 
            className="flex-1 bg-white/5 border border-border-glass rounded-lg p-4 text-sm text-text-primary resize-none outline-none mb-4"
            placeholder="Paste your resume content here for analysis..."
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
          />
          <button 
            onClick={() => analyzeMutation.mutate()} 
            disabled={analyzeMutation.isPending || !resumeText}
            className="btn-primary w-full disabled:opacity-50"
          >
            {analyzeMutation.isPending ? "Analyzing..." : "Analyze Now"}
          </button>
        </div>

        <div className="lg:col-span-2 glass-panel p-8">
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
            <FileText size={20} className="text-accent-violet" /> Analysis Report
          </h2>
          
          {!analysis ? (
             <div className="flex-1 flex items-center justify-center h-48 text-text-muted italic">
               Paste your resume and click Analyze to see feedback.
             </div>
          ) : (
            <>
              <div className="flex items-center gap-8 mb-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-base-raised" />
                    <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * analysis.score / 100)} className="text-emerald-400 transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-emerald-400">{analysis.score}</span>
                    <span className="text-xs text-text-muted">/ 100</span>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-emerald-400 flex items-center gap-2 mb-3"><CheckCircle2 size={16} /> Strengths</h4>
                    <ul className="text-sm text-text-muted space-y-2">
                      {analysis.feedback.strengths.map((s: string, i: number) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400 flex items-center gap-2 mb-3"><AlertCircle size={16} /> Improvements</h4>
                    <ul className="text-sm text-text-muted space-y-2">
                      {analysis.feedback.improvements.map((s: string, i: number) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
