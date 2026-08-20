<script lang="ts">
  import { X, Search } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import type { Translator } from "$lib/stores/language";

  let {
    activities,
    selectedIds = $bindable([]),
    t,
    onCancel,
    onConfirm,
  }: {
    activities: readonly { id: string }[];
    selectedIds?: string[];
    t: Translator;
    onCancel: () => void;
    onConfirm: () => void;
  } = $props();

  let query = $state("");
  let searchEl = $state<HTMLInputElement | null>(null);

  let filtered = $derived(
    query.trim()
      ? activities.filter((a) =>
          t.activity(a.id).toLowerCase().includes(query.trim().toLowerCase()),
        )
      : activities,
  );

  function toggle(id: string) {
    selectedIds = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
  }

  // Autofocus the search field as soon as the picker takes over the screen.
  $effect(() => {
    searchEl?.focus();
  });
</script>

<div class="fixed inset-0 z-50 mx-auto flex w-full flex-col bg-bg md:max-w-md">
  <div class="sticky top-0 z-10 bg-bg px-5 pb-3 pt-5 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-black text-text">{t.t("profile.addSport")}</h2>
      <button
        onclick={onCancel}
        class="flex size-8 items-center justify-center rounded-full bg-surface text-muted"
        aria-label={t.t("common.close")}
      >
        <X class="size-4" />
      </button>
    </div>
    <div class="relative">
      <Search
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      <input
        bind:this={searchEl}
        type="text"
        bind:value={query}
        placeholder={t.t("common.search")}
        class="w-full rounded-2xl border-2 border-border bg-surface py-2.5 pl-9 pr-3 text-sm font-semibold text-text placeholder:text-muted focus:border-primary focus:outline-none"
      />
    </div>
  </div>

  <div class="flex-1 overflow-y-auto px-5 pb-4">
    {#if filtered.length === 0}
      <p class="mt-6 text-center text-sm text-muted">
        {t.t("common.noResults")}
      </p>
    {:else}
      <div class="grid grid-cols-2 gap-2 pt-1">
        {#each filtered as activity}
          <button
            onclick={() => toggle(activity.id)}
            class="flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all active:scale-95 {selectedIds.includes(
              activity.id,
            )
              ? 'border-primary bg-primary/10'
              : 'border-border bg-surface'}"
          >
            <ActivityIcon id={activity.id} class="size-6 text-primary" />
            <span class="text-xs font-semibold text-text"
              >{t.activity(activity.id)}</span
            >
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div
    class="sticky bottom-0 flex gap-3 border-t-2 border-border bg-bg px-5 py-4"
  >
    <button
      onclick={onCancel}
      class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
    >
      {t.t("common.cancel")}
    </button>
    <button
      onclick={onConfirm}
      disabled={selectedIds.length === 0}
      class="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
    >
      {selectedIds.length > 1
        ? t.t("profile.addSports", { count: selectedIds.length })
        : t.t("profile.addSportButton")}
    </button>
  </div>
</div>
