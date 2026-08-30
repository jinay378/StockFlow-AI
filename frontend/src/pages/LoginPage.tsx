import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, verifyOtp, resendOtp } from "../services/auth.service";
import Logo from "../components/common/Logo";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  RotateCw,
  KeyRound,
  ArrowLeft,
} from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();

  // Step state: "credentials" | "otp" | "success"
  const [authStep, setAuthStep] = useState<"credentials" | "otp" | "success">("credentials");

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP State
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (authStep === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (authStep === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [authStep]);

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);

      if (response.requires_otp) {
        setTempToken(response.temp_token);
        setMaskedEmail(response.masked_email || email);
        setDemoOtpCode(response.demo_otp || null);
        setCountdown(60);
        setCanResend(false);
        setOtpDigits(["", "", "", "", "", ""]);
        setAuthStep("otp");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      setErrorMessage(
        error.response?.data?.detail ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Individual Digit Input
  const handleDigitChange = (index: number, value: string) => {
    // Keep only the last typed digit
    const cleaned = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];

    if (cleaned.length > 0) {
      newDigits[index] = cleaned[cleaned.length - 1];
      setOtpDigits(newDigits);
      setErrorMessage("");

      // Move focus to next input
      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      newDigits[index] = "";
      setOtpDigits(newDigits);
    }
  };

  // Handle Backspace & Navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle Paste Event (Full 6 digits)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    // Focus on the next empty or last filled
    const nextIdx = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp(tempToken, fullOtp);

      setAuthenticatedUser(response.username || "Admin");
      setAuthStep("success");

      // Smooth cinematic redirect delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1400);
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      setErrorMessage(
        error.response?.data?.detail ||
          "Invalid or expired OTP code. Access denied."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setErrorMessage("");
    setSuccessInfo("");

    try {
      setResending(true);
      const response = await resendOtp(tempToken);
      setDemoOtpCode(response.demo_otp || null);
      setCountdown(60);
      setCanResend(false);
      setSuccessInfo("A new 6-digit verification code has been sent to your email inbox.");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => setSuccessInfo(""), 5000);
      otpInputRefs.current[0]?.focus();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.detail ||
          "Failed to resend OTP. Please return to login and try again."
      );
    } finally {
      setResending(false);
    }
  };

  // Demo Helpers
  const fillDemoAdmin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    setErrorMessage("");
  };

  const autoFillDemoOtp = () => {
    if (!demoOtpCode || demoOtpCode.length !== 6) return;
    const digits = demoOtpCode.split("");
    setOtpDigits(digits);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center mb-4">
          <Logo size={44} to="/" />
        </div>
        <p className="text-center text-sm text-slate-400">
          AI-Powered Smart Inventory & Supply Chain Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-scale-in">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* ========================================================= */}
          {/* SCREEN 3: LOGIN SUCCESSFUL ANIMATION                      */}
          {/* ========================================================= */}
          {authStep === "success" && (
            <div className="py-6 text-center space-y-5 animate-scale-in">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 animate-pulse-glow flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={44} className="animate-scale-in" />
                </div>
                <Sparkles size={20} className="absolute -top-1 -right-1 text-emerald-300 animate-bounce" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Welcome back, {authenticatedUser}!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  2FA OTP Verified. Initializing live encrypted dashboard...
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-full transition-all duration-1000 ease-out" />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 1: EMAIL & PASSWORD CREDENTIALS                   */}
          {/* ========================================================= */}
          {authStep === "credentials" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Sign in to your account
                </h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  Step 1 of 2
                </span>
              </div>

              {errorMessage && (
                <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm animate-shake">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying credentials...</span>
                    </div>
                  ) : (
                    <>
                      <span>Continue to OTP Verification</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Credentials */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700/60 hover:border-emerald-500/40"
                >
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Use Demo Admin Credentials (admin@example.com)</span>
                </button>
              </div>

              <div className="mt-6 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition ml-1"
                  >
                    Create an Account
                  </Link>
                </p>

                <div>
                  <Link
                    to="/"
                    className="text-xs text-slate-500 hover:text-slate-300 transition"
                  >
                    ← Back to Homepage
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2: 2-FACTOR 6-DIGIT EMAIL OTP VERIFICATION        */}
          {/* ========================================================= */}
          {authStep === "otp" && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Mail size={28} className="animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Email OTP Verification
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  To protect company data from unauthorized access, enter the 6-digit code sent to your registered email:
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-400 font-mono text-xs font-semibold tracking-wider shadow-sm">
                  ✉️ {maskedEmail || email}
                </div>
              </div>

              {/* Success Info Message */}
              {successInfo && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-lg text-xs font-medium animate-fade-in text-center">
                  {successInfo}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-xs font-medium animate-shake text-center">
                  {errorMessage}
                </div>
              )}

              {/* Demo Helper Banner for Testing */}
              {demoOtpCode && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-400" />
                    <span className="text-slate-400">Demo Code:</span>
                    <span className="font-mono font-bold text-amber-300 tracking-wider text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {demoOtpCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={autoFillDemoOtp}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition"
                  >
                    Auto Fill
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Boxes */}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div
                  className="flex justify-between gap-2 sm:gap-2.5"
                  onPaste={handlePaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-slate-950 border transition-all duration-200 outline-none ${
                        digit
                          ? "border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500"
                          : "border-slate-700 text-white placeholder-slate-600 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                      } ${errorMessage ? "border-red-500/60 ring-1 ring-red-500/40" : ""}`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying OTP & Authorizing...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Verify & Access Company Data</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend OTP & Back Controls */}
              <div className="space-y-4 pt-2 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition"
                    >
                      <RotateCw size={13} className={resending ? "animate-spin" : ""} />
                      <span>{resending ? "Dispatching..." : "Resend OTP Code"}</span>
                    </button>
                  ) : (
                    <span>
                      Didn't receive code? Resend in{" "}
                      <span className="font-mono font-bold text-slate-200">
                        {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                        {String(countdown % 60).padStart(2, "0")}
                      </span>
                    </span>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("credentials");
                      setErrorMessage("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to email & password</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;