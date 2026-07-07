import { useState, useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  LayoutDashboard, MessageSquare, FileText, BookOpen, LogOut, Sparkles,
  Code2, CheckSquare, Map, Briefcase, FileSearch, Mic, LineChart, Trophy, Sun, Moon, Pencil, Bell, X, Check
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import TutorChat from "@/components/TutorChat";
import { SYLLABUS_DATA } from "@/features/courses/moduleSyllabus";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Modules", icon: BookOpen },
  { to: "/code-lab", label: "Code Lab", icon: Code2 },
  { to: "/quiz-center", label: "Quiz Center", icon: CheckSquare },
  { to: "/roadmaps", label: "Roadmaps", icon: Map },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/achievements", label: "Achievements", icon: Trophy },
];

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchFromCloud = useAuthStore((s) => s.fetchFromCloud);
  const courseProgress = useAuthStore((s) => s.courseProgress);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.full_name ?? "Learner");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const MOCK_NOTIFICATIONS = [
    { id: 1, title: "Quiz Reminder", message: "Your daily ML Quiz is ready!", time: "10 min ago", unread: true, icon: <CheckSquare size={16} className="text-accent-blue" /> },
    { id: 2, title: "Study Streak", message: "Don't break your 3-day streak! Read a module.", time: "2 hours ago", unread: true, icon: <Sparkles size={16} className="text-accent-orange" /> },
    { id: 3, title: "Project Pending", message: "You have an unfinished Neural Network project.", time: "1 day ago", unread: false, icon: <Briefcase size={16} className="text-accent-brown" /> },
    { id: 4, title: "Achievement", message: "You earned 100 XP yesterday!", time: "1 day ago", unread: false, icon: <Trophy size={16} className="text-accent-peach" /> }
  ];

  const handleSaveName = () => {
    if (user && editName.trim() !== "") {
      useAuthStore.getState().setUser({ ...user, full_name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const computedXP = () => {
    let xp = 0;
    Object.values(SYLLABUS_DATA).forEach((course) => {
      if (courseProgress[course.id] === 100) xp += 100;
    });
    return xp;
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchFromCloud();
    }
  }, [user, fetchFromCloud]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 shrink-0 border-r border-border-glass bg-base-panel/40 backdrop-blur-xl p-5 flex flex-col">
        <Link to="/dashboard" className="flex items-center gap-2 mb-10 px-1 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-accent-peach flex items-center justify-center">
            <Sparkles size={16} className="text-accent-orange" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Tutor<span className="gradient-text">AI</span></span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto hide-scrollbar">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-accent-peach text-accent-orange font-semibold"
                    : "text-text-muted hover:text-text-primary hover:bg-base-raised"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-glass pt-4 mt-4">
          <div className="flex items-center gap-3 mb-4 group">
            <div className="w-9 h-9 rounded-full bg-accent-peach flex items-center justify-center text-sm font-semibold text-accent-orange shrink-0">
              {user?.full_name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1 relative flex items-center pr-6">
              <div className="w-full">
                {isEditingName ? (
                  <input 
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    onBlur={handleSaveName}
                    className="w-full bg-base border border-border-glass rounded px-2 py-0.5 text-sm text-text-primary focus:outline-none focus:border-accent-orange mb-0.5"
                  />
                ) : (
                  <p className="text-sm font-medium truncate">{user?.full_name ?? "Learner"}</p>
                )}
                <p className="text-xs text-text-muted">{computedXP()} XP</p>
              </div>
              {!isEditingName && (
                <button 
                  onClick={() => { setEditName(user?.full_name ?? "Learner"); setIsEditingName(true); }}
                  className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-accent-orange p-1"
                >
                  <Pencil size={12} />
                </button>
              )}
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary px-3 py-2 w-full rounded-lg hover:bg-base-raised transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto relative flex flex-col">
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-base-raised transition-all relative"
              title="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-orange rounded-full animate-pulse"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-14 right-0 w-80 bg-base-panel border border-border-glass rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="p-4 border-b border-border-glass flex items-center justify-between bg-base-raised/50">
                  <h3 className="font-display font-semibold text-content-base">Notifications</h3>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-text-muted hover:text-text-primary">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {MOCK_NOTIFICATIONS.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-border-glass last:border-b-0 hover:bg-base-raised transition-colors cursor-pointer ${notif.unread ? 'bg-accent-blue/5' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.unread ? 'bg-base border border-accent-blue/20 shadow-sm' : 'bg-base-raised'}`}>
                          {notif.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-semibold truncate ${notif.unread ? 'text-content-base' : 'text-text-muted'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-text-faint whitespace-nowrap ml-2">{notif.time}</span>
                          </div>
                          <p className="text-xs text-text-muted leading-snug">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-base-raised/30 text-center border-t border-border-glass">
                  <button className="text-xs font-semibold text-accent-blue hover:text-accent-peach transition-colors">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-base-raised transition-all"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <Outlet />
        <TutorChat />
      </main>
    </div>
  );
}
