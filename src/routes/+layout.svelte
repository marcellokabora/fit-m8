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

  const PUBLIC_ROUTES = ["/auth", "/"];

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
        if (!PUBLIC_ROUTES.includes(path)) goto("/");
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
  <title>FIT-M8</title>
  <meta name="description" content={t.t("meta.description")} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="FIT-M8" />
  <meta property="og:title" content="FIT-M8" />
  <meta property="og:description" content={t.t("meta.description")} />
  <meta property="og:url" content={page.url.origin} />
  <meta property="og:image" content={`${page.url.origin}/og-image.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="FIT-M8" />
  <meta name="twitter:description" content={t.t("meta.description")} />
  <meta name="twitter:image" content={`${page.url.origin}/og-image.png`} />
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
