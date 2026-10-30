import { useState } from "react";
import { Map, Rocket, BrainCircuit, Database, Settings, GitCommit, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { SYLLABUS_DATA } from "@/features/courses/moduleSyllabus";
import { useAuthStore } from "@/stores/authStore";

const ICON_MAP: Record<string, any> = {
  GitCommit, Settings, BrainCircuit, Database, Rocket
};

export default function RoadmapsPage() {
  const [role, setRole] = useState("ML Engineer");
  const [level, setLevel] = useState("Intermediate");
  const [time, setTime] = useState("2 hours/day");
  const savedProgress = useAuthStore((s) => s.courseProgress);
  const navigate = useNavigate();

  const handleContinue = () => {
    const courses = Object.values(SYLLABUS_DATA);
    let nextCourse = courses[0].id;
    for (const course of courses) {
      if (savedProgress[course.id] !== 100) {
        nextCourse = course.id;
        break;
      }
    }
    navigate(`/modules/${nextCourse}`);
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/roadmaps/generate", { role, level, time });
      return data;
    }
  });

  const rawPhases = generateMutation.data?.phases || [
    { phase: 'Phase 1: Foundations', time: '(4 weeks)', items: 'Python, Math, Statistics, Linear Algebra', icon: 'GitCommit', color: 'text-accent-blue', bg: 'bg-accent-blue' },
    { phase: 'Phase 2: Machine Learning', time: '(6 weeks)', items: 'Scikit-Learn, Regression, Classification', icon: 'Settings', color: 'text-accent-brown', bg: 'bg-accent-brown' },
    { phase: 'Phase 3: Deep Learning', time: '(8 weeks)', items: 'Neural Networks, CNNs, RNNs', icon: 'BrainCircuit', color: 'text-accent-orange', bg: 'bg-accent-orange' },
    { phase: 'Phase 4: Advanced Topics', time: '(4 weeks)', items: 'Transformers, LLMs, MLOps', icon: 'Database', color: 'text-accent-blue', bg: 'bg-accent-blue' },
    { phase: 'Phase 5: Projects & Deployment', time: '(4 weeks)', items: 'Build, Deploy, Resume', icon: 'Rocket', color: 'text-text-muted', bg: 'bg-base-raised' }
  ];

  const courses = Object.values(SYLLABUS_DATA);
  let currentPhaseIndex = 0;
  for (let i = 0; i < courses.length; i++) {
    if (savedProgress[courses[i].id] !== 100) {
      currentPhaseIndex = i;
      break;
    }
  }
  // If all completed, point to the last phase
  if (courses.length > 0 && courses.every(c => savedProgress[c.id] === 100)) {
    currentPhaseIndex = Math.min(rawPhases.length - 1, courses.length);
  }

  const phases = rawPhases.map((step: any, i: number) => ({
    ...step,
    current: i === currentPhaseIndex
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-8 items-start pb-24">
      <div className="w-80 shrink-0">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold">AI Roadmap Generator</h1>
          <p className="text-text-muted mt-1">Get a personalized roadmap based on your goals.</p>
        </header>

        <div className="glass-panel p-6">
          <div className="mb-4">
            <label className="block text-sm text-text-muted mb-2">Target Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-base-raised border border-border-glass rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-accent-blue">
              <option>ML Engineer</option>
              <option>Data Scientist</option>
              <option>AI Researcher</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-text-muted mb-2">Current Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-base-raised border border-border-glass rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-accent-blue">
              <option>Intermediate</option>
              <option>Beginner</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-sm text-text-muted mb-2">Time Available</label>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-base-raised border border-border-glass rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-accent-blue">
              <option>2 hours/day</option>
              <option>1 hour/day</option>
              <option>Weekends only</option>
            </select>
          </div>

          <button 
            onClick={() => generateMutation.mutate()} 
            disabled={generateMutation.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            {generateMutation.isPending ? "Generating..." : "Generate Roadmap"}
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel p-8">
        <h2 className="text-xl font-display font-semibold mb-8 flex items-center gap-2">
          <Map className="text-accent-blue" size={24} /> Your Personalized Roadmap
        </h2>
        
        <div className="relative border-l-2 border-border-glass ml-6 space-y-12 pb-8">
          {phases.map((step: any, i: number) => {
            const Icon = ICON_MAP[step.icon] || GitCommit;
            return (
            <div key={i} className="relative pl-8">
               <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-base-panel flex items-center justify-center ${step.current ? 'bg-accent-orange shadow-glow text-white' : (step.bg || 'bg-base-raised') + ' text-base-panel'}`}>
                 <Icon size={14} />
               </div>
               <h3 className={`font-semibold text-lg flex gap-2 ${step.current ? 'text-accent-orange' : ''}`}>
                 {step.phase} <span className="text-text-muted font-normal">{step.time}</span>
               </h3>
               <p className="text-text-muted mt-2 mb-4">{step.items}</p>
               
               {step.current && (
                 <div className="p-4 rounded-xl bg-white/5 border border-border-glass inline-block">
                   <p className="text-sm font-medium mb-3">Current Module: Active</p>
                   <button onClick={handleContinue} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2">Continue <ArrowRight size={16}/></button>
                 </div>
               )}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
