<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { LoaderCircle, Users } from "@lucide/svelte";
  import { authUser } from "$lib/stores/auth";
  import { db } from "$lib/firebase/client";
  import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
  } from "firebase/firestore";
  import type { Match } from "$lib/types";
  import { ACTIVITIES } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { get } from "svelte/store";

  let matches = $state<Match[]>([]);
  let loading = $state(true);
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    const uid = get(authUser)?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "matches"),
      where("userIds", "array-contains", uid),
      orderBy("createdAt", "desc"),
    );

    unsubscribe = onSnapshot(q, (snap) => {
      matches = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Match, "id">),
      }));
      loading = false;
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

<div class="flex min-h-screen flex-col bg-bg pb-24">
  <div class="px-5 pb-4 pt-12">
    <h1 class="text-2xl font-black text-text">Matches</h1>
    <p class="text-sm text-muted">People you matched with</p>
  </div>

  {#if loading}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if matches.length === 0}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
    >
      <Users class="size-16 text-muted" />
      <p class="text-lg font-bold text-text">No matches yet</p>
      <p class="text-sm text-muted">
        Keep swiping to find your sports partner!
      </p>
      <a
        href="/discover"
        class="rounded-2xl bg-primary px-6 py-3 font-bold text-white active:scale-95"
      >
        Go to Discover
      </a>
    </div>
  {:else}
    <div class="flex flex-col gap-3 px-5">
      {#each matches as match}
        {@const activity = ACTIVITIES.find((a) => a.id === match.activity)}
        <a
          href="/chat/{match.id}"
          class="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div
            class="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <ActivityIcon id={match.activity} class="size-6" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-text truncate">
              {activity?.label ?? match.activity}
            </p>
            <p class="text-sm text-muted">{match.format} · {match.status}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span
              class="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white"
              >Chat</span
            >
          </div>
        </a>
      {/each}
    </div>
  {/if}

  <BottomNav active="matches" />
</div>
