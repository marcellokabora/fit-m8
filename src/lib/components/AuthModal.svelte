<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade, fly } from "svelte/transition";
  import { authUser } from "$lib/stores/auth";
  import GoogleSignInButton from "$lib/components/GoogleSignInButton.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import { Eye, EyeOff, X } from "@lucide/svelte";

  let {
    open = $bindable(false),
    mode = $bindable<"login" | "register">("register"),
  }: { open?: boolean; mode?: "login" | "register" } = $props();

  let t = $derived(createTranslator($activeLanguage));

  let email = $state("");
  let password = $state("");
  let passwordVisible = $state(false);
  let error = $state("");
  let info = $state("");
  let loading = $state(false);
  let resetSending = $state(false);

  function close() {
    open = false;
  }

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

  async function handleGoogle() {
    error = "";
    loading = true;
    try {
      await authUser.signInGoogle();
      goto("/discover");
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
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
    transition:fade={{ duration: 150 }}
    onclick={close}
  >
    <div
      class="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-bg px-6 pb-8 pt-4"
      transition:fly={{ y: 400, duration: 250 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border"></div>

      <div class="mb-6 flex items-start justify-between gap-2">
        <div>
          <h1 class="font-display text-2xl tracking-wide text-text">
            {mode === "login" ? t.t("auth.welcome") : t.t("auth.join")}
          </h1>
          <p class="text-sm text-muted">
            {mode === "login"
              ? t.t("auth.loginSubtitle")
              : t.t("auth.registerSubtitle")}
          </p>
        </div>
        <button
          type="button"
          onclick={close}
          aria-label={t.t("common.close")}
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted active:scale-95"
        >
          <X class="size-5" />
        </button>
      </div>

      <GoogleSignInButton
        onclick={handleGoogle}
        {loading}
        label={t.t("home.google")}
        loadingLabel={t.t("home.signingIn")}
      />

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
        <button
          type="button"
          onclick={() => (mode = mode === "login" ? "register" : "login")}
          class="font-semibold text-primary"
        >
          {mode === "login" ? t.t("auth.signUp") : t.t("auth.signIn")}
        </button>
      </p>
    </div>
  </div>
{/if}
