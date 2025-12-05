"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { NeoButton, FeatureCard, LandingFooter } from "@/components/landing";

export function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div className="min-h-screen bg-[#FFE66D] text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-black text-xl">
              T
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">
              SCREAM
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold">
            <a
              href="#features"
              className="hover:underline decoration-4 underline-offset-4 decoration-[#FF6B6B]"
            >
              Features
            </a>
            <Link
              href="/about"
              className="hover:underline decoration-4 underline-offset-4 decoration-[#4ECDC4]"
            >
              About
            </Link>
            <NeoButton href="/sign-up" variant="primary" className="py-2 px-6 text-base">
              Join Now
            </NeoButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={targetRef}
        style={{ opacity, scale, y }}
        className="relative min-h-screen flex items-center justify-center pt-20 px-6 border-b-4 border-black bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, rotate: 5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          >
            <h1 className="text-6xl md:text-9xl font-black mb-8 leading-none tracking-tighter drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              SAY IT.  
              <br />
              <span className="text-[#FF6B6B] bg-black px-4 transform -skew-x-6 inline-block mt-2">
                MEAN IT.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-3xl font-bold mb-12 max-w-3xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1"
          >
            A platform built for real voices, real thoughts, and real people.  
            No fake personas. No algorithmic manipulation. Just signal — not noise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <NeoButton href="/sign-up" variant="primary">
              START NOW
            </NeoButton>
            <NeoButton href="#features" variant="secondary">
              LEARN MORE
            </NeoButton>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-32 left-10 w-24 h-24 bg-[#4ECDC4] border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce hidden md:block" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FF6B6B] border-4 border-black rotate-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hidden md:block" />
      </motion.section>

      {/* Marquee */}
      <div className="bg-black text-white py-4 border-y-4 border-black overflow-hidden whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="inline-block text-4xl font-black uppercase tracking-widest"
        >
          • REAL PEOPLE • ZERO FILTERS • HIGH SIGNAL • REAL PEOPLE • ZERO FILTERS • HIGH SIGNAL •
        </motion.div>
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="inline-block text-4xl font-black uppercase tracking-widest"
        >
          • REAL PEOPLE • ZERO FILTERS • HIGH SIGNAL • REAL PEOPLE • ZERO FILTERS • HIGH SIGNAL •
        </motion.div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-20 text-center uppercase tracking-tight">
            Why{" "}
            <span className="underline decoration-8 decoration-[#4ECDC4] underline-offset-8">
              Join Us?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              title="Blazing Tech"
              description="Optimized systems, instant delivery. Built like a modern infra stack, not a legacy social feed."
              color="bg-[#F7FFF7]"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />

            <FeatureCard
              title="The World — Unfiltered"
              description="Connect with millions, instantly. Think global group chat, but smarter and less chaotic… mostly."
              color="bg-[#FFE66D]"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            <FeatureCard
              title="Be True. Be You."
              description="No fake metrics. No performative nonsense. Post what’s real — your thoughts, your ideas, your energy."
              color="bg-[#FF6B6B]"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#4ECDC4] border-t-4 border-black">
        <div className="max-w-5xl mx-auto text-center bg-white border-4 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase">
            Ready to speak your mind?
          </h2>
          <p className="text-xl font-bold mb-10 max-w-2xl mx-auto">
            Join a platform built for authenticity, speed, and actual human expression.  
            No noise. No pretending. Just you.
          </p>
          <NeoButton href="/sign-up" variant="primary" className="text-xl px-12 py-6">
            GET STARTED
          </NeoButton>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
