<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    ChevronLeft,
    ChevronRight,
    UserRoundPlus,
    SlidersHorizontal,
    Compass,
    MessagesSquare,
    Dumbbell,
    MessageCircle,
    Heart,
    Crown,
    Globe,
    ShieldCheck,
    MapPin,
    CircleHelp,
  } from "@lucide/svelte";
  import Logo from "$lib/components/Logo.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import ActivityCarousel from "$lib/components/ActivityCarousel.svelte";
  import phoneImg from "$lib/assets/phone.png";
  import { activeTheme, THEMES } from "$lib/stores/theme";
  import {
    MAX_LIKES_FREE_PER_DAY,
    MAX_SPORTS_FREE,
    MAX_SPORTS_PREMIUM,
    PREMIUM_PRICE_USD,
  } from "$lib/types";
  import activitiesScreen from "$lib/assets/screens/activities.png?enhanced";
  import filtersScreen from "$lib/assets/screens/filters.png?enhanced";
  import discoverScreen from "$lib/assets/screens/discover.png?enhanced";
  import matchesScreen from "$lib/assets/screens/matchs.png?enhanced";

  // Same forced-dark-mode technique as the homepage hero: keeps the visitor's own chosen
  // accent color (theme.ts), just always renders the dark variant of it - English copy only.
  let theme = $derived(
    THEMES.find((t) => t.id === $activeTheme.themeId) ?? THEMES[0],
  );
  let colors = $derived(theme.dark);

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
      icon: Compass,
      title: "Discover nearby players",
      desc: "Swipe through people who share your sports, close to you.",
      screen: discoverScreen,
    },
    {
      icon: MessagesSquare,
      title: "Match & play",
      desc: "Chat with your matches and plan your next session.",
      screen: matchesScreen,
    },
  ] as const;

  const FEATURES = [
    {
      icon: Compass,
      title: "Smart matching",
      desc: "Ranked by shared sports, format, skill level, and distance.",
    },
    {
      icon: SlidersHorizontal,
      title: "Quick presets",
      desc: "One-tap Dating, Friends, or Trainer filters.",
    },
    {
      icon: MessagesSquare,
      title: "Real-time chat",
      desc: "Message matches instantly and plan sessions.",
    },
    {
      icon: Globe,
      title: "Multi-language",
      desc: "English, Spanish, and Italian out of the box.",
    },
    {
      icon: ShieldCheck,
      title: "Safety tools",
      desc: "Report and block keep the community safe.",
    },
    {
      icon: MapPin,
      title: "Location-aware",
      desc: "Filter by distance to find people practicing nearby.",
    },
  ] as const;

  const PREMIUM_FEATURES = [
    {
      icon: Dumbbell,
      title: "More activities",
      desc: `Up to ${MAX_SPORTS_PREMIUM} sports instead of ${MAX_SPORTS_FREE}.`,
    },
    {
      icon: MessageCircle,
      title: "Message directly",
      desc: "Skip the match — reach out to any profile.",
    },
    {
      icon: Heart,
      title: "Unlimited likes",
      desc: `Free accounts get ${MAX_LIKES_FREE_PER_DAY} likes a day.`,
    },
  ] as const;

  const SOCIAL_LINKS = [
    { url: "https://www.facebook.com/", label: "Facebook" },
    { url: "https://www.instagram.com/", label: "Instagram" },
    { url: "https://www.youtube.com/", label: "YouTube" },
  ];

  type Slide =
    | { kind: "cover" }
    | { kind: "problem" }
    | { kind: "how"; step: (typeof HOW_IT_WORKS)[number]; index: number }
    | { kind: "features"; group: (typeof FEATURES)[number][] }
    | { kind: "monetization" }
    | { kind: "closing" };

  const SLIDES: Slide[] = [
    { kind: "cover" },
    { kind: "problem" },
    ...HOW_IT_WORKS.map((step, index): Slide => ({ kind: "how", step, index })),
    { kind: "features", group: [...FEATURES] },
    { kind: "monetization" },
    { kind: "closing" },
  ];
  const SLIDE_COUNT = SLIDES.length;

  // 1-based in the URL (?slide=1..N) for readability, 0-based internally
  const urlSlideParam = Number(page.url.searchParams.get("slide"));
  let current = $state(
    urlSlideParam >= 1 && urlSlideParam <= SLIDE_COUNT ? urlSlideParam - 1 : 0,
  );
  let slide = $derived(SLIDES[current]);
  // Which way the slide transition should move: 1 = forward, -1 = backward
  let direction = $state(1);

  function pushSlideUrl() {
    const url = new URL(page.url);
    url.searchParams.set("slide", String(current + 1));
    goto(url, { keepFocus: true, noScroll: true });
  }

  function goTo(index: number) {
    if (index < 0 || index >= SLIDE_COUNT || index === current) return;
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
      urlSlide <= SLIDE_COUNT &&
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

  // Swipe-to-navigate, same pointer drag-threshold pattern as the Discover card swipe
  let dragging = false;
  let startX = 0;
  const SWIPE_THRESHOLD = 60;

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    startX = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    const delta = e.clientX - startX;
    if (delta <= -SWIPE_THRESHOLD) next();
    else if (delta >= SWIPE_THRESHOLD) prev();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div
  class="relative flex h-dvh flex-col overflow-hidden bg-bg text-text"
  style="--color-primary: {theme.primary}; --color-primary-dark: {theme.primaryDark}; --color-bg: {colors.bg}; --color-surface: {colors.surface}; --color-text: {colors.text}; --color-muted: {colors.muted}; --color-border: {colors.border};"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative min-h-0 flex-1 overflow-hidden"
    onpointerdown={onPointerDown}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  >
    {#key current}
      <div
        class="hide-scrollbar absolute inset-0 flex flex-col overflow-y-auto px-6 py-10 md:px-20 md:py-16"
        in:fly|local={{ x: direction * 48, duration: 220, easing: quintOut }}
        out:fly|local={{ x: direction * -48, duration: 150, easing: quintOut }}
      >
        {#if slide.kind === "cover"}
          <!-- Cover -->
          <div
            class="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-20 text-center"
          >
            <div class="relative z-10 flex flex-col items-center gap-4">
              <Logo class="h-auto w-56 text-primary drop-shadow-md md:w-72" />
              <p
                class="text-lg font-medium text-muted text-balance md:text-2xl"
              >
                Match people for sports activities — Tinder-style.
              </p>
            </div>
            <div class="relative flex w-full justify-center">
              <ActivityCarousel />
            </div>
          </div>
        {:else if slide.kind === "problem"}
          <!-- Problem -->
          <div
            class="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 md:flex-row md:gap-16"
          >
            <div class="flex flex-1 flex-col gap-6 text-center md:text-left">
              <h2 class="text-2xl font-black text-text md:text-4xl">
                Sports partners are hard to find
              </h2>
              <p class="text-base text-muted md:text-lg">
                Dating apps aren't built for finding a sport partner. Community
                boards and group chats are noisy and unreliable. Most people who
                want to train, play, or compete with someone nearby simply don't
                know where to look.
              </p>
              <div class="flex flex-col gap-3 md:gap-4">
                <div class="rounded-2xl bg-surface p-4 shadow-sm md:p-5">
                  <p class="font-bold text-text md:text-lg">
                    No dedicated platform
                  </p>
                  <p class="text-sm text-muted md:text-base">
                    for matching by sport, skill level, and intent.
                  </p>
                </div>
                <div class="rounded-2xl bg-surface p-4 shadow-sm md:p-5">
                  <p class="font-bold text-text md:text-lg">
                    Fragmented discovery
                  </p>
                  <p class="text-sm text-muted md:text-base">
                    scattered across chat groups, forums, and word of mouth.
                  </p>
                </div>
                <div class="rounded-2xl bg-surface p-4 shadow-sm md:p-5">
                  <p class="font-bold text-text md:text-lg">Growing demand</p>
                  <p class="text-sm text-muted md:text-base">
                    for social fitness and workout accountability partners.
                  </p>
                </div>
              </div>
            </div>
            <div class="relative w-36 shrink-0 md:w-56">
              <img
                src={phoneImg}
                alt=""
                aria-hidden="true"
                class="h-auto w-full drop-shadow-2xl"
              />
              <div
                class="absolute inset-x-[4%] top-[3.5%] bottom-[3.5%] flex items-center justify-center"
              >
                <CircleHelp class="size-12 text-primary/70 md:size-20" />
              </div>
            </div>
          </div>
        {:else if slide.kind === "how"}
          <!-- How it works - one slide per step, horizontal on desktop -->
          <div
            class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 text-center md:flex-row md:gap-24 md:text-left"
          >
            <div class="flex flex-col items-center gap-4 md:items-start">
              <p
                class="text-xs font-semibold uppercase tracking-widest text-primary"
              >
                How FIT-M8 works
              </p>
              <span
                class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary md:size-20"
              >
                <slide.step.icon class="size-8 md:size-10" />
              </span>
              <h2 class="text-2xl font-black text-text md:text-4xl">
                {slide.step.title}
              </h2>
              <p class="text-base text-muted md:text-lg">{slide.step.desc}</p>
            </div>
            <div
              class="w-64 shrink-0 overflow-hidden rounded-2xl shadow-2xl md:w-96 {slide.index %
                2 ===
              0
                ? 'rotate-3'
                : '-rotate-3'}"
            >
              <enhanced:img
                src={slide.step.screen}
                alt=""
                aria-hidden="true"
                sizes="(min-width: 768px) 384px, 256px"
                class="aspect-431/886 w-full object-cover object-top"
              />
            </div>
          </div>
        {:else if slide.kind === "features"}
          <!-- Feature showcase - all features together in one grid -->
          <div
            class="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8"
          >
            <p
              class="text-xs font-semibold uppercase tracking-widest text-primary"
            >
              Built for real training partners
            </p>
            <div
              class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6"
            >
              {#each slide.group as feature, i}
                {@const isLastOdd =
                  slide.group.length % 3 === 1 && i === slide.group.length - 1}
                <div
                  class="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-sm {isLastOdd
                    ? 'sm:col-span-2 md:col-span-3 md:mx-auto md:w-full md:max-w-xs'
                    : ''}"
                >
                  <span
                    class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary md:size-16"
                  >
                    <feature.icon class="size-7 md:size-8" />
                  </span>
                  <h2 class="text-lg font-black text-text md:text-xl">
                    {feature.title}
                  </h2>
                  <p class="text-sm text-muted md:text-base">{feature.desc}</p>
                </div>
              {/each}
            </div>
          </div>
        {:else if slide.kind === "monetization"}
          <!-- Monetization -->
          <div
            class="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8"
          >
            <div class="flex flex-col items-center gap-2 text-center">
              <span
                class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary md:size-16"
              >
                <Crown class="size-7 md:size-8" />
              </span>
              <h2 class="text-2xl font-black text-text md:text-4xl">
                FIT-M8 Premium
              </h2>
              <p class="text-sm text-muted md:text-base">
                Recurring membership subscription
              </p>
              <p class="text-3xl font-black text-primary md:text-5xl">
                ${PREMIUM_PRICE_USD} / month
              </p>
            </div>
            <div class="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
              {#each PREMIUM_FEATURES as feature}
                <div
                  class="flex items-start gap-4 rounded-2xl bg-surface p-4 shadow-sm"
                >
                  <span
                    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    <feature.icon class="size-5" />
                  </span>
                  <div>
                    <p class="font-bold text-text">{feature.title}</p>
                    <p class="text-sm text-muted">{feature.desc}</p>
                  </div>
                </div>
              {/each}
            </div>
            <p class="text-center text-sm text-muted md:text-base">
              Free accounts stay fully functional — Premium is an upsell, not a
              paywall, keeping the network effect intact while monetizing power
              users.
            </p>
          </div>
        {:else if slide.kind === "closing"}
          <!-- Closing / CTA -->
          <div
            class="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"
          >
            <Logo class="h-auto w-40 text-primary opacity-90 md:w-52" />
            <h2 class="text-xl font-bold text-text md:text-3xl text-balance">
              Let's build the home for sports partners together.
            </h2>
            <div class="flex justify-center gap-5">
              {#each SOCIAL_LINKS as link (link.url)}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  class="text-muted transition-colors active:scale-95"
                >
                  <SocialIcon url={link.url} class="size-5 md:size-6" />
                </a>
              {/each}
            </div>
            <a
              href="mailto:info@fit-m8.app"
              class="font-semibold text-primary md:text-lg"
            >
              info@fit-m8.app
            </a>
            <p class="text-xs text-muted md:text-sm">Thank you.</p>
          </div>
        {/if}
      </div>
    {/key}
  </div>

  <!-- Bottom pagination -->
  <div
    class="relative z-10 flex shrink-0 items-center justify-center gap-4 px-6 pb-8 pt-4 md:gap-6 md:pb-10 md:pt-6"
  >
    <button
      type="button"
      onclick={prev}
      disabled={current === 0}
      aria-label="Previous slide"
      class="flex size-10 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90 disabled:opacity-30 md:size-12"
    >
      <ChevronLeft class="size-5" />
    </button>
    <div class="flex items-center gap-2">
      {#each Array(SLIDE_COUNT) as _, i}
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
      disabled={current === SLIDE_COUNT - 1}
      aria-label="Next slide"
      class="flex size-10 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90 disabled:opacity-30 md:size-12"
    >
      <ChevronRight class="size-5" />
    </button>
  </div>
</div>
