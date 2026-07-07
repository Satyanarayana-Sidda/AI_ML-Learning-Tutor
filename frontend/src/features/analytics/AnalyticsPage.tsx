import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Activity, Clock, CheckCircle2, Target, Download, Share2, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SYLLABUS_DATA } from "@/features/courses/moduleSyllabus";
import { useAuthStore } from "@/stores/authStore";

export default function AnalyticsPage() {
  const savedProgress = useAuthStore((s) => s.courseProgress);
  const totalModules = Object.keys(SYLLABUS_DATA).length;
  let mastered = 0;
  let inProgress = 0;
  
  Object.values(SYLLABUS_DATA).forEach((course) => {
    const prog = savedProgress[course.id] || 0;
    if (prog === 100) mastered++;
    else if (prog > 0) inProgress++;
  });

  const notStarted = totalModules - mastered - inProgress;
  const masteredPct = totalModules > 0 ? Math.round((mastered / totalModules) * 100) : 0;
  const inProgressPct = totalModules > 0 ? Math.round((inProgress / totalModules) * 100) : 0;
  const notStartedPct = totalModules > 0 ? Math.round((notStarted / totalModules) * 100) : 0;

  const totalStudyHours = (mastered * 5) + (inProgress * 2);
  const coursesEnrolled = mastered + inProgress;
  const quizzesTaken = mastered * 2;
  const projectsCompleted = Math.floor(mastered / 3);

  // Real-time daily graph logic
  const [dailyData, setDailyData] = useState<number[]>([0,0,0,0,0,0,0]);

  useEffect(() => {
    let savedDaily = [0,0,0,0,0,0,0];
    try {
      const parsed = JSON.parse(localStorage.getItem('dailyStudyData') || '[0,0,0,0,0,0,0]');
      if (Array.isArray(parsed) && parsed.length === 7) {
        savedDaily = parsed;
      }
    } catch (e) {}

    let lastTotal = parseInt(localStorage.getItem('lastTotalStudyHours') || '0', 10);
    if (isNaN(lastTotal)) lastTotal = 0;
    
    // Calculate difference
    const diff = totalStudyHours - lastTotal;
    
    if (diff > 0) {
      // Add difference to today
      const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6
      savedDaily[todayIndex] += diff;
      
      localStorage.setItem('dailyStudyData', JSON.stringify(savedDaily));
      localStorage.setItem('lastTotalStudyHours', totalStudyHours.toString());
    }
    
    setDailyData(savedDaily);
  }, [totalStudyHours]);

  // Find max for scaling the graph safely
  const safeDailyData = Array.isArray(dailyData) && dailyData.length === 7 ? dailyData : [0,0,0,0,0,0,0];
  const maxDaily = Math.max(10, ...safeDailyData);

  const handleShare = async () => {
    const text = `I've mastered ${masteredPct}% of my AI/ML topics and studied for ${totalStudyHours} hours!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Learning Analytics',
          text,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Progress copied to clipboard!");
    }
  };

  const handleExport = () => {
    const data = {
      totalStudyHours,
      coursesEnrolled,
      quizzesTaken,
      projectsCompleted,
      masteredPct,
      inProgressPct,
      notStartedPct,
      dailyStudyHours: safeDailyData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-analytics.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Analytics exported successfully!");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold">Learning Analytics</h1>
          <p className="text-text-muted mt-1">Track your learning progress.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
            <Share2 size={16} /> Share
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel p-6 col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-medium text-lg">Study Hours</h3>
            <select className="bg-transparent text-sm text-text-muted outline-none border border-border-glass rounded px-2 py-1"><option>This Week</option></select>
          </div>
          <div className="h-64 flex justify-between gap-4 px-4">
            {safeDailyData.map((hours, i) => {
              const h = Math.min(100, Math.max(2, (hours / maxDaily) * 100)); // At least 2% height so it's visible if 0
              const isToday = i === ((new Date().getDay() + 6) % 7);
              return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group pt-6">
                <div className="w-full flex-1 relative">
                  {hours > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-base-raised border border-border-glass px-2 py-1 rounded text-xs font-semibold shadow-xl z-10 whitespace-nowrap">
                      {hours}h
                    </div>
                  )}
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-md transition-all duration-1000 group-hover:brightness-125 ${isToday ? 'bg-gradient-to-t from-accent-blue to-accent-orange shadow-lg' : 'bg-accent-peach'}`} 
                    style={{ height: `${hours === 0 ? 0 : h}%`, minHeight: hours > 0 ? '4px' : '0' }} 
                  />
                </div>
                <span className={`text-xs uppercase shrink-0 ${isToday ? 'text-accent-blue font-bold' : 'text-text-muted'}`}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            )})}
          </div>
        </div>

        <div className="glass-panel p-6">
           <h3 className="font-medium text-lg mb-8">Topics Mastery</h3>
           <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" fill="transparent" strokeWidth="16" className="stroke-base-raised text-base-raised" stroke="currentColor" />
                  <circle cx="96" cy="96" r="80" fill="transparent" strokeWidth="16" strokeDasharray="502" strokeDashoffset={502 - (502 * masteredPct) / 100} className="stroke-accent-blue text-accent-blue transition-all duration-1000" stroke="currentColor" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{masteredPct}%</span>
                  <span className="text-sm text-text-muted">Mastered</span>
                </div>
              </div>
           </div>
           <div className="space-y-3">
             <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent-blue"/>Mastered</span><span>{masteredPct}%</span></div>
             <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent-orange"/>In Progress</span><span>{inProgressPct}%</span></div>
             <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-base-raised"/>Not Started</span><span>{notStartedPct}%</span></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { l: 'Total Study Hours', v: totalStudyHours, i: Clock, c: 'text-accent-blue' },
          { l: 'Courses Enrolled', v: coursesEnrolled, i: BookOpen, c: 'text-accent-brown' },
          { l: 'Quizzes Taken', v: quizzesTaken, i: Target, c: 'text-accent-orange' },
          { l: 'Projects Completed', v: projectsCompleted, i: Activity, c: 'text-accent-blue' }
        ].map((s, i) => (
          <div key={i} className="glass-panel p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">{s.l}</p>
              <p className="text-2xl font-bold">{s.v}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${s.c}`}>
               <s.i size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
