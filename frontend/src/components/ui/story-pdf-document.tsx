"use client";

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
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// emoji
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
  storyMeta?: PdfStoryMeta;
  coverImageUrl?: string;
  parentPhotoUrl?: string;
  creatorName?: string;
  storyTheme?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// 5 page tints matching the reader's PAGE_TINTS
const PAGE_TINTS = [
  { accent: "#C87533", text: "#3A1800", hex: "#C87533" },
  { accent: "#2E7CBF", text: "#012244", hex: "#2E7CBF" },
  { accent: "#6A3EB8", text: "#220050", hex: "#6A3EB8" },
  { accent: "#2A7A40", text: "#0A3A1A", hex: "#2A7A40" },
  { accent: "#B5254F", text: "#420022", hex: "#B5254F" },
];

const PAPER_LIGHT = "#FBF7EE";

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

const COVER_STOPS: [string, string] = ["#6CC6FF", "#BFA7FF"];

// Theme icon pools (simplified from the reader)
const THEME_ICONS: Record<string, string[]> = {
  adventure:  ["🗺️","🧭","🏔️","🌋","⛺","🎒"],
  space:      ["🚀","⭐","🪐","🌙","☄️","🛸"],
  sea:        ["🌊","🐠","🐬","🐚","🦀","🐙"],
  magic:      ["✨","🧚","🦄","🐉","👑","🪄"],
  animals:    ["🦁","🐒","🦋","🌿","🐘","🦜"],
  dinos:      ["🦕","🦖","🌋","🦴","🥚","🌿"],
  bedtime:    ["🌙","⭐","☁️","🧸","🕯️","😴"],
  everyday:   ["🏡","🌳","🚲","🎒","🎂","🌸"],
  default:    ["✨","🌟","🌈","🍀","💫","🌸"],
};

// Emoji positions (% of page width/height) — margins only, never over content
const FLOAT_POSITIONS = [
  { left: 3,  top: 12 },
  { left: 1,  top: 35 },
  { left: 4,  top: 65 },
  { left: 1,  top: 82 },
  { left: 94, top: 16 },
  { left: 96, top: 45 },
  { left: 93, top: 70 },
  { left: 95, top: 88 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveIconKey(theme: string | undefined): string {
  if (!theme) return "default";
  const t = theme.toLowerCase();
  if (/adventure|journey|quest|explore/.test(t))    return "adventure";
  if (/space|star|galaxy|moon|cosmic|planet/.test(t)) return "space";
  if (/sea|ocean|water|marine|fish|under/.test(t))  return "sea";
  if (/magic|fairy|wizard|dragon|unicorn/.test(t))  return "magic";
  if (/animal|jungle|forest|nature|wild/.test(t))   return "animals";
  if (/dino|dinosaur/.test(t))                      return "dinos";
  if (/bedtime|sleep|night|calm|dream/.test(t))     return "bedtime";
  if (/everyday|home|school|life/.test(t))          return "everyday";
  return "default";
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const S = StyleSheet.create({
  pageA4: {
    width: "100%",
    height: "100%",
    backgroundColor: PAPER_LIGHT,
  },

  // Cover
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
    fontFamily: "Helvetica",
    fontWeight: 800,
    color: BRAND.darkText,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: 14,
    fontFamily: "Helvetica",
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
    fontFamily: "Helvetica",
    color: BRAND.mutedText,
  },

  // Story page — header
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  pageHeaderLeft: {
    flexDirection: "column",
    gap: 1,
  },
  pageHeaderStoryLabel: {
    fontSize: 8,
    fontFamily: "Helvetica",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  pageHeaderTitle: {
    fontSize: 14,
    fontFamily: "Helvetica",
    fontWeight: 700,
  },
  pageHeaderBadge: {
    fontSize: 9,
    fontFamily: "Helvetica",
    fontWeight: 400,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  headerNavIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Cover image
  coverImage: {
    width: "100%",
    borderRadius: 12,
  },

  // Image wrapper (full width, aspect ratio auto)
  imageWrapper: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },

  // Text area
  textArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 6,
  },
  storyText: {
    fontSize: 10,
    fontFamily: "Helvetica",
    fontWeight: 400,
    color: BRAND.darkText,
    lineHeight: 1.9,
  },

  // Bottom page number
  pageNumberBar: {
    textAlign: "center",
    paddingBottom: 14,
    paddingTop: 4,
  },
  pageNumberText: {
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // Vocab / Quiz / Details pages
  sectionPage: {
    padding: 48,
    backgroundColor: PAPER_LIGHT,
  },
  sectionHeading: {
    fontSize: 26,
    fontFamily: "Helvetica",
    fontWeight: 700,
    color: BRAND.darkText,
    marginBottom: 28,
    borderBottom: `2 solid ${BRAND.skyBlue}`,
    paddingBottom: 10,
  },

  vocabItem: {
    marginBottom: 16,
    paddingLeft: 14,
    borderLeft: `3 solid ${BRAND.lavender}`,
  },
  vocabWord: {
    fontSize: 14,
    fontFamily: "Helvetica",
    fontWeight: 600,
    color: BRAND.darkText,
    marginBottom: 2,
  },
  vocabMeaning: {
    fontSize: 12,
    fontFamily: "Helvetica",
    color: BRAND.mutedText,
    lineHeight: 1.5,
  },

  quizItem: {
    marginBottom: 22,
  },
  quizQuestion: {
    fontSize: 13,
    fontFamily: "Helvetica",
    fontWeight: 600,
    color: BRAND.darkText,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  quizOption: {
    fontSize: 12,
    fontFamily: "Helvetica",
    color: BRAND.darkText,
    marginBottom: 4,
    paddingLeft: 10,
  },
  quizOptionCorrect: {
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#166534",
    marginBottom: 4,
    paddingLeft: 10,
    backgroundColor: "#dcfce7",
    paddingVertical: 3,
    borderRadius: 4,
  },

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
    fontFamily: "Helvetica",
    fontWeight: 700,
    color: BRAND.darkText,
    textAlign: "center",
  },
  detailsBody: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 32,
    paddingBottom: 48,
    backgroundColor: PAPER_LIGHT,
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
    fontFamily: "Helvetica",
    color: BRAND.mutedText,
    paddingRight: 12,
    lineHeight: 1.5,
  },
  detailsValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica",
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
    fontFamily: "Helvetica",
    color: BRAND.mutedText,
    paddingRight: 12,
  },
  detailsCreatedValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: BRAND.darkText,
  },

  // Credit page
  creditPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    backgroundColor: "#FFF6ED",
  },
  creditPhotoWrapper: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#C4956A55",
  },
  creditPhoto: {
    width: "100%",
    height: "100%",
  },
  creditAuthorText: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#8C5A30",
    textAlign: "center",
    marginBottom: 20,
  },
  creditTheEnd: {
    fontFamily: "Helvetica",
    fontWeight: 800,
    fontSize: 22,
    color: "#7A3800",
    textAlign: "center",
    marginBottom: 12,
  },
  creditStoryTitle: {
    fontFamily: "Helvetica",
    fontWeight: 600,
    fontSize: 12,
    color: "#5A2E05",
    textAlign: "center",
    marginBottom: 4,
  },
  creditTagline: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#8C5A30",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: 200,
  },
  creditSprout: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#A07050",
    textAlign: "center",
    marginTop: 4,
  },
  creditDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    width: "60%",
  },
  creditDividerLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#C4956A",
  },
  creditDividerIcon: {
    fontSize: 11,
    color: "#C4956A",
  },
});

// ---------------------------------------------------------------------------
// GradientRect — full-area gradient via SVG
// ---------------------------------------------------------------------------

interface GradientRectProps {
  id: string;
  stops: [string, string];
}

function GradientRect({ id, stops }: GradientRectProps) {
  return (
    <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      viewBox="0 0 595 842">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={stops[0]} stopOpacity={1} />
          <Stop offset="1" stopColor={stops[1]} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="595" height="842" fill={`url(#${id})`} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// FloatingEmoji — static decorative emoji in page margins
// ---------------------------------------------------------------------------

function FloatingEmoji({ theme }: { theme: string | undefined }) {
  const key = resolveIconKey(theme);
  const pool = THEME_ICONS[key] ?? THEME_ICONS.default;

  return (
    <>
      {FLOAT_POSITIONS.map((pos, i) => (
        <Text
          key={i}
          style={{
            position: "absolute",
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            fontSize: 14,
            opacity: 0.18,
          }}
          aria-hidden
        >
          {pool[i % pool.length]}
        </Text>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// CoverPage
// ---------------------------------------------------------------------------

function CoverPage({ title }: { title: string }) {
  return (
    <Page size="A4" style={S.pageA4}>
      <GradientRect id="cover-grad" stops={COVER_STOPS} />
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
// StoryPageComponent — single continuous story page.
// Header + full‑width image on page 1, all story text flows into a single
// <Text> that @react-pdf/renderer automatically wraps to new pages.
// ---------------------------------------------------------------------------

function StoryPageComponent({
  text,
  title,
  coverImageUrl,
  storyTheme,
}: {
  text: string;
  title: string;
  coverImageUrl?: string;
  storyTheme?: string;
}) {
  const tint = PAGE_TINTS[0];

  return (
    <Page size="A4" style={S.pageA4}>
      <FloatingEmoji theme={storyTheme} />

      {/* Page header */}
      <View style={[S.pageHeader, { borderBottomColor: tint.accent + "28" }]}>
        <View style={S.pageHeaderLeft}>
          <Text style={[S.pageHeaderStoryLabel, { color: tint.accent + "bb" }]}>
            ✦ Story
          </Text>
          <Text style={[S.pageHeaderTitle, { color: tint.text }]}>
            {title}
          </Text>
        </View>
        <View style={S.headerNavIcons}>
          <Text style={S.pageHeaderBadge}>p.1</Text>
        </View>
      </View>

      {/* Full‑width image */}
      {coverImageUrl && (
        <View style={S.imageWrapper}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image doesn't support alt */}
          <Image src={coverImageUrl} style={S.coverImage} cache />
        </View>
      )}

      {/* Story text — flex:1 so it fills the remaining space; auto-overflows */}
      <View style={S.textArea}>
        <Text style={S.storyText}>{text}</Text>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// VocabPage
// ---------------------------------------------------------------------------

function VocabPage({ vocabulary }: { vocabulary: PdfVocabItem[] }) {
  return (
    <Page size="A4" style={S.pageA4}>
      <View style={S.sectionPage}>
        <Text style={S.sectionHeading}>Word Bank</Text>
        {vocabulary.map((item, i) => (
          <View key={i} style={S.vocabItem}>
            <Text style={S.vocabWord}>{item.word}</Text>
            <Text style={S.vocabMeaning}>{item.meaning}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// QuizPage
// ---------------------------------------------------------------------------

const OPTION_LABELS = ["A", "B", "C", "D"];

function QuizPage({ quiz }: { quiz: PdfQuizQuestion[] }) {
  return (
    <Page size="A4" style={S.pageA4}>
      <View style={S.sectionPage}>
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
      </View>
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
  const storyText = React.useMemo(
    () => data.pages.map((p) => p.text).join("\n\n"),
    [data.pages]
  );

  return (
    <Document title={data.title} author="StorySprout" producer="StorySprout">
      <CoverPage title={data.title} />
      {data.storyMeta && <StoryDetailsPage meta={data.storyMeta} />}
      <StoryPageComponent
        text={storyText}
        title={data.title}
        coverImageUrl={data.coverImageUrl}
        storyTheme={data.storyTheme}
      />
      {data.vocabulary.length > 0 && <VocabPage vocabulary={data.vocabulary} />}
      {data.quiz.length > 0 && <QuizPage quiz={data.quiz} />}
    </Document>
  );
}

export default StoryPdfDocument;
