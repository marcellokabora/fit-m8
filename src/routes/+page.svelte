<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";

  let t = $derived(createTranslator($activeLanguage));

  // true once auth state resolves to "no user" and the rest of the page can reveal
  let ready = $state(false);

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

  const HERO_ACTIVITIES = [
    { id: "jogging" },
    { id: "padel" },
    { id: "beach-volley" },
    { id: "tennis" },
    { id: "basketball" },
    { id: "cycling" },
  ];
</script>

<div
  class="flex min-h-dvh flex-col items-center justify-between bg-bg px-6 pb-12 pt-20"
>
  {#if !ready}
    <Loading />
  {/if}

  <!-- Logo / Hero -->
  <div class="mt-4 flex flex-col items-center gap-4 text-text">
    <div
      class="flex size-24 items-center justify-center rounded-3xl bg-primary p-4 text-white shadow-xl"
    >
      <Logo class="h-full w-full" />
    </div>
    {#if ready}
      <h1 transition:fade class="text-5xl font-black tracking-tight">Fit-M8</h1>
      <p transition:fade class="text-center text-lg font-medium text-muted">
        {t.t("home.tagline")}<br />{t.t("home.taglineSecond")}
      </p>
    {/if}
  </div>

  <LanguagePicker />

  {#if ready}
    <!-- Activity bubbles -->
    <div transition:fade class="flex flex-wrap justify-center gap-3">
      {#each HERO_ACTIVITIES as activity}
        <span
          class="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
        >
          <ActivityIcon id={activity.id} class="size-4" />
          {t.activity(activity.id)}
        </span>
      {/each}
    </div>

    <!-- CTA -->
    <div transition:fade class="flex w-full flex-col gap-3">
      {#if error}
        <p
          class="rounded-xl bg-error/10 px-4 py-3 text-center text-sm text-error"
        >
          {error}
        </p>
      {/if}
      <button
        onclick={handleGoogle}
        disabled={loading}
        class="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-lg font-bold text-white shadow-lg active:scale-95 disabled:opacity-50"
      >
        <svg class="size-5" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#fff"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#fff"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#fff"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? t.t("home.signingIn") : t.t("home.google")}
      </button>
      <a
        href="/auth"
        class="block w-full rounded-2xl border-2 border-border bg-surface py-4 text-center text-lg font-semibold text-text active:scale-95"
      >
        {t.t("home.email")}
      </a>
    </div>
  {/if}
</div>
