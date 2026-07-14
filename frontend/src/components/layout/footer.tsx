"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, BookOpen, Wand2, Star, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  Discover: [
    { label: "Library",       href: "/library"    },
    { label: "Dashboard",     href: "/dashboard"  },
    { label: "Downloads",     href: "/downloads"  },
    { label: "About",         href: "/about"      },
  ],
  Create: [
    { label: "New Story",     href: "/create"     },
    { label: "Login",         href: "/login"      },
    { label: "Settings",      href: "/settings"   },
    { label: "Quiz",          href: "/quiz/1"     },
  ],
  Support: [
    { label: "Help Center",   href: "/help"       },
    { label: "Privacy Policy",href: "/privacy"    },
    { label: "Terms of Service",href: "/terms"    },
    { label: "Contact Us",    href: "/contact"    },
  ],
} as const;

const socials = [
  { icon: <span className="text-sm font-bold">𝕏</span>,    href: "#", label: "Twitter / X"  },
  { icon: <span className="text-sm font-bold">IG</span>,   href: "#", label: "Instagram"    },
  { icon: <span className="text-sm font-bold">▶</span>,    href: "#", label: "YouTube"      },
];

interface FooterProps {
  className?: string;
  compact?: boolean;
}

function Footer({ className, compact = false }: FooterProps) {
  if (compact) {
    return (
      <footer className={cn("border-t border-border/30 py-4 glass", className)}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-body">
          <div className="flex items-center gap-1.5">
            <span>🌱</span>
            <span className="font-heading font-semibold text-foreground">StorySprout</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="fill-[#BFA7FF] stroke-[#BFA7FF]" /> for young readers
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("border-t border-border/30 glass mt-auto", className)}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="text-3xl"
              >
                🌱
              </motion.span>
              <span className="font-heading font-extrabold text-xl">StorySprout</span>
            </Link>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs">
              Where imagination grows — magical AI-powered stories crafted for every child&apos;s wonder and curiosity.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="p-2 rounded-xl glass hover:scale-110 text-muted-foreground hover:text-foreground transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            {/* Newsletter */}
            <div className="flex gap-2 max-w-xs">
              <input
                type="email"
                placeholder="Your email…"
                className="flex-1 h-9 px-3 rounded-xl text-sm font-body border border-border bg-background/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Subscribe to newsletter"
              />
              <button className="h-9 px-4 rounded-xl gradient-sky text-white text-xs font-heading font-semibold hover:brightness-105 transition-all shrink-0">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <h4 className="font-heading font-bold text-sm text-foreground">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-body">
          <p>© {new Date().getFullYear()} StorySprout. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="fill-[#BFA7FF] stroke-[#BFA7FF] mx-0.5" /> for young readers everywhere
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
