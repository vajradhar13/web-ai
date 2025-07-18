'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Bot, FileText, MessageCircle, FileSearch } from "lucide-react";
import { Spotlight } from "@/components/ui/Spotlight";

// Redesigned Navbar
function Navbar() {
  // Scroll to features section
  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById('features');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <nav className="w-full flex items-center justify-center py-8 lg:px-8 px-2 mx-auto sticky top-0 z-50" style={{ backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between w-full max-w-4xl rounded-2xl px-6 py-3 bg-white/10 border border-white/20 shadow-lg" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)' }}>
        <div className="flex items-center gap-2">
          <Bot className="h-7 w-7 text-black" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex gap-8">
            <a href="#features" onClick={scrollToFeatures} className="flex items-center gap-1 text-base font-medium text-white hover:text-gray-300 transition-colors cursor-pointer">
              <MessageCircle className="h-5 w-5 text-black" /> Chatbot
            </a>
            <a href="#features" onClick={scrollToFeatures} className="flex items-center gap-1 text-base font-medium text-white hover:text-gray-300 transition-colors cursor-pointer">
              <FileSearch className="h-5 w-5 text-black" /> Document QA
            </a>
            <a href="#features" onClick={scrollToFeatures} className="flex items-center gap-1 text-base font-medium text-white hover:text-gray-300 transition-colors cursor-pointer">
              <FileText className="h-5 w-5 text-black" /> Summarize
            </a>
          </div>
        </div>
        <Button asChild variant="default" size="sm" className="bg-black text-white border-none shadow-md hover:bg-gray-800 transition">
          <Link href="/unified-assistant">Try Now</Link>
        </Button>
      </div>
    </nav>
  );
}

// HeroSection (no product name, just AI/assistant theme)
function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center py-24 md:py-32 w-full">
      <div className="bg-[#18181b]/80 rounded-2xl shadow-lg px-8 py-12 flex flex-col items-center max-w-2xl w-full border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">Your Smart AI Assistant for Documents & Conversations</h1>
        <p className="max-w-[700px] text-gray-300 text-center mb-8 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Summarize PDFs, ask questions about documents, and chat with an intelligent assistant—all in one place.
        </p>
        <Button asChild variant="default" size="lg" className="group bg-black text-white border-none shadow-md hover:bg-gray-800 transition">
          <Link href="#features" className="flex items-center gap-2">
            Explore Features
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-16 w-full bg-transparent">
      <div className="mx-auto px-4 md:px-6 max-w-5xl">
        <h2 className="text-center text-sm font-bold mb-2 text-white tracking-widest animate-fade-in">HOW IT WORKS</h2>
        <h3 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-white animate-slide-up">Transform any PDF into an easy-to-digest summary in three simple steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center bg-[#18181b]/80 rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in border border-white/10" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}>
            <FileText className="h-12 w-12 text-white mb-4" />
            <h4 className="font-bold text-lg mb-2 text-white">Upload your PDF</h4>
            <p className="text-base text-gray-300 text-center">Simply drag and drop your PDF document or click to upload</p>
          </div>
          <div className="flex flex-col items-center bg-[#18181b]/80 rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in border border-white/10" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}>
            <Sparkles className="h-12 w-12 text-white mb-4" />
            <h4 className="font-bold text-lg mb-2 text-white">AI Analysis</h4>
            <p className="text-base text-gray-300 text-center">Our advanced AI processes and analyzes your document instantly</p>
          </div>
          <div className="flex flex-col items-center bg-[#18181b]/80 rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in border border-white/10" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}>
            <FileText className="h-12 w-12 text-white mb-4" />
            <h4 className="font-bold text-lg mb-2 text-white">Get Summary</h4>
            <p className="text-base text-gray-300 text-center">Receive a clear, concise summary of your document</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="flex flex-col items-center bg-[#18181b]/80 rounded-xl shadow-lg p-8 col-span-3 md:col-span-1 md:col-start-2 transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in border border-white/10" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}>
            <MessageCircle className="h-12 w-12 text-white mb-4" />
            <h4 className="font-bold text-lg mb-2 text-white">Chat with AI</h4>
            <p className="text-base text-gray-300 text-center">Interact with your document or ask anything—get instant, intelligent answers</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// CarouselComp with slides
function CarouselComp() {
  const slideData = [
    {
      title: "Summarization",
      src: "/asssets/summarization.png",
      path: "summarize"
    },
    {
      title: "Q & A Chatbot",
      src: "/asssets/chatbot.png",
      path: "/chatbot"
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-center py-12">
      {slideData.map((slide) => (
        <div
          key={slide.title}
          className="flex flex-col items-center bg-[#18181b]/80 rounded-xl shadow-lg p-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-white/10 animate-fade-in"
          style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}
        >
          <img src={slide.src} alt={slide.title} className="h-32 w-auto mb-6 object-contain" />
          <h3 className="font-bold text-2xl mb-4 text-white text-center">{slide.title}</h3>
        </div>
      ))}
    </div>
  );
}

function ModelSection() {
  return (
    <section id="models" className="py-16 w-full">
      <div className="mx-auto px-4 md:px-6 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">AI Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
          <div className="bg-[#18181b]/80 rounded-xl shadow-lg p-8 flex flex-col items-center border border-white/10 animate-fade-in" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}>
            <h3 className="font-bold text-xl mb-2 text-white">Gemini 1.5 Flash</h3>
            <p className="text-base text-gray-300 text-center">Fast, accurate, and cost-effective for summarization and Q&A.</p>
          </div>
          <div className="bg-[#18181b]/80 rounded-xl shadow-lg p-8 flex flex-col items-center border border-white/10 animate-fade-in" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}>
            <h3 className="font-bold text-xl mb-2 text-white">Coming Soon</h3>
            <p className="text-base text-gray-300 text-center">More advanced models and features will be added soon.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full py-8 border-t border-white/10 bg-transparent text-center text-sm text-white mt-8">
      &copy; {new Date().getFullYear()} AI Assistant. All rights reserved.
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full relative overflow-x-hidden bg-black">
      <Spotlight className="top-0 left-0 w-full h-full opacity-100" fill="#fff" />
      <Navbar />
      <main className="flex-1 w-full relative z-10">
        {/* Main container with centered content and consistent padding */}
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <FeaturesSection />
          {/* Carousel section with improved spacing */}
          <section id="carousel" className="py-16 bg-transparent w-full">
            <div className="mx-auto px-4 md:px-6 max-w-7xl">
              <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Explore Our Capabilities
                </h2>
                <p className="max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See the AI Assistant in action with these interactive examples
                </p>
              </div>
              <CarouselComp />
            </div>
          </section>
          <ModelSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
