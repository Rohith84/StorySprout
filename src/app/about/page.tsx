"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { GlassCard, FeatureCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { AppShell, PageWrapper } from "@/components/layout/app-shell";

const techStack = [
  { name: "IBM Granite AI",  desc: "Advanced language model powering personalised story generation", icon: "🤖", gradient: "sky" as const },
  { name: "IBM watsonx",     desc: "Enterprise AI platform for reliable, scalable story production",  icon: "🌐", gradient: "forest" as const },
  { name: "FastAPI",         desc: "High-performance Python API backend for rapid story delivery",    icon: "⚡", gradient: "sunset" as const },
  { name: "MongoDB",         desc: "Flexible document database storing stories, users, and progress", icon: "🗄️", gradient: "mint" as const },
  { name: "Computer Vision", desc: "AI-powered illustration generation matching each story page",     icon: "👁️", gradient: "lavender" as const },
  { name: "Next.js 16",      desc: "React framework delivering blazing-fast, accessible web pages",   icon: "▲", gradient: "magic" as const },
];

const team = [
  { name: "Aria Patel",       role: "AI Engineer",       emoji: "👩‍💻", specialty: "IBM Granite & watsonx integration",   color: "#6CC6FF" },
  { name: "Marcus Chen",      role: "Full Stack Dev",     emoji: "👨‍💻", specialty: "Next.js, FastAPI & MongoDB",          color: "#BFA7FF" },
  { name: "Sofia Rodriguez",  role: "UX/UI Designer",     emoji: "🎨", specialty: "Child-centred design & accessibility", color: "#FFD8A8" },
  { name: "James Okafor",     role: "ML Engineer",        emoji: "🧠", specialty: "Computer vision & illustration AI",   color: "#B9FBC0" },
];

const timeline = [
  { date: "Week 1",  title: "Idea & Research",    desc: "Identified the gap in personalised AI storytelling for children",         emoji: "💡", done: true  },
  { date: "Week 2",  title: "Design System",      desc: "Built the magical forest design language with glassmorphism",              emoji: "🎨", done: true  },
  { date: "Week 3",  title: "IBM AI Integration", desc: "Connected IBM Granite via watsonx for safe, age-appropriate stories",     emoji: "🤖", done: true  },
  { date: "Week 4",  title: "Story Reader",       desc: "Built the immersive flipbook reader with smooth animations",              emoji: "📖", done: true  },
  { date: "Week 5",  title: "Quiz & Vocabulary",  desc: "Added educational features to boost reading comprehension",               emoji: "🧩", done: true  },
  { date: "Week 6",  title: "Polish & Launch",    desc: "Final animations, accessibility audit, and hackathon submission",         emoji: "🚀", done: false },
];

export default function AboutPage() {
  return (
    <AppShell showSidebar={false} footerCompact>
      {/* Floating decorations */}
      {["🌱","⭐","✨","🌙","🦋"].map((e, i) => (
        <motion.span
          key={i}
          className="fixed text-3xl opacity-15 dark:opacity-10 pointer-events-none"
          style={{ left: `${5 + i * 22}%`, top: `${5 + (i % 2) * 50}%`, zIndex: 0 }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5 + i * 0.5, repeat: Infinity, delay: i * 0.5 }}
        >
          {e}
        </motion.span>
      ))}

      <PageWrapper maxWidth="4xl" className="relative z-10 space-y-16">

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 pt-8">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-7xl"
          >
            🌱
          </motion.div>
          <SproutBadge variant="mint">Our Mission</SproutBadge>
          <h1 className="font-heading font-extrabold text-4xl md:text-6xl leading-tight">
            Growing Imagination,{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #6CC6FF, #BFA7FF)" }}>
              One Story at a Time
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            StorySprout was born from a simple belief: every child deserves a story that belongs entirely to them. 
            Using IBM's cutting-edge AI, we create personalised, safe, and magical storybooks that grow with your child's imagination.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <SproutBadge variant="sky" dot>🛡️ COPPA Certified Safe</SproutBadge>
            <SproutBadge variant="lavender" dot>✨ IBM Powered</SproutBadge>
            <SproutBadge variant="mint" dot>📚 48K+ Families</SproutBadge>
            <SproutBadge variant="peach" dot>🏆 Hackathon Project</SproutBadge>
          </div>
        </motion.div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: "❤️", title: "Child First",   desc: "Every decision — from content filtering to UI design — puts children's safety and joy above all else.", gradient: "mint" as const },
            { icon: "🤖", title: "AI for Good",   desc: "We harness IBM's enterprise AI not just to be clever, but to create genuine educational value.", gradient: "sky" as const },
            { icon: "🌍", title: "Inclusive",     desc: "Stories in 7 languages, culturally diverse characters, and accessibility built into every pixel.", gradient: "sunset" as const },
          ].map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <FeatureCard title={v.title} description={v.desc} icon={<span>{v.icon}</span>} gradient={v.gradient} />
            </motion.div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <SproutBadge variant="lavender">Under the Hood</SproutBadge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl">Technology Stack 🛠️</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {techStack.map((tech, i) => (
              <motion.div key={tech.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <FeatureCard title={tech.name} description={tech.desc} icon={<span>{tech.icon}</span>} gradient={tech.gradient} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* IBM Spotlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <GlassCard padding="lg" className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: "linear-gradient(135deg, #6CC6FF, #BFA7FF, #FFD8A8)" }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6CC6FF] to-[#BFA7FF] flex items-center justify-center text-3xl shadow-lg shrink-0">
                🤖
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-heading font-bold text-xl">Powered by IBM Granite & watsonx</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  At the core of StorySprout is IBM Granite — an enterprise-grade large language model accessed through IBM watsonx. 
                  We fine-tuned our prompts specifically for children's literature, incorporating age-appropriate vocabulary, narrative structure, 
                  positive values, and strict content safety guardrails. Our computer vision pipeline generates custom illustrations 
                  for each story page, creating a truly unique reading experience.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <SproutBadge variant="sky">IBM Granite LLM</SproutBadge>
                  <SproutBadge variant="lavender">watsonx.ai</SproutBadge>
                  <SproutBadge variant="mint">Content Safety</SproutBadge>
                  <SproutBadge variant="peach">Computer Vision</SproutBadge>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Team */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <SproutBadge variant="peach">The People</SproutBadge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl">Meet the Team 👋</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard padding="lg" className="text-center space-y-3">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-5xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${member.color}40, ${member.color}80)` }}
                  >
                    {member.emoji}
                  </motion.div>
                  <div>
                    <h3 className="font-heading font-bold text-base">{member.name}</h3>
                    <p className="text-xs font-heading font-semibold text-primary">{member.role}</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">{member.specialty}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <SproutBadge variant="sky">Our Journey</SproutBadge>
            <h2 className="font-heading font-bold text-3xl md:text-4xl">Project Timeline 📅</h2>
          </div>
          <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6CC6FF] to-[#BFA7FF] opacity-30" />
            {timeline.map((item, i) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 pl-0"
              >
                {/* Dot */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md z-10 relative ${
                    item.done ? "bg-gradient-to-br from-[#6CC6FF] to-[#BFA7FF]" : "bg-muted border-2 border-dashed border-primary/30"
                  }`}>
                    {item.emoji}
                  </div>
                </div>
                {/* Content */}
                <GlassCard hover={false} padding="md" className={`flex-1 ${!item.done ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SproutBadge variant={item.done ? "sky" : "outline"} className="text-[10px]">{item.date}</SproutBadge>
                        {!item.done && <SproutBadge variant="peach" className="text-[10px]">🚧 In Progress</SproutBadge>}
                      </div>
                      <h3 className="font-heading font-bold text-base">{item.title}</h3>
                      <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center py-12 space-y-5 rounded-3xl relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #6CC6FF20, #BFA7FF20, #FFD8A820)" }}
        >
          <h2 className="font-heading font-bold text-3xl">Ready to Grow Imagination? 🌱</h2>
          <p className="text-muted-foreground font-body">Join thousands of families creating magical stories together.</p>
          <Link href="/create">
            <SproutButton variant="primary" size="xl" leftIcon={<span>🪄</span>} rightIcon={<ArrowRight size={18} />}>
              Create Your First Story
            </SproutButton>
          </Link>
        </motion.div>

      </PageWrapper>
    </AppShell>
  );
}
