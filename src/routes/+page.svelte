<script lang="ts">
  import { fade } from "svelte/transition";
  import ActivityCarousel from "$lib/components/ActivityCarousel.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import Logo from "$lib/components/LogoText.svelte";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { SOCIAL_LINKS } from "$lib/social";
  import { activeTheme, THEMES } from "$lib/stores/theme";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import { ACTIVITIES } from "$lib/types";
  import {
    UserRoundPlus,
    SlidersHorizontal,
    Dumbbell,
    Compass,
    MessagesSquare,
    MapPin,
    LogIn,
    ChevronDown,
  } from "@lucide/svelte";
  import activitiesScreen from "$lib/assets/screens/activities.png?enhanced";
  import filtersScreen from "$lib/assets/screens/filters.png?enhanced";
  import trainerScreen from "$lib/assets/screens/trainer.png?enhanced";
  import discoverScreen from "$lib/assets/screens/discover.png?enhanced";
  import matchesScreen from "$lib/assets/screens/matches.png?enhanced";
  import exploreScreen from "$lib/assets/screens/explore.png?enhanced";

  let t = $derived(createTranslator($activeLanguage));

  // icon + in-app screenshot per step, so each step shows a peek of the real screen it describes
  const STEPS = [
    {
      icon: UserRoundPlus,
      titleKey: "step1Title",
      descKey: "step1Desc",
      screen: activitiesScreen,
    },
    {
      icon: SlidersHorizontal,
      titleKey: "stepFiltersTitle",
      descKey: "stepFiltersDesc",
      screen: filtersScreen,
    },
    {
      icon: Dumbbell,
      titleKey: "stepTrainerTitle",
      descKey: "stepTrainerDesc",
      screen: trainerScreen,
    },
    {
      icon: Compass,
      titleKey: "step2Title",
      descKey: "step2Desc",
      screen: discoverScreen,
    },
    {
      icon: MapPin,
      titleKey: "stepExploreTitle",
      descKey: "stepExploreDesc",
      screen: exploreScreen,
    },
    {
      icon: MessagesSquare,
      titleKey: "step3Title",
      descKey: "step3Desc",
      screen: matchesScreen,
    },
  ] as const;

  // curated, most-to-least popular in Barcelona today - kept separate from the id hash so
  // e.g. pickleball can't outrank padel just because its string happens to hash higher
  const FEATURED_ACTIVITY_IDS = [
    "beachVolley",
    "calisthenics",
    "padel",
    "footVolley",
    "jogging",
    "paddleboard",
    "skateboard",
    "tennis",
  ] as const;

  // stable string hash reused below - same input always produces the same output, so
  // server and client (and every reload) agree without needing real randomness
  function hashString(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  // deterministic "people interested" count per activity
  function interestCount(id: string): number {
    const hash = hashString(id);
    const featuredIndex = FEATURED_ACTIVITY_IDS.indexOf(id as any);
    if (featuredIndex !== -1) {
      // featured sports lead the pack, tapering down the more niche they get
      return 1400 - featuredIndex * 90 + (hash % 80);
    }
    // everything else stays in a lower, modest range so it never outranks the featured sports
    return 60 + (hash % 420);
  }

  function formatCount(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  }

  // capped so the homepage doesn't dump the entire activity catalog on the visitor; featured
  // sports are guaranteed a slot, then everything is shuffled (deterministically, via a hash
  // salted differently from interestCount) so the big chips don't all clump at the top
  const ACTIVITIES_DISPLAY_LIMIT = 22;
  const DISPLAYED_ACTIVITIES = [
    ...FEATURED_ACTIVITY_IDS.map((id) =>
      ACTIVITIES.find((activity) => activity.id === id),
    ).filter((activity) => activity !== undefined),
    ...ACTIVITIES.filter(
      (activity) => !FEATURED_ACTIVITY_IDS.includes(activity.id as any),
    ),
  ]
    .slice(0, ACTIVITIES_DISPLAY_LIMIT)
    .sort(
      (a, b) => hashString(`shuffle:${a.id}`) - hashString(`shuffle:${b.id}`),
    );

  // this page always looks best against its own dark palette (photo backgrounds need
  // the extra contrast), regardless of the user's light/dark preference elsewhere
  let darkColors = $derived(
    (THEMES.find((theme) => theme.id === $activeTheme.themeId) ?? THEMES[0])
      .dark,
  );
</script>

<svelte:head>
  <!-- this is now the single source of truth for these tags: app.html used to hardcode
       them, but that duplicated/conflicted with every other prerendered page's own
       canonical/og:url once /pitch, /contact, /terms, /privacy also got real SEO tags. -->
  <title>FIT-M8 - Find Your Sports Match</title>
  <meta
    name="description"
    content="Rank your sports. Set your format. Meet your match"
  />
  <link rel="canonical" href="https://fit-m8.app/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="FIT-M8 - Find Your Sports Match" />
  <meta
    property="og:description"
    content="Rank your sports. Set your format. Meet your match"
  />
  <meta property="og:url" content="https://fit-m8.app/" />
  <meta
    property="og:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="FIT-M8 - Find Your Sports Match" />
  <meta
    name="twitter:description"
    content="Rank your sports. Set your format. Meet your match"
  />
  <meta
    name="twitter:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FIT-M8",
    url: "https://fit-m8.app/",
    description: "Rank your sports. Set your format. Meet your match",
  })}<\/script>`}
</svelte:head>

<div
  class="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-bg"
  style="--color-bg: {darkColors.bg}; --color-surface: {darkColors.surface}; --color-text: {darkColors.text}; --color-muted: {darkColors.muted}; --color-border: {darkColors.border};"
>
  <SiteHeader showLogo={false} />

  <div
    class="relative flex min-h-dvh shrink-0 flex-col items-center overflow-hidden px-6 py-8 transform-[translateZ(0)] justify-center gap-20"
  >
    <!-- Activity carousel -->
    <div class="absolute inset-0">
      <ActivityCarousel />
    </div>

    <!-- Logo / Hero -->
    <div class="relative z-10 flex flex-col items-center gap-4 text-text">
      <h1 class="sr-only">FIT-M8</h1>
      <Logo class="w-75 h-auto text-primary my-6 drop-shadow-md max-w-65" />
      <p
        class="text-center text-lg font-medium text-muted -mt-6 text-balance text-shadow-2xs"
      >
        {t.t("home.tagline")}<br />{t.t("home.taglineSecond")}
      </p>
    </div>

    <!-- CTA -->
    <div
      transition:fade
      class="relative z-10 mx-auto flex w-full max-w-md flex-col gap-3"
    >
      <a
        href="/app/discover"
        class="flex capitalize mx-auto px-12 items-center justify-center cursor-pointer gap-3 rounded-full border-2 border-primary backdrop-blur-md py-4 text-center text-base font-semibold text-text shadow-sm active:scale-95"
      >
        <LogIn class="size-5" />
        {t.t("home.openApp")}
      </a>
    </div>

    <!-- scroll cue: hints there's more content below the hero fold -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center text-text/70"
      aria-hidden="true"
    >
      <ChevronDown class="size-5 animate-bounce" />
    </div>

    <!-- fades the hero photo into the solid page bg instead of cutting off hard at the fold -->
    <div
      class="pointer-events-none absolute inset-x-0 -bottom-0 h-1/3 bg-linear-to-b from-transparent to-bg"
      aria-hidden="true"
    ></div>
  </div>

  <!-- SEO content: real, crawlable copy below the hero fold -->
  <main class="relative z-10 flex w-full flex-col gap-10 px-6 py-12 text-text">
    <section class="flex flex-col gap-6 md:-mb-40">
      <h2 class="font-heading text-center text-xl font-bold text-primary">
        {t.t("home.howItWorksTitle")}
      </h2>
      <p class="-mt-4 text-center text-sm text-muted text-balance mb-8">
        {t.t("home.howItWorksSubtitle")}
      </p>
      <ol class="mx-auto flex w-full flex-col gap-8 md:gap-16">
        {#each STEPS as step, i}
          <li
            class="flex flex-col gap-8 md:flex-row md:items-center md:justify-center md:gap-20 {i %
              2 ===
            1
              ? 'md:flex-row-reverse'
              : ''}"
          >
            <!-- stacked above the screenshot on mobile, side-by-side (so the row's height is just
                 the image's, not text+image added together) on desktop -->
            <div
              class="mx-auto flex w-full max-w-65 items-start gap-4 md:mx-0 md:w-auto md:scale-120"
            >
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <step.icon class="size-5" />
              </span>
              <div>
                <p class="font-semibold text-text">
                  {t.t(`home.${step.titleKey}` as any)}
                </p>
                <p class="text-sm text-muted">
                  {t.t(`home.${step.descKey}` as any)}
                </p>
              </div>
            </div>

            <!-- tilted on purpose - just a glimpse of the screen, not the full UI - only alternating
                 tilt direction, kept smaller on desktop since it now sits beside its text, not above it -->
            <div
              class="mx-auto w-102 shrink-0 overflow-hidden shadow-xl mt-4 max-h-full mb-8 md:mx-0 md:mt-0 md:mb-0 md:w-80 relative {i %
                2 ===
              0
                ? 'rotate-6'
                : '-rotate-6'}"
            >
              <enhanced:img
                src={step.screen}
                alt=""
                aria-hidden="true"
                loading="lazy"
              />

              <!-- <div
                class="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-b from-transparent to-bg"
                aria-hidden="true"
              ></div> -->
            </div>
          </li>
        {/each}
      </ol>
    </section>

    <section class="flex flex-col gap-6 md:mt-50">
      <div class="flex flex-col gap-5">
        <h2
          class="font-heading text-center text-xl font-bold text-primary mt-4 -mb-2"
        >
          {t.t("home.activitiesTitle")}
        </h2>
        <p class="text-center text-sm text-muted text-balance">
          {t.t("home.activitiesSubtitle")}
        </p>
        <!-- natural order, but chip size scales with the interest count to highlight the popular ones -->
        <!-- one big tilted "card" that bleeds off both page edges, matching the step screenshots above -->
        <div
          class="-mx-34 md:mx-auto flex max-w-200 flex-wrap justify-center gap-2 rounded-3xl max-sm:bg-surface/40 p-5 max-sm:ring-1 ring-white/10 rotate-0"
        >
          {#each DISPLAYED_ACTIVITIES as activity}
            {@const count = interestCount(activity.id)}
            {@const big = count >= 1000}
            {@const medium = !big && count >= 500}
            <span
              class="flex items-center gap-1.5 rounded-full font-semibold {big
                ? 'bg-primary px-4 py-2 text-sm text-bg shadow-md'
                : medium
                  ? 'bg-surface px-3.5 py-1.5 text-sm text-text ring-1 ring-border'
                  : 'bg-surface px-3 py-1 text-xs text-text ring-1 ring-border'}"
            >
              <ActivityIcon
                id={activity.id}
                class={big ? "size-4" : "size-3.5 text-primary"}
              />
              {t.activity(activity.id)}
              <span
                class="rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold {big
                  ? 'bg-white/20'
                  : 'bg-primary/10 text-primary'}"
              >
                {formatCount(count)}
                <span class="sr-only">{t.t("home.peopleInterested")}</span>
              </span>
            </span>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <footer
    transition:fade
    class="relative z-10 flex w-full flex-col items-center gap-5 px-6 py-8 text-center"
  >
    <div class="mb-25 -mt-5">
      <LanguagePicker />
    </div>

    <Logo class="h-auto w-14 text-primary opacity-80" />

    <div class="flex justify-center gap-5">
      {#each SOCIAL_LINKS as link (link.url)}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="{t.t('home.followUs')}: {link.label}"
          class="text-muted transition-colors active:scale-95"
        >
          <SocialIcon url={link.url} class="size-5" />
        </a>
      {/each}
    </div>

    <p class="text-xs text-muted">
      &copy; {new Date().getFullYear()} FIT-M8. {t.t("home.rights")}
    </p>
  </footer>
</div>
