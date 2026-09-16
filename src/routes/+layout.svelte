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
  <!-- title: static English fallback already lives in src/app.html for crawlers (this app
       is ssr=false, so they never see this); this just keeps document.title in sync for
       real visitors once JS hydrates - the browser reuses the existing <title> node rather
       than duplicating it. meta description/og/twitter are intentionally NOT duplicated
       here: unlike <title>, <meta> tags aren't deduped by the browser, and link-preview/SEO
       bots can't see this dynamic head anyway in a pure SPA - so adding one here would just
       leave two conflicting <meta name="description"> tags in the DOM for real visitors.
       Must match app.html's title exactly, or the tab title visibly flips right after hydration. -->
  <title>FIT-M8 - Find Your Sports Match</title>
  {#if import.meta.env.PROD}
    <!-- manifest is only generated/served by vite-plugin-pwa in production builds -->
    <link rel="manifest" href="/manifest.webmanifest" />
  {/if}
</svelte:head>

<div class="min-h-dvh bg-bg font-sans">
  {@render children()}
</div>
