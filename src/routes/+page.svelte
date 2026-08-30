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
  class="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-bg px-6 pb-12 pt-20"
>
  {#if !ready}
    <Loading />
  {/if}

  <!-- Logo / Hero -->
  <div class="relative z-10 flex flex-col items-center gap-4 text-text">
    <!-- <div
      class="flex size-24 items-center justify-center rounded-3xl bg-primary text-white shadow-xl overflow-auto"
    >
      <Logo class="h-full w-full" />
    </div> -->
    {#if ready}
      <!-- <h1 transition:fade class="font-display text-5xl tracking-wide">
        FIT-M8
      </h1> -->
      <img src="fit-m8-text-v2.png" alt="" class="w-80 -mt-6" />
      <p
        transition:fade
        class="text-center text-lg font-medium text-muted -mt-4"
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
      <ActivityCarousel activities={HERO_ACTIVITIES} {t} />
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
        class="block w-full rounded-2xl border-2 border-border py-4 text-center text-lg font-semibold text-text bg-surface/0 backdrop-blur-lg active:scale-95"
      >
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
