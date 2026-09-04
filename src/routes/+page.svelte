<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { fly } from "svelte/transition";
  import ActivityCarousel from "$lib/components/ActivityCarousel.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import AuthModal from "$lib/components/AuthModal.svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { activeTheme, THEMES } from "$lib/stores/theme";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import MailIcon from "~icons/material-symbols/mail-outline";
  import { ACTIVITIES } from "$lib/types";
  import {
    Palette,
    UserRoundPlus,
    SlidersHorizontal,
    Compass,
    MessagesSquare,
  } from "@lucide/svelte";
  import footballImg from "$lib/assets/homepage/football.jpg?enhanced";
  import tennisImg from "$lib/assets/homepage/tennis.jpg?enhanced";
  import boxingImg from "$lib/assets/homepage/boxing.jpg?enhanced";
  import surfImg from "$lib/assets/homepage/surf.jpg?enhanced";
  import cyclingImg from "$lib/assets/homepage/cycling.jpg?enhanced";
  import activitiesScreen from "$lib/assets/screens/activities.png?enhanced";
  import filtersScreen from "$lib/assets/screens/filters.png?enhanced";
  import discoverScreen from "$lib/assets/screens/discover.png?enhanced";
  import matchesScreen from "$lib/assets/screens/matchs.png?enhanced";

  let t = $derived(createTranslator($activeLanguage));

  // a small curated bento of homepage photos - not the full carousel set
  const GALLERY_TILES = [
    { id: "soccer", src: footballImg, span: true },
    { id: "tennis", src: tennisImg, span: false },
    { id: "boxing", src: boxingImg, span: false },
    { id: "surf", src: surfImg, span: false },
    { id: "cycling", src: cyclingImg, span: false },
  ];

  // real profile links only - keep in sync with the JSON-LD sameAs list in src/app.html
  const SOCIAL_LINKS = [
    {
      url: "https://www.facebook.com/",
      label: "Facebook",
    },
    { url: "https://www.instagram.com/", label: "Instagram" },
    { url: "https://www.youtube.com/", label: "YouTube" },
  ];

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
      icon: Compass,
      titleKey: "step2Title",
      descKey: "step2Desc",
      screen: discoverScreen,
    },
    {
      icon: MessagesSquare,
      titleKey: "step3Title",
      descKey: "step3Desc",
      screen: matchesScreen,
    },
  ] as const;

  // reveals each step as it scrolls into view instead of all popping in at once with the section
  function reveal(node: HTMLElement, { delay = 0 }: { delay?: number } = {}) {
    node.style.transitionDelay = `${delay}ms`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.remove("opacity-0", "translate-y-8");
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

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

  // true once auth state resolves to "no user" and the rest of the page can reveal
  let ready = $state(false);

  let authModalOpen = $state(false);
  let authMode = $state<"login" | "register">("register");
  let themePickerOpen = $state(false);

  onMount(() => {
    return authUser.subscribe(async (user) => {
      if (user === undefined) return; // still resolving persisted session
      if (user) {
        goto("/discover");
        return;
      }
      ready = true;
    });
  });

  let loading = $state(false);
  let error = $state("");

  async function handleGoogle() {
    error = "";
    loading = true;
    try {
      await authUser.signInGoogle();
      goto("/discover");
    } catch (e: any) {
      error = e.message ?? t.t("errors.generic");
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-bg"
  style="--color-bg: {darkColors.bg}; --color-surface: {darkColors.surface}; --color-text: {darkColors.text}; --color-muted: {darkColors.muted}; --color-border: {darkColors.border};"
>
  <div
    class="relative flex min-h-dvh shrink-0 flex-col items-center justify-between overflow-hidden px-6 py-8 transform-[translateZ(0)]"
  >
    {#if !ready}
      <Loading />
    {/if}

    <!-- Logo / Hero -->
    <div class="relative z-10 flex flex-col items-center gap-4 text-text">
      <!-- always in the DOM so bots/screen readers see the app name even before auth resolves -->
      <h1 class="sr-only">FIT-M8</h1>
      {#if ready}
        <Logo
          class="w-75 mt-8 h-auto text-primary my-6 drop-shadow-md max-w-[260px]"
        />
        <p
          transition:fade
          class="text-center text-lg font-medium text-muted -mt-6 text-balance text-shadow-2xs"
        >
          {t.t("home.tagline")}<br />{t.t("home.taglineSecond")}
        </p>
      {/if}
      <div class="mt-2">
        <LanguagePicker />
      </div>
    </div>

    {#if ready}
      <!-- Activity carousel -->
      <!-- no z-index here: it must not trap the carousel's fixed background image in a stacking context above the logo/CTA -->
      <div transition:fade class="relative flex w-full justify-center mt-6">
        <ActivityCarousel />
      </div>

      <!-- CTA -->
      <div transition:fade class="relative z-10 flex w-full flex-col gap-3">
        {#if error}
          <p
            class="rounded-xl bg-error/10 px-4 py-3 text-center text-sm text-error"
          >
            {error}
          </p>
        {/if}
        <button
          type="button"
          onclick={handleGoogle}
          disabled={loading}
          class="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary/50 bg-surface/0 py-4 text-base font-semibold text-text shadow-sm active:scale-95 disabled:opacity-50 backdrop-blur-sm"
        >
          <svg class="size-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? t.t("home.signingIn") : t.t("home.google")}
        </button>
        <button
          type="button"
          onclick={() => {
            authMode = "register";
            authModalOpen = true;
          }}
          class="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border py-4 text-center text-base font-semibold text-text bg-surface/0 backdrop-blur-sm active:scale-95"
        >
          <MailIcon class="size-5" />
          {t.t("home.email")}
        </button>

        <!-- <p
          class="flex justify-center gap-4 pt-2 text-center text-xs text-muted"
        >
          <a href="/terms" class="font-semibold text-primary"
            >Terms of Service</a
          >
          <a href="/privacy" class="font-semibold text-primary"
            >Privacy Policy</a
          >
        </p> -->
      </div>
    {/if}
  </div>

  {#if ready}
    <!-- SEO content: real, crawlable copy below the hero fold -->
    <main
      transition:fade
      class="relative z-10 flex w-full flex-col gap-10 px-6 py-12 text-text"
    >
      <section class="flex flex-col gap-6">
        <h2 class="font-heading text-center text-xl font-bold text-primary">
          {t.t("home.howItWorksTitle")}
        </h2>
        <ol class="flex flex-col gap-8">
          {#each STEPS as step, i}
            <li
              use:reveal={{ delay: i * 120 }}
              class="flex translate-y-8 flex-col gap-8 opacity-0 transition-all duration-700 ease-out"
            >
              <!-- info sits above the screenshot, plain like the original rows -->
              <div class="mx-auto flex w-full max-w-60 items-start gap-4">
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

              <!-- tilted and bled off the page edge on purpose - just a glimpse of the screen, not the full UI -->
              <div
                class="w-102 overflow-hidden shadow-xl mt-4 max-h-full mb-8 {i %
                  2 ===
                0
                  ? '-ml-6 rotate-6'
                  : '-mr-12 ml-auto -rotate-6'}"
              >
                <enhanced:img
                  src={step.screen}
                  alt=""
                  aria-hidden="true"
                  sizes="288px"
                  class="aspect-431/886 w-full object-cover object-top"
                />
              </div>
            </li>
          {/each}
        </ol>
      </section>

      <section class="flex flex-col gap-6 -rotate-3">
        <div class="flex flex-col gap-5">
          <h2
            class="font-heading text-center text-xl font-bold text-primary mt-4"
          >
            {t.t("home.activitiesTitle")}
          </h2>
          <!-- natural order, but chip size scales with the interest count to highlight the popular ones -->
          <!-- one big tilted "card" that bleeds off both page edges, matching the step screenshots above -->
          <div
            class="-mx-24 flex flex-wrap justify-center gap-2 rounded-3xl bg-surface/40 p-5 ring-1 ring-white/10"
          >
            {#each DISPLAYED_ACTIVITIES as activity}
              {@const count = interestCount(activity.id)}
              {@const big = count >= 1000}
              {@const medium = !big && count >= 500}
              <span
                class="flex items-center gap-1.5 rounded-full font-semibold {big
                  ? 'bg-primary px-4 py-2 text-sm text-white shadow-md'
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

      <nav class="flex flex-wrap justify-center gap-4 text-xs">
        <a href="/terms" class="font-semibold text-primary">Terms of Service</a>
        <a href="/privacy" class="font-semibold text-primary">Privacy Policy</a>
        <a href="mailto:info@fit-m8.app" class="font-semibold text-primary"
          >info@fit-m8.app</a
        >
      </nav>

      <p class="text-xs text-muted">
        &copy; {new Date().getFullYear()} FIT-M8. {t.t("home.rights")}
      </p>
    </footer>
  {/if}

  <AuthModal bind:open={authModalOpen} bind:mode={authMode} />

  <!-- {#if import.meta.env.DEV} -->
  {#if false}
    <button
      type="button"
      onclick={() => (themePickerOpen = true)}
      aria-label="Theme picker (dev only)"
      class="fixed bottom-4 right-4 z-40 flex size-11 items-center justify-center rounded-full text-primary shadow-lg active:scale-95"
    >
      <Palette class="size-5" />
    </button>
  {/if}
</div>

{#if themePickerOpen}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
    role="button"
    tabindex="0"
    aria-label="Close"
    onclick={() => (themePickerOpen = false)}
    onkeydown={(e) =>
      (e.key === "Enter" || e.key === " ") && (themePickerOpen = false)}
  >
    <div
      class="w-full rounded-t-3xl bg-bg p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      transition:fly={{ y: 400, duration: 250 }}
      role="dialog"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border"></div>
      <AppearancePicker />
    </div>
  </div>
{/if}
