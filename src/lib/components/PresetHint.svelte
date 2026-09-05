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
  } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  export type DiscoverPresetKind = "default" | "dating" | "friends" | "trainer";

  let {
    class: className = "",
    preset = null,
    // undefined = the profile hasn't finished loading yet, so we don't know if
    // filters exist; only once it resolves to a real boolean do we decide whether to auto-open
    hasDiscoverFilters,
    onSelectPreset,
  }: {
    class?: string;
    preset?: DiscoverPresetKind | null;
    hasDiscoverFilters?: boolean;
    onSelectPreset: (preset: DiscoverPresetKind) => void;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let open = $state(false);
  // Highlighted preset while the modal is open; stays null until tapped, which is what
  // keeps the modal from being dismissed before the user actually picks one
  let selected = $state<DiscoverPresetKind | null>(null);

  function openModal() {
    selected = preset;
    open = true;
  }

  // Auto-opens only for users with no saved discover filters yet - once one is picked and
  // saved (see saveFilters/applyDatingPreset etc.), it won't show up again. Waits for the
  // profile to finish loading (hasDiscoverFilters undefined) so it doesn't flash open before
  // the saved filters are known, then only ever decides once.
  let autoOpenDecided = false;
  $effect(() => {
    if (autoOpenDecided || hasDiscoverFilters === undefined) return;
    autoOpenDecided = true;
    if (!hasDiscoverFilters) openModal();
  });

  // No-op until a preset is picked, so backdrop taps and the confirm button can't close
  // the modal without applying one of the three discover presets
  function confirmAndClose() {
    if (!selected) return;
    onSelectPreset(selected);
    open = false;
  }

  const CONCEPT_ROWS = [
    {
      key: "swipe",
      icon: Zap,
      title: "discover.presetHintSwipeTitle",
      body: "discover.presetHintSwipeBody",
    },
    {
      key: "sports",
      icon: Dumbbell,
      title: "discover.presetHintIntroTitle",
      body: "discover.presetHintIntroBody",
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

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
    transition:fade={{ duration: 150 }}
    onclick={confirmAndClose}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class="flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-surface pt-4 shadow-2xl"
      transition:fly={{ y: 400, duration: 250 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border"></div>

      <div class="flex flex-col gap-6 overflow-y-auto px-7 pb-4">
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
          <p class="mb-3 text-sm font-bold text-primary">
            {t.t("discover.presetHintPickOne")}
          </p>
          <div
            class="flex flex-col gap-3"
            role="radiogroup"
            aria-label={t.t("discover.presetHintPickOne")}
          >
            {#each ROWS as row}
              {@const isSelected = selected === row.key}
              <button
                type="button"
                onclick={() => (selected = row.key)}
                role="radio"
                aria-checked={isSelected}
                class="flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors {isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-bg'}"
              >
                <span
                  class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <row.icon class="size-5" />
                </span>
                <span class="flex-1">
                  <span class="block font-bold text-text">{t.t(row.title)}</span
                  >
                  <span class="mt-0.5 block text-sm text-muted"
                    >{t.t(row.body)}</span
                  >
                </span>
                <span
                  aria-hidden="true"
                  class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 {isSelected
                    ? 'border-primary bg-primary'
                    : 'border-border'}"
                >
                  {#if isSelected}
                    <Check class="size-3.5 text-white" />
                  {/if}
                </span>
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div class="border-t border-border px-7 py-4">
        <button
          onclick={confirmAndClose}
          disabled={!selected}
          class="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
        >
          {t.t("common.save")}
        </button>
      </div>
    </div>
  </div>
{/if}
