<script lang="ts">
  import "../app.css";
  import { activeLanguage } from "$lib/stores/language";
  import { activeTheme } from "$lib/stores/theme";
  import { onMount } from "svelte";
  import { registerSW } from "virtual:pwa-register";
  import { initAnalytics } from "$lib/firebase/analytics";
  import { createTranslator } from "$lib/stores/language";
  // the auth-gated app shell (redirect/onboarding/presence/push) now lives in
  // src/routes/app/+layout.svelte - this root layout only covers public marketing pages

  let { children } = $props();
  let t = $derived(createTranslator($activeLanguage));

  onMount(() => {
    activeLanguage.init();
    activeTheme.init();

    if (import.meta.env.PROD) {
      registerSW({ immediate: true });
      // deferred to idle so the GTM/analytics payload doesn't compete with the initial paint
      (window.requestIdleCallback ?? setTimeout)(() => void initAnalytics());
    }
  });
</script>

<svelte:head>
  <title>FIT-M8 - Find Your Sports Match</title>
  <meta property="og:site_name" content="FIT-M8" />
  <meta property="fb:app_id" content="1427668445891250" />
  {#if import.meta.env.PROD}
    <!-- manifest is only generated/served by vite-plugin-pwa in production builds -->
    <link rel="manifest" href="/manifest.webmanifest" />
  {/if}
</svelte:head>

<div class="min-h-dvh bg-bg font-sans">
  {@render children()}
</div>
