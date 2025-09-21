"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Logo from "../components/Logo";
import Link from "next/link";
import { signinWithEmail, signInWithGooglePopup, setAuthPersistence } from "../firebase/auth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await setAuthPersistence(remember);
      await signinWithEmail(email, password);
          router.push("/personalized");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGooglePopup();
          router.push("/personalized");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF6EB] font-sans">
      {/* Logo in top-left */}
      <div className="p-4">
        <Logo />
      </div>
      <div>
        <h1 className="text-5xl font-bold text-gray-800 text-center mb-2"> Log In to Next Chapter </h1>
        <p className="text-center text-gray-500 mb-6"> Don’t have an account?{" "}
          <Link href="/signup" className="text-[#D47249] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-10 px-6">
        <div className="flex-1 w-full max-w-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full border-b border-[#D47249] bg-transparent py-2 px-1 text-[#D47249] placeholder-[#D47249] focus:outline-none focus:border-[#D47249]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border-b border-[#D47249] bg-transparent py-2 px-1 text-[#D47249] placeholder-[#D47249] focus:outline-none focus:border-[#D47249] pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-0 top-2 cursor-pointer text-[#D47249]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.224-3.825m2.551-2.551A9.969 9.969 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.968 9.968 0 01-1.203 2.438M3 3l18 18"
                    />
                  </svg>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-[#D47249]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-[#D47249]"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Remember Me
              </label>
              <Link href="/ForgotPass" className="text-[#DFB3A1] hover:underline">
                Forgot Password?
              </Link>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-25 rounded-full bg-[#D47249] py-2 text-white font-semibold hover:bg-[#BF5F3B]"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center relative">
          <div className="w-px h-64 bg-[#D47249]"></div>
          <span className="absolute bg-[#FDF6EB] px-2 text-sm text-[#D47249] -mt-32 font-bold">
            or
          </span>
        </div>
        <div className="flex-1 w-full max-w-md space-y-4">
          <button className="w-80 flex items-center justify-center gap-2 rounded-4xl border-2 border-[#D47249] px-4 py-2 text-[#D47249] hover:bg-gray-100" onClick={handleGoogleLogin} disabled={loading}>
            <FcGoogle size={20} /> Continue with Google
          </button>
          <button className="w-80 flex items-center justify-center gap-2 rounded-4xl border-2 border-[#D47249] px-4 py-2 text-[#D47249] hover:bg-gray-100" disabled>
            <FaApple size={20} className="text-black" /> Continue with Apple
          </button>
        </div>
      </div>
      {/* Footer */}
      <div className="text-center text-xs mt-8 mb-6 text-[#D47249]">
        <p>
          <a href="#" className="hover:underline text-[#D47249]">
            Terms of Use
          </a>{" "}
          ·{" "}
          <a href="#" className="hover:underline text-[#D47249]">
            Privacy Policy
          </a>
        </p>
        <p className="mt-2">
          This site is protected by reCAPTCHA Enterprise. Google’s{" "}
          <a href="#" className="hover:underline text-[#D47249]">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="hover:underline text-[#D47249]">
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </div>
    </div>
  );
}
