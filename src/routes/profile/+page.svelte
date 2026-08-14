<script lang="ts">
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    type UserActivity,
    type SkillLevel,
    type ActivityFormat,
  } from "$lib/types";
  import { get } from "svelte/store";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { storage } from "$lib/firebase/client";
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { User, MapPin, Plus, X, Camera, Loader2 } from "@lucide/svelte";

  let editing = $state(false);
  let saving = $state(false);

  let displayName = $state($userProfile?.displayName ?? "");
  let bio = $state($userProfile?.bio ?? "");
  let city = $state($userProfile?.city ?? "");

  $effect(() => {
    if ($userProfile) {
      displayName = $userProfile.displayName;
      bio = $userProfile.bio ?? "";
      city = $userProfile.city ?? "";
    }
  });

  async function save() {
    saving = true;
    const uid = get(authUser)?.uid;
    if (uid) {
      await userProfile.save(uid, { displayName, bio, city });
    }
    saving = false;
    editing = false;
  }

  async function logout() {
    await authUser.signOut();
  }

  // Avatar upload
  let uploadingPhoto = $state(false);
  let photoError = $state("");
  const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

  async function handlePhotoChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    photoError = "";
    if (!file.type.startsWith("image/")) {
      photoError = "Please choose an image file";
      input.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      photoError = "Image must be smaller than 5MB";
      input.value = "";
      return;
    }

    const uid = get(authUser)?.uid;
    if (!uid) return;

    uploadingPhoto = true;
    try {
      const photoRef = ref(storage, `avatars/${uid}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);
      await userProfile.save(uid, { photoURL });
    } catch (err: any) {
      photoError = err.message ?? "Upload failed";
    } finally {
      uploadingPhoto = false;
      input.value = "";
    }
  }

  // Add sport
  let showAddSport = $state(false);
  let newActivityId = $state<string | null>(null);
  let newFormat = $state<ActivityFormat>("1v1");
  let newLevel = $state<SkillLevel>("beginner");
  let savingSport = $state(false);

  let availableActivities = $derived(
    ACTIVITIES.filter(
      (a) => !$userProfile?.activities?.some((act) => act.id === a.id),
    ),
  );

  function openAddSport() {
    showAddSport = true;
    newActivityId = null;
    newFormat = "1v1";
    newLevel = "beginner";
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
  <div class="flex items-center justify-between px-5 pb-4 pt-12">
    <h1 class="text-2xl font-black text-text">Profile</h1>
    <button
      onclick={() => (editing = !editing)}
      class="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary active:scale-95"
    >
      {editing ? "Cancel" : "Edit"}
    </button>
  </div>

  <!-- Avatar + basic info -->
  <div class="flex flex-col items-center gap-3 px-5 pb-6">
    <div class="relative">
      <div
        class="flex size-24 items-center justify-center rounded-full bg-primary/20 text-6xl"
      >
        {#if $userProfile?.photoURL}
          <img
            src={$userProfile.photoURL}
            alt={$userProfile.displayName}
            class="h-full w-full rounded-full object-cover"
          />
        {:else}
          <User class="size-12 text-primary" />
        {/if}
        {#if uploadingPhoto}
          <div
            class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
          >
            <Loader2 class="size-6 animate-spin text-white" />
          </div>
        {/if}
      </div>
      <label
        class="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-bg bg-primary text-white shadow-sm active:scale-95"
      >
        <Camera class="size-4" />
        <input
          type="file"
          accept="image/*"
          onchange={handlePhotoChange}
          disabled={uploadingPhoto}
          class="hidden"
        />
      </label>
    </div>
    {#if photoError}
      <p class="text-sm text-error">{photoError}</p>
    {/if}
    {#if editing}
      <input
        type="text"
        bind:value={displayName}
        class="rounded-2xl border-2 border-gray-200 bg-surface px-4 py-3 text-base font-bold text-center text-text w-full outline-none focus:border-primary"
      />
      <textarea
        bind:value={bio}
        rows={2}
        placeholder="Your bio…"
        class="w-full rounded-2xl border-2 border-gray-200 bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
      ></textarea>
      <input
        type="text"
        bind:value={city}
        placeholder="City"
        class="w-full rounded-2xl border-2 border-gray-200 bg-surface px-4 py-3 text-base text-text outline-none focus:border-primary"
      />
      <button
        onclick={save}
        disabled={saving}
        class="w-full rounded-2xl bg-primary py-4 font-bold text-white active:scale-95 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    {:else}
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
        <p class="text-center text-sm text-muted">{$userProfile.bio}</p>
      {/if}
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
              <p class="text-sm text-muted">{act.format} · {act.level}</p>
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
                  : 'border-gray-200 bg-bg'}"
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
              <div class="mb-3 flex gap-2">
                {#each ["1v1", "2v2"] as fmt}
                  <button
                    onclick={() => (newFormat = fmt as ActivityFormat)}
                    class="flex-1 rounded-xl border-2 py-2 text-sm font-bold transition-colors {newFormat ===
                    fmt
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 text-text'}"
                  >
                    {fmt}
                  </button>
                {/each}
              </div>
              <p
                class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Level
              </p>
              <div class="flex gap-2">
                {#each ["beginner", "intermediate", "advanced"] as lvl}
                  <button
                    onclick={() => (newLevel = lvl as SkillLevel)}
                    class="flex-1 rounded-xl border-2 py-2 text-xs font-bold capitalize transition-colors {newLevel ===
                    lvl
                      ? 'border-secondary-dark bg-secondary text-white'
                      : 'border-gray-200 text-muted'}"
                  >
                    {lvl}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        {/if}

        <div class="mt-4 flex gap-3">
          <button
            onclick={() => (showAddSport = false)}
            class="flex-1 rounded-2xl border-2 border-gray-200 py-3 text-sm font-semibold text-text active:scale-95"
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
