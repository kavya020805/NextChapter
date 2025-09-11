"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });

    if (!email) return setErrors((p) => ({ ...p, email: "Email is required" }));
    if (!password)
      return setErrors((p) => ({ ...p, password: "Password is required" }));

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Login successful!");
    }, 1500);
  };

  const handleGoogleLogin = () => alert("Google login clicked!");
  const handleAppleLogin = () => alert("Apple login clicked!");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#975DCF] to-[#6F12C9] px-4 ">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[rgba(26,26,26,0.72)] to-[rgba(26,26,26,0.48)] p-7 shadow-xl backdrop-blur text-white">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="flex justify-center m-2 p-2">
            <Logo/>
          </div>
          <p className="text-3xl font-[var(--font-merriweather)]">Welcome to NextChapter</p>

        </div>
         <div className="my-4 flex items-center text-gray-400 text-xs">
          <hr className="flex-grow border-gray-700" />
          <span className="mx-2">Continue with</span>
          <hr className="flex-grow border-gray-700" />
        </div>
        {/* Social Login */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleGoogleLogin}
            className="flex w-1/2 items-center justify-center space-x-2 rounded-lg border border-purple-400 py-2.5 hover:bg-white/10 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span className="text-sm font-medium">Google</span>
          </button>
          <button
            onClick={handleAppleLogin}
            className="flex w-1/2 items-center justify-center space-x-2 rounded-lg border border-purple-400 py-2.5 hover:bg-white/10 transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple"
              className="h-5 w-5 invert"
            />
            <span className="text-sm font-medium">Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center text-gray-400 text-xs">
          <hr className="flex-grow border-gray-700" />
          <span className="mx-2">or Continue with email</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg bg-[#C4A1E6] px-4 py-3 text-sm text-[#57534E] placeholder-[#57534E] focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg bg-[#C4A1E6] px-4 py-3 text-sm text-[#57534E] placeholder-[#57534E]
                         focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between text-xs text-gray-300">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
              />
              <span>Remember me</span>
            </label>
             <Link href="/ForgotPass" className="text-purple-400 hover:underline">
            Forgot Password ?
          </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[#52148E] py-3 font-semibold text-white transition hover:bg-purple-800 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Loading..." : "Sign in"}
          </button>
        </form>

        {/* Switch to Signup */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Not registered yet?{" "}
          <Link href="/signup" className="text-purple-400 hover:underline">
            SignUp
          </Link>
        </p>

        {/* Language */}
        <div className="mt-6 flex justify-center">
          <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white">
            🌐 <span>English</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 space-x-4">
          <Link href="/privacy" className="hover:text-purple-300">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-purple-300">
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}
