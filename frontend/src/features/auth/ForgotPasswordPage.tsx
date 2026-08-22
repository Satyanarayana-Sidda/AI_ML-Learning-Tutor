import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Mail, KeyRound, Sparkles, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [senderInfo, setSenderInfo] = useState<string>("Satyanarayana Sidda (Founder, Satya Academy)");

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      if (data.otp) {
        setGeneratedOtp(data.otp);
        setOtp(data.otp); // Pre-fill for 1-click instant verification!
      }
      if (data.sender) {
        setSenderInfo(data.sender);
      }
      setStep("verify");
      toast.success(`OTP Code sent by ${data.sender || "Satyanarayana Sidda"}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail?.message || "Failed to send reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });
      toast.success(data.message || "Password updated successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.detail?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-base">
      <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden border border-border-glass shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-orange/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sender Branding Badge */}
        <div className="mb-6 flex items-center justify-center gap-2 bg-accent-peach/30 border border-accent-orange/20 rounded-full py-1.5 px-4 text-xs font-semibold text-accent-brown">
          <ShieldCheck size={14} className="text-accent-orange" />
          <span>Official Dispatch: Satyanarayana Sidda (Founder, Satya Academy)</span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-orange/10 text-accent-orange mx-auto flex items-center justify-center mb-3">
            {step === "request" ? <Mail size={24} /> : <KeyRound size={24} />}
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {step === "request" ? "Reset Password" : "Enter Verification OTP"}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {step === "request"
              ? "Enter your email to receive an instant verification OTP code."
              : `A 6-digit OTP code was generated for ${email}.`}
          </p>
        </div>

        {step === "request" ? (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  placeholder="student@example.com"
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2 flex items-center justify-center gap-2 py-3">
              {loading ? "Generating OTP..." : "Send Reset OTP"}
              <Sparkles size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            {/* OTP Code Callout Badge */}
            {generatedOtp && (
              <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Generated OTP Code by Satya Academy:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-widest text-accent-blue">{generatedOtp}</span>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">6-Digit Verification OTP</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="input-field pl-10 font-mono tracking-widest text-lg font-semibold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  className="input-field pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  className="input-field pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-2 flex items-center justify-center gap-2 py-3">
              {loading ? "Updating Password..." : "Verify OTP & Reset Password"}
              <CheckCircle2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="text-xs text-text-muted hover:text-text-primary text-center mt-1 flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Resend OTP / Change Email
            </button>
          </form>
        )}

        <div className="border-t border-border-glass mt-6 pt-4 text-center">
          <Link to="/login" className="text-sm font-medium text-accent-orange hover:text-accent-brown transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
