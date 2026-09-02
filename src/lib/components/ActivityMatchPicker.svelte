<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    open,
    activities,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    // shared activities to choose from, one or more must be picked before confirming
    activities: { id: string }[];
    onConfirm: (selectedIds: string[]) => void;
    onCancel: () => void;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let selected = $state<string[]>([]);

  // Reset selection each time the sheet opens for a new candidate
  $effect(() => {
    if (open) selected = [];
  });

  function toggle(id: string) {
    selected = selected.includes(id)
      ? selected.filter((activityId) => activityId !== id)
      : [...selected, id];
  }

  function confirm() {
    if (selected.length === 0) return;
    onConfirm(selected);
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
    transition:fade={{ duration: 150 }}
    onclick={onCancel}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class="flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-surface pt-4 shadow-2xl"
      transition:fly={{ y: 400, duration: 250 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border"></div>

      <div class="flex flex-col gap-1 px-7 pb-4">
        <h2 class="text-2xl font-black text-text">
          {t.t("discover.activityPickerTitle")}
        </h2>
        <p class="text-sm text-muted">
          {t.t("discover.activityPickerHint")}
        </p>
      </div>

      <div class="flex flex-col gap-3 overflow-y-auto px-7 pb-4">
        {#each activities as activity}
          {@const isSelected = selected.includes(activity.id)}
          <button
            type="button"
            onclick={() => toggle(activity.id)}
            aria-pressed={isSelected}
            class="flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors {isSelected
              ? 'border-primary bg-primary/10'
              : 'border-border bg-bg'}"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <ActivityIcon id={activity.id} class="size-5" />
            </span>
            <span class="flex-1 font-bold text-text">
              {t.activity(activity.id)}
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

      <div class="flex gap-3 border-t border-border px-7 py-4">
        <button
          onclick={onCancel}
          class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
        >
          {t.t("common.cancel")}
        </button>
        <button
          onclick={confirm}
          disabled={selected.length === 0}
          class="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
        >
          {t.t("common.continue")}
        </button>
      </div>
    </div>
  </div>
{/if}
