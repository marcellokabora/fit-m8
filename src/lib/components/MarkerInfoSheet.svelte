<script lang="ts">
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";
  import { Check, Crown, MessageCircle, UserPlus, X } from "@lucide/svelte";
  import BottomSheet from "$lib/components/BottomSheet.svelte";
  import MessageComposeSheet from "$lib/components/MessageComposeSheet.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { getFallbackPhoto } from "$lib/image";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { startDirectMessage } from "$lib/firebase/swipe";
  import {
    requestToJoinCheckin,
    respondToJoinRequest,
    cancelJoinRequest,
    subscribeJoinRequests,
  } from "$lib/firebase/checkins";
  import type { Checkin, CheckinJoinRequest } from "$lib/types";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    open = $bindable(false),
    checkin,
  }: {
    open?: boolean;
    checkin: Checkin | null;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));

  let showMessageModal = $state(false);
  let showComposeSheet = $state(false);
  let messaging = $state(false);
  let joinRequests = $state<CheckinJoinRequest[]>([]);
  let joining = $state(false);

  let myUid = $derived($authUser?.uid ?? "");
  let isOwnCheckin = $derived(!!checkin && checkin.uid === myUid);
  let hasRequestedToJoin = $derived(joinRequests.some((r) => r.uid === myUid));

  // Public join-requests list is scoped to whichever check-in is currently shown, and stops
  // listening automatically when the sheet is closed or a different check-in is selected.
  $effect(() => {
    if (!checkin) {
      joinRequests = [];
      return;
    }
    return subscribeJoinRequests(checkin.uid, (next) => (joinRequests = next));
  });

  // Recomputed on every render while the sheet is open rather than a live ticking timer — good
  // enough for a "roughly how long is left" label.
  let expiresInLabel = $derived.by(() => {
    if (!checkin) return "";
    const minutesLeft = Math.max(
      0,
      Math.round((checkin.expiresAt.getTime() - Date.now()) / 60000),
    );
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  });

  function close() {
    open = false;
  }

  function handleMessage() {
    if (!checkin) return;
    if (!$userProfile?.isPremium) {
      showMessageModal = true;
      return;
    }
    showComposeSheet = true;
  }

  async function handleJoinRequest() {
    const profile = get(userProfile);
    if (!checkin || !profile || joining) return;
    joining = true;
    try {
      if (hasRequestedToJoin) {
        await cancelJoinRequest(checkin.uid, profile.uid);
      } else {
        await requestToJoinCheckin(checkin.uid, profile);
      }
    } catch (err) {
      console.error("Failed to update join request:", err);
    } finally {
      joining = false;
    }
  }

  async function handleRespond(
    requesterUid: string,
    status: "accepted" | "declined",
  ) {
    if (!checkin) return;
    try {
      await respondToJoinRequest(checkin.uid, requesterUid, status);
    } catch (err) {
      console.error("Failed to respond to join request:", err);
    }
  }

  async function handleRemove(requesterUid: string) {
    if (!checkin) return;
    try {
      await cancelJoinRequest(checkin.uid, requesterUid);
    } catch (err) {
      console.error("Failed to remove join request:", err);
    }
  }

  async function handleSendDirectMessage(text: string) {
    const currentUid = get(authUser)?.uid;
    if (!currentUid || !checkin || messaging) return;
    messaging = true;
    const matchId = await startDirectMessage(
      currentUid,
      checkin.uid,
      [checkin.activityId],
      text,
    );
    messaging = false;
    showComposeSheet = false;
    open = false;
    goto(`/chat/${matchId}`);
  }
</script>

<BottomSheet
  bind:open
  onClose={close}
  closeLabel={t.t("common.close")}
  bgClass="bg-surface"
  maxHeightClass="max-h-[70dvh]"
>
  {#if checkin}
    <div class="flex flex-col items-center gap-3 px-7 pb-8 pt-2 text-center">
      <a
        href={`/profile/${checkin.uid}`}
        aria-label={checkin.displayName}
        class="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <img
          src={checkin.photos?.[0] ||
            getFallbackPhoto(checkin.uid, checkin.gender ?? "")}
          alt={checkin.displayName}
          class="size-20 rounded-full object-cover"
        />
      </a>
      <h2 class="text-xl font-black text-text">{checkin.displayName}</h2>
      <span
        class="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
      >
        <ActivityIcon id={checkin.activityId} class="size-4" />
        {t.activity(checkin.activityId)}
      </span>
      {#if checkin.message}
        <p class="text-sm text-muted">"{checkin.message}"</p>
      {/if}
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">
        {t.t("explore.expiresIn")}
        {expiresInLabel}
      </p>
      {#if !isOwnCheckin}
        <button
          type="button"
          onclick={handleJoinRequest}
          disabled={joining}
          class="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary py-3 font-bold text-primary active:scale-95 disabled:opacity-40"
        >
          {#if hasRequestedToJoin}
            <X class="size-5" />
          {:else}
            <UserPlus class="size-5" />
          {/if}
          {hasRequestedToJoin
            ? t.t("explore.joinRequested")
            : t.t("explore.askToJoin")}
        </button>
        <button
          type="button"
          onclick={handleMessage}
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-white active:scale-95"
        >
          <MessageCircle class="size-5" />
          {t.t("explore.messageButton")}
        </button>
      {/if}
      {#if joinRequests.length > 0}
        <div class="mt-2 flex w-full flex-col gap-2 text-left">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.t("explore.joinRequestsTitle")}
          </p>
          {#if isOwnCheckin}
            <ul class="flex flex-col gap-2">
              {#each joinRequests as request (request.uid)}
                <li class="flex items-center gap-3 rounded-2xl bg-bg px-3 py-2">
                  <img
                    src={request.photos?.[0] ||
                      getFallbackPhoto(request.uid, request.gender ?? "")}
                    alt={request.displayName}
                    class="size-8 shrink-0 rounded-full object-cover"
                  />
                  <span class="flex-1 truncate text-sm font-semibold text-text"
                    >{request.displayName}</span
                  >
                  {#if request.status === "pending"}
                    <button
                      type="button"
                      onclick={() => handleRespond(request.uid, "declined")}
                      aria-label={t.t("explore.declineJoin")}
                      class="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-border text-muted active:scale-95"
                    >
                      <X class="size-4" />
                    </button>
                    <button
                      type="button"
                      onclick={() => handleRespond(request.uid, "accepted")}
                      aria-label={t.t("explore.acceptJoin")}
                      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white active:scale-95"
                    >
                      <Check class="size-4" />
                    </button>
                  {:else}
                    <span
                      class="shrink-0 text-xs font-bold {request.status ===
                      'accepted'
                        ? 'text-primary'
                        : 'text-muted'}"
                    >
                      {request.status === "accepted"
                        ? t.t("explore.joinAccepted")
                        : t.t("explore.joinDeclined")}
                    </span>
                    <button
                      type="button"
                      onclick={() => handleRemove(request.uid)}
                      aria-label={t.t("explore.removeJoinRequest")}
                      class="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-border text-muted active:scale-95"
                    >
                      <X class="size-4" />
                    </button>
                  {/if}
                </li>
              {/each}
            </ul>
          {:else}
            <ul class="flex flex-wrap gap-2">
              {#each joinRequests as request (request.uid)}
                <li
                  class="flex items-center gap-2 rounded-full bg-bg px-3 py-1.5"
                >
                  <img
                    src={request.photos?.[0] ||
                      getFallbackPhoto(request.uid, request.gender ?? "")}
                    alt={request.displayName}
                    class="size-6 rounded-full object-cover"
                  />
                  <span class="text-xs font-semibold text-text"
                    >{request.displayName}</span
                  >
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</BottomSheet>

{#if showMessageModal}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="relative flex flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
    >
      <button
        onclick={() => (showMessageModal = false)}
        aria-label={t.t("common.close")}
        class="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-bg text-muted active:scale-95"
      >
        <X class="size-4" />
      </button>
      <span
        class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <Crown class="size-8" />
      </span>
      <h2 class="text-lg font-black text-text">
        {t.t("premium.messageUpsellTitle")}
      </h2>
      <p class="text-sm text-muted">{t.t("premium.messageUpsellHint")}</p>
      <a
        href="/premium"
        class="mt-2 w-full rounded-2xl bg-primary py-3 font-bold text-white active:scale-95"
      >
        {t.t("profile.goPremium")}
      </a>
      <button
        onclick={() => (showMessageModal = false)}
        class="w-full rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
      >
        {t.t("common.maybeLater")}
      </button>
    </div>
  </div>
{/if}

<MessageComposeSheet
  bind:open={showComposeSheet}
  sending={messaging}
  onSubmit={handleSendDirectMessage}
  title={t.t("premium.composeMessageTitle")}
  hint={t.t("premium.composeMessageHint")}
  placeholder={t.t("chat.placeholder")}
  sendLabel={t.t("common.send")}
  sendingLabel={t.t("common.sending")}
  closeLabel={t.t("common.close")}
/>
