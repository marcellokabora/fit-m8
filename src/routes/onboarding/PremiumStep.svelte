<script lang="ts">
  import { page } from "$app/state";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "$lib/firebase/client";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    MAX_LIKES_FREE_PER_DAY,
    MAX_SPORTS_FREE,
    MAX_SPORTS_PREMIUM,
  } from "$lib/types";
  import { Crown, Dumbbell, Heart, MessageCircle } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  // Preview-only — mirrors src/routes/premium/+page.svelte's feature list, no signup here.
  const FEATURES = [
    {
      icon: Dumbbell,
      title: "premium.featureMoreSportsTitle",
      hint: "premium.featureMoreSportsHint",
      params: { max: MAX_SPORTS_PREMIUM, free: MAX_SPORTS_FREE },
    },
    {
      icon: MessageCircle,
      title: "premium.featureDirectMessageTitle",
      hint: "premium.featureDirectMessageHint",
      params: {},
    },
    {
      icon: Heart,
      title: "premium.featureUnlimitedLikesTitle",
      hint: "premium.featureUnlimitedLikesHint",
      params: { free: MAX_LIKES_FREE_PER_DAY },
    },
  ] as const;

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
  {#each FEATURES as feature}
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
{:else}
  <p class="mt-4 text-center text-xs text-muted">
    {t.t("premium.inviteOnlyHint")}
  </p>
{/if}
