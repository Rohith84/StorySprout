"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReaderShell } from "@/components/reader-shell";
import type { ReaderShellPage } from "@/components/reader-shell";
import { ENCHANTED_FOREST_SAMPLE } from "@/lib/enchanted-forest-sample";

interface StoryApiResponse {
  title: string;
  pages: { pageNumber: number; text: string; imagePrompt: string }[];
}

export default function PublicStoryPage() {
  const params = useParams<{ slug: string }>();
  const [storyData, setStoryData] = React.useState<{
    pages: ReaderShellPage[];
    storyTitle: string;
    error: boolean;
    loading: boolean;
  }>({ pages: [], storyTitle: "", error: false, loading: true });

  React.useEffect(() => {
    let cancelled = false;

    async function fetchStory() {
      if (params.slug === "enchanted-forest") {
        if (!cancelled) {
          setStoryData({
            storyTitle: ENCHANTED_FOREST_SAMPLE.title,
            pages: ENCHANTED_FOREST_SAMPLE.pages.map((p) => ({
              pageNum: p.pageNumber,
              text: p.text,
              imageUrl: "",
              imageLoading: false,
            })),
            error: false,
            loading: false,
          });
        }
        return;
      }

      try {
        const res = await fetch(`/api/shares/${params.slug}`);
        if (!res.ok) {
          if (!cancelled) setStoryData({ pages: [], storyTitle: "", error: true, loading: false });
          return;
        }

        const data: StoryApiResponse = await res.json();
        if (!data.pages?.length) {
          if (!cancelled) setStoryData({ pages: [], storyTitle: "", error: true, loading: false });
          return;
        }

        if (!cancelled) {
          setStoryData({
            storyTitle: data.title,
            pages: data.pages.map((p) => ({
              pageNum: p.pageNumber,
              text: p.text,
              imageUrl: "",
              imageLoading: false,
            })),
            error: false,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) setStoryData({ pages: [], storyTitle: "", error: true, loading: false });
      }
    }

    fetchStory();
    return () => { cancelled = true; };
  }, [params.slug]);

  if (storyData.error) {
    return (
      <div className="min-h-screen gradient-page flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-4 rounded-3xl bg-background/80 backdrop-blur-sm p-8 shadow-2xl shadow-black/10 border border-border/50">
          <h1 className="font-heading font-bold text-2xl">Story not found</h1>
          <p className="text-sm text-muted-foreground font-body">
            This shared story link could not be loaded. The link may be invalid or expired.
          </p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-heading font-semibold text-sm bg-gradient-to-r from-[#C87533] to-[#E8A44A] text-white shadow-md hover:brightness-105 transition-all">
              <ChevronLeft size={16} /> Make Your Own Story
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (storyData.loading || storyData.pages.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #E8DCC8 0%, #D4C4A0 100%)" }}
      >
        <div className="animate-pulse text-lg font-body" style={{ color: "#7A5020" }}>
          Loading story...
        </div>
      </div>
    );
  }

  return (
    <ReaderShell
      pages={storyData.pages}
      storyTitle={storyData.storyTitle}
      showMakeYourOwnCta
    />
  );
}
