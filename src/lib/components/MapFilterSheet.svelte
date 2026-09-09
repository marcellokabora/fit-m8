<script lang="ts">
  import BottomSheet from "$lib/components/BottomSheet.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { ACTIVITIES } from "$lib/types";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    open = $bindable(false),
    myActivityIds = [],
    availableActivityIds = [],
    selectedIds = [],
    onApply,
  }: {
    open?: boolean;
    // the user's own sports surface first in the picker, ahead of the rest
    myActivityIds?: string[];
    // only sports with at least one active check-in on the map are offered
    availableActivityIds?: string[];
    selectedIds?: string[];
    onApply: (activityIds: string[]) => void;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));

  let orderedActivities = $derived(
    ACTIVITIES.filter((activity) =>
      availableActivityIds.includes(activity.id),
    ).sort(
      (a, b) =>
        Number(myActivityIds.includes(b.id)) -
        Number(myActivityIds.includes(a.id)),
    ),
  );

  let draft = $state<string[]>([]);

  // Reset the draft to the currently-applied selection each time the sheet opens
  $effect(() => {
    if (open) draft = [...selectedIds];
  });

  function toggle(id: string) {
    draft = draft.includes(id)
      ? draft.filter((activityId) => activityId !== id)
      : [...draft, id];
  }

  function close() {
    open = false;
  }

  function apply() {
    onApply(draft);
    open = false;
  }

  function showAll() {
    onApply([]);
    open = false;
  }
</script>

<BottomSheet
  bind:open
  onClose={close}
  closeLabel={t.t("common.close")}
  bgClass="bg-surface"
  maxHeightClass="max-h-[85dvh]"
>
  <div class="flex flex-col gap-1 px-7 pb-4 pt-2">
    <h2 class="text-xl font-black text-text">{t.t("explore.filterTitle")}</h2>
    <p class="text-sm text-muted">{t.t("explore.filterHint")}</p>
  </div>

  {#if orderedActivities.length === 0}
    <p class="px-7 pb-4 text-sm text-muted">
      {t.t("explore.noActiveCheckins")}
    </p>
  {:else}
    <div class="grid grid-cols-4 gap-3 overflow-y-auto px-7 pb-4">
      {#each orderedActivities as activity}
        {@const isSelected = draft.includes(activity.id)}
        <button
          type="button"
          onclick={() => toggle(activity.id)}
          aria-pressed={isSelected}
          class="flex flex-col items-center gap-1 rounded-2xl border-2 p-3 {isSelected
            ? 'border-primary bg-primary/10'
            : 'border-border bg-bg'}"
        >
          <ActivityIcon
            id={activity.id}
            class="size-5 {isSelected ? 'text-primary' : 'text-text'}"
          />
          <span class="truncate text-[10px] font-semibold text-text"
            >{t.activity(activity.id)}</span
          >
        </button>
      {/each}
    </div>
  {/if}

  <div class="flex gap-3 border-t border-border px-7 py-4">
    <button
      type="button"
      onclick={showAll}
      class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
    >
      {t.t("explore.filterShowAll")}
    </button>
    <button
      type="button"
      onclick={apply}
      disabled={draft.length === 0}
      class="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
    >
      {t.t("explore.filterApply")}
    </button>
  </div>
</BottomSheet>
