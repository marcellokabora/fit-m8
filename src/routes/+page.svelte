<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { fly } from "svelte/transition";
  import ActivityCarousel, {
    CAROUSEL_ACTIVITIES,
  } from "$lib/components/ActivityCarousel.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import AuthModal from "$lib/components/AuthModal.svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import { activeTheme, THEMES } from "$lib/stores/theme";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import MailIcon from "~icons/material-symbols/mail-outline";
  import {
    Palette,
    UserRoundPlus,
    Compass,
    MessagesSquare,
    Dumbbell,
    ListOrdered,
  } from "@lucide/svelte";
  import footballImg from "$lib/assets/homepage/football.jpg?enhanced";
  import tennisImg from "$lib/assets/homepage/tennis.jpg?enhanced";
  import boxingImg from "$lib/assets/homepage/boxing.jpg?enhanced";
  import surfImg from "$lib/assets/homepage/surf.jpg?enhanced";
  import cyclingImg from "$lib/assets/homepage/cycling.jpg?enhanced";

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

  let popularActivities = $derived(
    CAROUSEL_ACTIVITIES.map((activity) => t.activity(activity.id)).join(" · "),
  );

  // icon per step, styled after PresetHint's concept rows
  const STEPS = [
    { icon: UserRoundPlus, titleKey: "step1Title", descKey: "step1Desc" },
    { icon: Compass, titleKey: "step2Title", descKey: "step2Desc" },
    { icon: MessagesSquare, titleKey: "step3Title", descKey: "step3Desc" },
  ] as const;

  // explains how the activities list and its order drive matching, styled after PresetHint's concept rows
  const ACTIVITY_INFO_ROWS = [
    {
      icon: Dumbbell,
      titleKey: "activitiesIntroTitle",
      descKey: "activitiesIntroBody",
    },
    {
      icon: ListOrdered,
      titleKey: "activitiesOrderTitle",
      descKey: "activitiesOrderBody",
    },
  ] as const;

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
  class="relative flex min-h-dvh w-full flex-col bg-bg"
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
        <h2 class="text-center text-xl font-bold text-primary">
          {t.t("home.howItWorksTitle")}
        </h2>
        <ol class="flex flex-col gap-4">
          {#each STEPS as step}
            <li class="flex items-start gap-4">
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
            </li>
          {/each}
        </ol>
      </section>

      <section class="flex flex-col gap-6">
        <div class="flex flex-col gap-4">
          {#each ACTIVITY_INFO_ROWS as row}
            <div class="flex items-start gap-4">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <row.icon class="size-5" />
              </span>
              <div>
                <p class="font-semibold text-text">
                  {t.t(`home.${row.titleKey}` as any)}
                </p>
                <p class="text-sm text-muted">
                  {t.t(`home.${row.descKey}` as any)}
                </p>
              </div>
            </div>
          {/each}
        </div>

        <div class="flex flex-col gap-2 text-center">
          <h2 class="text-xl font-bold text-primary">
            {t.t("home.activitiesTitle")}
          </h2>
          <p class="text-sm text-muted text-balance">{popularActivities}</p>
        </div>
      </section>
    </main>

    <footer
      transition:fade
      class="relative z-10 flex w-full flex-col items-center gap-5 border-t border-border px-6 py-8 text-center"
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
