<script lang="ts">
  import "../app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { activeLanguage } from "$lib/stores/language";
  import { activeTheme } from "$lib/stores/theme";
  import { onMount } from "svelte";
  import { registerSW } from "virtual:pwa-register";
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

    return authUser.subscribe(async (user) => {
      if (user === undefined) return; // still resolving persisted session
      const path = page.url.pathname;
      if (!user) {
        userProfile.set(null);
        if (!PUBLIC_ROUTES.includes(path)) goto("/auth");
      } else if (user) {
        const hasProfile = await userProfile.load(user.uid);
        if (!hasProfile && path !== "/onboarding") {
          goto("/onboarding");
        }
      }
    });
  });
</script>

<svelte:head>
  <title>Fit-M8</title>
  <meta name="description" content={t.t("meta.description")} />
  {#if import.meta.env.PROD}
    <!-- manifest is only generated/served by vite-plugin-pwa in production builds -->
    <link rel="manifest" href="/manifest.webmanifest" />
  {/if}
</svelte:head>

<div class="min-h-dvh bg-bg font-sans">
  {@render children()}
</div>
