'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Calendar,
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  Check,
  Play,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRICING_TIERS } from '@/lib/utils/constants';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b rounded-none">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">RepurposeAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-foreground-muted hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-foreground-muted hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#how-it-works" className="text-foreground-muted hover:text-foreground transition-colors">
              How It Works
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="sm:text-base">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" className="sm:text-base">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 hover:bg-surface rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <Link href="#features" className="block py-2 text-foreground-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#pricing" className="block py-2 text-foreground-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link href="#how-it-works" className="block py-2 text-foreground-muted hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </Link>
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="secondary" className="w-full">Log In</Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button variant="primary" className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Rich Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
              variants={fadeInUp}
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground">AI-Powered Content Repurposing</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
              variants={fadeInUp}
            >
              Transform One Video Into{' '}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
                Endless Content
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-2xl text-foreground-muted/80 max-w-2xl mx-auto mb-10 leading-relaxed"
              variants={fadeInUp}
            >
              Automatically repurpose your videos, podcasts, and blogs into
              platform-perfect content for YouTube, Twitter, Instagram, and more.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
              variants={fadeInUp}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all rounded-2xl"
                >
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                className="h-14 px-8 text-lg bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-md rounded-2xl"
              >
                <Play className="w-5 h-5 mr-2" /> Watch Demo
              </Button>
            </motion.div>

            {/* Platform icons */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-foreground-muted/60 grayscale hover:grayscale-0 transition-all duration-500"
              variants={fadeInUp}
            >
              <span className="text-sm font-medium uppercase tracking-wider opacity-70">Trusted by creators on:</span>
              <div className="flex items-center gap-6 sm:gap-8">
                <Youtube className="w-6 h-6 hover:text-[#FF0000] transition-colors cursor-pointer" />
                <Twitter className="w-6 h-6 hover:text-[#1DA1F2] transition-colors cursor-pointer" />
                <Instagram className="w-6 h-6 hover:text-[#E4405F] transition-colors cursor-pointer" />
                <Linkedin className="w-6 h-6 hover:text-[#0A66C2] transition-colors cursor-pointer" />
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            className="mt-20 relative text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative inline-block rounded-[2rem] p-2 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm">
              <div className="relative rounded-[1.8rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10 bg-[#0f0f16]">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5" />
                {/* Placeholder for Dashboard UI - Keeping simplistic for now but styled better */}
                <div className="aspect-[16/9] w-full max-w-5xl flex items-center justify-center bg-[url('/grid.svg')] bg-cover opacity-50">
                  <div className="text-center p-12 glass-card rounded-3xl border border-white/10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Dashboard Preview</h3>
                    <p className="text-foreground-muted">Interactive demo coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect under the image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/20 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">
              Everything You Need to{' '}
              <span className="text-gradient">Scale Content</span>
            </h2>
            <p className="text-base sm:text-xl text-foreground-muted max-w-2xl mx-auto px-4">
              From transcription to scheduling, we handle the entire content workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Zap,
                title: 'AI-Powered Repurposing',
                description: 'Upload once, get clips, threads, captions, and more in seconds.',
              },
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Schedule posts across all platforms with optimal timing suggestions.',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track performance across platforms with unified insights.',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Invite team members, set approval workflows, share content.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Your content is encrypted and protected with best practices.',
              },
              {
                icon: Sparkles,
                title: 'Trending Hooks',
                description: 'AI suggests viral hooks and hashtags based on trends.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-4 sm:p-6 hover-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-foreground-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6 bg-background-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-base sm:text-xl text-foreground-muted">
              Three simple steps to multiply your content
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-8">
            {[
              { step: '01', title: 'Upload', desc: 'Drop your video, audio, or text file' },
              { step: '02', title: 'Process', desc: 'AI generates clips, threads, captions' },
              { step: '03', title: 'Publish', desc: 'Schedule & post to all platforms' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl sm:text-6xl font-bold text-gradient mb-3 sm:mb-4">{item.step}</div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-foreground-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-base sm:text-xl text-foreground-muted">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {Object.entries(PRICING_TIERS).map(([key, tier], index) => (
              <motion.div
                key={key}
                className={`glass-card p-5 sm:p-8 ${key === 'pro' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {key === 'pro' && (
                  <div className="text-center mb-3 sm:mb-4">
                    <span className="px-3 py-1 bg-primary text-white text-xs sm:text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-bold">${tier.price}</span>
                    {tier.price > 0 && <span className="text-foreground-muted text-sm sm:text-base">/month</span>}
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 sm:gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                      <span className="text-foreground-muted text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button
                    variant={key === 'pro' ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {tier.price === 0 ? 'Start Free' : 'Get Started'}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card-glow p-6 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
            <div className="relative">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                Ready to 10x Your Content?
              </h2>
              <p className="text-base sm:text-xl text-foreground-muted mb-6 sm:mb-8">
                Join thousands of creators who save hours every week with RepurposeAI.
              </p>
              <Link href="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">RepurposeAI</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            <p className="text-sm text-foreground-muted">
              © 2024 RepurposeAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
