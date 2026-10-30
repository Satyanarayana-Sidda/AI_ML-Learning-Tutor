import { useQuery } from "@tanstack/react-query";
import { Flame, Target, Award, Trophy, BookCheck } from "lucide-react";
import { api } from "@/lib/api";
import TutorChat from "@/components/TutorChat";
import { SYLLABUS_DATA } from "@/features/courses/moduleSyllabus";
import { useAuthStore } from "@/stores/authStore";
import { calculateStreak, recordStudyActivity } from "@/lib/studyTracker";

interface DashboardSummary {
  full_name: string;
  xp_points: number;
  current_streak: number;
  completed_lessons: number;
  total_lessons: number;
  today_goal_completed: boolean;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get<DashboardSummary>("/dashboard/summary")).data,
    refetchInterval: 3000,
  });

  const savedProgress = useAuthStore((s) => s.courseProgress);
  const totalModules = Object.keys(SYLLABUS_DATA).length;
  let completedModules = 0;
  let xpPoints = 0;
  let activeModules = 0;
  
  Object.values(SYLLABUS_DATA).forEach((course) => {
    const prog = savedProgress[course.id] || 0;
    if (prog === 100) {
      completedModules++;
      xpPoints += 100;
    }
    if (prog > 0) {
      activeModules++;
    }
  });

  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Dynamically compute streak
  let currentStreak = calculateStreak();

  // If user has active or completed modules, record study activity so streak is updated in real-time
  if (currentStreak === 0 && activeModules > 0) {
    recordStudyActivity((completedModules * 2) || 1);
    currentStreak = calculateStreak() || 1;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col h-full w-full">
      <header className="mb-8 shrink-0">
        <h1 className="font-display text-3xl font-semibold">
          Welcome back{data ? `, ${data.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-text-muted mt-1">Here's where your learning stands today.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 shrink-0">
          <StatCard icon={Trophy} label="XP Points" value={xpPoints} accent="text-accent-cyan" />
          <StatCard icon={Flame} label="Current Streak" value={`${currentStreak} days`} accent="text-accent-blue" />
          <StatCard
            icon={BookCheck}
            label="Modules Completed"
            value={`${completedModules} / ${totalModules}`}
            accent="text-accent-violet"
          />
          <StatCard
            icon={Target}
            label="Today's Goal"
            value={completedModules > 0 ? "Complete" : "In progress"}
            accent="text-accent-blue"
          />
        </div>
      )}

      <div className="glass-panel p-6 flex flex-col justify-center border-t-4 border-t-accent-orange">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-accent-peach flex items-center justify-center text-accent-orange">
            <Award size={20} />
          </div>
          <h2 className="font-display font-semibold text-lg">Overall progress</h2>
          <span className="text-sm text-text-muted">{progressPct}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-base-raised overflow-hidden">
          <div
            className="h-full bg-gradient-primary rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <TutorChat inline />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="glass-card p-5">
      <Icon size={20} className={accent} />
      <p className="text-2xl font-display font-semibold mt-3">{value}</p>
      <p className="text-sm text-text-muted mt-0.5">{label}</p>
    </div>
  );
}
