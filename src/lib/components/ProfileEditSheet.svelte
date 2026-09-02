<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { doc, setDoc, serverTimestamp } from "firebase/firestore";
  import { db } from "$lib/firebase/client";
  import {
    ACTIVITIES,
    GENDER_OPTIONS,
    ORIENTATIONS,
    type Gender,
    type SexualOrientation,
    type UserProfile,
  } from "$lib/types";
  import { LoaderCircle, ImageOff, Check, X } from "@lucide/svelte";

  let {
    profile,
    onClose,
    onSaved,
  }: {
    profile: UserProfile;
    onClose: () => void;
    onSaved: (updated: UserProfile) => void;
  } = $props();

  interface ProfileDraft {
    photoURL: string;
    displayName: string;
    bio: string;
    age: string;
    gender: Gender | "";
    orientation: SexualOrientation | "";
    city: string;
    isSingle: boolean;
    isTrainer: boolean;
  }

  function draftOf(p: UserProfile): ProfileDraft {
    return {
      photoURL: p.photoURL ?? "",
      displayName: p.displayName ?? "",
      bio: p.bio ?? "",
      age: p.age ? String(p.age) : "",
      gender: p.gender ?? "",
      orientation: p.orientation ?? "",
      city: p.city ?? "",
      isSingle: !!p.isSingle,
      isTrainer: !!p.isTrainer,
    };
  }

  // one-time snapshot at mount; component is remounted via {#if} each time it opens
  // svelte-ignore state_referenced_locally
  let draft = $state(draftOf(profile));
  let saving = $state(false);
  let saved = $state(false);

  function activityLabel(id?: string) {
    const info = ACTIVITIES.find((a) => a.id === id);
    return info ? `${info.emoji} ${info.label}` : (id ?? "—");
  }

  async function save() {
    const url = draft.photoURL.trim();
    if (url && !/^https?:\/\//.test(url)) return;
    const name = draft.displayName.trim();
    if (!name) return;
    const age = Number(draft.age);

    saving = true;
    const update: Partial<UserProfile> = {
      photoURL: url,
      photos: url ? [url] : [],
      displayName: name,
      bio: draft.bio.trim(),
      age,
      gender: draft.gender,
      orientation: draft.orientation || null,
      city: draft.city.trim(),
      isSingle: draft.isSingle,
      isTrainer: draft.isTrainer,
    };
    await setDoc(
      doc(db, "users", profile.uid),
      { ...update, updatedAt: serverTimestamp() },
      { merge: true },
    );
    saving = false;
    saved = true;
    onSaved({ ...profile, ...update });
    setTimeout(() => (saved = false), 1500);
  }
</script>

<div
  class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
  transition:fade={{ duration: 150 }}
  role="button"
  tabindex="0"
  aria-label="Close"
  onclick={onClose}
  onkeydown={(e) => (e.key === "Enter" || e.key === " ") && onClose()}
>
  <div
    class="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-bg"
    transition:fly={{ y: 400, duration: 250 }}
    role="dialog"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <div class="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border"></div>
    <div class="flex-1 overflow-y-auto p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-black text-text">Edit profile</h2>
        <button
          onclick={onClose}
          aria-label="Close"
          class="flex size-8 items-center justify-center rounded-full bg-bg text-muted active:scale-95"
        >
          <X class="size-4" />
        </button>
      </div>

      {#if draft.photoURL}
        <img
          src={draft.photoURL}
          alt={profile.displayName}
          class="mb-4 aspect-square w-full rounded-2xl object-cover"
        />
      {:else}
        <div
          class="mb-4 flex aspect-square w-full items-center justify-center rounded-2xl bg-bg text-muted"
        >
          <ImageOff class="size-10" />
        </div>
      {/if}

      <div class="mb-4 flex flex-col gap-2">
        <label
          class="text-xs font-semibold uppercase text-muted"
          for="photoURL-{profile.uid}">Photo URL</label
        >
        <input
          id="photoURL-{profile.uid}"
          type="url"
          placeholder="https://images.unsplash.com/..."
          bind:value={draft.photoURL}
          class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-muted"
        />

        <label
          class="text-xs font-semibold uppercase text-muted"
          for="name-{profile.uid}">Name</label
        >
        <input
          id="name-{profile.uid}"
          type="text"
          bind:value={draft.displayName}
          class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
        />

        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase text-muted"
              for="age-{profile.uid}">Age</label
            >
            <input
              id="age-{profile.uid}"
              type="number"
              min="18"
              bind:value={draft.age}
              class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase text-muted"
              for="city-{profile.uid}">City</label
            >
            <input
              id="city-{profile.uid}"
              type="text"
              bind:value={draft.city}
              class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase text-muted"
              for="gender-{profile.uid}">Gender</label
            >
            <select
              id="gender-{profile.uid}"
              bind:value={draft.gender}
              class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
            >
              <option value="">—</option>
              {#each GENDER_OPTIONS as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase text-muted"
              for="orientation-{profile.uid}">Orientation</label
            >
            <select
              id="orientation-{profile.uid}"
              bind:value={draft.orientation}
              class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
            >
              <option value="">—</option>
              {#each ORIENTATIONS as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <label class="flex items-center gap-1.5 text-sm text-text">
            <input type="checkbox" bind:checked={draft.isSingle} />
            Single
          </label>
          <label class="flex items-center gap-1.5 text-sm text-text">
            <input type="checkbox" bind:checked={draft.isTrainer} />
            Trainer
          </label>
        </div>

        <label
          class="text-xs font-semibold uppercase text-muted"
          for="bio-{profile.uid}">Bio</label
        >
        <textarea
          id="bio-{profile.uid}"
          rows="3"
          bind:value={draft.bio}
          class="w-full min-w-0 resize-none rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
        ></textarea>
      </div>

      <div class="mb-4">
        <p class="mb-2 text-xs font-semibold uppercase text-muted">
          Activities
        </p>
        <div class="flex flex-col gap-1.5">
          {#each profile.activities ?? [] as act}
            <div
              class="flex items-center justify-between rounded-lg bg-bg py-1.5 text-sm"
            >
              <span class="text-text">{activityLabel(act.id)}</span>
              <span class="text-muted">{act.format} · {act.level}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div
      class="flex gap-2 border-t border-border bg-bg px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <button
        onclick={save}
        disabled={saving}
        class="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
      >
        {#if saving}
          <LoaderCircle class="size-4 animate-spin" />
        {:else if saved}
          <Check class="size-4" />
        {:else}
          Save
        {/if}
      </button>
    </div>
  </div>
</div>
