"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MessageSquare, Clock, MapPin, Send } from "lucide-react";

const NeoButton = ({ children, href, variant = "primary", className = "" }: { children: React.ReactNode; href?: string; variant?: "primary" | "secondary"; className?: string }) => {
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 font-black text-lg border-4 border-black transition-all duration-200 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none";
  const variants = {
    primary: "bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    secondary: "bg-[#4ECDC4] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  };

  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const ContactCard = ({ icon, title, description, content, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  content: string;
  color: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: -1 }}
      className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${color}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{title}</h3>
          <p className="text-lg font-bold text-gray-600">{description}</p>
        </div>
      </div>
      <p className="text-lg font-bold leading-relaxed">{content}</p>
    </motion.div>
  );
};

const NeoInput = ({ label, name, type = "text", placeholder, value, onChange, required = false }: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xl font-black uppercase tracking-tight block">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white border-4 border-black p-4 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 focus:translate-x-0.5 transition-all outline-none"
      />
    </div>
  );
};

const NeoTextarea = ({ label, name, placeholder, value, onChange, required = false }: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xl font-black uppercase tracking-tight block">
        {label}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={6}
        className="w-full bg-white border-4 border-black p-4 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 focus:translate-x-0.5 transition-all outline-none resize-none"
      />
    </div>
  );
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Form submitted:", formData);
    setIsSubmitting(false);

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-[#FFE66D] text-black font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b-4 border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-black text-xl">
              T
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">SCREAM</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold hover:text-[#FF6B6B] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back Home
            </Link>
            <NeoButton href="/sign-up" variant="primary" className="py-2 px-6 text-base">
              Join Now
            </NeoButton>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-24 px-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] border-b-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tight">
              Contact <span className="text-[#FFE66D] bg-black px-4 transform -skew-x-6 inline-block">Us</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold mb-12 max-w-2xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Get in touch with the SCREAM team. We're here to help, scream, or listen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase tracking-tight">
              How to Reach Us
            </h2>
          </motion.div>

          <div
            className="grid gap-8 mb-16"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              display: "grid",
            }}
          >
            <ContactCard
              icon={<Mail className="w-6 h-6 text-white" />}
              title="Email"
              description="For general inquiries"
              content="mail@aritra.ovh"
              color="bg-[#4ECDC4]"
            />

            {/* 
            <ContactCard
              icon={<MessageSquare className="w-6 h-6 text-white" />}
              title="Live Chat"
              description="Available in-app"
              content="Quick responses for urgent issues"
              color="bg-[#FF6B6B]"
            />
            */}

            <ContactCard
              icon={<Clock className="w-6 h-6 text-white" />}
              title="Response Time"
              description="We aim to respond"
              content="Within 24-48 hours"
              color="bg-[#FFE66D]"
            />


          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6 bg-white border-y-4 border-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-8 text-center uppercase tracking-tight">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="bg-[#FFE66D] border-4 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <NeoInput
                  label="Name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <NeoInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-6">
                <NeoInput
                  label="Subject"
                  name="subject"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-8">
                <NeoTextarea
                  label="Message"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-3 bg-[#FF6B6B] text-black px-12 py-6 font-black text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 active:translate-y-0 active:translate-x-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase tracking-tight">
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black uppercase mb-4">Account Issues</h3>
                <p className="text-lg font-bold leading-relaxed">
                  Having trouble with your account? Check our help center or contact support.
                </p>
              </div>

              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black uppercase mb-4">Bug Reports</h3>
                <p className="text-lg font-bold leading-relaxed">
                  Found a bug? Let us know the details and we'll fix it ASAP.
                </p>
              </div>

              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black uppercase mb-4">Feature Requests</h3>
                <p className="text-lg font-bold leading-relaxed">
                  Have an idea to make SCREAM better? We'd love to hear it!
                </p>
              </div>

              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black uppercase mb-4">Business Inquiries</h3>
                <p className="text-lg font-bold leading-relaxed">
                  Interested in partnering with us? Get in touch.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 border-t-4 border-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black uppercase mb-2">SCREAM</h4>
            <p className="font-mono text-sm text-gray-400">© 2025. Built with rage and coffee.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="font-bold hover:text-[#FF6B6B] transition-colors">ABOUT</Link>
            <Link href="/privacy" className="font-bold hover:text-[#4ECDC4] transition-colors">PRIVACY</Link>
            <Link href="/terms" className="font-bold hover:text-[#FFE66D] transition-colors">TERMS</Link>
            <Link href="/contact" className="font-bold hover:text-[#4ECDC4] transition-colors">CONTACT</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
