<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { get } from "svelte/store";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { onMount } from "svelte";
  // notifications/presence are only needed once a signed-in profile exists, so they're
  // dynamically imported below instead of statically here - keeps firebase/messaging out
  // of the shared chunk

  let { children } = $props();

  onMount(() => {
    let stopPresence: (() => void) | null = null;

    return authUser.subscribe(async (user) => {
      if (user === undefined) return; // still resolving persisted session
      if (!user) {
        stopPresence?.();
        stopPresence = null;
        userProfile.set(null);
        goto(`/auth?redirect=${encodeURIComponent(page.url.pathname)}`);
      } else {
        const hasProfile = await userProfile.load(user.uid);
        if (!hasProfile && page.url.pathname !== "/app/onboarding") {
          goto("/app/onboarding");
        } else if (hasProfile) {
          // Catches users who verified their email link after their profile was already created
          const profile = get(userProfile);
          if (user.emailVerified && profile?.emailVerified !== true) {
            await userProfile.save(user.uid, { emailVerified: true });
          }
          // Re-attach the foreground push listener; no-op if permission was never granted
          const [{ initForegroundMessaging }, { startPresenceHeartbeat }] =
            await Promise.all([
              import("$lib/firebase/notifications"),
              import("$lib/firebase/presence"),
            ]);
          initForegroundMessaging();
          if (!stopPresence) stopPresence = startPresenceHeartbeat(user.uid);
        }
      }
    });
  });
</script>

<div class="app-shell min-h-dvh bg-black md:flex md:justify-center">
  <div
    class="relative flex min-h-dvh w-full flex-col bg-bg md:max-w-md md:border-x md:border-border md:shadow-2xl"
  >
    {@render children()}
  </div>
</div>

<style>
  /* Only the in-app shell blocks the native swipe-back/forward gesture - marketing pages
     outside /app keep it so users can swipe between pages */
  .app-shell {
    overscroll-behavior: none;
  }
</style>
