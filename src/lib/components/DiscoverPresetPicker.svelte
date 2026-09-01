<script module lang="ts">
  export type DiscoverPreset = "dating" | "friends" | "trainer";
</script>

<script lang="ts">
  import { Check, Heart, UserShield, Users } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  const HOW_IT_WORKS = [
    {
      key: "dating",
      preset: "dating",
      icon: Heart,
      body: "discover.presetHintDatingBody",
    },
    {
      key: "friends",
      preset: "friends",
      icon: Users,
      body: "discover.presetHintFriendsBody",
    },
    {
      key: "experts",
      preset: "trainer",
      icon: UserShield,
      body: "discover.presetHintTrainerBody",
    },
  ] as const;

  let {
    preset,
    onchange,
  }: {
    preset: DiscoverPreset | null;
    onchange: (preset: DiscoverPreset) => void;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
</script>

<h2 class="mb-1 text-2xl font-black text-text">
  {t.t("onboarding.howItWorks")}
</h2>
<p class="mb-6 text-sm text-muted mr-20">
  {t.t("onboarding.howItWorksHint")}
</p>
<div class="mb-6">
  <p class="text-sm font-bold text-text">
    {t.t("discover.presetHintIntroTitle")}
  </p>
  <p class="mt-0.5 text-xs text-muted">
    {t.t("discover.presetHintIntroBody")}
  </p>
</div>
<div
  class="flex flex-col gap-4"
  role="radiogroup"
  aria-label={t.t("onboarding.howItWorks")}
>
  {#each HOW_IT_WORKS as slide}
    {@const selected = preset === slide.preset}
    <button
      type="button"
      onclick={() => onchange(slide.preset)}
      role="radio"
      aria-checked={selected}
      class="flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors {selected
        ? 'border-primary bg-primary/10'
        : 'border-border bg-surface'}"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <slide.icon class="size-5" />
      </span>
      <div class="flex-1">
        <p class="font-bold text-text">
          {t.t(`intro.${slide.key}.title`)}
        </p>
        <p class="text-sm text-muted">
          {t.t(slide.body)}
        </p>
      </div>
      <!-- Radio indicator — makes clear only one of these can be picked, and it must be tapped to check it -->
      <span
        aria-hidden="true"
        class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 {selected
          ? 'border-primary bg-primary'
          : 'border-border'}"
      >
        {#if selected}
          <Check class="size-3.5 text-white" />
        {/if}
      </span>
    </button>
  {/each}
</div>
