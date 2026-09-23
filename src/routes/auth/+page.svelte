<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authUser } from "$lib/stores/auth";
  import GoogleSignInButton from "$lib/components/GoogleSignInButton.svelte";
  import FacebookSignInButton from "$lib/components/FacebookSignInButton.svelte";
  import LogoText from "$lib/components/LogoText.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import { Eye, EyeOff, LogIn, UserRoundPlus } from "@lucide/svelte";

  let t = $derived(createTranslator($activeLanguage));

  let mode = $state<"login" | "register">(
    page.url.searchParams.get("mode") === "register" ? "register" : "login",
  );
  // app/+layout.svelte sends unauthenticated visitors here with the page they wanted
  let redirectTo = $derived(
    page.url.searchParams.get("redirect") || "/app/discover",
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
      case "auth/account-exists-with-different-credential":
        return t.t("auth.errorAccountExistsDifferentCredential");
      default:
        return e?.message ?? t.t("errors.generic");
    }
  }

  async function handleGoogle() {
    error = "";
    loading = true;
    try {
      await authUser.signInGoogle();
      goto(redirectTo);
    } catch (e: any) {
      error = authErrorMessage(e);
    } finally {
      loading = false;
    }
  }

  async function handleFacebook() {
    error = "";
    loading = true;
    try {
      await authUser.signInFacebook();
      goto(redirectTo);
    } catch (e: any) {
      error = authErrorMessage(e);
    } finally {
      loading = false;
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
      goto(redirectTo);
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
</script>

<svelte:head>
  <title
    >{mode === "login" ? t.t("auth.welcome") : t.t("auth.join")} · FIT-M8</title
  >
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
  {#if loading}
    <Loading fullscreen={false} />
  {:else}
    <div class="w-full max-w-sm">
      <div class="mb-8 flex flex-col items-center gap-2 text-center">
        <a href="/" aria-label="FIT-M8 home">
          <LogoText class="h-8 w-auto text-primary" />
        </a>
        <h1 class="mt-4 text-2xl font-black text-text">
          {mode === "login" ? t.t("auth.welcome") : t.t("auth.join")}
        </h1>
        <p class="text-sm text-muted">
          {mode === "login"
            ? t.t("auth.loginSubtitle")
            : t.t("auth.registerSubtitle")}
        </p>
      </div>

      <GoogleSignInButton onclick={handleGoogle} label={t.t("home.google")} />

      <div class="mt-3">
        <FacebookSignInButton
          onclick={handleFacebook}
          label={t.t("home.facebook")}
        />
      </div>

      <div class="my-6 flex items-center gap-3">
        <hr class="flex-1 border-border" />
        <span class="text-sm text-muted">{t.t("auth.or")}</span>
        <hr class="flex-1 border-border" />
      </div>

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
          <p class="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        {/if}
        <button
          type="submit"
          class="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-lg font-bold text-bg shadow-md active:scale-95"
        >
          {#if mode === "login"}
            <LogIn class="size-5" />
          {:else}
            <UserRoundPlus class="size-5" />
          {/if}
          {mode === "login" ? t.t("auth.signIn") : t.t("auth.createAccount")}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-muted">
        {mode === "login" ? t.t("auth.noAccount") : t.t("auth.haveAccount")}
        <button
          type="button"
          onclick={() => (mode = mode === "login" ? "register" : "login")}
          class="font-semibold text-primary"
        >
          {mode === "login" ? t.t("auth.signUp") : t.t("auth.signIn")}
        </button>
      </p>
    </div>
  {/if}
</div>
