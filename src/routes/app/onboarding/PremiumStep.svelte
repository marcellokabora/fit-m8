<script lang="ts">
  import { page } from "$app/state";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "$lib/firebase/client";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { submitPremiumRequest } from "$lib/firebase/premiumRequests";
  import { PREMIUM_FEATURES } from "$lib/premiumFeatures";
  import { Crown } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  // Guards against re-checking the same ?promo= link on every reactive rerun once redemption has been attempted.
  let promoChecked = $state(false);

  // Signup is invite-only right now (see src/routes/premium/+page.svelte) — an active ?promo=
  // link is the only way to unlock it here too, redeemed automatically once auth resolves.
  $effect(() => {
    const promo = page.url.searchParams.get("promo");
    const uid = $authUser?.uid;
    if (!promo || !uid || promoChecked || $userProfile?.isPremium) return;
    promoChecked = true;
    getDoc(doc(db, "promoCodes", promo)).then((snap) => {
      if (snap.exists() && snap.data().active !== false) {
        userProfile.save(uid, { isPremium: true }).catch(() => {});
      }
    });
  });

  let requesting = $state(false);
  let requestSent = $state(false);

  async function requestPremium() {
    const uid = $authUser?.uid;
    if (!uid || requesting) return;
    requesting = true;
    try {
      await submitPremiumRequest(uid);
      requestSent = true;
    } finally {
      requesting = false;
    }
  }
</script>

<div class="mb-6 flex flex-col items-center gap-2 text-center">
  <span
    class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
  >
    <Crown class="size-8" />
  </span>
  <h2 class="text-2xl font-black text-text">
    {t.t("onboarding.premiumTitle")}
  </h2>
  <p class="text-sm text-muted text-balance">
    {t.t("onboarding.premiumHint")}
  </p>
</div>
<div class="flex flex-col gap-3">
  {#each PREMIUM_FEATURES as feature}
    <div class="flex items-start gap-4 rounded-2xl bg-surface p-4 shadow-sm">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <feature.icon class="size-5" />
      </span>
      <div class="flex-1">
        <p class="font-bold text-text">{t.t(feature.title)}</p>
        <p class="text-sm text-muted">
          {t.t(feature.hint, feature.params)}
        </p>
      </div>
    </div>
  {/each}
</div>
{#if $userProfile?.isPremium}
  <div class="mt-4 rounded-2xl bg-primary/10 p-4 text-center">
    <p class="font-bold text-primary">{t.t("premium.activeTitle")}</p>
    <p class="mt-1 text-sm text-muted">{t.t("premium.activeHint")}</p>
  </div>
{:else if requestSent}
  <p class="mt-4 text-center text-xs text-muted">
    {t.t("premium.requestSentHint")}
  </p>
{:else}
  <button
    onclick={requestPremium}
    disabled={requesting}
    class="mt-4 w-full rounded-2xl bg-primary py-4 text-base font-bold text-bg shadow-md active:scale-95 disabled:opacity-40"
  >
    {requesting ? t.t("common.saving") : t.t("premium.requestButton")}
  </button>
{/if}
