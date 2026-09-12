<script lang="ts">
  import { onMount, untrack, type Component } from "svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    ChevronLeft,
    ChevronRight,
    Download,
    UserRoundPlus,
    SlidersHorizontal,
    Dumbbell,
    Compass,
    MessagesSquare,
    MapPin,
  } from "@lucide/svelte";
  import { activeTheme, THEMES } from "$lib/stores/theme";
  import CoverSlide from "./slides/CoverSlide.svelte";
  import ProblemSlide from "./slides/ProblemSlide.svelte";
  import WhyNowSlide from "./slides/WhyNowSlide.svelte";
  import HowItWorksSlide from "./slides/HowItWorksSlide.svelte";
  import MarketSlide from "./slides/MarketSlide.svelte";
  import activitiesScreen from "$lib/assets/screens/activities.png?enhanced";
  import filtersScreen from "$lib/assets/screens/filters.png?enhanced";
  import trainerScreen from "$lib/assets/screens/trainer.png?enhanced";
  import discoverScreen from "$lib/assets/screens/discover.png?enhanced";
  import matchesScreen from "$lib/assets/screens/matchs.png?enhanced";
  import exploreScreen from "$lib/assets/screens/explore.png?enhanced";
  import BusinessSlide from "./slides/BusinessSlide.svelte";
  import GtmSlide from "./slides/GtmSlide.svelte";
  import CompetitionSlide from "./slides/CompetitionSlide.svelte";
  import TeamSlide from "./slides/TeamSlide.svelte";
  import AskSlide from "./slides/AskSlide.svelte";
  import ClosingSlide from "./slides/ClosingSlide.svelte";

  // Same forced-dark-mode technique as the homepage hero: keeps the visitor's own chosen
  // accent color (theme.ts), just always renders the dark variant of it - English copy only.
  let theme = $derived(
    THEMES.find((t) => t.id === $activeTheme.themeId) ?? THEMES[0],
  );
  let colors = $derived(theme.dark);

  // The 6-step product walkthrough, each rendered as its own slide via HowItWorksSlide.
  const HOW_IT_WORKS = [
    {
      icon: UserRoundPlus,
      title: "Build your profile",
      desc: "Pick the sports you play, your skill level, and your city.",
      screen: activitiesScreen,
    },
    {
      icon: SlidersHorizontal,
      title: "Set your intent",
      desc: "Filter by format, level, and distance — dating, friends, or a trainer.",
      screen: filtersScreen,
    },
    {
      icon: Dumbbell,
      title: "Find your trainer",
      desc: "Connect with trainers who specialize in the activities you want to improve.",
      screen: trainerScreen,
    },
    {
      icon: Compass,
      title: "Discover nearby players",
      desc: "Swipe through people who share your sports, close to you.",
      screen: discoverScreen,
    },
    {
      icon: MapPin,
      title: "Explore & check in",
      desc: "See who's playing nearby on the map and check in to your spot.",
      screen: exploreScreen,
    },
    {
      icon: MessagesSquare,
      title: "Match & play",
      desc: "Chat with your matches and plan your next session.",
      screen: matchesScreen,
    },
  ] as const;

  // The full narrative deck, each slide broken out into its own component. Order here is
  // the presentation order; "features"/"closing" are bonus/appendix slides after the ask.
  // Loosely typed on purpose: each slide component has its own distinct prop shape, and
  // dynamically rendering `slide.component` with `slide.props` can't be narrowed per-entry.
  type SlideDef = {
    key: string;
    label: string;
    component: Component<any>;
    props: Record<string, any>;
  };
  const SLIDE_DEFS: SlideDef[] = [
    { key: "cover", label: "Cover", component: CoverSlide, props: {} },
    { key: "whyNow", label: "Why Now?", component: WhyNowSlide, props: {} },
    { key: "problem", label: "Problem", component: ProblemSlide, props: {} },
    ...HOW_IT_WORKS.map((step, index) => ({
      key: `how-${index}`,
      label: `How it works: ${step.title}`,
      component: HowItWorksSlide,
      props: { ...step, index },
    })),
    { key: "market", label: "Market Size", component: MarketSlide, props: {} },
    {
      key: "business",
      label: "Business Model",
      component: BusinessSlide,
      props: {},
    },
    { key: "gtm", label: "Go-To-Market", component: GtmSlide, props: {} },
    {
      key: "competition",
      label: "Competition",
      component: CompetitionSlide,
      props: {},
    },
    { key: "team", label: "Team", component: TeamSlide, props: {} },
    { key: "ask", label: "The Ask", component: AskSlide, props: {} },
    { key: "closing", label: "Closing", component: ClosingSlide, props: {} },
  ];

  // Edit this array to hide slides from the deck & PDF export - no UI toggle, just code.
  const HIDDEN_SLIDE_KEYS: string[] = [];
  let visibleSlides = $derived(
    SLIDE_DEFS.filter((s) => !HIDDEN_SLIDE_KEYS.includes(s.key)),
  );
  let slideCount = $derived(visibleSlides.length);

  // 1-based in the URL (?slide=1..N) for readability, 0-based internally
  const urlSlideParam = Number(page.url.searchParams.get("slide"));
  let current = $state(
    urlSlideParam >= 1 && urlSlideParam <= SLIDE_DEFS.length
      ? urlSlideParam - 1
      : 0,
  );
  let slide = $derived(visibleSlides[current]);
  // Which way the slide transition should move: 1 = forward, -1 = backward
  let direction = $state(1);

  // Hiding a slide (or all of them) can leave `current` pointing past the new end - clamp it
  // back into range instead of rendering nothing.
  $effect(() => {
    const maxIndex = Math.max(0, slideCount - 1);
    if (untrack(() => current) > maxIndex) {
      current = maxIndex;
    }
  });

  function pushSlideUrl() {
    const url = new URL(page.url);
    url.searchParams.set("slide", String(current + 1));
    goto(url, { keepFocus: true, noScroll: true });
  }

  function goTo(index: number) {
    if (index < 0 || index >= slideCount || index === current) return;
    direction = index > current ? 1 : -1;
    current = index;
    pushSlideUrl();
  }
  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }

  // Drives the slide from the URL so browser back/forward move between slides too
  $effect(() => {
    const urlSlide = Number(page.url.searchParams.get("slide"));
    if (
      urlSlide >= 1 &&
      urlSlide <= slideCount &&
      urlSlide - 1 !== untrack(() => current)
    ) {
      direction = urlSlide - 1 < untrack(() => current) ? -1 : 1;
      current = urlSlide - 1;
    }
  });

  onMount(() => {
    if (page.url.searchParams.get("slide") !== String(current + 1)) {
      const url = new URL(page.url);
      url.searchParams.set("slide", String(current + 1));
      goto(url, { replaceState: true, keepFocus: true, noScroll: true });
    }
  });

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  }

  function exportPdf() {
    window.print();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div
  class="relative flex h-dvh flex-col overflow-hidden bg-bg text-text print:h-auto print:overflow-visible"
  style="--color-primary: {theme.primary}; --color-primary-dark: {theme.primaryDark}; --color-bg: {colors.bg}; --color-surface: {colors.surface}; --color-text: {colors.text}; --color-muted: {colors.muted}; --color-border: {colors.border};"
>
  <button
    type="button"
    onclick={exportPdf}
    class="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-text shadow-md transition-transform active:scale-95 print:hidden"
  >
    <Download class="size-4" />
    Export PDF
  </button>

  <div class="relative min-h-0 flex-1 overflow-hidden print:hidden">
    {#if slide}
      {#key current}
        <div
          class="hide-scrollbar absolute inset-0 flex flex-col overflow-y-auto px-6 py-10 md:px-20 md:py-16"
          in:fly|local={{ x: direction * 48, duration: 220, easing: quintOut }}
          out:fly|local={{
            x: direction * -48,
            duration: 150,
            easing: quintOut,
          }}
        >
          <slide.component {...slide.props} />
        </div>
      {/key}
    {/if}
  </div>

  <!-- Print-only: every visible slide rendered as its own page for PDF export (window.print) -->
  <div class="hidden print:block">
    {#each visibleSlides as printSlide, i (printSlide.key)}
      <div
        class="print-slide flex flex-col overflow-hidden px-6 py-10 md:px-20 md:py-16 {i <
        slideCount - 1
          ? 'break-after-page'
          : ''}"
      >
        <printSlide.component {...printSlide.props} />
      </div>
    {/each}
  </div>

  <!-- Bottom pagination -->
  <div
    class="relative z-10 flex shrink-0 items-center justify-center gap-4 px-6 pb-8 pt-4 md:gap-6 md:pb-10 md:pt-6 print:hidden"
  >
    <button
      type="button"
      onclick={prev}
      disabled={current === 0}
      aria-label="Previous slide"
      class="flex size-10 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90 disabled:opacity-30 md:size-10"
    >
      <ChevronLeft class="size-5" />
    </button>
    <div class="flex items-center gap-2">
      {#each Array(slideCount) as _, i}
        <button
          type="button"
          onclick={() => goTo(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === current ? "step" : undefined}
          class="h-2 rounded-full transition-all {i === current
            ? 'w-6 bg-primary'
            : 'w-2 bg-border'}"
        ></button>
      {/each}
    </div>
    <button
      type="button"
      onclick={next}
      disabled={current === slideCount - 1}
      aria-label="Next slide"
      class="flex size-10 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90 disabled:opacity-30 md:size-10"
    >
      <ChevronRight class="size-5" />
    </button>
  </div>
</div>

<style>
  @media print {
    :global(html, body) {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }

  .print-slide {
    height: 100vh;
  }

  @page {
    size: landscape;
    margin: 0;
  }
</style>
