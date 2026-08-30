<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import ActivityCarousel from "$lib/components/ActivityCarousel.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import GoogleSignInButton from "$lib/components/GoogleSignInButton.svelte";
  import AuthModal from "$lib/components/AuthModal.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import MailIcon from "~icons/material-symbols/mail-outline";

  let t = $derived(createTranslator($activeLanguage));

  // true once auth state resolves to "no user" and the rest of the page can reveal
  let ready = $state(false);

  let authModalOpen = $state(false);
  let authMode = $state<"login" | "register">("register");

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
  class="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-bg px-6 py-8"
>
  {#if !ready}
    <Loading />
  {/if}

  <!-- Logo / Hero -->
  <div class="relative z-10 flex flex-col items-center gap-4 text-text">
    <!-- always in the DOM so bots/screen readers see the app name even before auth resolves -->
    <h1 class="sr-only">FIT-M8</h1>
    {#if ready}
      <img src="fit-m8-text-v3.png" alt="FIT-M8" class="w-75 mt-2" />
      <p
        transition:fade
        class="text-center text-lg font-medium text-muted -mt-4 text-balance"
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
      <GoogleSignInButton
        onclick={handleGoogle}
        {loading}
        label={t.t("home.google")}
        loadingLabel={t.t("home.signingIn")}
      />
      <button
        type="button"
        onclick={() => {
          authMode = "register";
          authModalOpen = true;
        }}
        class="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border py-4 text-center text-base font-semibold text-text bg-surface/0 backdrop-blur-lg active:scale-95"
      >
        <MailIcon class="size-5" />
        {t.t("home.email")}
      </button>

      <p class="flex justify-center gap-4 pt-2 text-center text-xs text-muted">
        <a href="/terms" class="font-semibold text-primary">Terms of Service</a>
        <a href="/privacy" class="font-semibold text-primary">Privacy Policy</a>
      </p>
    </div>
  {/if}

  <AuthModal bind:open={authModalOpen} bind:mode={authMode} />
</div>
