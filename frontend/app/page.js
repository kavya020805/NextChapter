"use client";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to NextChapter
          </h1>
          
          {user ? (
            <div className="space-y-4">
              <p className="text-xl text-gray-600">
                Hello, {user.displayName || user.email}! You&apos;re successfully logged in.
              </p>
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-2">Your Account</h2>
                <p className="text-sm text-gray-600">Email: {user.email}</p>
                {user.displayName && (
                  <p className="text-sm text-gray-600">Name: {user.displayName}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xl text-gray-600">
                Please sign in or create an account to get started.
              </p>
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-4">Get Started</h2>
                <p className="text-sm text-gray-600">
                  Use the profile dropdown in the navbar to sign in or sign up.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}