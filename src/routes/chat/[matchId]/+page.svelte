<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { goto } from "$app/navigation";
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
  import type { Message, Match, ReportReason, UserProfile } from "$lib/types";
  import { ACTIVITIES } from "$lib/types";
  import { get } from "svelte/store";
  import { unmatch } from "$lib/firebase/swipe";
  import { submitReport } from "$lib/firebase/reports";
  import {
    LoaderCircle,
    Sparkles,
    Send,
    MoreVertical,
    UserMinus,
    Flag,
  } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import {
    activeLanguage,
    createTranslator,
    type TranslationKey,
  } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let matchId = $derived(page.params.matchId as string);
  let messages = $state<Message[]>([]);
  let text = $state("");
  let loading = $state(true);
  let sending = $state(false);
  let messagesEndEl = $state<HTMLDivElement | null>(null);
  let unsubscribe: (() => void) | null = null;
  let unsubscribeAuth: (() => void) | null = null;
  let otherUser = $state<UserProfile | null>(null);
  let match = $state<Match | null>(null);
  let activity = $derived(ACTIVITIES.find((a) => a.id === match?.activity));

  let showMenu = $state(false);
  let confirmUnmatch = $state(false);
  let unmatching = $state(false);
  let showReportModal = $state(false);
  let reportReason = $state<ReportReason>("harassment");
  let reportDetails = $state("");
  let reporting = $state(false);
  let reportSubmitted = $state(false);
  const REPORT_REASONS: ReportReason[] = [
    "harassment",
    "inappropriate",
    "fake_profile",
    "spam",
    "other",
  ];
  const REPORT_REASON_KEYS: Record<ReportReason, TranslationKey> = {
    harassment: "chat.reportReasonHarassment",
    inappropriate: "chat.reportReasonInappropriate",
    fake_profile: "chat.reportReasonFakeProfile",
    spam: "chat.reportReasonSpam",
    other: "chat.reportReasonOther",
  };

  async function handleUnmatch() {
    unmatching = true;
    await unmatch(matchId);
    unmatching = false;
    confirmUnmatch = false;
    goto("/matches");
  }

  function openReportModal() {
    showMenu = false;
    reportReason = "harassment";
    reportDetails = "";
    reportSubmitted = false;
    showReportModal = true;
  }

  async function handleReport() {
    const uid = get(authUser)?.uid;
    if (!uid || !otherUser) return;
    reporting = true;
    await submitReport(
      uid,
      otherUser.uid,
      matchId,
      reportReason,
      reportDetails,
    );
    reporting = false;
    reportSubmitted = true;
  }

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
    // On a fresh page refresh, authUser is still resolving the persisted session at
    // this point, so wait for a real user before fetching the match/other user data.
    unsubscribeAuth = authUser.subscribe((user) => {
      if (user) loadOtherUser();
    });
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

  onDestroy(() => {
    unsubscribe?.();
    unsubscribeAuth?.();
  });

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

<div class="flex h-dvh flex-col bg-bg">
  <!-- Header -->
  <BackHeader href="/matches" class="border-b border-border bg-surface">
    {#snippet children()}
      {#if otherUser}
        <a
          href="/profile/{otherUser.uid}"
          class="flex flex-1 items-center gap-3"
        >
          <img
            src={otherUser.photoURL}
            alt={otherUser.displayName}
            class="size-10 shrink-0 rounded-full object-cover"
          />
          <div class="flex-1">
            <p class="font-bold text-text">{otherUser.displayName}</p>
            {#if match}
              <p class="flex items-center gap-1 text-xs text-muted">
                <ActivityIcon id={match.activity} class="size-3" />
                {t.activity(match.activity)} · {t.format(match.format)}
              </p>
            {:else}
              <p class="text-xs text-muted">{matchId}</p>
            {/if}
          </div>
        </a>
      {:else}
        <div class="flex-1">
          <p class="font-bold text-text">{t.t("chat.fallbackTitle")}</p>
          {#if match}
            <p class="flex items-center gap-1 text-xs text-muted">
              <ActivityIcon id={match.activity} class="size-3" />
              {t.activity(match.activity)} · {t.format(match.format)}
            </p>
          {/if}
        </div>
      {/if}
    {/snippet}
    {#snippet actions()}
      <div class="relative">
        <button
          onclick={() => (showMenu = !showMenu)}
          aria-label={t.t("chat.menu")}
          class="flex size-9 items-center justify-center rounded-full hover:bg-text/10"
        >
          <MoreVertical class="size-5 text-text" />
        </button>
        {#if showMenu}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <div
            class="fixed inset-0 z-10"
            onclick={() => (showMenu = false)}
          ></div>
          <div
            class="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
          >
            <button
              onclick={() => {
                showMenu = false;
                confirmUnmatch = true;
              }}
              class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-text active:bg-text/10"
            >
              <UserMinus class="size-4" />
              {t.t("chat.unmatch")}
            </button>
            <button
              onclick={openReportModal}
              class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-error active:bg-text/10"
            >
              <Flag class="size-4" />
              {t.t("chat.report")}
            </button>
          </div>
        {/if}
      </div>
    {/snippet}
  </BackHeader>

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
        <p class="font-bold text-text">{t.t("chat.emptyTitle")}</p>
        <p class="text-sm text-muted">{t.t("chat.emptyHint")}</p>
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
        placeholder={t.t("chat.placeholder")}
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

{#if confirmUnmatch}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
    >
      <UserMinus class="size-12 text-error" />
      <h2 class="text-lg font-black text-text">{t.t("chat.unmatchTitle")}</h2>
      <p class="text-sm text-muted">{t.t("chat.unmatchHint")}</p>
      <div class="flex w-full gap-3">
        <button
          onclick={() => (confirmUnmatch = false)}
          disabled={unmatching}
          class="flex-1 rounded-2xl border-2 border-border py-3 text-xs font-semibold text-text active:scale-95 disabled:opacity-50"
        >
          {t.t("common.cancel")}
        </button>
        <button
          onclick={handleUnmatch}
          disabled={unmatching}
          class="flex-1 rounded-2xl bg-error py-3 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {unmatching ? t.t("chat.unmatching") : t.t("chat.unmatch")}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showReportModal}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex w-full flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
    >
      <Flag class="size-12 text-error" />
      <h2 class="text-lg font-black text-text">{t.t("chat.reportTitle")}</h2>
      {#if reportSubmitted}
        <p class="text-sm text-muted">{t.t("chat.reportSuccess")}</p>
        <button
          onclick={() => (showReportModal = false)}
          class="w-full rounded-2xl bg-primary py-3 text-xs font-bold text-white active:scale-95"
        >
          {t.t("common.close")}
        </button>
      {:else}
        <p class="text-sm text-muted">{t.t("chat.reportHint")}</p>
        <select
          bind:value={reportReason}
          class="w-full rounded-2xl border-2 border-border bg-bg px-4 py-3 text-sm text-text outline-none focus:border-primary"
        >
          {#each REPORT_REASONS as reason}
            <option value={reason}>{t.t(REPORT_REASON_KEYS[reason])}</option>
          {/each}
        </select>
        <textarea
          bind:value={reportDetails}
          placeholder={t.t("chat.reportDetailsPlaceholder")}
          rows={3}
          class="w-full resize-none rounded-2xl border-2 border-border bg-bg px-4 py-3 text-sm text-text outline-none focus:border-primary"
        ></textarea>
        <div class="flex w-full gap-3">
          <button
            onclick={() => (showReportModal = false)}
            disabled={reporting}
            class="flex-1 rounded-2xl border-2 border-border py-3 text-xs font-semibold text-text active:scale-95 disabled:opacity-50"
          >
            {t.t("common.cancel")}
          </button>
          <button
            onclick={handleReport}
            disabled={reporting}
            class="flex-1 rounded-2xl bg-error py-3 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
          >
            {reporting ? t.t("chat.reporting") : t.t("chat.reportSubmit")}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
