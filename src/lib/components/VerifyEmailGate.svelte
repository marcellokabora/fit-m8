<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { MailCheck } from "@lucide/svelte";
  import { authUser } from "$lib/stores/auth";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let verificationSending = $state(false);
  let verificationMessage = $state("");
  let checkingVerification = $state(false);

  async function resendVerification() {
    verificationSending = true;
    verificationMessage = "";
    try {
      await authUser.resendVerificationEmail();
      verificationMessage = t.t("auth.verificationEmailSent");
    } catch (e: any) {
      verificationMessage = e.message ?? t.t("errors.generic");
    } finally {
      verificationSending = false;
    }
  }

  async function checkVerification() {
    checkingVerification = true;
    verificationMessage = "";
    // The parent layout reacts to the auth store update and swaps this gate out once verified
    const verified = await authUser.refreshUser();
    if (!verified) {
      verificationMessage = t.t("auth.stillNotVerified");
    }
    checkingVerification = false;
  }

  onMount(() => {
    // Firebase's verification email links back here with ?verified=1 once it confirms the address
    if (page.url.searchParams.get("verified") === "1") {
      goto(page.url.pathname, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    }
    // Silently catches verification completed in another tab/session
    authUser.refreshUser();
  });
</script>

<div
  class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
>
  <MailCheck class="size-16 text-primary" />
  <h1 class="text-xl font-black text-text">
    {t.t("auth.verifyEmailTitle")}
  </h1>
  <p class="text-sm text-muted">
    {t.t("auth.verifyEmailHint", { email: $authUser?.email ?? "" })}
  </p>
  {#if verificationMessage}
    <p class="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
      {verificationMessage}
    </p>
  {/if}
  <button
    onclick={checkVerification}
    disabled={checkingVerification}
    class="w-full rounded-2xl bg-primary py-4 text-base font-bold text-bg shadow-md active:scale-95 disabled:opacity-50"
  >
    {checkingVerification ? t.t("common.loading") : t.t("auth.iHaveVerified")}
  </button>
  <button
    onclick={resendVerification}
    disabled={verificationSending}
    class="w-full rounded-2xl border-2 border-border py-4 text-base font-semibold text-text active:scale-95 disabled:opacity-50"
  >
    {verificationSending
      ? t.t("common.loading")
      : t.t("auth.resendVerification")}
  </button>
  <button
    onclick={() => authUser.signOut()}
    class="mt-2 text-sm font-semibold text-muted"
  >
    {t.t("profile.signOut")}
  </button>
</div>
