"use client"
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Logo from "../components/Logo";
import Link from "next/link";

export default function ForgotPass() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF6EB] font-sans">
      {/* Logo in top-left */}
      <div className="p-4">
        <Logo />
      </div>

     <div> <h1 className="text-5xl font-bold text-gray-800 text-center mb-2"> Reset Your Password </h1> <p className="text-center text-gray-500 mb-6"> Remember Your Password? {" "}
       <Link href="/login" className="text-[#D47249] hover:underline">
           Sign In
          </Link>
       </p> </div>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-10 px-6">
        {/* Left Side - Form */}
        <div className="flex-1 w-full max-w-md">
          <form className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full border-b border-[#D47249] bg-transparent py-2 px-1 text-[#D47249] placeholder-[#D47249] focus:outline-none focus:border-[#D47249]"
              />
            </div>
           
            {/* Log In button */}
            <div className="flex justify-center">
            <button
              type="submit"
              className="w-50  rounded-full bg-[#D47249] py-2 text-white font-semibold hover:bg-[#BF5F3B]"
            >
              Reset Password
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
