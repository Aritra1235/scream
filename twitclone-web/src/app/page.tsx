import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TwitClone</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              About
            </a>
            <Button asChild className="rounded-full">
              <Link href="/sign-up">
                Get Started
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Welcome to
              <span className="block text-blue-500">TwitClone</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Share your thoughts, connect with friends, and discover what's happening in the world around you.
              Join millions of users on the ultimate social platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-4 rounded-full">
              <Link href="/sign-up">
                Start Tweeting
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-full border-2">
              Learn More
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Experience blazing-fast performance with our optimized platform designed for seamless social interactions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Connect Globally</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with people from around the world. Share ideas, stories, and build meaningful relationships.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Stay Inspired</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Discover trending topics, breaking news, and creative content that keeps you engaged and informed.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 TwitClone. Built with passion for social connection.
          </p>
        </div>
      </footer>
    </div>
  );
}
