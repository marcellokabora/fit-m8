<script lang="ts">
  import { onMount } from "svelte";
  import LogoText from "$lib/components/LogoText.svelte";
  import SideMenu from "$lib/components/SideMenu.svelte";
  import AuthModal from "$lib/components/AuthModal.svelte";
  import { authUser, userProfile } from "$lib/stores/auth";

  let { logoHref = "/" }: { logoHref?: string } = $props();

  let authModalOpen = $state(false);
  let authMode = $state<"login" | "register">("register");

  // drives SideMenu's CTA: spinner while the persisted session resolves, then either
  // the normal sign-in action or an "open app" action - no automatic redirect
  let authState = $state<"checking" | "guest" | "loggedIn">("checking");
  let appDestination = $state("/app/profile");

  onMount(() => {
    return authUser.subscribe(async (user) => {
      if (user === undefined) return; // still resolving persisted session
      if (!user) {
        authState = "guest";
        return;
      }
      const hasProfile = await userProfile.load(user.uid);
      appDestination = hasProfile ? "/app/profile" : "/app/onboarding";
      authState = "loggedIn";
    });
  });
</script>

<SideMenu
  {authState}
  {appDestination}
  onSignIn={() => {
    authMode = "login";
    authModalOpen = true;
  }}
/>

<div
  class="sticky top-0 z-10 flex items-center justify-center bg-bg px-4 pb-3 pt-5"
>
  <a href={logoHref} aria-label="FIT-M8 home">
    <LogoText class="h-8 w-auto text-primary" />
  </a>
</div>

<AuthModal bind:open={authModalOpen} bind:mode={authMode} />
