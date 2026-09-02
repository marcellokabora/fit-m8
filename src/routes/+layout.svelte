<script lang="ts">
  import "../app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { get } from "svelte/store";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { activeLanguage } from "$lib/stores/language";
  import { activeTheme } from "$lib/stores/theme";
  import { onMount } from "svelte";
  import { registerSW } from "virtual:pwa-register";
  import { initForegroundMessaging } from "$lib/firebase/notifications";
  import { startPresenceHeartbeat } from "$lib/firebase/presence";
  import { createTranslator } from "$lib/stores/language";

  let { children } = $props();
  let t = $derived(createTranslator($activeLanguage));

  const PUBLIC_ROUTES = ["/"];

  onMount(() => {
    activeLanguage.init();
    activeTheme.init();

    if (import.meta.env.PROD) {
      registerSW({ immediate: true });
    }

    let stopPresence: (() => void) | null = null;

    return authUser.subscribe(async (user) => {
      if (user === undefined) return; // still resolving persisted session
      const path = page.url.pathname;
      if (!user) {
        stopPresence?.();
        stopPresence = null;
        userProfile.set(null);
        // Dev-only escape hatch: ?testUser signs in anonymously so onboarding (and
        // anything past it) can be tested without a real registered account.
        if (import.meta.env.DEV && page.url.searchParams.has("testUser")) {
          authUser.signInTestUser();
        } else if (!PUBLIC_ROUTES.includes(path)) {
          goto("/");
        }
      } else if (user) {
        const hasProfile = await userProfile.load(user.uid);
        if (!hasProfile && path !== "/onboarding") {
          goto("/onboarding");
        } else if (hasProfile) {
          // Catches users who verified their email link after their profile was already created
          const profile = get(userProfile);
          if (user.emailVerified && profile?.emailVerified !== true) {
            await userProfile.save(user.uid, { emailVerified: true });
          }
          // Re-attach the foreground push listener; no-op if permission was never granted
          initForegroundMessaging();
          if (!stopPresence) stopPresence = startPresenceHeartbeat(user.uid);
        }
      }
    });
  });
</script>

<svelte:head>
  <!-- title/description: static English fallbacks already live in src/app.html for
       crawlers (this app is ssr=false, so they never see these); these just localize
       them for actual visitors once JS hydrates. og:/twitter: tags are intentionally NOT
       duplicated here since link-preview bots can't see them anyway in a pure SPA. -->
  <title>FIT-M8</title>
  <meta name="description" content={t.t("meta.description")} />
  {#if import.meta.env.PROD}
    <!-- manifest is only generated/served by vite-plugin-pwa in production builds -->
    <link rel="manifest" href="/manifest.webmanifest" />
  {/if}
</svelte:head>

<div class="min-h-dvh bg-black font-sans md:flex md:justify-center">
  <div
    class="relative flex min-h-dvh w-full flex-col bg-bg md:max-w-md md:border-x md:border-border md:shadow-2xl"
  >
    {@render children()}
  </div>
</div>
