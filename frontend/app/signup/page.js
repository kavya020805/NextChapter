"use client";
import { Component, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState("");

  // Password strength checker
  const checkStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0: return "";
      case 1: return "Weak";
      case 2: return "Medium";
      case 3:
      case 4: return "Strong";
      default: return "";
    }
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setStrength(checkStrength(pwd));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(`Signed up with Email: ${email}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#975DCF] to-[#6F12C9] px-4 ">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[rgba(26,26,26,0.72)] to-[rgba(26,26,26,0.48)] p-7 shadow-xl backdrop-blur text-white"> 
        
        {/* Logo */}
        <div className="mb-6 text-center">
        <div className="flex justify-center">
          <Logo/>
        </div>
          <h2 className="mt-4 text-2xl font-[var(--font-merriweather)]">Sign Up</h2>
        </div>
        <div className="my-4 flex items-center text-gray-400 text-xs">
          <hr className="flex-grow border-gray-700" />
          <span className="mx-2">Continue with</span>
          <hr className="flex-grow border-gray-700" />
        </div>
        {/* Social Sign Up */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => alert("Google Sign Up")}
            className="flex w-1/2 items-center justify-center space-x-2 rounded-lg border border-purple-500 py-2 text-sm font-medium hover:bg-white/10 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span>Google</span>
          </button>
          <button
            onClick={() => alert("Apple Sign Up")}
            className="flex w-1/2 items-center justify-center space-x-2 rounded-lg border border-purple-500 py-2 text-sm font-medium hover:bg-white/10 transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple"
              className="h-5 w-5 invert"
            />
            <span>Apple</span>
          </button>
        </div>
        {/* Divider */}
         <div className="my-4 flex items-center text-gray-400 text-xs">
          <hr className="flex-grow border-gray-700" />
          <span className="mx-2">or Continue with email</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg bg-[#C4A1E6] px-4 py-3 text-sm text-[#57534E] placeholder-[#57534E]
                         focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password"
              className="w-full rounded-lg bg-[#C4A1E6] px-4 py-3 pr-10 text-sm text-[#57534E] placeholder-[#57534E] 
                         focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-[#57534E] hover:text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Strength */}
          {strength && (
            <p
              className={`text-sm ${
                strength === "Weak"
                  ? "text-red-400"
                  : strength === "Medium"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              Password Strength: {strength}
            </p>
          )}

        {/* Terms & Conditions Checkbox */}
<div className="flex items-center justify-between text-xs text-gray-300">
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
      required
    />
    <span>
      I agree to the{" "}
      <Link href="/terms" className="text-purple-400 hover:underline">
        Terms of Use
      </Link>
      <span> & </span>
      <Link href="/terms" className="text-purple-400 hover:underline">
        Privacy policy
      </Link>
    </span>
  </label>
</div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#52148E] py-3 font-semibold text-white transition hover:bg-purple-800"
          >
            Sign Up
          </button>
        </form>

        {/* Switch to Login */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:underline">
            Sign In
          </Link>
        </p>

        {/* Footer */}
        
         {/* Language */}
        <div className="mt-6 flex justify-center">
          <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white">
            🌐 <span>English</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500 space-x-4">
          <Link href="/privacy" className="hover:text-purple-400">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-purple-400">
            Terms of Use
          </Link>
        </div>
        
      </div>
    </div>
  );
}
