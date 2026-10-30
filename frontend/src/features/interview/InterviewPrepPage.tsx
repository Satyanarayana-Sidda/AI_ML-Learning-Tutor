import { useState } from "react";
import { RefreshCw, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function InterviewPrepPage() {
  const [role, setRole] = useState("ML Engineer");
  const [level, setLevel] = useState("Intermediate");
  const [session, setSession] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);

  const startMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/interview/start", { role, level });
      return data;
    },
    onSuccess: (data) => {
      setSession(data);
      setAnswer("");
      setFeedback(null);
    }
  });

  const answerMutation = useMutation({
    mutationFn: async () => {
      const question = session.transcript[0].content;
      const { data } = await api.post("/interview/answer", { session_id: session.id, question, answer });
      return data;
    },
    onSuccess: (data) => {
      setFeedback(data);
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col pb-24">
      <header className="mb-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-3xl font-semibold">Mock Interview</h1>
          <p className="text-text-muted mt-1">Practice and get better.</p>
        </div>
        <button 
          onClick={() => { setSession(null); setFeedback(null); }}
          className="btn-ghost flex items-center gap-2"
        >
          <RefreshCw size={16} /> New Interview
        </button>
      </header>

      {!session ? (
        <div className="flex-1 glass-panel p-8 flex flex-col items-center justify-center">
          <h2 className="text-xl mb-4 font-semibold">Start a Mock Interview</h2>
          <select value={role} onChange={e => setRole(e.target.value)} className="bg-base-raised border border-border-glass rounded-lg px-4 py-2 w-64 mb-4 text-text-primary">
            <option>ML Engineer</option>
            <option>Data Scientist</option>
            <option>Software Engineer</option>
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} className="bg-base-raised border border-border-glass rounded-lg px-4 py-2 w-64 mb-6 text-text-primary">
            <option>Intermediate</option>
            <option>Beginner</option>
            <option>Advanced</option>
          </select>
          <button 
            className="btn-primary disabled:opacity-50"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
          >
            {startMutation.isPending ? "Starting..." : "Start Interview"}
          </button>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          <div className="lg:col-span-2 glass-panel p-8 flex flex-col relative overflow-hidden">
            <div className="mb-8">
              <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-sm font-medium">{role} - {level}</span>
            </div>

            <div className="flex-1 flex flex-col">
              <h2 className="text-3xl font-display font-medium leading-relaxed mb-8">
                {session.transcript[0].content}
              </h2>

              {!feedback && (
                <div className="flex flex-col gap-4 mt-auto">
                  <textarea 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-40 bg-white/5 border border-border-glass rounded-xl p-4 resize-none outline-none text-text-primary"
                  />
                  <button 
                    onClick={() => answerMutation.mutate()}
                    disabled={answerMutation.isPending || !answer}
                    className="btn-primary self-end"
                  >
                    {answerMutation.isPending ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col overflow-y-auto">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Star size={20} className="text-yellow-400" /> Feedback</h3>
            
            {!feedback ? (
              <div className="flex-1 flex items-center justify-center text-text-muted italic text-center">
                Submit your answer to get AI feedback.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-8">
                   <div className="w-32 h-32 rounded-full border-8 border-accent-violet flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{feedback.score}</span>
                      <span className="text-xs text-text-muted">/ 10</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-border-glass">
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{feedback.feedback}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
