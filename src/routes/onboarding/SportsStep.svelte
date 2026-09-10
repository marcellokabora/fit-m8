<script lang="ts">
  import {
    ACTIVITIES,
    MAX_SPORTS_FREE,
    groupActivities,
    type ActivityFormat,
    type SkillLevel,
  } from "$lib/types";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { Search } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    selectedActivities = $bindable([]),
    activitySettings = $bindable({}),
  }: {
    selectedActivities?: string[];
    activitySettings?: Record<
      string,
      { format: ActivityFormat; level: SkillLevel }
    >;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));
  let sportsQuery = $state("");
  let filteredActivities = $derived(
    sportsQuery.trim()
      ? ACTIVITIES.filter((a) =>
          t
            .activity(a.id)
            .toLowerCase()
            .includes(sportsQuery.trim().toLowerCase()),
        )
      : ACTIVITIES,
  );
  let groupedFilteredActivities = $derived(groupActivities(filteredActivities));

  function toggleActivity(id: string) {
    if (selectedActivities.includes(id)) {
      selectedActivities = selectedActivities.filter((a) => a !== id);
      delete activitySettings[id];
    } else if (selectedActivities.length < MAX_SPORTS_FREE) {
      selectedActivities = [...selectedActivities, id];
      activitySettings[id] = { format: "all", level: "basic" };
    }
  }
</script>

<h2 class="mb-1 text-2xl font-black text-text">
  {t.t("onboarding.yourSports")}
</h2>
<p class="mb-1 text-sm text-muted">{t.t("onboarding.sportsHint")}</p>
<p class="mb-4 text-xs font-semibold text-muted">
  {t.t("sports.maxHint", { max: MAX_SPORTS_FREE })}
</p>
<div class="sticky top-0 z-10 -mx-6 bg-bg px-6 pb-4">
  <div class="relative">
    <Search
      class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
    />
    <input
      type="search"
      bind:value={sportsQuery}
      placeholder={t.t("common.search")}
      class="w-full rounded-2xl border-2 border-border bg-surface py-2.5 pl-9 pr-3 text-sm font-semibold text-text placeholder:text-muted focus:border-primary focus:outline-none"
    />
  </div>
</div>
{#if filteredActivities.length === 0}
  <p class="mt-6 text-center text-sm text-muted">
    {t.t("common.noResults")}
  </p>
{:else}
  {#each groupedFilteredActivities as section}
    <p
      class="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-muted first:mt-1"
    >
      {section.group ? t.activityGroup(section.group) : t.t("common.other")}
    </p>
    <div class="grid grid-cols-2 gap-3 pt-1">
      {#each section.items as activity}
        {@const selected = selectedActivities.includes(activity.id)}
        <button
          onclick={() => toggleActivity(activity.id)}
          disabled={!selected && selectedActivities.length >= MAX_SPORTS_FREE}
          class="flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 disabled:opacity-40 {selected
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'}"
        >
          <ActivityIcon id={activity.id} class="size-7 text-primary" />
          <span class="text-sm font-semibold text-text"
            >{t.activity(activity.id)}</span
          >
        </button>
      {/each}
    </div>
  {/each}
{/if}
