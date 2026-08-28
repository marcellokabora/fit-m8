<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    collection,
    query,
    where,
    documentId,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
  } from "firebase/firestore";
  import { db } from "$lib/firebase/client";
  import { isAdmin } from "$lib/stores/admin";
  import {
    ACTIVITIES,
    GENDER_OPTIONS,
    ORIENTATIONS,
    type Gender,
    type SexualOrientation,
    type UserProfile,
  } from "$lib/types";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import {
    LoaderCircle,
    ImageOff,
    Check,
    ShieldAlert,
    X,
    Heart,
    Dumbbell,
    Rainbow,
    Trash2,
  } from "@lucide/svelte";

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

  let loading = $state(true);
  let profiles = $state<UserProfile[]>([]);
  let drafts = $state<Record<string, ProfileDraft>>({});
  let saving = $state<Record<string, boolean>>({});
  let savedFlash = $state<Record<string, boolean>>({});
  let selectedSport = $state<string | null>(null);
  let genderFilter = $state<Gender | "">("");
  let sortBy = $state<"name" | "age">("name");
  let selectedProfile = $state<UserProfile | null>(null);
  let confirmDelete = $state(false);
  let deleting = $state(false);

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

  function activityLabel(id?: string) {
    const info = ACTIVITIES.find((a) => a.id === id);
    return info ? `${info.emoji} ${info.label}` : (id ?? "—");
  }

  function activityName(id?: string) {
    return ACTIVITIES.find((a) => a.id === id)?.label ?? id ?? "—";
  }

  // Counts by first sport, ordered alphabetically by sport name
  let sportCounts = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const p of profiles) {
      const id = p.activities?.[0]?.id;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) =>
      activityName(a[0]).localeCompare(activityName(b[0])),
    );
  });

  let filteredProfiles = $derived.by(() => {
    let list = selectedSport
      ? profiles.filter((p) => p.activities?.[0]?.id === selectedSport)
      : profiles;
    if (genderFilter) list = list.filter((p) => p.gender === genderFilter);
    return [...list].sort((a, b) =>
      sortBy === "age"
        ? (a.age ?? 0) - (b.age ?? 0)
        : a.displayName.localeCompare(b.displayName),
    );
  });

  async function loadProfiles() {
    loading = true;
    // Fake seed accounts all use the "fake_<name>" doc id convention (see scripts/seed.cjs)
    const snap = await getDocs(
      query(
        collection(db, "users"),
        where(documentId(), ">=", "fake_"),
        where(documentId(), "<", "fake_\uf8ff"),
      ),
    );
    profiles = snap.docs
      .map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    for (const p of profiles) drafts[p.uid] = draftOf(p);
    loading = false;
  }

  $effect(() => {
    if ($isAdmin === undefined) return; // still resolving auth state / the claim check
    if ($isAdmin) loadProfiles();
    else goto("/discover");
  });

  async function saveProfile(uid: string) {
    const d = drafts[uid];
    if (!d) return;
    const url = d.photoURL.trim();
    if (url && !/^https?:\/\//.test(url)) return;
    const name = d.displayName.trim();
    if (!name) return;
    const age = Number(d.age);

    saving = { ...saving, [uid]: true };
    const update: Partial<UserProfile> = {
      photoURL: url,
      photos: url ? [url] : [],
      displayName: name,
      bio: d.bio.trim(),
      age,
      gender: d.gender,
      orientation: d.orientation || null,
      city: d.city.trim(),
      isSingle: d.isSingle,
      isTrainer: d.isTrainer,
    };
    await setDoc(
      doc(db, "users", uid),
      { ...update, updatedAt: serverTimestamp() },
      { merge: true },
    );
    profiles = profiles.map((p) => (p.uid === uid ? { ...p, ...update } : p));
    saving = { ...saving, [uid]: false };
    savedFlash = { ...savedFlash, [uid]: true };
    setTimeout(() => (savedFlash = { ...savedFlash, [uid]: false }), 1500);
    if (selectedProfile?.uid === uid) {
      selectedProfile = null;
    }
  }

  async function deleteProfile(uid: string) {
    deleting = true;
    await deleteDoc(doc(db, "users", uid));
    profiles = profiles.filter((p) => p.uid !== uid);
    delete drafts[uid];
    deleting = false;
    confirmDelete = false;
    selectedProfile = null;
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-12">
  <BackHeader title="Fake profiles" href="/discover" class="bg-bg" />

  {#if $isAdmin === undefined}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if !$isAdmin}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-muted"
    >
      <ShieldAlert class="size-10" />
      <p>You don't have access to this page.</p>
    </div>
  {:else}
    <div class="px-5 pb-4">
      <select
        bind:value={selectedSport}
        class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
      >
        <option value={null}>All sports ({profiles.length})</option>
        {#each sportCounts as [id, count]}
          <option value={id}>
            {count < 10 ? "⚠️ " : ""}{activityLabel(id)} · {count}
          </option>
        {/each}
      </select>
      {#if selectedSport}
        <p class="mt-2 text-xs text-muted">
          Showing {filteredProfiles.length} of {profiles.length} profiles
        </p>
      {/if}

      <div class="mt-3 flex gap-2">
        <select
          bind:value={genderFilter}
          class="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
        >
          <option value="">All genders</option>
          {#each GENDER_OPTIONS as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
        <select
          bind:value={sortBy}
          class="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
        >
          <option value="name">Sort by name</option>
          <option value="age">Sort by age</option>
        </select>
      </div>
    </div>

    {#if loading}
      <div class="flex flex-1 items-center justify-center text-muted">
        <LoaderCircle class="size-10 animate-spin" />
      </div>
    {:else}
      <div class="flex flex-col gap-3 px-5">
        {#each filteredProfiles as p (p.uid)}
          <button
            onclick={() => {
              selectedProfile = p;
              confirmDelete = false;
            }}
            class="flex items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-sm active:scale-[0.99]"
          >
            {#if p.photoURL}
              <img
                src={p.photoURL}
                alt={p.displayName}
                class="size-14 shrink-0 rounded-xl object-cover"
              />
            {:else}
              <div
                class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-bg text-muted"
              >
                <ImageOff class="size-5" />
              </div>
            {/if}
            <div class="min-w-0 flex-1">
              <p class="truncate font-bold text-text">
                {p.displayName}
                <span class="font-normal text-muted"
                  >· {p.age ?? "—"} · {p.gender || "—"} · {activityLabel(
                    p.activities?.[0]?.id,
                  )}</span
                >
              </p>
            </div>
            {#if p.isSingle}
              <Heart class="size-4 shrink-0 text-primary" aria-label="Single" />
            {/if}
            {#if p.isTrainer}
              <Dumbbell
                class="size-4 shrink-0 text-muted"
                aria-label="Trainer"
              />
            {/if}
            {#if p.orientation === "gay"}
              <Rainbow class="size-4 shrink-0 text-muted" aria-label="Gay" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>

{#if selectedProfile}
  {@const p = selectedProfile}
  {@const d = drafts[p.uid]}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full flex-col bg-bg md:max-w-md"
  >
    <div class="flex-1 overflow-y-auto p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-black text-text">{p.displayName}</h2>
        <button
          onclick={() => (selectedProfile = null)}
          aria-label="Close"
          class="flex size-8 items-center justify-center rounded-full bg-bg text-muted active:scale-95"
        >
          <X class="size-4" />
        </button>
      </div>

      {#if d.photoURL}
        <img
          src={d.photoURL}
          alt={p.displayName}
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
          for="photoURL-{p.uid}">Photo URL</label
        >
        <input
          id="photoURL-{p.uid}"
          type="url"
          placeholder="https://images.unsplash.com/..."
          bind:value={d.photoURL}
          class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-muted"
        />

        <label
          class="text-xs font-semibold uppercase text-muted"
          for="name-{p.uid}">Name</label
        >
        <input
          id="name-{p.uid}"
          type="text"
          bind:value={d.displayName}
          class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
        />

        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase text-muted"
              for="age-{p.uid}">Age</label
            >
            <input
              id="age-{p.uid}"
              type="number"
              min="18"
              bind:value={d.age}
              class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase text-muted"
              for="city-{p.uid}">City</label
            >
            <input
              id="city-{p.uid}"
              type="text"
              bind:value={d.city}
              class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label
              class="text-xs font-semibold uppercase text-muted"
              for="gender-{p.uid}">Gender</label
            >
            <select
              id="gender-{p.uid}"
              bind:value={d.gender}
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
              for="orientation-{p.uid}">Orientation</label
            >
            <select
              id="orientation-{p.uid}"
              bind:value={d.orientation}
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
            <input type="checkbox" bind:checked={d.isSingle} />
            Single
          </label>
          <label class="flex items-center gap-1.5 text-sm text-text">
            <input type="checkbox" bind:checked={d.isTrainer} />
            Trainer
          </label>
        </div>

        <label
          class="text-xs font-semibold uppercase text-muted"
          for="bio-{p.uid}">Bio</label
        >
        <textarea
          id="bio-{p.uid}"
          rows="3"
          bind:value={d.bio}
          class="w-full min-w-0 resize-none rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
        ></textarea>
      </div>

      <div class="mb-4">
        <p class="mb-2 text-xs font-semibold uppercase text-muted">
          Activities
        </p>
        <div class="flex flex-col gap-1.5">
          {#each p.activities ?? [] as act}
            <div
              class="flex items-center justify-between rounded-lg bg-bg px-3 py-1.5 text-sm"
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
      {#if confirmDelete}
        <button
          onclick={() => (confirmDelete = false)}
          disabled={deleting}
          class="flex-1 rounded-lg border-2 border-border py-2 text-sm font-bold text-text active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onclick={() => deleteProfile(p.uid)}
          disabled={deleting}
          class="flex flex-1 items-center justify-center gap-1 rounded-lg bg-error px-3 py-2 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {#if deleting}
            <LoaderCircle class="size-4 animate-spin" />
          {:else}
            Confirm delete
          {/if}
        </button>
      {:else}
        <button
          onclick={() => saveProfile(p.uid)}
          disabled={saving[p.uid]}
          class="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {#if saving[p.uid]}
            <LoaderCircle class="size-4 animate-spin" />
          {:else if savedFlash[p.uid]}
            <Check class="size-4" />
          {:else}
            Save
          {/if}
        </button>
        <button
          onclick={() => (confirmDelete = true)}
          aria-label="Delete profile"
          class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error active:scale-95"
        >
          <Trash2 class="size-4" />
        </button>
      {/if}
    </div>
  </div>
{/if}
