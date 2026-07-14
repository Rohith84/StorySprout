import type { Metadata, Viewport } from "next";
import { Baloo_2, Poppins } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { SessionProvider } from "@/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | StorySprout",
    default: "StorySprout — Magical AI Children's Stories",
  },
  description:
    "Where imagination grows. Create and discover magical AI-powered storybooks for every child's wonder and curiosity.",
  keywords: ["children's books", "AI stories", "storybook", "kids reading", "interactive stories"],
  authors: [{ name: "StorySprout" }],
  openGraph: {
    type: "website",
    title: "StorySprout — Magical AI Children's Stories",
    description: "Where imagination grows. Magical AI-powered stories for young readers.",
    siteName: "StorySprout",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f6ff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0e1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${baloo2.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-body antialiased">
        <SessionProvider>
          <ThemeProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
