import { useState } from "react";
import { CheckCircle2, ChevronRight, Trophy } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SYLLABUS_DATA } from "@/features/courses/moduleSyllabus";
import { useAuthStore } from "@/stores/authStore";

export default function QuizCenterPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(3);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const savedProgress = useAuthStore((s) => s.courseProgress);
  let completedModules = 0;
  Object.values(SYLLABUS_DATA).forEach((course) => {
    if (savedProgress[course.id] === 100) completedModules++;
  });

  const xpEarned = completedModules * 100;

  const [quizStats, setQuizStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quizStats') || '{"quizzesTaken": 0, "totalQuestions": 0, "totalCorrect": 0}');
    } catch {
      return { quizzesTaken: 0, totalQuestions: 0, totalCorrect: 0 };
    }
  });

  const quizzesTaken = quizStats.quizzesTaken;
  const accuracy = quizStats.totalQuestions > 0 ? Math.round((quizStats.totalCorrect / quizStats.totalQuestions) * 100) : 0;

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/quiz/generate", { topic, num_questions: numQuestions });
      return data;
    },
    onSuccess: (data) => {
      setCurrentQuiz(data);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setScore(0);
    }
  });

  const handleNext = () => {
    if (selectedOption === currentQuiz.questions[currentQuestionIndex].correct_answer) {
      setScore(s => s + 1);
    }
    
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      const finalScore = score + (selectedOption === currentQuiz.questions[currentQuestionIndex].correct_answer ? 1 : 0);
      const updated = {
        quizzesTaken: (quizStats.quizzesTaken || 0) + 1,
        totalQuestions: (quizStats.totalQuestions || 0) + currentQuiz.questions.length,
        totalCorrect: (quizStats.totalCorrect || 0) + finalScore
      };
      localStorage.setItem('quizStats', JSON.stringify(updated));
      setQuizStats(updated);

      alert(`Quiz finished! Score: ${finalScore}/${currentQuiz.questions.length}`);
      setCurrentQuiz(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col pb-24">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Quiz Center</h1>
        <p className="text-text-muted mt-1">Test your knowledge and level up!</p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-8 shrink-0">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div><p className="text-sm text-text-muted">Accuracy</p><p className="text-2xl font-bold text-emerald-400">{accuracy}%</p></div>
        </div>
        <div className="glass-panel p-4 flex items-center justify-between">
          <div><p className="text-sm text-text-muted">Quizzes Taken</p><p className="text-2xl font-bold">{quizzesTaken}</p></div>
        </div>
        <div className="glass-panel p-4 flex items-center justify-between">
          <div><p className="text-sm text-text-muted">XP Earned</p><p className="text-2xl font-bold text-accent-cyan">{xpEarned.toLocaleString()}</p></div>
          <Trophy size={32} className="text-accent-cyan/20" />
        </div>
      </div>

      {!currentQuiz ? (
        <div className="glass-panel p-8 flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl mb-4 font-semibold">Generate a new Quiz</h2>
          <div className="flex gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Topic (e.g. Backpropagation)" 
              className="bg-base-raised border border-border-glass rounded-lg px-4 py-2 w-64 text-text-primary focus:outline-none focus:border-accent-blue"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
            <select
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="bg-base-raised border border-border-glass rounded-lg px-4 py-2 text-text-primary outline-none focus:border-accent-blue"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>
          <button 
            className="btn-primary disabled:opacity-50"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !topic}
          >
            {generateMutation.isPending ? "Generating with AI..." : "Start Quiz"}
          </button>
        </div>
      ) : (
        <div className="glass-panel p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <span className="text-accent-blue text-sm font-medium uppercase tracking-wider">{currentQuiz.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Question</span>
              <span className="text-sm text-yellow-400 font-medium">{currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
            </div>
          </div>

          <h2 className="text-2xl font-display font-medium leading-relaxed mb-8">
            {currentQuiz.questions[currentQuestionIndex].question}
          </h2>

          <div className="flex-1 flex flex-col gap-4">
            {currentQuiz.questions[currentQuestionIndex].options.map((opt: string, i: number) => {
              const isSelected = selectedOption === i;
              const isSubmitted = selectedOption !== null;
              const isCorrect = i === currentQuiz.questions[currentQuestionIndex].correct_answer;
              
              let btnClass = 'glass-card hover:border-accent-blue/50';
              if (isSubmitted) {
                if (isCorrect) btnClass = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
                else if (isSelected && !isCorrect) btnClass = 'bg-red-500/10 border-red-500/50 text-red-400';
                else btnClass = 'glass-card opacity-50';
              } else if (isSelected) {
                btnClass = 'border-accent-blue bg-accent-blue/10';
              }

              return (
                <button 
                  key={i} 
                  disabled={isSubmitted}
                  onClick={() => setSelectedOption(i)}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${btnClass}`}
                >
                  <span className="font-medium text-lg"><span className="text-text-muted mr-4">{String.fromCharCode(65+i)}</span> {opt}</span>
                  {isSubmitted && isCorrect && <CheckCircle2 className="text-emerald-400" />}
                </button>
              )
            })}
          </div>

          {selectedOption !== null && (
             <div className="mt-4 p-4 rounded-lg bg-base-raised text-sm text-text-muted">
               <strong>Explanation:</strong> {currentQuiz.questions[currentQuestionIndex].explanation}
             </div>
          )}

          <div className="mt-8 flex justify-between items-center border-t border-border-glass pt-6">
            <div className="flex items-center gap-4">
               <span className="text-emerald-400 font-medium">Score: {score}</span>
            </div>
            <button 
              onClick={handleNext}
              disabled={selectedOption === null}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {currentQuestionIndex < currentQuiz.questions.length - 1 ? "Next Question" : "Finish"} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
