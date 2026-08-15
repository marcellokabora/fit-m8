<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    ACTIVITIES,
    type UserActivity,
    type SkillLevel,
    type ActivityFormat,
  } from "$lib/types";
  import { get } from "svelte/store";
  import { Camera, User, Zap, Loader2 } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import { storage } from "$lib/firebase/client";
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { compressImage } from "$lib/image";

  let step = $state(1);
  const TOTAL_STEPS = 4;

  // Step 1 — Basic info
  let displayName = $state("");
  let bio = $state("");
  let age = $state(25);
  let gender = $state("");
  let city = $state("");

  // Step 2 — Activities
  let selectedActivities = $state<string[]>([]);

  // Step 3 — For each selected activity: format + level
  let activitySettings = $state<
    Record<string, { format: ActivityFormat; level: SkillLevel }>
  >({});

  // Step 4 — Photo (optional)
  let photoURL = $state("");
  let uploadingPhoto = $state(false);
  let photoError = $state("");
  let saving = $state(false);
  let error = $state("");

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

    const uid = get(authUser)?.uid;
    if (!uid) return;

    uploadingPhoto = true;
    try {
      const compressed = await compressImage(file);
      const photoRef = ref(storage, `avatars/${uid}`);
      await uploadBytes(photoRef, compressed);
      photoURL = await getDownloadURL(photoRef);
    } catch (err: any) {
      photoError = err.message ?? "Upload failed";
    } finally {
      uploadingPhoto = false;
      input.value = "";
    }
  }

  function toggleActivity(id: string) {
    if (selectedActivities.includes(id)) {
      selectedActivities = selectedActivities.filter((a) => a !== id);
      delete activitySettings[id];
    } else {
      selectedActivities = [...selectedActivities, id];
      activitySettings[id] = { format: "1v1", level: "beginner" };
    }
  }

  function next() {
    if (step < TOTAL_STEPS) step++;
  }

  function back() {
    if (step > 1) step--;
  }

  async function save() {
    error = "";
    saving = true;
    const user = get(authUser);
    if (!user) return;

    const activities: UserActivity[] = selectedActivities.map((id) => ({
      id,
      ...activitySettings[id],
    }));

    try {
      await userProfile.save(user.uid, {
        displayName,
        bio,
        age,
        gender,
        sexualOrientation: "straight",
        city,
        photoURL: photoURL || user.photoURL || "",
        activities,
      });
      goto("/discover");
    } catch (e: any) {
      error = e.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="flex min-h-screen flex-col bg-bg px-6 pb-10 pt-10">
  <!-- Progress -->
  <div class="mb-8 flex items-center gap-2">
    {#each Array(TOTAL_STEPS) as _, i}
      <div
        class="h-1.5 flex-1 rounded-full transition-all {i + 1 <= step
          ? 'bg-primary'
          : 'bg-gray-200'}"
      ></div>
    {/each}
  </div>

  {#if step === 1}
    <h2 class="mb-1 text-2xl font-black text-text">About you</h2>
    <p class="mb-6 text-sm text-muted">Tell us who you are</p>
    <div class="flex flex-col gap-4">
      <input
        type="text"
        bind:value={displayName}
        placeholder="Your name"
        class="rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
      />
      <textarea
        bind:value={bio}
        placeholder="Short bio (optional)"
        rows={3}
        class="rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
      ></textarea>
      <div class="flex gap-3">
        <input
          type="number"
          bind:value={age}
          min={16}
          max={80}
          placeholder="Age"
          class="w-24 rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
        />
        <LocationPicker bind:city />
      </div>
      <div class="flex gap-3">
        {#each ["Male", "Female", "Other"] as g}
          <button
            onclick={() => (gender = g)}
            class="flex-1 rounded-2xl border-2 py-3 text-sm font-semibold transition-colors {gender ===
            g
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-surface text-text'}"
          >
            {g}
          </button>
        {/each}
      </div>
    </div>
  {:else if step === 2}
    <h2 class="mb-1 text-2xl font-black text-text">Your sports</h2>
    <p class="mb-6 text-sm text-muted">Pick the activities you enjoy</p>
    <div class="grid grid-cols-2 gap-3">
      {#each ACTIVITIES as activity}
        <button
          onclick={() => toggleActivity(activity.id)}
          class="flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 {selectedActivities.includes(
            activity.id,
          )
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'}"
        >
          <ActivityIcon id={activity.id} class="size-7 text-primary" />
          <span class="text-sm font-semibold text-text">{activity.label}</span>
        </button>
      {/each}
    </div>
  {:else if step === 3}
    <h2 class="mb-1 text-2xl font-black text-text">Your settings</h2>
    <p class="mb-6 text-sm text-muted">For each sport, pick format and level</p>
    <div class="flex flex-col gap-5">
      {#each selectedActivities as id}
        {@const activity = ACTIVITIES.find((a) => a.id === id)}
        {@const settings = activitySettings[id]}
        <div class="rounded-2xl border-2 border-border bg-surface p-4">
          <p class="mb-3 flex items-center gap-2 font-bold text-text">
            <ActivityIcon {id} class="size-4 text-primary" />
            {activity?.label}
          </p>
          <div class="mb-3">
            <p
              class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Format
            </p>
            <div class="flex gap-2">
              {#each ["1v1", "2v2"] as fmt}
                <button
                  onclick={() =>
                    (activitySettings[id].format = fmt as ActivityFormat)}
                  class="flex-1 rounded-xl border-2 py-2 text-sm font-bold transition-colors {settings.format ===
                  fmt
                    ? 'border-primary bg-primary text-white'
                    : 'border-border text-text'}"
                >
                  {fmt}
                </button>
              {/each}
            </div>
          </div>
          <div>
            <p
              class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Level
            </p>
            <div class="flex gap-2">
              {#each ["beginner", "intermediate", "advanced"] as lvl}
                <button
                  onclick={() =>
                    (activitySettings[id].level = lvl as SkillLevel)}
                  class="flex-1 rounded-xl border-2 py-2 text-xs font-bold capitalize transition-colors {settings.level ===
                  lvl
                    ? 'border-secondary-dark bg-secondary text-white'
                    : 'border-border text-muted'}"
                >
                  {lvl}
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if step === 4}
    <h2 class="mb-1 text-2xl font-black text-text">Profile photo</h2>
    <p class="mb-6 text-sm text-muted">
      Add a photo so others can find you (optional)
    </p>
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
      <div class="relative">
        <div
          class="flex size-56 items-center justify-center rounded-full bg-gray-200 text-6xl"
        >
          {#if photoURL}
            <img
              src={photoURL}
              alt="Profile"
              class="h-full w-full rounded-full object-cover"
            />
          {:else}
            <User class="size-24 text-muted" />
          {/if}
          {#if uploadingPhoto}
            <div
              class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
            >
              <Loader2 class="size-10 animate-spin text-white" />
            </div>
          {/if}
        </div>
        <label
          class="absolute bottom-2 right-2 flex size-12 items-center justify-center rounded-full border-2 border-bg bg-primary text-white shadow-sm active:scale-95"
        >
          <Camera class="size-6" />
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
    </div>
    {#if error}
      <p class="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
        {error}
      </p>
    {/if}
  {/if}

  <!-- Navigation -->
  <div class="mt-auto flex gap-3 pt-8">
    {#if step > 1}
      <button
        onclick={back}
        class="flex-1 rounded-2xl border-2 border-border py-4 text-base font-semibold text-text active:scale-95"
      >
        Back
      </button>
    {/if}
    {#if step < TOTAL_STEPS}
      <button
        onclick={next}
        disabled={step === 1 && (!displayName || !city)}
        class="flex-1 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        Continue
      </button>
    {:else}
      <button
        onclick={save}
        disabled={saving}
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
      >
        {saving ? "Saving…" : "Let's go!"}
        {#if !saving}
          <Zap class="size-5" />
        {/if}
      </button>
    {/if}
  </div>
</div>
