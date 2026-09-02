<script lang="ts">
  import { onDestroy } from "svelte";
  import { LoaderCircle, Users, User, Crown, Send } from "@lucide/svelte";
  import { authUser } from "$lib/stores/auth";
  import { db } from "$lib/firebase/client";
  import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    doc,
    getDoc,
  } from "firebase/firestore";
  import type { Match, UserProfile } from "$lib/types";
  import { getMatchActivityIds } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { unreadMatches } from "$lib/stores/unread";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let matches = $state<Match[]>([]);
  let otherUsers = $state<Record<string, UserProfile>>({});
  let loading = $state(true);
  let error = $state<string | null>(null);
  let unsubscribe: (() => void) | null = null;

  async function loadOtherUser(uid: string) {
    if (otherUsers[uid]) return;
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      otherUsers[uid] = { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
    }
  }

  function toMillis(val: unknown): number {
    if (!val) return 0;
    if (typeof val === "object" && val !== null && "toMillis" in val) {
      return (val as { toMillis: () => number }).toMillis();
    }
    if (val instanceof Date) return val.getTime();
    return 0;
  }

  // Most recent activity on a match: the last message time, or when it was made if no messages yet
  function activityMillis(match: Match): number {
    return toMillis(match.lastMessageAt) || toMillis(match.createdAt);
  }

  // Unread conversations first, then newest activity (new messages/matches) first within each group
  let sortedMatches = $derived(
    [...matches].sort((a, b) => {
      const unreadDiff =
        Number($unreadMatches.has(b.id)) - Number($unreadMatches.has(a.id));
      return unreadDiff !== 0
        ? unreadDiff
        : activityMillis(b) - activityMillis(a);
    }),
  );

  // Re-run once auth state resolves ($authUser starts as undefined while loading)
  $effect(() => {
    const uid = $authUser?.uid;
    unsubscribe?.();
    unsubscribe = null;

    if (!uid) {
      matches = [];
      loading = $authUser === undefined;
      return;
    }

    loading = true;
    error = null;
    const q = query(
      collection(db, "matches"),
      where("userIds", "array-contains", uid),
      orderBy("createdAt", "desc"),
    );

    unsubscribe = onSnapshot(
      q,
      (snap) => {
        matches = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Match, "id">),
        }));
        loading = false;
        for (const match of matches) {
          const otherUid = match.userIds.find((id) => id !== uid);
          if (otherUid) loadOtherUser(otherUid);
        }
      },
      (err) => {
        // Without this the spinner would spin forever on a rules/index failure
        console.error("Failed to load matches:", err);
        error = err.message;
        loading = false;
      },
    );
  });

  onDestroy(() => unsubscribe?.());
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-24">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-bg px-5 pb-3 pt-5">
    <h1 class="text-2xl font-black text-text">{t.t("nav.matches")}</h1>
    <p class="text-sm text-muted">{t.t("matches.subtitle")}</p>
  </div>

  {#if loading}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if error}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center"
    >
      <p class="text-lg font-bold text-text">{t.t("matches.loadError")}</p>
      <p class="text-sm text-muted">{error}</p>
    </div>
  {:else if matches.length === 0}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
    >
      <Users class="size-16 text-muted" />
      <p class="text-lg font-bold text-text">{t.t("matches.emptyTitle")}</p>
      <p class="text-sm text-muted">
        {t.t("matches.emptyHint")}
      </p>
      <a
        href="/discover"
        class="rounded-2xl bg-primary px-6 py-3 font-bold text-white active:scale-95"
      >
        {t.t("matches.goDiscover")}
      </a>
    </div>
  {:else}
    <div class="flex flex-col gap-3 px-5">
      {#each sortedMatches as match}
        {@const matchActivityIds = getMatchActivityIds(match)}
        {@const otherUid = match.userIds.find((id) => id !== $authUser?.uid)}
        {@const other = otherUid ? otherUsers[otherUid] : undefined}
        {@const unread = $unreadMatches.has(match.id)}
        <a
          href="/chat/{match.id}"
          class="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div
            class="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
          >
            {#if other?.photoURL}
              <img
                src={other.photoURL}
                alt={other.displayName}
                class="h-full w-full object-cover"
              />
            {:else}
              <User class="size-6" />
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <p class="flex items-center gap-1 font-bold text-text truncate">
              {other?.displayName ?? t.t("matches.fallback")}
              {#if other?.isPremium}
                <Crown
                  class="size-3.5 shrink-0 text-primary"
                  aria-label={t.t("profile.premiumMember")}
                />
              {/if}
            </p>
            <p class="mt-1 flex items-center gap-1 text-sm text-muted min-w-0">
              {#if matchActivityIds[0]}
                <ActivityIcon
                  id={matchActivityIds[0]}
                  class="size-3.5 shrink-0"
                />
              {/if}
              <span class="truncate"
                >{matchActivityIds.map((id) => t.activity(id)).join(", ")}</span
              >
            </p>
            {#if match.isDirectMessage}
              <span
                class="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
              >
                <Send class="size-3" />
                {t.t("matches.directMessage")}
              </span>
            {/if}
          </div>
          <div class="flex flex-col items-end gap-1">
            {#if unread}
              <span
                class="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white"
                >{match.lastMessageAt
                  ? t.t("common.chat")
                  : t.t("common.new")}</span
              >
            {:else}
              <span
                class="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white"
                >{t.t("common.chat")}</span
              >
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}

  <BottomNav active="matches" />
</div>
