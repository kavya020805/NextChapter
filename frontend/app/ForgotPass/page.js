"use client"
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Logo from "../components/Logo";
import Link from "next/link";
import { sendResetEmail } from "../firebase/auth";
import { getFirebaseAuth } from "../firebase/client";
import { confirmPasswordReset } from "firebase/auth";

function ForgotPassContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  
  // Check if user is coming from email link (has oobCode and mode is resetPassword)
  const isPasswordResetMode = !!(oobCode && mode === "resetPassword");
  
  // Debug: Log URL parameters
  console.log("URL Parameters:", { oobCode, mode, isPasswordResetMode });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    if (isPasswordResetMode) {
      // Handle password reset
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!oobCode) {
        setError("Invalid or missing reset code.");
        setLoading(false);
        return;
      }
      try {
        await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
        setSuccess("Your password has been reset successfully. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Handle sending reset email
      try {
        await sendResetEmail(email);
        setSuccess("Password reset email sent. Please check your inbox.");
      } catch (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF6EB] font-sans">
      <div className="p-4">
        <Logo />
      </div>
      <div>
        <h1 className="text-5xl font-bold text-gray-800 text-center mb-2">
          {isPasswordResetMode ? "Set New Password" : "Reset Your Password"}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {isPasswordResetMode ? "Enter your new password below." : (
            <>
              Remember Your Password? {" "}
              <Link href="/login" className="text-[#D47249] hover:underline">
                Sign In
              </Link>
            </>
          )}
        </p>
      </div>
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-10 px-6">
        <div className="flex-1 w-full max-w-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isPasswordResetMode ? (
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
            ) : (
              <>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border-b border-[#D47249] bg-transparent py-2 px-1 text-[#D47249] placeholder-[#D47249] focus:outline-none focus:border-[#D47249]"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full border-b border-[#D47249] bg-transparent py-2 px-1 text-[#D47249] placeholder-[#D47249] focus:outline-none focus:border-[#D47249]"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-50 rounded-full bg-[#D47249] py-2 text-white font-semibold hover:bg-[#BF5F3B]"
                disabled={loading}
              >
                {loading 
                  ? (isPasswordResetMode ? "Resetting..." : "Sending...") 
                  : (isPasswordResetMode ? "Reset Password" : "Send Reset Email")
                }
              </button>
            </div>
          </form>
        </div>
        {/* Divider */}
       
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

export default function ForgotPass() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPassContent />
    </Suspense>
  );
}
