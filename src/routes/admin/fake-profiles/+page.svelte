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
    serverTimestamp,
  } from "firebase/firestore";
  import { db } from "$lib/firebase/client";
  import { isAdmin } from "$lib/stores/admin";
  import { ACTIVITIES, type UserProfile } from "$lib/types";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import {
    LoaderCircle,
    ImageOff,
    Check,
    ShieldAlert,
    X,
  } from "@lucide/svelte";

  let loading = $state(true);
  let profiles = $state<UserProfile[]>([]);
  let drafts = $state<Record<string, string>>({});
  let saving = $state<Record<string, boolean>>({});
  let savedFlash = $state<Record<string, boolean>>({});
  let selectedSport = $state<string | null>(null);
  let selectedProfile = $state<UserProfile | null>(null);

  function activityLabel(id?: string) {
    const info = ACTIVITIES.find((a) => a.id === id);
    return info ? `${info.emoji} ${info.label}` : (id ?? "—");
  }

  // Counts by first sport, so gaps toward "10 people per sport" are visible at a glance
  let sportCounts = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const p of profiles) {
      const id = p.activities?.[0]?.id;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[1] - b[1]);
  });

  let filteredProfiles = $derived(
    selectedSport
      ? profiles.filter((p) => p.activities?.[0]?.id === selectedSport)
      : profiles,
  );

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
    for (const p of profiles) drafts[p.uid] = p.photoURL ?? "";
    loading = false;
  }

  $effect(() => {
    if ($isAdmin === undefined) return; // still resolving auth state / the claim check
    if ($isAdmin) loadProfiles();
    else goto("/discover");
  });

  async function savePhoto(uid: string) {
    const url = drafts[uid]?.trim();
    if (!url || !/^https?:\/\//.test(url)) return;
    saving = { ...saving, [uid]: true };
    await setDoc(
      doc(db, "users", uid),
      { photoURL: url, photos: [url], updatedAt: serverTimestamp() },
      { merge: true },
    );
    profiles = profiles.map((p) =>
      p.uid === uid ? { ...p, photoURL: url, photos: [url] } : p,
    );
    if (selectedProfile?.uid === uid) {
      selectedProfile = { ...selectedProfile, photoURL: url, photos: [url] };
    }
    saving = { ...saving, [uid]: false };
    savedFlash = { ...savedFlash, [uid]: true };
    setTimeout(() => (savedFlash = { ...savedFlash, [uid]: false }), 1500);
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
      <h2 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
        Coverage by first sport
      </h2>
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
    </div>

    {#if loading}
      <div class="flex flex-1 items-center justify-center text-muted">
        <LoaderCircle class="size-10 animate-spin" />
      </div>
    {:else}
      <div class="flex flex-col gap-3 px-5">
        {#each filteredProfiles as p (p.uid)}
          <button
            onclick={() => (selectedProfile = p)}
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
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>

{#if selectedProfile}
  {@const p = selectedProfile}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full flex-col overflow-y-auto bg-bg p-5 pb-8 md:max-w-md"
  >
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

    {#if p.photoURL}
      <img
        src={p.photoURL}
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

    <div class="mb-4 flex items-center gap-2">
      <input
        type="url"
        placeholder="https://images.unsplash.com/..."
        bind:value={drafts[p.uid]}
        class="w-full min-w-0 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text placeholder:text-muted"
      />
      <button
        onclick={() => savePhoto(p.uid)}
        disabled={saving[p.uid]}
        class="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
      >
        {#if saving[p.uid]}
          <LoaderCircle class="size-4 animate-spin" />
        {:else if savedFlash[p.uid]}
          <Check class="size-4" />
        {:else}
          Save
        {/if}
      </button>
    </div>

    <dl class="mb-4 grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt class="text-xs font-semibold uppercase text-muted">Gender</dt>
        <dd class="text-text">{p.gender || "—"}</dd>
      </div>
      <div>
        <dt class="text-xs font-semibold uppercase text-muted">Age</dt>
        <dd class="text-text">{p.age ?? "—"}</dd>
      </div>
      <div>
        <dt class="text-xs font-semibold uppercase text-muted">City</dt>
        <dd class="text-text">{p.city || "—"}</dd>
      </div>
      <div>
        <dt class="text-xs font-semibold uppercase text-muted">Orientation</dt>
        <dd class="text-text">{p.orientation || "—"}</dd>
      </div>
      <div>
        <dt class="text-xs font-semibold uppercase text-muted">Single</dt>
        <dd class="text-text">{p.isSingle ? "Yes" : "No"}</dd>
      </div>
      <div>
        <dt class="text-xs font-semibold uppercase text-muted">Trainer</dt>
        <dd class="text-text">{p.isTrainer ? "Yes" : "No"}</dd>
      </div>
    </dl>

    {#if p.bio}
      <div class="mb-4">
        <p class="mb-1 text-xs font-semibold uppercase text-muted">Bio</p>
        <p class="text-sm text-text">{p.bio}</p>
      </div>
    {/if}

    <div>
      <p class="mb-2 text-xs font-semibold uppercase text-muted">Activities</p>
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
{/if}
