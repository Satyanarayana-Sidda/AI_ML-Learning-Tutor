import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setTokens(data.access_token, data.refresh_token);
      const { data: userData } = await api.get("/auth/me");
      setUser(userData);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-panel p-8">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-semibold text-xl">Tutor<span className="gradient-text">AI</span></span>
        </div>

        <h1 className="font-display text-2xl font-semibold mb-1 text-center">Welcome back</h1>
        <p className="text-text-muted text-sm text-center mb-8">Log in to continue your learning path</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-right -mt-1">
            <Link to="/forgot-password" className="text-xs text-accent-blue hover:underline">
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent-blue hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
