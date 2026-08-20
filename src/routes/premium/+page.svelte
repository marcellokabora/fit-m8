<script lang="ts">
  import { get } from "svelte/store";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { MAX_SPORTS_FREE, MAX_SPORTS_PREMIUM } from "$lib/types";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import { Calendar, Crown, Dumbbell, MessageCircle } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));
  let saving = $state(false);
  let error = $state("");

  const FEATURES = [
    {
      icon: Dumbbell,
      title: "premium.featureMoreSportsTitle",
      hint: "premium.featureMoreSportsHint",
      params: { max: MAX_SPORTS_PREMIUM, free: MAX_SPORTS_FREE },
      comingSoon: false,
    },
    {
      icon: MessageCircle,
      title: "premium.featureDirectMessageTitle",
      hint: "premium.featureDirectMessageHint",
      params: {},
      comingSoon: false,
    },
    {
      icon: Calendar,
      title: "premium.featureTrainerEventsTitle",
      hint: "premium.featureTrainerEventsHint",
      params: {},
      comingSoon: true,
    },
  ] as const;

  async function setPremium(value: boolean) {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    error = "";
    saving = true;
    try {
      // No payment provider wired up yet — this just flips the flag to unblock the rest of the feature.
      // Trainer status requires an active subscription, so cancelling revokes it too.
      await userProfile.save(uid, {
        isPremium: value,
        ...(value ? {} : { isTrainer: false }),
      });
    } catch (e: any) {
      error = e.message;
    } finally {
      saving = false;
    }
  }
</script>

<BackHeader title={t.t("premium.title")} />

<div class="flex flex-col gap-6 px-5 pb-10">
  <div class="flex flex-col items-center gap-2 pt-2 text-center">
    <span
      class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
    >
      <Crown class="size-8" />
    </span>
    <h2 class="text-2xl font-black text-text">{t.t("premium.title")}</h2>
    <p class="text-sm text-muted">{t.t("premium.subtitle")}</p>
    <p class="mt-2 text-3xl font-black text-primary">
      {t.t("premium.priceLine")}
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
          <p class="flex items-center gap-2 font-bold text-text">
            {t.t(feature.title)}
            {#if feature.comingSoon}
              <span
                class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
              >
                {t.t("premium.comingSoon")}
              </span>
            {/if}
          </p>
          <p class="text-sm text-muted">{t.t(feature.hint, feature.params)}</p>
        </div>
      </div>
    {/each}
  </div>

  {#if error}
    <p class="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
  {/if}

  {#if $userProfile?.isPremium}
    <div class="rounded-2xl bg-primary/10 p-4 text-center">
      <p class="font-bold text-primary">{t.t("premium.activeTitle")}</p>
      <p class="mt-1 text-sm text-muted">{t.t("premium.activeHint")}</p>
    </div>
    <button
      onclick={() => setPremium(false)}
      disabled={saving}
      class="w-full rounded-2xl border-2 border-error/30 py-4 text-base font-semibold text-error active:scale-95 disabled:opacity-40"
    >
      {saving ? t.t("common.saving") : t.t("premium.cancelButton")}
    </button>
  {:else}
    <button
      onclick={() => setPremium(true)}
      disabled={saving}
      class="w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
    >
      {saving ? t.t("common.saving") : t.t("premium.subscribeButton")}
    </button>
  {/if}
</div>
