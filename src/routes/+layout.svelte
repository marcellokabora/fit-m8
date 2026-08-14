<script lang="ts">
  import "../app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { registerSW } from "virtual:pwa-register";

  let { children } = $props();

  const PUBLIC_ROUTES = ["/auth", "/"];

  onMount(() => {
    if (import.meta.env.PROD) {
      registerSW({ immediate: true });
    }

    return authUser.subscribe(async (user) => {
      if (user === undefined) return; // still resolving persisted session
      const path = page.url.pathname;
      if (!user && !PUBLIC_ROUTES.includes(path)) {
        goto("/auth");
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
  <title>FitMate</title>
  <meta
    name="description"
    content="Match people for sports activities near you"
  />
  {#if import.meta.env.PROD}
    <!-- manifest is only generated/served by vite-plugin-pwa in production builds -->
    <link rel="manifest" href="/manifest.webmanifest" />
  {/if}
</svelte:head>

<div class="min-h-screen bg-bg font-sans">
  {@render children()}
</div>
