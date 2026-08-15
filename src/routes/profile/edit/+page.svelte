<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    ACTIVITY_FORMAT_OPTIONS,
    SKILL_LEVEL_OPTIONS,
    ORIENTATIONS,
    GENDER_OPTIONS,
    formatLabel,
    type UserActivity,
    type SexualOrientation,
    type Gender,
    type ActivityFormat,
    type SkillLevel,
  } from "$lib/types";
  import { get } from "svelte/store";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import { Plus, X, Check, Sun, Moon, RotateCcw } from "@lucide/svelte";
  import { activeTheme, THEMES } from "$lib/stores/theme";
  import { resetSwipes } from "$lib/firebase/swipe";

  let saving = $state(false);
  let confirmResetSwipes = $state(false);
  let resettingSwipes = $state(false);

  let displayName = $state($userProfile?.displayName ?? "");
  let bio = $state($userProfile?.bio ?? "");
  let city = $state($userProfile?.city ?? "");
  let sexualOrientation = $state<SexualOrientation>(
    $userProfile?.orientation ?? "straight",
  );
  let gender = $state<Gender | "">($userProfile?.gender ?? "");
  let photos = $state<string[]>(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );
  let activities = $state<UserActivity[]>($userProfile?.activities ?? []);
  let uid = $derived($authUser?.uid ?? "");

  $effect(() => {
    if ($userProfile) {
      displayName = $userProfile.displayName;
      bio = $userProfile.bio ?? "";
      city = $userProfile.city ?? "";
      sexualOrientation = $userProfile.orientation ?? "straight";
      gender = $userProfile.gender ?? "";
      photos =
        $userProfile.photos ??
        ($userProfile.photoURL ? [$userProfile.photoURL] : []);
      activities = $userProfile.activities ?? [];
    }
  });

  function handlePhotosChange(next: string[]) {
    if (!uid) return;
    userProfile.save(uid, { photos: next, photoURL: next[0] ?? "" });
  }

  async function save() {
    saving = true;
    const uid = get(authUser)?.uid;
    if (uid) {
      await userProfile.save(uid, {
        displayName,
        bio,
        city,
        gender,
        orientation: sexualOrientation,
        activities,
      });
    }
    saving = false;
    goto("/profile");
  }

  // Add sport — pick a sport, then its format/level, before adding to the
  // local list; it's persisted to Firestore when "Save" is pressed.
  let showAddSport = $state(false);
  let newActivityId = $state<string | null>(null);
  let newFormat = $state<ActivityFormat>("all");
  let newLevel = $state<SkillLevel>("Basic");

  let availableActivities = $derived(
    ACTIVITIES.filter((a) => !activities.some((act) => act.id === a.id)),
  );

  function openAddSport() {
    showAddSport = true;
    newActivityId = null;
    newFormat = "all";
    newLevel = "Basic";
  }

  function confirmAddSport() {
    if (!newActivityId) return;
    activities = [
      ...activities,
      { id: newActivityId, format: newFormat, level: newLevel },
    ];
    showAddSport = false;
  }

  function removeSport(id: string) {
    activities = activities.filter((act) => act.id !== id);
  }

  async function handleResetSwipes() {
    if (!uid) return;
    resettingSwipes = true;
    await resetSwipes(uid);
    resettingSwipes = false;
    confirmResetSwipes = false;
  }
</script>

<div class="flex min-h-screen flex-col bg-bg">
  <!-- Header -->
  <div
    class="sticky top-0 z-10 flex items-center justify-between bg-bg px-5 pb-3 pt-5"
  >
    <a
      href="/profile"
      aria-label="Close"
      class="flex size-9 items-center justify-center rounded-full text-text active:scale-95"
    >
      <X class="size-5" />
    </a>
    <h1 class="text-lg font-black text-text">Edit profile</h1>
    <button
      onclick={save}
      disabled={saving}
      class="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95 disabled:opacity-50"
    >
      {saving ? "Saving…" : "Save"}
    </button>
  </div>

  <!-- Photos + basic info -->
  <div class="flex flex-col items-center gap-3 px-5 pb-6">
    <div class="w-full">
      <PhotoGrid {photos} {uid} onchange={handlePhotosChange} />
    </div>
    <input
      type="text"
      bind:value={displayName}
      class="rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base font-bold text-center text-text w-full outline-none focus:border-primary"
    />
    <textarea
      bind:value={bio}
      rows={2}
      placeholder="Your bio…"
      class="w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
    ></textarea>
    <div class="w-full">
      <LocationPicker bind:city />
    </div>
  </div>

  <!-- Gender + Orientation -->
  <div class="px-5 pb-8">
    <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
      Gender
    </h3>
    <SegmentedControl
      options={GENDER_OPTIONS}
      value={gender}
      ariaLabel="Gender"
      onchange={(value) => (gender = value)}
    />
    <h3 class="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-muted">
      Orientation
    </h3>
    <SegmentedControl
      options={ORIENTATIONS}
      value={sexualOrientation}
      ariaLabel="Orientation"
      onchange={(value) => (sexualOrientation = value)}
    />
  </div>

  <!-- Activities -->
  <div class="px-5">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      My Sports
    </h3>
    {#if activities.length === 0}
      <p class="mb-3 text-sm text-muted">No activities set</p>
    {:else}
      <div class="mb-3 flex flex-col gap-3">
        {#each activities as act}
          {@const info = ACTIVITIES.find((a) => a.id === act.id)}
          <div
            class="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm"
          >
            <span
              class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <ActivityIcon id={act.id} class="size-5" />
            </span>
            <div class="flex-1">
              <p class="font-bold text-text">{info?.label ?? act.id}</p>
              <p class="text-sm text-muted">
                {formatLabel(act.format)} · {act.level}
              </p>
            </div>
            <button
              onclick={() => removeSport(act.id)}
              aria-label="Remove {info?.label ?? act.id}"
              class="flex size-8 items-center justify-center rounded-full text-muted active:scale-95"
            >
              <X class="size-4" />
            </button>
          </div>
        {/each}
      </div>
    {/if}

    {#if showAddSport}
      <div
        class="rounded-2xl border-2 border-dashed border-primary/40 bg-surface p-4"
      >
        <p class="mb-3 text-sm font-bold text-text">Add a sport</p>
        {#if availableActivities.length === 0}
          <p class="text-sm text-muted">You've added every sport already!</p>
        {:else}
          <div class="grid grid-cols-2 gap-2">
            {#each availableActivities as activity}
              <button
                onclick={() => (newActivityId = activity.id)}
                class="flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all active:scale-95 {newActivityId ===
                activity.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-bg'}"
              >
                <ActivityIcon id={activity.id} class="size-6 text-primary" />
                <span class="text-xs font-semibold text-text"
                  >{activity.label}</span
                >
              </button>
            {/each}
          </div>

          {#if newActivityId}
            <div class="mt-4">
              <p
                class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Format
              </p>
              <div class="mb-3">
                <SegmentedControl
                  options={ACTIVITY_FORMAT_OPTIONS}
                  value={newFormat}
                  ariaLabel="Format"
                  onchange={(value) => (newFormat = value)}
                />
              </div>
              <p
                class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Level
              </p>
              <div class="flex gap-2">
                {#each SKILL_LEVEL_OPTIONS as level}
                  <button
                    onclick={() => (newLevel = level.value as SkillLevel)}
                    class="flex-1 rounded-xl border-2 py-2 text-xs font-bold transition-colors {newLevel ===
                    level.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-muted'}"
                  >
                    {level.label}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        {/if}

        <div class="mt-4 flex gap-3">
          <button
            onclick={() => (showAddSport = false)}
            class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
          >
            Cancel
          </button>
          <button
            onclick={confirmAddSport}
            disabled={!newActivityId}
            class="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
          >
            Add sport
          </button>
        </div>
      </div>
    {:else}
      <button
        onclick={openAddSport}
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 py-3 text-sm font-bold text-primary active:scale-95"
      >
        <Plus class="size-4" />
        Add sport
      </button>
    {/if}
  </div>

  <!-- Theme -->
  <div class="px-5 pt-8 pb-8">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      Appearance
    </h3>
    <div class="mb-4 flex rounded-xl border-2 border-border bg-bg p-0.5">
      <button
        onclick={() => activeTheme.selectMode("light")}
        class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors {$activeTheme.mode ===
        'light'
          ? 'bg-primary text-white'
          : 'text-muted'}"
      >
        <Sun class="size-4" />
        Light
      </button>
      <button
        onclick={() => activeTheme.selectMode("dark")}
        class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors {$activeTheme.mode ===
        'dark'
          ? 'bg-primary text-white'
          : 'text-muted'}"
      >
        <Moon class="size-4" />
        Dark
      </button>
    </div>

    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      App Theme
    </h3>
    <div class="grid grid-cols-3 gap-3">
      {#each THEMES as theme}
        <button
          onclick={() => activeTheme.selectTheme(theme.id)}
          class="flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all active:scale-95 {$activeTheme.themeId ===
          theme.id
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'}"
        >
          <span
            class="relative flex size-10 items-center justify-center rounded-full shadow-sm"
            style="background: linear-gradient(135deg, {theme.primary} 50%, {theme.secondary} 50%); box-shadow: 0 0 0 3px {$activeTheme.mode ===
            'dark'
              ? theme.dark.bg
              : theme.light.bg}"
          >
            {#if $activeTheme.themeId === theme.id}
              <Check class="size-5 text-white drop-shadow" />
            {/if}
          </span>
          <span class="text-xs font-semibold text-text">{theme.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Reset swipes -->
  <div class="px-5 pb-8">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      Discovery
    </h3>
    {#if confirmResetSwipes}
      <div
        class="rounded-2xl border-2 border-dashed border-error/40 bg-surface p-4"
      >
        <p class="mb-3 text-sm font-bold text-text">
          Reset all swipes? Everyone you've liked or passed will reappear in
          Discover. This can't be undone.
        </p>
        <div class="flex gap-3">
          <button
            onclick={() => (confirmResetSwipes = false)}
            class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
          >
            Cancel
          </button>
          <button
            onclick={handleResetSwipes}
            disabled={resettingSwipes}
            class="flex-1 rounded-2xl bg-error py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
          >
            {resettingSwipes ? "Resetting…" : "Reset swipes"}
          </button>
        </div>
      </div>
    {:else}
      <button
        onclick={() => (confirmResetSwipes = true)}
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-error/40 py-3 text-sm font-bold text-error active:scale-95"
      >
        <RotateCcw class="size-4" />
        Reset all swipes
      </button>
    {/if}
  </div>
</div>
