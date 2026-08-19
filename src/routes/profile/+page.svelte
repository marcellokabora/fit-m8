<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    ACTIVITY_FORMAT_OPTIONS,
    SKILL_LEVEL_OPTIONS,
    type ActivityFormat,
    type SkillLevel,
    type UserActivity,
  } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import PhotoGallery from "$lib/components/PhotoGallery.svelte";
  import LanguagePicker from "$lib/components/LanguagePicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import SportPickerModal from "$lib/components/SportPickerModal.svelte";
  import { ChevronDown, MapPin, Pencil, Plus, Trash2 } from "@lucide/svelte";
  import { slide } from "svelte/transition";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));
  let activities = $state<UserActivity[]>($userProfile?.activities ?? []);
  let expandedActivityId = $state<string | null>(null);
  let showAddSport = $state(false);
  let selectedNewIds = $state<string[]>([]);

  let formatOptions = $derived(
    ACTIVITY_FORMAT_OPTIONS.map((option) => ({
      ...option,
      label: t.format(option.value),
    })),
  );
  let skillOptions = $derived(
    SKILL_LEVEL_OPTIONS.map((option) => ({
      ...option,
      label: t.skill(option.value),
    })),
  );
  let availableActivities = $derived(
    ACTIVITIES.filter((a) => !activities.some((act) => act.id === a.id)),
  );

  let photos = $derived(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );

  $effect(() => {
    activities = $userProfile?.activities ?? [];
  });

  async function saveActivities(next: UserActivity[]) {
    const uid = $authUser?.uid;
    if (!uid) return;
    activities = next;
    await userProfile.save(uid, { activities: next });
  }

  function toggleExpandActivity(id: string) {
    expandedActivityId = expandedActivityId === id ? null : id;
  }

  function updateActivityFormat(id: string, format: ActivityFormat) {
    void saveActivities(
      activities.map((act) => (act.id === id ? { ...act, format } : act)),
    );
  }

  function updateActivityLevel(id: string, level: SkillLevel) {
    void saveActivities(
      activities.map((act) => (act.id === id ? { ...act, level } : act)),
    );
  }

  function removeSport(id: string) {
    if (expandedActivityId === id) expandedActivityId = null;
    void saveActivities(activities.filter((act) => act.id !== id));
  }

  function openAddSport() {
    showAddSport = true;
    selectedNewIds = [];
  }

  function confirmAddSport() {
    if (selectedNewIds.length === 0) return;
    void saveActivities([
      ...activities,
      ...selectedNewIds.map((id) => ({
        id,
        format: "all" as ActivityFormat,
        level: "basic" as SkillLevel,
      })),
    ]);
    showAddSport = false;
    selectedNewIds = [];
  }

  async function logout() {
    // Navigate explicitly instead of relying on the layout's auth-state
    // redirect, which can lag (or never fire) on some mobile browsers.
    try {
      await authUser.signOut();
    } finally {
      goto("/", { replaceState: true });
    }
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-24">
  <!-- Header -->
  <div
    class="sticky top-0 z-10 flex items-center justify-between bg-bg px-5 pb-3 pt-5"
  >
    <h1 class="text-2xl font-black text-text">{t.t("nav.profile")}</h1>
    <a
      href="/profile/edit"
      class="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95"
    >
      <Pencil class="size-4" />
      {t.t("profile.edit")}
    </a>
  </div>

  <!-- Photos + basic info -->
  <PhotoGallery
    {photos}
    alt={$userProfile?.displayName ?? t.t("common.profilePhoto")}
  />
  <div class="flex flex-col items-center gap-3 px-5 pb-6 pt-4">
    <h2 class="text-xl font-black text-text">
      {$userProfile?.displayName ?? "—"}
    </h2>
    {#if $userProfile?.city}
      <p class="flex items-center gap-1 text-sm text-muted">
        <MapPin class="size-4" />
        {$userProfile.city}
      </p>
    {/if}
    {#if $userProfile?.bio}
      <p class="text-center text-sm text-muted text-balance">
        {$userProfile.bio}
      </p>
    {/if}
  </div>

  <!-- Activities -->
  <div class="px-5">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      {t.t("common.mySports")}
    </h3>
    {#if activities.length === 0}
      <p class="mb-3 text-sm text-muted">{t.t("common.noActivities")}</p>
    {:else}
      <div class="mb-3 flex flex-col gap-3">
        {#each activities as act}
          {@const expanded = expandedActivityId === act.id}
          <div class="rounded-2xl bg-surface shadow-sm">
            <div
              role="button"
              tabindex="0"
              onclick={() => toggleExpandActivity(act.id)}
              onkeydown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                toggleExpandActivity(act.id)}
              class="flex items-center gap-4 p-4"
            >
              <span
                class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <ActivityIcon id={act.id} class="size-5" />
              </span>
              <div class="flex-1">
                <p class="font-bold text-text">{t.activity(act.id)}</p>
                <p class="text-sm text-muted">
                  {#if act.format !== "all"}{t.format(act.format)}·
                  {/if}{t.skill(act.level)}
                </p>
              </div>
              {#if expanded}
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    removeSport(act.id);
                  }}
                  aria-label={`${t.t("common.removeSport")} ${t.activity(act.id)}`}
                  class="flex size-8 items-center justify-center rounded-full bg-error/10 text-error active:scale-95"
                >
                  <Trash2 class="size-4" />
                </button>
              {:else}
                <ChevronDown class="size-5 text-muted" />
              {/if}
            </div>
            {#if expanded}
              <div class="px-4 pb-4" transition:slide={{ duration: 200 }}>
                <p
                  class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {t.t("common.format")}
                </p>
                <div class="mb-3">
                  <SegmentedControl
                    options={formatOptions}
                    value={act.format}
                    ariaLabel={t.t("common.format")}
                    onchange={(value) => updateActivityFormat(act.id, value)}
                  />
                </div>
                <p
                  class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {t.t("common.level")}
                </p>
                <SegmentedControl
                  options={skillOptions}
                  value={act.level}
                  ariaLabel={t.t("common.level")}
                  onchange={(value) => updateActivityLevel(act.id, value)}
                />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if availableActivities.length === 0}
      <p class="text-sm text-muted">{t.t("profile.allSports")}</p>
    {:else}
      <button
        onclick={openAddSport}
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 py-3 text-sm font-bold text-primary active:scale-95"
      >
        <Plus class="size-4" />
        {t.t("profile.addSportButton")}
      </button>
    {/if}
  </div>

  {#if showAddSport}
    <SportPickerModal
      activities={availableActivities}
      bind:selectedIds={selectedNewIds}
      {t}
      onCancel={() => (showAddSport = false)}
      onConfirm={confirmAddSport}
    />
  {/if}

  <!-- Logout -->
  <div class="mt-auto px-5 pt-8">
    <button
      onclick={logout}
      class="mt-5 w-full rounded-2xl border-2 border-error/30 py-4 text-base font-semibold text-error active:scale-95"
    >
      {t.t("profile.signOut")}
    </button>
  </div>

  <BottomNav active="profile" />
</div>
