<script lang="ts">
  import { goto } from "$app/navigation";
  import { Search } from "@lucide/svelte";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    getMaxSports,
    type ActivityFormat,
    type SkillLevel,
  } from "$lib/types";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let profileActivities = $derived($userProfile?.activities ?? []);
  let availableActivities = $derived(
    ACTIVITIES.filter((a) => !profileActivities.some((act) => act.id === a.id)),
  );
  let maxSports = $derived(getMaxSports($userProfile?.isPremium));
  let remainingSlots = $derived(
    Math.max(0, maxSports - profileActivities.length),
  );

  let query = $state("");
  let selectedIds = $state<string[]>([]);

  let filtered = $derived(
    query.trim()
      ? availableActivities.filter((a) =>
          t.activity(a.id).toLowerCase().includes(query.trim().toLowerCase()),
        )
      : availableActivities,
  );

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter((x) => x !== id);
    } else if (selectedIds.length < remainingSlots) {
      selectedIds = [...selectedIds, id];
    }
  }

  async function confirm() {
    if (selectedIds.length === 0) return;
    const uid = $authUser?.uid;
    if (!uid) return;
    await userProfile.save(uid, {
      activities: [
        ...profileActivities,
        ...selectedIds.map((id) => ({
          id,
          format: "all" as ActivityFormat,
          level: "basic" as SkillLevel,
        })),
      ],
    });
    goto("/profile");
  }
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-bg">
  <BackHeader href="/profile">
    <h1 class="text-lg font-black text-text">{t.t("profile.addSport")}</h1>
  </BackHeader>

  <div class="px-5 pb-3">
    <p class="mb-3 text-xs font-semibold text-muted">
      {t.t("sports.maxHint", { max: remainingSlots })}
    </p>
    <div class="relative">
      <Search
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        bind:value={query}
        placeholder={t.t("common.search")}
        class="w-full rounded-2xl border-2 border-border bg-surface py-2.5 pl-9 pr-3 text-sm font-semibold text-text placeholder:text-muted focus:border-primary focus:outline-none"
      />
    </div>
  </div>

  <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
    {#if filtered.length === 0}
      <p class="mt-6 text-center text-sm text-muted">
        {t.t("common.noResults")}
      </p>
    {:else}
      <div class="grid grid-cols-2 gap-2 pt-1">
        {#each filtered as activity}
          {@const selected = selectedIds.includes(activity.id)}
          <button
            onclick={() => toggle(activity.id)}
            disabled={!selected && selectedIds.length >= remainingSlots}
            class="flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all active:scale-95 disabled:opacity-40 {selected
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

  <div class="border-t border-border bg-surface p-4">
    <button
      onclick={confirm}
      disabled={selectedIds.length === 0}
      class="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
    >
      {selectedIds.length > 1
        ? t.t("profile.addSports", { count: selectedIds.length })
        : t.t("profile.addSportButton")}
    </button>
  </div>
</div>
