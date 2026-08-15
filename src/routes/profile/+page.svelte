<script lang="ts">
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    ACTIVITY_FORMAT_OPTIONS,
    SEXUAL_ORIENTATIONS,
    SKILL_LEVEL_OPTIONS,
    formatLabel,
    type UserActivity,
    type SkillLevel,
    type ActivityFormat,
    type SexualOrientation,
  } from "$lib/types";
  import { get } from "svelte/store";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import PhotoGallery from "$lib/components/PhotoGallery.svelte";
  import { MapPin, Plus, X, Check, Sun, Moon } from "@lucide/svelte";
  import { activeTheme, THEMES } from "$lib/stores/theme";

  let editing = $state(false);
  let saving = $state(false);

  let displayName = $state($userProfile?.displayName ?? "");
  let bio = $state($userProfile?.bio ?? "");
  let city = $state($userProfile?.city ?? "");
  let sexualOrientation = $state<SexualOrientation>(
    $userProfile?.sexualOrientation ?? "straight",
  );
  let photos = $state<string[]>(
    $userProfile?.photos ??
      ($userProfile?.photoURL ? [$userProfile.photoURL] : []),
  );
  let uid = $derived($authUser?.uid ?? "");

  $effect(() => {
    if ($userProfile) {
      displayName = $userProfile.displayName;
      bio = $userProfile.bio ?? "";
      city = $userProfile.city ?? "";
      sexualOrientation = $userProfile.sexualOrientation ?? "straight";
      photos =
        $userProfile.photos ??
        ($userProfile.photoURL ? [$userProfile.photoURL] : []);
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
        sexualOrientation,
      });
    }
    saving = false;
    editing = false;
  }

  async function logout() {
    await authUser.signOut();
  }

  // Add sport
  let showAddSport = $state(false);
  let newActivityId = $state<string | null>(null);
  let newFormat = $state<ActivityFormat>("all");
  let newLevel = $state<SkillLevel>("Basic");
  let savingSport = $state(false);

  let availableActivities = $derived(
    ACTIVITIES.filter(
      (a) => !$userProfile?.activities?.some((act) => act.id === a.id),
    ),
  );

  function openAddSport() {
    showAddSport = true;
    newActivityId = null;
    newFormat = "all";
    newLevel = "Basic";
  }

  async function addSport() {
    if (!newActivityId) return;
    savingSport = true;
    const uid = get(authUser)?.uid;
    const newActivity: UserActivity = {
      id: newActivityId,
      format: newFormat,
      level: newLevel,
    };
    const activities = [...($userProfile?.activities ?? []), newActivity];
    if (uid) {
      await userProfile.save(uid, { activities });
    }
    savingSport = false;
    showAddSport = false;
  }

  async function removeSport(id: string) {
    const uid = get(authUser)?.uid;
    const activities = ($userProfile?.activities ?? []).filter(
      (act) => act.id !== id,
    );
    if (uid) {
      await userProfile.save(uid, { activities });
    }
  }
</script>

<div class="flex min-h-screen flex-col bg-bg pb-24">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 pb-3 pt-5">
    <h1 class="text-2xl font-black text-text">Profile</h1>
    <button
      onclick={() => (editing = !editing)}
      class="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95"
    >
      {editing ? "Cancel" : "Edit"}
    </button>
  </div>

  <!-- Photos + basic info -->
  {#if editing}
    <div class="flex flex-col items-center gap-3 px-5 pb-6">
      <div class="w-full max-w-xs">
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
  {:else}
    <PhotoGallery {photos} alt={$userProfile?.displayName ?? "Profile photo"} />
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
  {/if}

  <!-- Sexual orientation -->
  <div class="px-5 pb-8">
    {#if editing}
      <SegmentedControl
        options={SEXUAL_ORIENTATIONS}
        value={sexualOrientation}
        ariaLabel="Sexual orientation"
        onchange={(value) => (sexualOrientation = value)}
      />
      <button
        onclick={save}
        disabled={saving}
        class="mt-4 w-full rounded-2xl bg-primary py-4 font-bold text-white active:scale-95 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    {/if}
  </div>

  <!-- Activities -->
  <div class="px-5">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
      My Sports
    </h3>
    {#if ($userProfile?.activities?.length ?? 0) === 0}
      <p class="text-sm text-muted">No activities set</p>
    {:else}
      <div class="flex flex-col gap-3">
        {#each $userProfile?.activities ?? [] as act}
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
        class="mt-3 rounded-2xl border-2 border-dashed border-primary/40 bg-surface p-4"
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
            onclick={addSport}
            disabled={!newActivityId || savingSport}
            class="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
          >
            {savingSport ? "Adding…" : "Add sport"}
          </button>
        </div>
      </div>
    {:else}
      <button
        onclick={openAddSport}
        class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 py-3 text-sm font-bold text-primary active:scale-95"
      >
        <Plus class="size-4" />
        Add sport
      </button>
    {/if}
  </div>

  <!-- Theme -->
  <div class="px-5 pt-8">
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

  <!-- Logout -->
  <div class="mt-auto px-5 pt-8">
    <button
      onclick={logout}
      class="w-full rounded-2xl border-2 border-error/30 py-4 text-base font-semibold text-error active:scale-95"
    >
      Sign out
    </button>
  </div>

  <BottomNav active="profile" />
</div>
