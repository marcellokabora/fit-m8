<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authUser } from "$lib/stores/auth";
  import Logo from "$lib/components/Logo.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import { Eye, EyeOff } from "@lucide/svelte";

  let t = $derived(createTranslator($activeLanguage));

  let mode = $derived(
    page.url.searchParams.get("mode") === "login" ? "login" : "register",
  );
  let email = $state("");
  let password = $state("");
  let passwordVisible = $state(false);
  let error = $state("");
  let info = $state("");
  let loading = $state(false);
  let resetSending = $state(false);

  function authErrorMessage(e: any) {
    switch (e?.code) {
      case "auth/email-already-in-use":
        return t.t("auth.errorEmailInUse");
      case "auth/invalid-email":
        return t.t("auth.errorInvalidEmail");
      case "auth/weak-password":
        return t.t("auth.errorWeakPassword");
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return t.t("auth.errorInvalidCredential");
      case "auth/too-many-requests":
        return t.t("auth.errorTooManyRequests");
      default:
        return e?.message ?? t.t("errors.generic");
    }
  }

  async function handleEmail() {
    error = "";
    info = "";
    loading = true;
    try {
      if (mode === "login") {
        await authUser.signInEmail(email, password);
      } else {
        await authUser.registerEmail(email, password);
      }
      goto("/discover");
    } catch (e: any) {
      error = authErrorMessage(e);
    } finally {
      loading = false;
    }
  }

  async function handleForgotPassword() {
    error = "";
    info = "";
    if (!email) {
      error = t.t("auth.enterEmailFirst");
      return;
    }
    resetSending = true;
    try {
      await authUser.resetPassword(email);
      info = t.t("auth.resetEmailSent");
    } catch (e: any) {
      error = authErrorMessage(e);
    } finally {
      resetSending = false;
    }
  }

  // Facebook login disabled for now
  async function handleSocial(provider: "google") {
    error = "";
    loading = true;
    try {
      if (provider === "google") await authUser.signInGoogle();
      goto("/discover");
    } catch (e: any) {
      error = authErrorMessage(e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg px-6 pb-10 pt-16">
  <!-- Header -->
  <div class="mb-8 flex flex-col items-center gap-2">
    <!-- <a
      href="/"
      class="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-white overflow-auto"
    >
      <Logo class="h-full w-full" />
    </a> -->
    <h1 class="font-display text-2xl tracking-wide text-text">
      {mode === "login" ? t.t("auth.welcome") : t.t("auth.join")}
    </h1>
    <p class="text-sm text-muted">
      {mode === "login"
        ? t.t("auth.loginSubtitle")
        : t.t("auth.registerSubtitle")}
    </p>
  </div>

  <!-- Social buttons -->
  <div class="flex flex-col gap-3">
    <button
      onclick={() => handleSocial("google")}
      disabled={loading}
      class="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border bg-surface py-4 text-base font-semibold text-text shadow-sm active:scale-95 disabled:opacity-50"
    >
      <svg class="size-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {t.t("home.google")}
    </button>

    <!-- Facebook login disabled for now
    <button
      onclick={() => handleSocial("facebook")}
      disabled={loading}
      class="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-sm active:scale-95 disabled:opacity-50"
    >
      <svg class="size-5 fill-white" viewBox="0 0 24 24">
        <path
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
      Continue with Facebook
    </button>
    -->
  </div>

  <div class="my-6 flex items-center gap-3">
    <hr class="flex-1 border-border" />
    <span class="text-sm text-muted">{t.t("auth.or")}</span>
    <hr class="flex-1 border-border" />
  </div>

  <!-- Email form -->
  <form onsubmit={handleEmail} class="flex flex-col gap-4">
    <input
      type="email"
      bind:value={email}
      placeholder={t.t("auth.email")}
      required
      class="w-full rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
    />
    <div class="relative">
      <input
        type={passwordVisible ? "text" : "password"}
        bind:value={password}
        placeholder={t.t("auth.password")}
        required
        minlength={6}
        class="w-full rounded-2xl border-2 border-border bg-surface px-4 py-4 pr-12 text-base text-text outline-none focus:border-primary"
      />
      <button
        type="button"
        onclick={() => (passwordVisible = !passwordVisible)}
        tabindex="-1"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
      >
        {#if passwordVisible}
          <EyeOff class="size-5" />
        {:else}
          <Eye class="size-5" />
        {/if}
      </button>
    </div>
    {#if mode === "login"}
      <button
        type="button"
        onclick={handleForgotPassword}
        disabled={resetSending}
        class="self-end text-sm font-semibold text-primary disabled:opacity-50"
      >
        {resetSending ? t.t("auth.loading") : t.t("auth.forgotPassword")}
      </button>
    {/if}
    {#if info}
      <p class="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
        {info}
      </p>
    {/if}
    {#if error}
      <p class="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
    {/if}
    <button
      type="submit"
      disabled={loading}
      class="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
    >
      {loading
        ? t.t("auth.loading")
        : mode === "login"
          ? t.t("auth.signIn")
          : t.t("auth.createAccount")}
    </button>
  </form>

  <p class="mt-6 text-center text-sm text-muted">
    {mode === "login" ? t.t("auth.noAccount") : t.t("auth.haveAccount")}
    <a
      href="/auth?mode={mode === 'login' ? 'register' : 'login'}"
      class="font-semibold text-primary"
    >
      {mode === "login" ? t.t("auth.signUp") : t.t("auth.signIn")}
    </a>
  </p>

  {#if mode === "register"}
    <p class="mt-4 text-center text-xs text-muted">
      By continuing, you agree to our
      <a href="/terms" class="font-semibold text-primary">Terms of Service</a>
      and
      <a href="/privacy" class="font-semibold text-primary">Privacy Policy</a>.
    </p>
  {/if}
</div>
