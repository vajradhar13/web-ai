'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Bot, FileText, MessageCircle, FileSearch } from "lucide-react";
import Carousel from "@/components/ui/carousel";

// Generic AI Logo/Icon
function AILogo() {
  return (
    <span className="flex items-center gap-2 text-primary">
      <Bot className="h-7 w-7" />
      <span className="sr-only">AI Assistant</span>
    </span>
  );
}

// Redesigned Navbar
function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-4 px-6 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <AILogo />
      <div className="flex gap-4">
        <Link href="/chatbot" className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary transition-colors">
          <MessageCircle className="h-4 w-4" /> Chatbot
        </Link>
        <Link href="/document-qa" className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary transition-colors">
          <FileSearch className="h-4 w-4" /> Document QA
        </Link>
        <Link href="/summarize" className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary transition-colors">
          <FileText className="h-4 w-4" /> Summarize
        </Link>
      </div>
      <Button asChild variant="default" size="sm">
        <Link href="/summarize">Try Now</Link>
      </Button>
    </nav>
  );
}

// HeroSection (no product name, just AI/assistant theme)
function HeroSection() {
  return (
    <div className="relative overflow-hidden py-20 md:py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background -z-10" />
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          
          <div className="flex items-center gap-3 mb-2">
            <AILogo />
          </div>
          <p className="text-xl font-medium text-primary">
            Your Smart AI Assistant for Documents & Conversations
          </p>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Summarize PDFs, ask questions about documents, and chat with an intelligent assistant—all in one place.
          </p>
          <Button asChild variant="default" size="lg" className="group">
            <Link href="#carousel" className="flex items-center gap-2">
              Explore Features
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-16 w-full">
      <div className="mx-auto px-4 md:px-6 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FileText className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold text-lg mb-1">PDF Summarization</h3>
            <p className="text-sm text-muted-foreground text-center">Upload any text-based PDF and get a concise summary powered by AI.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FileSearch className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold text-lg mb-1">Document Q&A</h3>
            <p className="text-sm text-muted-foreground text-center">Ask questions about your documents and get instant, accurate answers.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold text-lg mb-1">Chatbot</h3>
            <p className="text-sm text-muted-foreground text-center">Chat with an intelligent assistant for any topic or task.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// CarouselComp with slides
export function CarouselComp() {
  const slideData = [
    {
      title: "Summarization",
      button: "Explore",
      src: "/asssets/summarization.png",
      path: "summarize"
    },
    {
      title: "Q & A Chatbot",
      button: "Explore",
      src: "/asssets/chatbot.png",
      path: "/chatbot"
    },
  ];

  return (
    <div className="relative overflow-hidden w-full h-full py-20">
      <Carousel slides={slideData} />
    </div>
  );
}

function ModelSection() {
  return (
    <section id="models" className="py-16 w-full">
      <div className="mx-auto px-4 md:px-6 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-8">AI Models</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[250px]">
            <h3 className="font-semibold text-lg mb-2">Gemini 1.5 Flash</h3>
            <p className="text-sm text-muted-foreground">Fast, accurate, and cost-effective for summarization and Q&A.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[250px]">
            <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">More advanced models and features will be added soon.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full py-8 border-t border-neutral-200 bg-white/80 text-center text-sm text-muted-foreground mt-8">
      &copy; {new Date().getFullYear()} AI Assistant. All rights reserved.
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />
      <main className="flex-1 w-full">
        {/* Main container with centered content and consistent padding */}
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <FeaturesSection />
          {/* Carousel section with improved spacing */}
          <section id="carousel" className="py-16 bg-background w-full">
            <div className="mx-auto px-4 md:px-6 max-w-7xl">
              <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Explore Our Capabilities
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
