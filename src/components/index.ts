// ─── Layout ───────────────────────────────────────────────────────────────────
export { AppShell, CenteredShell, PageWrapper } from "@/components/layout/app-shell";
export { Header } from "@/components/layout/header";
export { Footer } from "@/components/layout/footer";

// ─── Navigation ───────────────────────────────────────────────────────────────
export {
  Sidebar, MobileDrawer, BottomTabBar, Breadcrumb,
  defaultNavItems,
} from "@/components/navigation/sidebar";
export type { NavItem } from "@/components/navigation/sidebar";

// ─── Buttons ──────────────────────────────────────────────────────────────────
export { SproutButton, buttonVariants } from "@/components/ui/sprout-button";
export type { SproutButtonProps } from "@/components/ui/sprout-button";

// ─── Cards ────────────────────────────────────────────────────────────────────
export { StoryCard, GlassCard, StatCard, FeatureCard } from "@/components/ui/sprout-cards";

// ─── Inputs ───────────────────────────────────────────────────────────────────
export {
  SproutInput, SearchInput, PasswordInput, SproutTextarea,
} from "@/components/ui/sprout-inputs";
export type { SproutInputProps, SproutTextareaProps } from "@/components/ui/sprout-inputs";

// ─── Dialog ───────────────────────────────────────────────────────────────────
export { SproutDialog, ConfirmDialog } from "@/components/ui/sprout-dialog";

// ─── Loading ──────────────────────────────────────────────────────────────────
export {
  PageLoader, FloatingBooksLoader, Skeleton, StoryCardSkeleton,
  Spinner, MagicLoader, DotLoader, SparklesDots,
} from "@/components/ui/sprout-loading";

// ─── Misc ─────────────────────────────────────────────────────────────────────
export {
  SproutBadge, badgeVariants, ToastContainer, useToast,
  ProgressBar, SproutAvatar,
} from "@/components/ui/sprout-misc";
