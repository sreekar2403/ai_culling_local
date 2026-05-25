"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ImageIcon,
  HardDrive,
  Download,
  Shield,
  Code2,
  ChevronRight,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold tracking-tight">
              Ollama Photo Culler
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ollama
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Launch App
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div
          variants={fadeIn}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
        >
          <Shield className="h-3.5 w-3.5" />
          100% Local & Privacy-First
        </motion.div>

        <motion.h1
          variants={fadeIn}
          className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
        >
          AI Photo Culling{" "}
          <span className="text-blue-600">That Never Leaves</span> Your Machine
        </motion.h1>

        <motion.p
          variants={fadeIn}
          className="mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Use Ollama vision models to analyze, rate, and cull thousands of
          photos — all locally. No uploads, no subscriptions, just your photos
          and your privacy.
        </motion.p>

        <motion.div variants={fadeIn} className="mt-10 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <ImageIcon className="h-5 w-5" />
            Start Culling
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-base font-medium hover:bg-muted transition-colors"
          >
            <Code2 className="h-5 w-5" />
            GitHub
          </a>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section id="features" className="border-t border-border/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to cull like a pro
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built for photographers who value speed, privacy, and zero
              subscriptions.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-border/50 bg-white p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span>Ollama Photo Culler — Free & Open Source</span>
          <span>Built with ❤️ for the photography community</span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "AI-Powered Culling",
    description:
      "Uses Ollama vision models (LLaVA, minicpm-v, moondream) to score images on sharpness, exposure, blur, and composition quality.",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    title: "Batch Photo Loading",
    description:
      "Load thousands of images via drag-and-drop or folder picker. Supports JPEG, PNG, TIFF, and major RAW formats through LibRaw.",
    icon: <ImageIcon className="h-6 w-6" />,
  },
  {
    title: "Hardware Detection",
    description:
      "Automatically detects your CPU, GPU, and RAM to recommend the optimal Ollama vision model for your machine's capabilities.",
    icon: <HardDrive className="h-6 w-6" />,
  },
  {
    title: "Privacy First",
    description:
      "Zero images ever leave your machine. All processing happens locally through Ollama. No cloud upload, no data leaks, no subscriptions.",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    title: "Flexible Export",
    description:
      "Export your cull selection as TXT, CSV, or JSON — compatible with Lightroom, Capture One, and other editing workflows.",
    icon: <Download className="h-6 w-6" />,
  },
  {
    title: "Manual Override",
    description:
      "AI is your assistant, not your boss. Review each image in full-screen, override decisions, and trust your creative judgment.",
    icon: <ImageIcon className="h-6 w-6" />,
  },
];
