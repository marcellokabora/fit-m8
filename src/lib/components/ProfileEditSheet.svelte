<script lang="ts">
  import { fade, fly, slide } from "svelte/transition";
  import { doc, setDoc, serverTimestamp } from "firebase/firestore";
  import { db } from "$lib/firebase/client";
  import {
    ACTIVITIES,
    ACTIVITY_FORMAT_OPTIONS,
    GENDER_OPTIONS,
    ORIENTATIONS,
    SKILL_LEVEL_OPTIONS,
    type ActivityFormat,
    type Gender,
    type SexualOrientation,
    type SkillLevel,
    type UserActivity,
    type UserProfile,
  } from "$lib/types";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";
  import {
    Check,
    ChevronDown,
    ImageOff,
    LoaderCircle,
    Trash2,
    X,
  } from "@lucide/svelte";

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
    photo: string;
    displayName: string;
    bio: string;
    age: string;
    gender: Gender | "";
    orientation: SexualOrientation | "";
    city: string;
    isSingle: boolean;
    isTrainer: boolean;
    isPremium: boolean;
    activities: UserActivity[];
  }

  function draftOf(p: UserProfile): ProfileDraft {
    return {
      photo: p.photos?.[0] ?? "",
      displayName: p.displayName ?? "",
      bio: p.bio ?? "",
      age: p.age ? String(p.age) : "",
      gender: p.gender ?? "",
      orientation: p.orientation ?? "",
      city: p.city ?? "",
      isSingle: !!p.isSingle,
      isTrainer: !!p.isTrainer,
      isPremium: !!p.isPremium,
      activities: (p.activities ?? []).map((activity) => ({ ...activity })),
    };
  }

  // one-time snapshot at mount; component is remounted via {#if} each time it opens
  // svelte-ignore state_referenced_locally
  let draft = $state(draftOf(profile));
  let saving = $state(false);
  let saved = $state(false);
  let expandedActivityIndex = $state<number | null>(null);

  function activityLabel(id?: string) {
    const info = ACTIVITIES.find((a) => a.id === id);
    return info ? `${info.emoji} ${info.label}` : (id ?? "—");
  }

  function updateActivity(
    index: number,
    changes: Partial<Pick<UserActivity, "id" | "format" | "level">>,
  ) {
    draft.activities[index] = { ...draft.activities[index], ...changes };
  }

  function changeActivityType(index: number, id: string) {
    if (
      draft.activities.some((activity, i) => i !== index && activity.id === id)
    )
      return;
    updateActivity(index, { id });
  }

  function removeActivity(index: number) {
    draft.activities.splice(index, 1);
    expandedActivityIndex = null;
  }

  async function save() {
    const url = draft.photo.trim();
    if (url && !/^https?:\/\//.test(url)) return;
    const name = draft.displayName.trim();
    if (!name) return;
    const age = Number(draft.age);

    saving = true;
    const update: Partial<UserProfile> = {
      photos: url ? [url] : [],
      displayName: name,
      bio: draft.bio.trim(),
      age,
      gender: draft.gender,
      orientation: draft.orientation || null,
      city: draft.city.trim(),
      isSingle: draft.isSingle,
      isTrainer: draft.isTrainer,
      isPremium: draft.isPremium,
      activities: draft.activities,
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

      {#if draft.photo}
        <img
          src={draft.photo}
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
          for="photo-{profile.uid}">Photo URL</label
        >
        <input
          id="photo-{profile.uid}"
          type="url"
          placeholder="https://images.unsplash.com/..."
          bind:value={draft.photo}
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
          <label class="flex items-center gap-1.5 text-sm text-text">
            <input type="checkbox" bind:checked={draft.isPremium} />
            Premium
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
        {#if draft.activities.length === 0}
          <p class="text-sm text-muted">No activities</p>
        {:else}
          <div class="flex flex-col gap-2">
            {#each draft.activities as act, index (act.id)}
              {@const expanded = expandedActivityIndex === index}
              <div class="rounded-lg border border-border bg-bg">
                <div
                  role="button"
                  tabindex="0"
                  onclick={() =>
                    (expandedActivityIndex = expanded ? null : index)}
                  onkeydown={(event) =>
                    (event.key === "Enter" || event.key === " ") &&
                    (expandedActivityIndex = expanded ? null : index)}
                  class="flex items-center gap-2 px-3 py-2 text-sm"
                >
                  <span class="min-w-0 flex-1 truncate text-text">
                    {activityLabel(act.id)}
                  </span>
                  <span class="shrink-0 text-xs text-muted">
                    {act.format} · {act.level}
                  </span>
                  {#if expanded}
                    <button
                      type="button"
                      onclick={(event) => {
                        event.stopPropagation();
                        removeActivity(index);
                      }}
                      aria-label={`Remove ${activityLabel(act.id)}`}
                      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-error/10 text-error active:scale-95"
                    >
                      <Trash2 class="size-4" />
                    </button>
                  {:else}
                    <ChevronDown class="size-4 shrink-0 text-muted" />
                  {/if}
                </div>

                {#if expanded}
                  <div
                    class="border-t border-border px-3 pt-3 pb-3"
                    transition:slide={{ duration: 200 }}
                  >
                    <label
                      class="mb-1 block text-xs font-semibold uppercase text-muted"
                      for="activity-{profile.uid}-{index}">Sport</label
                    >
                    <select
                      id="activity-{profile.uid}-{index}"
                      value={act.id}
                      onchange={(event) =>
                        changeActivityType(index, event.currentTarget.value)}
                      class="mb-3 w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
                    >
                      {#each ACTIVITIES as activity}
                        <option
                          value={activity.id}
                          disabled={draft.activities.some(
                            (item, itemIndex) =>
                              itemIndex !== index && item.id === activity.id,
                          )}>{activity.emoji} {activity.label}</option
                        >
                      {/each}
                    </select>

                    <p class="mb-1 text-xs font-semibold uppercase text-muted">
                      Format
                    </p>
                    <div class="mb-3">
                      <SegmentedControl
                        options={ACTIVITY_FORMAT_OPTIONS}
                        value={act.format}
                        ariaLabel="Format"
                        onchange={(format: ActivityFormat) =>
                          updateActivity(index, { format })}
                      />
                    </div>

                    <p class="mb-1 text-xs font-semibold uppercase text-muted">
                      Level
                    </p>
                    <SegmentedControl
                      options={SKILL_LEVEL_OPTIONS}
                      value={act.level}
                      ariaLabel="Level"
                      onchange={(level: SkillLevel) =>
                        updateActivity(index, { level })}
                    />
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
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
