"use client";

import { motion } from "framer-motion";
import { Zap, Heart, Users, Flame, Target } from "lucide-react";
import {
  NeoButton,
  StoryCard,
  ValueCard,
  LandingNav,
  LandingFooter,
} from "@/components/landing";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFE66D] text-black font-sans">
      <LandingNav showBackLink />

      {/* Hero Section */}
      <section className="py-24 px-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] border-b-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tight">
              About{" "}
              <span className="text-[#FF6B6B] bg-black px-4 transform -skew-x-6 inline-block">
                SCREAM
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold mb-12 max-w-3xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1">
              The raw, chaotic, and unfiltered social platform we built because the
              internet needed more noise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-16 text-center uppercase tracking-tight">
              Our{" "}
              <span className="underline decoration-8 decoration-[#FF6B6B] underline-offset-8">
                Story
              </span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            <StoryCard
              icon={<Flame className="w-8 h-8 text-black" />}
              title="The Problem"
              content="We were tired of the same old sanitized social platforms. Algorithms deciding what you see, filters hiding reality, and everyone pretending to be perfect. The internet lost its edge, its chaos, its humanity."
              delay={0.1}
            />

            <StoryCard
              icon={<Zap className="w-8 h-8 text-black" />}
              title="The Spark"
              content="One late night, fueled by energy drinks and existential dread, we asked: What if we built something that embraced the mess? Something raw, loud, and real. Transparent algorithms, no filters, no bullshit."
              delay={0.2}
            />

            <StoryCard
              icon={<Target className="w-8 h-8 text-black" />}
              title="The Mission"
              content="SCREAM was born. A platform where you can be yourself, scream your thoughts, and connect with people who get it. We built it for the misfits, the dreamers, the angry, and the authentic."
              delay={0.3}
            />

            <StoryCard
              icon={<Heart className="w-8 h-8 text-black" />}
              title="Why We Care"
              content="Because the world needs more genuine connection. Because algorithms should be transparent and fair. Because sometimes you just need to scream, and someone needs to hear it."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 px-6 bg-white border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-16 text-center uppercase tracking-tight">
              What Makes Us{" "}
              <span className="text-[#FFE66D] bg-black px-4 transform -skew-x-6 inline-block">
                Different
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Transparent Algorithms"
              description="Our algorithms are open about how they work. No mysterious formulas or manipulation. Fair, transparent, and designed to promote quality content."
              color="bg-[#FF6B6B]"
            />

            <ValueCard
              icon={<Heart className="w-8 h-8 text-white" />}
              title="Authentic Connections"
              description="Meet people for who they really are. No filters, no facades, no pretending. Just real conversations."
              color="bg-[#4ECDC4]"
            />

            <ValueCard
              icon={<Users className="w-8 h-8 text-white" />}
              title="Global Chaos"
              description="Connect with weirdos from every corner of the globe. Language barriers? Who cares. Memes are universal."
              color="bg-[#FFE66D]"
            />

            <ValueCard
              icon={<Flame className="w-8 h-8 text-white" />}
              title="Freedom to Express"
              description="Say what you mean. Mean what you say. No character limits on your thoughts. Let it out."
              color="bg-[#FFE66D]"
            />

            <ValueCard
              icon={<Target className="w-8 h-8 text-white" />}
              title="Built for Humans"
              description="We prioritize people over profits. Your privacy matters. Your voice matters. You matter."
              color="bg-[#FF6B6B]"
            />

            <ValueCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Lightning Fast"
              description="Optimized for speed. No bloated features. No unnecessary crap. Just pure, screaming performance."
              color="bg-[#4ECDC4]"
            />
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#4ECDC4] border-4 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-center uppercase tracking-tight">
              Our Vision
            </h2>
            <div className="text-center space-y-6">
              <p className="text-2xl md:text-3xl font-black leading-relaxed">
                To create a digital space where authenticity thrives, where voices
                are amplified by transparent algorithms, and where human connection
                happens on its own terms.
              </p>
              <p className="text-xl font-bold leading-relaxed">
                We're not just building a social platform. We're building a movement.
                A rebellion against the sanitized, controlled, opaque algorithm-driven
                internet. Join us in making the web loud and transparent again.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 px-6 bg-black text-white border-t-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tight">
              Ready to Make Some <span className="text-[#FFE66D]">Noise</span>?
            </h2>
            <p className="text-xl font-bold mb-12 max-w-2xl mx-auto">
              Join thousands of users who have discovered the freedom of authentic
              expression. The internet's most chaotic social platform is waiting for
              you.
            </p>
            <NeoButton href="/sign-up" variant="secondary" className="text-2xl px-16 py-8">
              START SCREAMING
            </NeoButton>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}


