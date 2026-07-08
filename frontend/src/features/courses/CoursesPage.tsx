import { Play, Code2, BrainCircuit, Network, MessageSquare, Eye, Database, Sparkles, LineChart, HeartHandshake, FileText, Mic, Cpu, ThumbsUp, Smartphone, Terminal, Calculator, PieChart, BarChart, Server, Shield, Heart, TrendingUp, Cloud, Zap, Target, Atom, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useState, useMemo } from "react";
import { CourseTrie } from "@/lib/trie";

const STATIC_COURSES = [
  { id: "dsa", title: "Data Structures & Algorithms", level: "Beginner", lessons: 15, progress: 0, icon: "Network", color: "from-accent-orange to-accent-peach", category: "Computer Science" },
  { id: "ml", title: "Machine Learning Foundations", level: "Beginner", lessons: 24, progress: 75, icon: "BrainCircuit", color: "from-accent-orange to-accent-peach", category: "Foundations" },
  { id: "dl", title: "Deep Learning with PyTorch", level: "Intermediate", lessons: 32, progress: 40, icon: "Network", color: "from-accent-blue to-accent-peach", category: "Deep Learning" },
  { id: "nlp", title: "NLP & Large Language Models", level: "Advanced", lessons: 28, progress: 20, icon: "MessageSquare", color: "from-accent-orange to-accent-brown", category: "NLP" },
  { id: "cv", title: "Computer Vision Systems", level: "Advanced", lessons: 26, progress: 0, icon: "Eye", color: "from-accent-brown to-accent-orange", category: "Computer Vision" },
  { id: "rl", title: "Reinforcement Learning", level: "Advanced", lessons: 30, progress: 0, icon: "Code2", color: "from-accent-blue to-accent-brown", category: "Applied AI" },
  { id: "mlops", title: "MLOps & Model Deployment", level: "Advanced", lessons: 12, progress: 0, icon: "Database", color: "from-accent-peach to-accent-orange", category: "Applied AI" },
  { id: "genai", title: "Generative AI & Diffusion", level: "Advanced", lessons: 4, progress: 0, icon: "Sparkles", color: "from-accent-orange to-accent-peach", category: "Deep Learning" },
  { id: "timeseries", title: "Time Series Forecasting", level: "Intermediate", lessons: 4, progress: 0, icon: "LineChart", color: "from-accent-blue to-accent-peach", category: "Applied AI" },
  { id: "gnn", title: "Graph Neural Networks", level: "Advanced", lessons: 4, progress: 0, icon: "Network", color: "from-accent-brown to-accent-orange", category: "Deep Learning" },
  { id: "ethics", title: "AI Ethics & Alignment", level: "Beginner", lessons: 4, progress: 0, icon: "HeartHandshake", color: "from-accent-blue to-accent-brown", category: "Foundations" },
  { id: "nlg", title: "Natural Language Generation", level: "Intermediate", lessons: 4, progress: 0, icon: "FileText", color: "from-accent-orange to-accent-peach", category: "NLP" },
  { id: "audio", title: "Speech & Audio Processing", level: "Advanced", lessons: 4, progress: 0, icon: "Mic", color: "from-accent-blue to-accent-peach", category: "Applied AI" },
  { id: "robotics", title: "Autonomous Agents", level: "Advanced", lessons: 4, progress: 0, icon: "Cpu", color: "from-accent-brown to-accent-orange", category: "Deep Learning" },
  { id: "recsys", title: "Recommender Systems", level: "Advanced", lessons: 4, progress: 0, icon: "ThumbsUp", color: "from-accent-blue to-accent-brown", category: "Applied AI" },
  { id: "edge", title: "Edge AI & TinyML", level: "Advanced", lessons: 4, progress: 0, icon: "Smartphone", color: "from-accent-peach to-accent-orange", category: "Foundations" },
  { id: "prompting", title: "Prompt Engineering Mastery", level: "Beginner", lessons: 4, progress: 0, icon: "Terminal", color: "from-accent-orange to-accent-brown", category: "NLP" },
  { id: "math", title: "Mathematics for ML", level: "Advanced", lessons: 4, progress: 0, icon: "Calculator", color: "from-accent-orange to-accent-brown", category: "Foundations" },
  { id: "stats", title: "Probability & Statistics", level: "Intermediate", lessons: 4, progress: 0, icon: "PieChart", color: "from-accent-blue to-accent-peach", category: "Foundations" },
  { id: "dataeng", title: "Data Engineering for ML", level: "Intermediate", lessons: 4, progress: 0, icon: "Database", color: "from-accent-peach to-accent-orange", category: "Applied AI" },
  { id: "dataviz", title: "Data Visualization", level: "Beginner", lessons: 4, progress: 0, icon: "BarChart", color: "from-accent-brown to-accent-orange", category: "Foundations" },
  { id: "bigdata", title: "Big Data Analytics", level: "Advanced", lessons: 4, progress: 0, icon: "Server", color: "from-accent-blue to-accent-brown", category: "Applied AI" },
  { id: "automl", title: "AutoML & NAS", level: "Advanced", lessons: 4, progress: 0, icon: "Cpu", color: "from-accent-orange to-accent-peach", category: "Deep Learning" },
  { id: "federated", title: "Federated Learning", level: "Advanced", lessons: 4, progress: 0, icon: "Shield", color: "from-accent-blue to-accent-peach", category: "Applied AI" },
  { id: "healthcare", title: "AI in Healthcare", level: "Intermediate", lessons: 4, progress: 0, icon: "Heart", color: "from-accent-peach to-accent-orange", category: "Applied AI" },
  { id: "finance", title: "AI in Finance", level: "Advanced", lessons: 4, progress: 0, icon: "TrendingUp", color: "from-accent-brown to-accent-orange", category: "Applied AI" },
  { id: "cloud", title: "Cloud ML Pipelines", level: "Intermediate", lessons: 4, progress: 0, icon: "Cloud", color: "from-accent-blue to-accent-brown", category: "Applied AI" },
  { id: "cpp", title: "C++ for High-Performance ML", level: "Advanced", lessons: 4, progress: 0, icon: "Code2", color: "from-accent-orange to-accent-brown", category: "Foundations" },
  { id: "jax", title: "Advanced Deep Learning with JAX", level: "Advanced", lessons: 4, progress: 0, icon: "Zap", color: "from-accent-blue to-accent-peach", category: "Deep Learning" },
  { id: "optimization", title: "Convex Optimization", level: "Advanced", lessons: 4, progress: 0, icon: "Target", color: "from-accent-peach to-accent-orange", category: "Foundations" },
  { id: "quantum", title: "Quantum Machine Learning", level: "Advanced", lessons: 4, progress: 0, icon: "Atom", color: "from-accent-brown to-accent-orange", category: "Applied AI" }
];

const ICON_MAP: Record<string, any> = { Code2, BrainCircuit, Network, MessageSquare, Eye, Database, Sparkles, LineChart, HeartHandshake, FileText, Mic, Cpu, ThumbsUp, Smartphone, Terminal, Calculator, PieChart, BarChart, Server, Shield, Heart, TrendingUp, Cloud, Zap, Target, Atom };
const TAGS = ['All', 'Computer Science', 'Foundations', 'Deep Learning', 'NLP', 'Computer Vision', 'Applied AI'];

export default function CoursesPage() {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: apiCourses, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await api.get('/courses')).data
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await api.post(`/courses/${courseId}/enroll`);
      return data;
    },
    onSuccess: () => refetch()
  });

  const savedProgress = useAuthStore((s) => s.courseProgress);

  const baseCourses = apiCourses?.length ? apiCourses.map((c: any) => ({
    id: c.id,
    title: c.title,
    level: c.level || "Beginner",
    lessons: 20, // mock
    progress: c.progress || 0, // mock
    icon: "Code2",
    color: "from-accent-orange to-accent-peach",
    category: "Foundations"
  })) : STATIC_COURSES;

  const courses = baseCourses.map((c: any) => ({
    ...c,
    progress: savedProgress[c.id] !== undefined ? savedProgress[c.id] : c.progress
  }));

  // 1. Build the Trie
  const trie = useMemo(() => {
    const t = new CourseTrie();
    courses.forEach((c: any) => t.insert(c.id, c.title));
    return t;
  }, [courses]);

  // 2. Filter using Trie if searching, else use Tag
  const filteredCourses = useMemo(() => {
    let result = courses;
    
    // O(L) fast search via Trie
    if (searchQuery.trim().length > 0) {
      const matchedIds = trie.searchPrefix(searchQuery);
      result = result.filter((c: any) => matchedIds.has(c.id));
    }
    
    // Apply tag filter
    if (activeTag !== 'All') {
      result = result.filter((c: any) => c.category === activeTag);
    }
    
    return result;
  }, [courses, activeTag, searchQuery, trie]);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">All Modules</h1>
          <p className="text-text-muted mt-1">Choose a path and start learning AI/ML.</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search via Trie..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-base-raised border border-border-glass rounded-lg pl-9 pr-4 py-2 text-sm focus:border-accent-orange outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {TAGS.map((tag) => (
              <button 
                key={tag} 
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTag === tag ? 'bg-accent-orange text-white shadow-sm' : 'glass-card hover:bg-base-raised text-text-muted hover:text-text-primary'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course: any) => {
          const Icon = ICON_MAP[course.icon] || Code2;
          return (
          <div key={course.id} className="glass-panel p-6 relative overflow-hidden group hover:border-accent-blue/50 transition-colors flex flex-col">
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${course.color} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />
            
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} p-[1px]`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shrink-0`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                course.level === 'Beginner' ? 'bg-accent-blue/10 text-accent-blue' :
                course.level === 'Intermediate' ? 'bg-accent-orange/10 text-accent-orange' :
                'bg-accent-brown/10 text-accent-brown'
              }`}>
                {course.level}
              </span>
            </div>

            <h3 className="font-display font-semibold text-xl mb-1">{course.title}</h3>
            <p className="text-sm text-text-muted mb-6">{course.lessons} Lessons</p>

            <div className="flex items-center justify-between text-sm mb-2 mt-auto">
              <span className="text-text-muted">{course.progress > 0 ? `${course.progress}% Completed` : 'Not started'}</span>
              {course.progress > 0 && <span className="text-accent-brown font-medium">{course.progress}%</span>}
            </div>

            <div className="w-full h-1.5 rounded-full bg-base-raised overflow-hidden mb-6">
              <div 
                className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all duration-1000`}
                style={{ width: `${course.progress}%` }}
              />
            </div>

            <button 
              onClick={() => navigate(`/modules/${course.id}`)}
              className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                course.progress > 0 
                ? 'bg-base-raised hover:bg-border-glass text-text-primary' 
                : 'bg-accent-orange text-white shadow-sm hover:brightness-110'
              }`}>
              {course.progress > 0 ? 'Continue' : 'Start'}
              <Play size={16} />
            </button>
          </div>
        )})}
      </div>
    </div>
  );
}
