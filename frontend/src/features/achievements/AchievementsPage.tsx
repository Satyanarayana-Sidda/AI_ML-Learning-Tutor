import { useMemo, useState } from "react";
import { Trophy, Star, Target, CheckCircle2, Flame, Clock, Download, Loader2 } from "lucide-react";
import { SYLLABUS_DATA } from "@/features/courses/moduleSyllabus";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import confetti from "canvas-confetti";
import CertificateRenderer from "./CertificateRenderer";

export default function AchievementsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const savedProgress = useAuthStore((s) => s.courseProgress);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { completedCourses, runningCourses, totalXP } = useMemo(() => {
    const completed: any[] = [];
    const running: any[] = [];
    
    Object.values(SYLLABUS_DATA).forEach((course) => {
      const progress = savedProgress[course.id] || 0;
      if (progress === 100) {
        completed.push({ ...course, progress });
      } else if (progress > 0) {
        running.push({ ...course, progress });
      }
    });

    return {
      completedCourses: completed,
      runningCourses: running,
      totalXP: completed.length * 100,
    };
  }, [savedProgress]);

  const handleDownloadCertificate = async (courseId: string, courseTitle: string) => {
    setDownloadingId(courseId);
    
    // Trigger confetti immediately for instant feedback
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#8B1972', '#d4af37', '#FCE7F2'];
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());

    // Allow DOM to update in case we need it, though it should already be rendered hidden
    setTimeout(async () => {
      const element = document.getElementById(`cert-${courseId}`);
      if (element) {
        try {
          const canvas = await html2canvas(element, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1000, 707]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, 1000, 707);
          pdf.save(`${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
        } catch (error) {
          console.error("Failed to generate PDF", error);
        }
      }
      setDownloadingId(null);
    }, 100);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col pb-24">
      <header className="mb-10 shrink-0">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <Trophy className="text-accent-orange" size={32} /> 
          Achievements & XP
        </h1>
        <p className="text-text-muted mt-2 text-lg">Track your progress and earn XP for mastering AI modules.</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 shrink-0">
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-accent-peach/50 to-transparent border-t-4 border-t-accent-orange">
          <div className="w-16 h-16 rounded-full bg-accent-orange/10 flex items-center justify-center mb-4">
            <Star className="text-accent-orange" size={32} />
          </div>
          <h2 className="text-4xl font-display font-bold text-accent-brown mb-1">{totalXP}</h2>
          <p className="text-text-muted font-medium uppercase tracking-wider text-sm">Total XP Earned</p>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-accent-blue/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="text-accent-blue" size={32} />
          </div>
          <h2 className="text-4xl font-display font-bold mb-1">{completedCourses.length}</h2>
          <p className="text-text-muted font-medium uppercase tracking-wider text-sm">Modules Completed</p>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-accent-orange/10 flex items-center justify-center mb-4">
            <Flame className="text-accent-orange" size={32} />
          </div>
          <h2 className="text-4xl font-display font-bold mb-1">{runningCourses.length}</h2>
          <p className="text-text-muted font-medium uppercase tracking-wider text-sm">Courses In Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* In Progress Courses */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="text-accent-blue" /> Currently Running
          </h2>
          <div className="flex flex-col gap-4">
            {runningCourses.length === 0 ? (
              <div className="glass-card p-6 text-center text-text-muted">
                No courses currently in progress. Start learning to see them here!
              </div>
            ) : (
              runningCourses.map((course) => (
                <div key={course.id} className="glass-card p-5 flex flex-col gap-4 hover:border-accent-blue/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-semibold text-lg">{course.title}</h3>
                    <span className="text-accent-blue font-medium">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-base-raised overflow-hidden">
                    <div 
                      className="h-full bg-accent-blue rounded-full transition-all duration-1000"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => navigate(`/modules/${course.id}`)}
                    className="text-sm font-medium text-accent-blue hover:text-accent-brown transition-colors self-start"
                  >
                    Continue Learning →
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Completed Courses */}
        <section>
          <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2">
            <Target className="text-accent-orange" /> Completed (+100 XP)
          </h2>
          <div className="flex flex-col gap-4">
            {completedCourses.length === 0 ? (
              <div className="glass-card p-6 text-center text-text-muted">
                Complete your first module to earn 100 XP!
              </div>
            ) : (
              completedCourses.map((course) => (
                <div key={course.id} className="relative">
                  <div className="glass-panel p-5 flex items-center gap-4 bg-accent-peach/20 border-accent-orange/20">
                    <div className="w-12 h-12 rounded-full bg-accent-orange text-white flex items-center justify-center shrink-0">
                      <Star size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg text-accent-brown">{course.title}</h3>
                      <p className="text-sm text-text-muted">Mastered! 100 XP Awarded</p>
                    </div>
                    <button 
                      onClick={() => handleDownloadCertificate(course.id, course.title)}
                      disabled={downloadingId === course.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-orange text-white text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {downloadingId === course.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      Certificate
                    </button>
                  </div>
                  
                  {/* Hidden Certificate for Rendering */}
                  <div id={`cert-${course.id}`} style={{ position: 'fixed', left: '200vw', top: 0, pointerEvents: 'none' }}>
                    <CertificateRenderer 
                      studentName={user?.full_name || "AI Student"}
                      courseTitle={course.title}
                      date={new Date().toLocaleDateString()}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
