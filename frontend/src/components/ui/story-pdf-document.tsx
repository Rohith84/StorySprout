"use client";

/**
 * StoryPdfDocument
 *
 * Renders the StorySprout storybook PDF using @react-pdf/renderer v4.
 * Layout: Cover page → Story pages (one per page) → Vocabulary page → Quiz page.
 *
 * Gradients are rendered via SVG LinearGradient inside an Svg block so that the
 * full brand palette is preserved in the PDF output.
 */

import * as React from "react";
import {
  Document,
  Font,
  Page,
  View,
  Text,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  StyleSheet,
} from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// Emoji source — Apple Color Emoji PNGs via jsDelivr (same "3D" glyphs as
// the browser). Must run once at module load time before any pdf() call.
// ---------------------------------------------------------------------------
Font.registerEmojiSource({
  builder: (code: string) =>
    `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/${code}.png`,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfStoryPage {
  pageNum: number;
  illustration: string;
  gradient: string;
  text: string;
}

export interface PdfVocabItem {
  word: string;
  meaning: string;
}

export interface PdfQuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface PdfStoryMeta {
  heroName?: string;
  heroType: string;
  theme: string;
  ageLevel: string;
  language?: string;
  storyType: string;
  incident?: string;
  lesson?: string;
  artStyle: string;
  length: string;
  createdAt: string;
}

export interface PdfStoryData {
  title: string;
  pages: PdfStoryPage[];
  vocabulary: PdfVocabItem[];
  quiz: PdfQuizQuestion[];
  /** Story creation inputs — present when sessionStorage payload is available. */
  storyMeta?: PdfStoryMeta;
}

// ---------------------------------------------------------------------------
// Brand colours
// ---------------------------------------------------------------------------

const BRAND = {
  skyBlue:  "#6CC6FF",
  lavender: "#BFA7FF",
  peach:    "#FFD8A8",
  mint:     "#B9FBC0",
  sunny:    "#FFE66D",
  white:    "#FFFFFF",
  darkText: "#1f2328",
  mutedText:"#57606a",
  accent:   "#3b82d4",
};

// Gradient stop pairs for the 5 page-gradient slots (matching the reader GRADIENTS array)
const GRADIENT_STOPS: Array<[string, string]> = [
  ["#B9FBC0", "#6CC6FF"],  // 0 forest
  ["#FFD8A8", "#FFE66D"],  // 1 peach/sunny
  ["#6CC6FF", "#BFA7FF"],  // 2 sky/lavender
  ["#BFA7FF", "#FFD8A8"],  // 3 lavender/peach
  ["#B9FBC0", "#BFA7FF"],  // 4 mint/lavender
];

// Cover gradient — same as "magic"
const COVER_STOPS: [string, string] = ["#6CC6FF", "#BFA7FF"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the start and end hex colours from a CSS linear-gradient string.
 *  Falls back to sky/lavender if parsing fails. */
function parseGradientStops(gradient: string): [string, string] {
  const hex = gradient.match(/#[0-9a-fA-F]{6}/g);
  if (hex && hex.length >= 2) return [hex[0], hex[hex.length - 1]];
  return COVER_STOPS;
}

/** Convert a page index to a stable SVG gradient id */
function gradId(prefix: string, idx: number) {
  return `${prefix}${idx}`;
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const S = StyleSheet.create({
  // Page
  pageA4: {
    width: "100%",
    height: "100%",
    backgroundColor: BRAND.white,
  },

  // Cover
  coverFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  coverEmoji: {
    fontSize: 100,
    marginBottom: 24,
    textAlign: "center",
  },
  coverTitle: {
    fontSize: 36,
    color: BRAND.darkText,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: 14,
    color: BRAND.mutedText,
    textAlign: "center",
    letterSpacing: 1,
  },
  coverStorySprout: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
    color: BRAND.mutedText,
  },

  // Story page — illustration area (top half)
  illArea: {
    height: "50%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  illEmoji: {
    fontSize: 80,
    textAlign: "center",
  },
  pageNumBadge: {
    position: "absolute",
    top: 12,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pageNumText: {
    fontSize: 10,
    color: BRAND.white,
  },

  // Story page — text area (bottom half)
  textArea: {
    flex: 1,
    paddingHorizontal: 36,
    paddingVertical: 28,
    backgroundColor: BRAND.white,
  },
  storyText: {
    fontSize: 13,
    color: BRAND.darkText,
    lineHeight: 1.7,
  },

  // Vocab / Quiz pages
  sectionPage: {
    padding: 48,
    backgroundColor: BRAND.white,
  },
  sectionHeading: {
    fontSize: 26,
    color: BRAND.darkText,
    marginBottom: 28,
    borderBottom: `2 solid ${BRAND.skyBlue}`,
    paddingBottom: 10,
  },

  // Vocab items
  vocabItem: {
    marginBottom: 16,
    paddingLeft: 14,
    borderLeft: `3 solid ${BRAND.lavender}`,
  },
  vocabWord: {
    fontSize: 14,
    color: BRAND.darkText,
    marginBottom: 2,
  },
  vocabMeaning: {
    fontSize: 12,
    color: BRAND.mutedText,
    lineHeight: 1.5,
  },

  // Quiz items
  quizItem: {
    marginBottom: 22,
  },
  quizQuestion: {
    fontSize: 13,
    color: BRAND.darkText,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  quizOption: {
    fontSize: 12,
    color: BRAND.darkText,
    marginBottom: 4,
    paddingLeft: 10,
  },
  quizOptionCorrect: {
    fontSize: 12,
    color: "#166534",
    marginBottom: 4,
    paddingLeft: 10,
    backgroundColor: "#dcfce7",
    paddingVertical: 3,
    borderRadius: 4,
  },

  // Story Details page
  detailsHeaderArea: {
    height: 120,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsHeaderEmoji: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 8,
  },
  detailsHeaderTitle: {
    fontSize: 22,
    color: BRAND.darkText,
    textAlign: "center",
  },
  detailsBody: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 32,
    paddingBottom: 48,
    backgroundColor: BRAND.white,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottom: `1 solid #e5e7eb`,
  },
  detailsLabel: {
    width: 140,
    fontSize: 11,
    color: BRAND.mutedText,
    paddingRight: 12,
    lineHeight: 1.5,
  },
  detailsValue: {
    flex: 1,
    fontSize: 12,
    color: BRAND.darkText,
    lineHeight: 1.5,
  },
  detailsCreatedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    marginTop: 8,
    borderTop: `2 solid ${BRAND.skyBlue}`,
  },
  detailsCreatedLabel: {
    width: 140,
    fontSize: 11,
    color: BRAND.mutedText,
    paddingRight: 12,
  },
  detailsCreatedValue: {
    flex: 1,
    fontSize: 12,
    color: BRAND.darkText,
  },
});

// ---------------------------------------------------------------------------
// GradientRect — renders a full-area gradient via SVG inside a View
// ---------------------------------------------------------------------------

interface GradientRectProps {
  id: string;
  stops: [string, string];
}

function GradientRect({ id, stops }: GradientRectProps) {
  return (
    <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
      viewBox="0 0 595 420">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={stops[0]} stopOpacity={1} />
          <Stop offset="1" stopColor={stops[1]} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="595" height="420" fill={`url(#${id})`} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// CoverPage
// ---------------------------------------------------------------------------

function CoverPage({ title }: { title: string }) {
  return (
    <Page size="A4" style={S.pageA4}>
      {/* Gradient background */}
      <Svg style={S.coverFill} viewBox="0 0 595 842">
        <Defs>
          <LinearGradient id="cover-grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={COVER_STOPS[0]} stopOpacity={1} />
            <Stop offset="1" stopColor={COVER_STOPS[1]} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="595" height="842" fill="url(#cover-grad)" />
      </Svg>

      {/* Content */}
      <View style={S.coverContent}>
        <Text style={S.coverEmoji}>📖</Text>
        <Text style={S.coverTitle}>{title}</Text>
        <Text style={S.coverSubtitle}>A StorySprout Story</Text>
      </View>

      <Text style={S.coverStorySprout}>Created with StorySprout ✨</Text>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// StoryPageComponent
// ---------------------------------------------------------------------------

function StoryPageComponent({
  page,
  total,
  index,
}: {
  page: PdfStoryPage;
  total: number;
  index: number;
}) {
  const stops = parseGradientStops(page.gradient) ?? GRADIENT_STOPS[index % GRADIENT_STOPS.length];
  const gid = gradId("story-grad-", index);

  return (
    <Page size="A4" style={S.pageA4}>
      {/* Illustration area */}
      <View style={S.illArea}>
        <GradientRect id={gid} stops={stops} />
        <Text style={S.illEmoji}>{page.illustration}</Text>
        {/* Page badge */}
        <View style={S.pageNumBadge}>
          <Text style={S.pageNumText}>{page.pageNum} / {total}</Text>
        </View>
      </View>

      {/* Text area */}
      <View style={S.textArea}>
        <Text style={S.storyText}>{page.text}</Text>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// VocabPage
// ---------------------------------------------------------------------------

function VocabPage({ vocabulary }: { vocabulary: PdfVocabItem[] }) {
  return (
    <Page size="A4" style={[S.pageA4, S.sectionPage]}>
      <Text style={S.sectionHeading}>Word Bank</Text>
      {vocabulary.map((item, i) => (
        <View key={i} style={S.vocabItem}>
          <Text style={S.vocabWord}>{item.word}</Text>
          <Text style={S.vocabMeaning}>{item.meaning}</Text>
        </View>
      ))}
    </Page>
  );
}

// ---------------------------------------------------------------------------
// QuizPage
// ---------------------------------------------------------------------------

const OPTION_LABELS = ["A", "B", "C", "D"];

function QuizPage({ quiz }: { quiz: PdfQuizQuestion[] }) {
  return (
    <Page size="A4" style={[S.pageA4, S.sectionPage]}>
      <Text style={S.sectionHeading}>Story Quiz</Text>
      {quiz.map((q, qi) => (
        <View key={qi} style={S.quizItem}>
          <Text style={S.quizQuestion}>
            {qi + 1}. {q.question}
          </Text>
          {q.options.map((opt, oi) => {
            const isCorrect = opt === q.answer;
            return (
              <Text key={oi} style={isCorrect ? S.quizOptionCorrect : S.quizOption}>
                {OPTION_LABELS[oi] ?? oi + 1}. {opt}{isCorrect ? "  ✓" : ""}
              </Text>
            );
          })}
        </View>
      ))}
    </Page>
  );
}

// ---------------------------------------------------------------------------
// StoryDetailsPage
// ---------------------------------------------------------------------------

interface MetaRowProps {
  label: string;
  value: string;
}

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <View style={S.detailsRow}>
      <Text style={S.detailsLabel}>{label}</Text>
      <Text style={S.detailsValue}>{value}</Text>
    </View>
  );
}

function StoryDetailsPage({ meta }: { meta: PdfStoryMeta }) {
  return (
    <Page size="A4" style={S.pageA4}>
      {/* Gradient header strip */}
      <View style={S.detailsHeaderArea}>
        <GradientRect id="details-grad" stops={COVER_STOPS} />
        <Text style={S.detailsHeaderEmoji}>📋</Text>
        <Text style={S.detailsHeaderTitle}>Story Details</Text>
      </View>

      {/* Metadata rows */}
      <View style={S.detailsBody}>
        {meta.heroName  && <MetaRow label="Hero Name"    value={meta.heroName} />}
        {meta.heroType  && <MetaRow label="Hero Type"    value={meta.heroType} />}
        <MetaRow label="Theme"       value={meta.theme} />
        <MetaRow label="Age Group"   value={meta.ageLevel} />
        {meta.language  && <MetaRow label="Language"    value={meta.language} />}
        <MetaRow label="Story Type"  value={meta.storyType} />
        {meta.incident  && <MetaRow label="Incident"    value={meta.incident} />}
        {meta.lesson    && <MetaRow label="Lesson"      value={meta.lesson} />}
        <MetaRow label="Art Style"   value={meta.artStyle} />
        <MetaRow label="Story Length" value={meta.length} />

        {/* Created On — separated by a heavier rule */}
        <View style={S.detailsCreatedRow}>
          <Text style={S.detailsCreatedLabel}>Created On</Text>
          <Text style={S.detailsCreatedValue}>{meta.createdAt}</Text>
        </View>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// StoryPdfDocument — main export
// ---------------------------------------------------------------------------

interface StoryPdfDocumentProps {
  data: PdfStoryData;
}

export function StoryPdfDocument({ data }: StoryPdfDocumentProps) {
  return (
    <Document title={data.title} author="StorySprout" producer="StorySprout">
      <CoverPage title={data.title} />
      {data.storyMeta && <StoryDetailsPage meta={data.storyMeta} />}
      {data.pages.map((page, i) => (
        <StoryPageComponent key={i} page={page} total={data.pages.length} index={i} />
      ))}
      {data.vocabulary.length > 0 && <VocabPage vocabulary={data.vocabulary} />}
      {data.quiz.length > 0 && <QuizPage quiz={data.quiz} />}
    </Document>
  );
}

export default StoryPdfDocument;
