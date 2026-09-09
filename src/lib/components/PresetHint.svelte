<script lang="ts">
  import {
    Heart,
    Users,
    UserShield,
    RotateCcw,
    CircleQuestionMark,
    Dumbbell,
    Zap,
    Check,
    SlidersHorizontal,
  } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import type { DiscoverPresetKind } from "$lib/discoverPresets";
  import BottomSheet from "./BottomSheet.svelte";

  let {
    class: className = "",
    preset = null,
    onSelectPreset,
  }: {
    class?: string;
    preset?: DiscoverPresetKind | null;
    onSelectPreset: (preset: DiscoverPresetKind) => void;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let open = $state(false);

  function openModal() {
    open = true;
  }

  // Tapping a row applies it right away and dismisses the sheet, no separate save step
  function choosePreset(kind: DiscoverPresetKind) {
    onSelectPreset(kind);
    open = false;
  }

  const CONCEPT_ROWS = [
    // {
    //   key: "swipe",
    //   icon: Zap,
    //   title: "discover.presetHintSwipeTitle",
    //   body: "discover.presetHintSwipeBody",
    // },
    {
      key: "sports",
      icon: Dumbbell,
      title: "discover.presetHintIntroTitle",
      body: "discover.presetHintIntroBody",
    },
    {
      key: "filters",
      icon: SlidersHorizontal,
      title: "discover.presetHintFiltersTitle",
      body: "discover.presetHintFiltersBody",
    },
  ] as const;

  const ROWS = [
    {
      key: "default",
      icon: RotateCcw,
      title: "discover.defaultPreset",
      body: "discover.presetHintDefaultBody",
    },
    {
      key: "dating",
      icon: Heart,
      title: "discover.datingPreset",
      body: "discover.presetHintDatingBody",
    },
    {
      key: "friends",
      icon: Users,
      title: "discover.friendsPreset",
      body: "discover.presetHintFriendsBody",
    },
    {
      key: "trainer",
      icon: UserShield,
      title: "discover.trainerPreset",
      body: "discover.presetHintTrainerBody",
    },
  ] as const;
</script>

<button
  onclick={openModal}
  class="flex size-9 items-center justify-center rounded-full bg-surface text-text shadow-sm {className}"
  aria-label={t.t("discover.presetHintToggle")}
>
  <CircleQuestionMark class="size-5" />
</button>

<BottomSheet
  bind:open
  onClose={() => (open = false)}
  closeLabel={t.t("discover.presetHintToggle")}
  bgClass="bg-surface"
  maxHeightClass="max-h-[85dvh]"
>
  {#snippet children()}
    <div class="flex flex-col gap-6 overflow-y-auto px-7 pt-4 pb-4">
      <div>
        <h2 class="text-2xl font-black text-text">
          {t.t("discover.presetHintToggle")}
        </h2>
        <p class="mt-1 text-sm text-muted">
          {t.t("discover.presetHintSubtitle")}
        </p>
      </div>

      <div class="flex flex-col gap-4">
        {#each CONCEPT_ROWS as row}
          <div class="flex items-start gap-4">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <row.icon class="size-5" />
            </div>
            <div>
              <p class="text-base font-bold text-text">{t.t(row.title)}</p>
              <p class="mt-0.5 text-sm text-muted">{t.t(row.body)}</p>
            </div>
          </div>
        {/each}
      </div>

      <div class="">
        <div
          class="flex flex-col gap-3"
          role="radiogroup"
          aria-label={t.t("discover.presetHintPickOne")}
        >
          {#each ROWS as row}
            {@const isActive = preset === row.key}
            <button
              type="button"
              onclick={() => choosePreset(row.key)}
              role="radio"
              aria-checked={isActive}
              class="flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors {isActive
                ? 'border-primary bg-primary/10'
                : 'border-border bg-bg'}"
            >
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <row.icon class="size-5" />
              </span>
              <span class="flex-1">
                <span class="block font-bold text-text">{t.t(row.title)}</span>
                <span class="mt-0.5 block text-sm text-muted"
                  >{t.t(row.body)}</span
                >
              </span>
              <span
                aria-hidden="true"
                class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 {isActive
                  ? 'border-primary bg-primary'
                  : 'border-border'}"
              >
                {#if isActive}
                  <Check class="size-3.5 text-white" />
                {/if}
              </span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/snippet}
</BottomSheet>
