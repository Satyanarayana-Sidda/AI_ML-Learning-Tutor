import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/auth/forgot-password", { email });
    setSent(true);
    toast.success("Check your inbox for a reset link");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-panel p-8">
        <h1 className="font-display text-2xl font-semibold mb-1 text-center">Reset your password</h1>
        <p className="text-text-muted text-sm text-center mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <p className="text-center text-sm text-accent-cyan">
            If that email exists, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary mt-2">
              Send reset link
            </button>
          </form>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          <Link to="/login" className="text-accent-blue hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
