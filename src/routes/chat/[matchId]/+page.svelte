<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { page } from "$app/state";
  import { authUser } from "$lib/stores/auth";
  import { db } from "$lib/firebase/client";
  import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    serverTimestamp,
    doc,
    getDoc,
  } from "firebase/firestore";
  import type { Message, Match, UserProfile } from "$lib/types";
  import { ACTIVITIES } from "$lib/types";
  import { get } from "svelte/store";
  import { ArrowLeft, LoaderCircle, Sparkles, Send } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";

  let matchId = $derived(page.params.matchId as string);
  let messages = $state<Message[]>([]);
  let text = $state("");
  let loading = $state(true);
  let sending = $state(false);
  let messagesEndEl = $state<HTMLDivElement | null>(null);
  let unsubscribe: (() => void) | null = null;
  let otherUser = $state<UserProfile | null>(null);
  let match = $state<Match | null>(null);
  let activity = $derived(ACTIVITIES.find((a) => a.id === match?.activity));

  async function loadOtherUser() {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    const matchSnap = await getDoc(doc(db, "matches", matchId));
    if (!matchSnap.exists()) return;
    const matchData = matchSnap.data() as Omit<Match, "id">;
    match = { id: matchSnap.id, ...matchData };
    const otherUid = matchData.userIds.find((id) => id !== uid);
    if (!otherUid) return;
    const userSnap = await getDoc(doc(db, "users", otherUid));
    if (userSnap.exists()) {
      otherUser = {
        uid: otherUid,
        ...(userSnap.data() as Omit<UserProfile, "uid">),
      };
    }
  }

  async function markAsRead() {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    await updateDoc(doc(db, "matches", matchId), {
      [`readBy.${uid}`]: serverTimestamp(),
    });
  }

  onMount(() => {
    loadOtherUser();
    const q = query(
      collection(db, "chats", matchId, "messages"),
      orderBy("timestamp", "asc"),
    );
    unsubscribe = onSnapshot(q, async (snap) => {
      messages = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      loading = false;
      await tick();
      messagesEndEl?.scrollIntoView({ behavior: "smooth" });
      // chat is open, so any message that just arrived counts as read
      markAsRead();
    });
  });

  onDestroy(() => unsubscribe?.());

  async function send() {
    const uid = get(authUser)?.uid;
    if (!text.trim() || !uid || sending) return;
    sending = true;
    const msg = text.trim();
    text = "";
    await addDoc(collection(db, "chats", matchId, "messages"), {
      senderId: uid,
      text: msg,
      timestamp: serverTimestamp(),
    });
    await updateDoc(doc(db, "matches", matchId), {
      lastMessage: msg,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: uid,
      [`readBy.${uid}`]: serverTimestamp(),
    });
    sending = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  let currentUid = $derived($authUser?.uid);
</script>

<div class="flex h-screen flex-col bg-bg">
  <!-- Header -->
  <div
    class="flex items-center gap-3 border-b border-border bg-surface px-4 pb-3 pt-12"
  >
    <a
      href="/matches"
      class="flex size-9 items-center justify-center rounded-full hover:bg-gray-100"
    >
      <ArrowLeft class="size-5 text-text" />
    </a>
    {#if otherUser}
      <a href="/profile/{otherUser.uid}" class="shrink-0">
        <img
          src={otherUser.photoURL}
          alt={otherUser.displayName}
          class="size-10 rounded-full object-cover"
        />
      </a>
    {/if}
    <div class="flex-1">
      <p class="font-bold text-text">
        {otherUser?.displayName ?? "Match Chat"}
      </p>
      {#if match}
        <p class="flex items-center gap-1 text-xs text-muted">
          <ActivityIcon id={match.activity} class="size-3" />
          {activity?.label ?? match.activity} · {match.format}
        </p>
      {:else}
        <p class="text-xs text-muted">{matchId}</p>
      {/if}
    </div>
  </div>

  <!-- Messages -->
  <div class="flex-1 overflow-y-auto px-4 py-4">
    {#if loading}
      <div class="flex h-full items-center justify-center text-muted">
        <LoaderCircle class="size-8 animate-spin" />
      </div>
    {:else if messages.length === 0}
      <div
        class="flex h-full flex-col items-center justify-center gap-3 text-center"
      >
        <Sparkles class="size-12 text-primary" />
        <p class="font-bold text-text">Say hi to your match!</p>
        <p class="text-sm text-muted">Plan your activity session together</p>
      </div>
    {:else}
      {#each messages as msg}
        <div
          class="mb-3 flex {msg.senderId === currentUid
            ? 'justify-end'
            : 'justify-start'}"
        >
          <div
            class="max-w-[75%] rounded-2xl px-4 py-3 text-sm {msg.senderId ===
            currentUid
              ? 'rounded-br-sm bg-primary text-white'
              : 'rounded-bl-sm bg-surface text-text shadow-sm'}"
          >
            {msg.text}
          </div>
        </div>
      {/each}
      <div bind:this={messagesEndEl}></div>
    {/if}
  </div>

  <!-- Input -->
  <div class="border-t border-border bg-surface px-4 py-3 pb-safe">
    <div class="flex items-end gap-3">
      <textarea
        bind:value={text}
        onkeydown={handleKeydown}
        placeholder="Type a message…"
        rows={1}
        class="flex-1 resize-none rounded-2xl border-2 border-border bg-bg px-4 py-3 text-sm text-text outline-none focus:border-primary"
      ></textarea>
      <button
        onclick={send}
        disabled={!text.trim() || sending}
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl text-white shadow-md active:scale-90 disabled:opacity-40 transition-transform"
      >
        <Send class="size-5" />
      </button>
    </div>
  </div>
</div>
