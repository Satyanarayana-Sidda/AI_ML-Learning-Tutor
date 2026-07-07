import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import DocumentsPage from "@/features/documents/DocumentsPage";
import PathsPage from "@/features/paths/PathsPage";
import CoursesPage from "@/features/courses/CoursesPage";
import ModuleViewerPage from "@/features/courses/ModuleViewerPage";
import CodeLabPage from "@/features/codelab/CodeLabPage";
import QuizCenterPage from "@/features/quiz/QuizCenterPage";
import RoadmapsPage from "@/features/roadmaps/RoadmapsPage";
import ProjectsPage from "@/features/projects/ProjectsPage";
import InterviewPrepPage from "@/features/interview/InterviewPrepPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";
import AchievementsPage from "@/features/achievements/AchievementsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/paths" element={<PathsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/modules/:moduleId" element={<ModuleViewerPage />} />
          <Route path="/code-lab" element={<CodeLabPage />} />
          <Route path="/quiz-center" element={<QuizCenterPage />} />
          <Route path="/roadmaps" element={<RoadmapsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
