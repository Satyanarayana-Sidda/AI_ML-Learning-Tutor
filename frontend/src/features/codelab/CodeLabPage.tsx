import { useState } from "react";
import { Play, Square, RotateCcw, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const DEFAULT_CODE = `# Linear Regression
import numpy as np

X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Write a simple algorithm to find the multiplier
multiplier = y[0] / X[0][0]
print(f"The relationship is y = {multiplier} * X")
print(f"Prediction for X=6 is {multiplier * 6}")
`;

export default function CodeLabPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  
  const runMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/codelab/execute", { code });
      return data;
    }
  });

  return (
    <div className="flex flex-col h-full w-full p-6 max-w-[1400px] mx-auto pb-24">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
            <span className="text-blue-400 font-bold text-sm">Py</span>
          </div>
          <h1 className="font-display text-xl font-semibold">Python Sandbox</h1>
        </div>
        <div className="flex gap-2 mr-28">
          <button 
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="btn-primary flex items-center gap-2 py-1.5 px-4 disabled:opacity-50"
          >
            <Play size={16} /> {runMutation.isPending ? "Running..." : "Run"}
          </button>
          <button className="btn-ghost flex items-center gap-2 py-1.5 px-4"><Square size={16} /> Stop</button>
          <button onClick={() => setCode(DEFAULT_CODE)} className="btn-ghost flex items-center gap-2 py-1.5 px-4"><RotateCcw size={16} /> Reset</button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <div className="glass-panel flex flex-col overflow-hidden">
          <div className="bg-white/5 px-4 py-2 text-sm font-mono text-text-muted border-b border-border-glass">
            main.py
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 font-mono text-sm bg-transparent text-text-primary outline-none resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="glass-panel flex-1 flex flex-col">
            <div className="bg-white/5 px-4 py-2 text-sm font-medium border-b border-border-glass">Output</div>
            <div className="p-4 font-mono text-sm text-text-primary whitespace-pre-wrap flex-1 overflow-auto">
              {runMutation.data ? (
                <>
                  {runMutation.data.output && <div className="text-emerald-400">{runMutation.data.output}</div>}
                  {runMutation.data.error && <div className="text-red-400 mt-2">{runMutation.data.error}</div>}
                </>
              ) : (
                <span className="text-text-muted italic">Run code to see output</span>
              )}
            </div>
          </div>
          
          <div className="border border-border-glass rounded-xl bg-base-raised p-4 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Sparkles size={16} className="text-accent-violet" /> AI Helper</h3>
            </div>
            <p className="text-sm text-text-muted">This is an active sandbox connected to the backend. You can write and execute arbitrary Python code here. Use it to experiment with concepts you learn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
