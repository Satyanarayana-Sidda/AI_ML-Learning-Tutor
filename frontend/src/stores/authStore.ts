import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  xp_points: number;
  current_streak: number;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  
  // Cloud Sync State
  courseProgress: Record<string, number>;
  chapterContents: Record<string, string>;
  
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  
  // Sync Actions
  setCourseProgress: (courseId: string, progress: number) => void;
  setChapterContent: (chapterId: string, content: string) => void;
  syncToCloud: () => Promise<void>;
  fetchFromCloud: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      courseProgress: {},
      chapterContents: {},
      
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null, courseProgress: {}, chapterContents: {} }),
      
      setCourseProgress: (courseId, progress) => {
        set((state) => ({ courseProgress: { ...state.courseProgress, [courseId]: progress } }));
        get().syncToCloud();
      },
      setChapterContent: (chapterId, content) => {
        set((state) => ({ chapterContents: { ...state.chapterContents, [chapterId]: content } }));
        get().syncToCloud();
      },
      
      syncToCloud: async () => {
        const state = get();
        if (!state.user) return;
        try {
          await api.post(`/sync/${state.user.id}`, {
            courseProgress: state.courseProgress,
            chapterContents: state.chapterContents
          });
        } catch (e) {
          console.error("Failed to sync to cloud", e);
        }
      },
      
      fetchFromCloud: async () => {
        const state = get();
        if (!state.user) return;
        try {
          const res = await api.get(`/sync/${state.user.id}`);
          if (res && res.data) {
            set({
              courseProgress: res.data.courseProgress || {},
              chapterContents: res.data.chapterContents || {}
            });
          }
        } catch (e) {
          console.error("Failed to fetch from cloud", e);
        }
      }
    }),
    { name: "aiml-tutor-auth" }
  )
);
