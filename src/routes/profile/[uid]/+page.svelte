<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";
  import { db } from "$lib/firebase/client";
  import { doc, getDoc } from "firebase/firestore";
  import { ACTIVITIES, type UserProfile } from "$lib/types";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import PhotoGallery from "$lib/components/PhotoGallery.svelte";
  import ActionButtons from "$lib/components/ActionButtons.svelte";
  import ProfileEditSheet from "$lib/components/ProfileEditSheet.svelte";
  import MessageComposeSheet from "$lib/components/MessageComposeSheet.svelte";
  import ActivityMatchPicker from "$lib/components/ActivityMatchPicker.svelte";
  import { authUser, userProfile } from "$lib/stores/auth";
  import { isAdmin } from "$lib/stores/admin";
  import { recordSwipe, startDirectMessage } from "$lib/firebase/swipe";
  import { distanceKm } from "$lib/location";
  import {
    MapPin,
    LoaderCircle,
    PartyPopper,
    UserShield,
    Rainbow,
    Crown,
    Pencil,
    X,
  } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import { detectSocialPlatform } from "$lib/social";

  let t = $derived(createTranslator($activeLanguage));

  let uid = $derived(page.params.uid as string);
  let profile = $state<UserProfile | null>(null);
  let loading = $state(true);
  let notFound = $state(false);
  let alreadyMatched = $state(false);
  let swiping = $state(false);
  let matchBanner = $state(false);
  let showMessageModal = $state(false);
  let showEditSheet = $state(false);
  let distanceAway = $derived.by(() => {
    if (
      !$userProfile ||
      $userProfile.lat === undefined ||
      $userProfile.lng === undefined ||
      !profile ||
      profile.lat === undefined ||
      profile.lng === undefined
    )
      return null;
    return Math.round(
      distanceKm($userProfile.lat, $userProfile.lng, profile.lat, profile.lng),
    );
  });

  let photos = $derived(
    profile?.photos?.length
      ? profile.photos
      : profile?.photoURL
        ? [profile.photoURL]
        : [],
  );

  let mySportIds = $derived(
    new Set(($userProfile?.activities ?? []).map((a) => a.id)),
  );
  // Stable sort keeps each group in its original order, shared sports just move to the front
  let sortedActivities = $derived(
    [...(profile?.activities ?? [])].sort(
      (a, b) => Number(!mySportIds.has(a.id)) - Number(!mySportIds.has(b.id)),
    ),
  );

  // Buttons only make sense for someone else's profile you haven't already matched with
  let showActions = $derived(
    !!profile &&
      !!$authUser &&
      $authUser.uid !== profile.uid &&
      !alreadyMatched,
  );

  $effect(() => {
    loading = true;
    notFound = false;
    profile = null;
    alreadyMatched = false;
    const currentUid = get(authUser)?.uid;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) {
        profile = { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
      } else {
        notFound = true;
      }
      loading = false;
    });
    if (currentUid && currentUid !== uid) {
      const matchId = [currentUid, uid].sort().join("_");
      getDoc(doc(db, "matches", matchId)).then((snap) => {
        alreadyMatched = snap.exists();
      });
    }
  });

  let activityPickerOpen = $state(false);
  let activityPickerOptions = $state<{ id: string }[]>([]);

  function sharedActivities() {
    return profile?.activities?.filter((a) => mySportIds.has(a.id)) ?? [];
  }

  async function handleSwipe(direction: "like" | "pass") {
    if (!profile || swiping) return;
    if (direction === "pass") {
      await completeSwipe("pass", []);
      return;
    }

    // Picking which shared activity to connect on is mandatory whenever there's more than one
    const shared = sharedActivities();
    if (shared.length > 1) {
      activityPickerOptions = shared;
      activityPickerOpen = true;
      return;
    }
    await completeSwipe(
      "like",
      shared.map((a) => a.id),
    );
  }

  async function completeSwipe(
    direction: "like" | "pass",
    activities: string[],
  ) {
    const currentUid = get(authUser)?.uid;
    if (!currentUid || !profile || swiping) return;
    swiping = true;
    const isMatch = await recordSwipe(
      currentUid,
      profile.uid,
      direction,
      activities,
    );
    if (isMatch) {
      matchBanner = true;
      setTimeout(() => goto("/matches"), 1800);
    } else {
      goto("/discover");
    }
  }

  function confirmActivityPicker(selectedIds: string[]) {
    activityPickerOpen = false;
    completeSwipe("like", selectedIds);
  }

  function cancelActivityPicker() {
    activityPickerOpen = false;
  }

  async function handleShare() {
    if (!profile || typeof navigator === "undefined") return;
    const url = `${location.origin}/profile/${profile.uid}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: profile.displayName, url });
      } catch {
        // user cancelled the share sheet, nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard unavailable, nothing more we can do
    }
  }

  let messaging = $state(false);
  let showComposeSheet = $state(false);

  async function handleMessage() {
    const currentUid = get(authUser)?.uid;
    if (!currentUid || !profile || messaging) return;

    if (!$userProfile?.isPremium) {
      showMessageModal = true;
      return;
    }

    showComposeSheet = true;
  }

  async function handleSendDirectMessage(text: string) {
    const currentUid = get(authUser)?.uid;
    if (!currentUid || !profile || messaging) return;

    messaging = true;
    const matchId = await startDirectMessage(
      currentUid,
      profile.uid,
      sharedActivities().map((a) => a.id),
      text,
    );
    messaging = false;
    showComposeSheet = false;
    goto(`/chat/${matchId}`);
  }
</script>

<div class="flex min-h-dvh flex-col bg-bg {showActions ? 'pb-28' : 'pb-12'}">
  <div
    class="sticky top-0 z-10 flex items-center justify-between gap-3 bg-bg px-4 pb-3 pt-5"
  >
    <div class="flex items-center gap-1.5">
      {#if profile}
        <h1 class="text-lg font-black text-text">
          {profile.displayName}{#if profile.age}, {profile.age}{/if}
        </h1>
        {#if profile.isPremium}
          <Crown
            class="size-4 shrink-0 text-primary"
            aria-label={t.t("profile.premiumMember")}
          />
        {/if}
        {#if profile.orientation === "gay"}
          <Rainbow
            class="size-4 shrink-0 text-primary"
            aria-label={t.orientation("gay")}
          />
        {/if}
        {#if profile.isTrainer}
          <UserShield
            class="size-4 shrink-0 text-primary"
            aria-label={t.t("profile.trainer")}
          />
        {/if}
      {:else}
        <h1 class="text-lg font-black text-text">{t.t("nav.profile")}</h1>
      {/if}
    </div>
    <div class="flex items-center gap-1">
      {#if $isAdmin && profile}
        <button
          onclick={() => (showEditSheet = true)}
          aria-label="Edit profile"
          class="flex size-9 items-center justify-center rounded-full hover:bg-text/10"
        >
          <Pencil class="size-4.5 text-text" />
        </button>
      {/if}
      <button
        onclick={() => history.back()}
        aria-label={t.t("common.close")}
        class="flex size-9 items-center justify-center rounded-full hover:bg-text/10"
      >
        <X class="size-5 text-text" />
      </button>
    </div>
  </div>

  {#if loading}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if notFound || !profile}
    <div class="flex flex-1 items-center justify-center text-muted">
      <p>{t.t("profile.notFound")}</p>
    </div>
  {:else}
    <PhotoGallery {photos} alt={profile.displayName} />

    <div class="flex flex-col gap-3 px-5 pb-6 pt-4">
      {#if profile.city || distanceAway !== null}
        <div
          class="flex flex-wrap items-center gap-2 rounded-2xl bg-surface p-4 text-sm text-muted shadow-sm"
        >
          {#if profile.city}
            <span class="flex items-center gap-0.5">
              <MapPin class="size-3.5" />
              {profile.city}
            </span>
          {/if}
          {#if distanceAway !== null}
            <span>{t.t("profile.distanceAway", { count: distanceAway })}</span>
          {/if}
        </div>
      {/if}
      <div
        class="flex flex-col items-start gap-3 rounded-2xl bg-surface p-4 shadow-sm"
      >
        {#if profile.bio}
          <p class="text-left text-sm text-muted text-balance">{profile.bio}</p>
        {/if}
        {#if profile.socialLinks?.length}
          <div class="flex flex-wrap gap-2">
            {#each profile.socialLinks as link}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={detectSocialPlatform(link).label}
                class="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary active:scale-95"
              >
                <SocialIcon url={link} class="size-4.5" />
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="px-5">
      <!-- <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
        {t.t("common.sports")}
      </h3> -->
      {#if (profile.activities?.length ?? 0) === 0}
        <p class="text-sm text-muted">{t.t("common.noActivities")}</p>
      {:else}
        <div class="flex flex-col gap-3">
          {#each sortedActivities as act}
            {@const info = ACTIVITIES.find((a) => a.id === act.id)}
            <div
              class="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm"
            >
              <span
                class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <ActivityIcon id={act.id} class="size-5" />
              </span>
              <div class="flex-1">
                <p class="flex items-center gap-2 font-bold text-text">
                  {t.activity(act.id)}
                  {#if mySportIds.has(act.id)}
                    <span
                      class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                    >
                      {t.t("profile.inCommon")}
                    </span>
                  {/if}
                </p>
                <p class="text-sm text-muted">
                  {#if act.format !== "all"}{t.format(act.format)}·
                  {/if}{t.skill(act.level)}
                </p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if showEditSheet && profile}
  <ProfileEditSheet
    {profile}
    onClose={() => (showEditSheet = false)}
    onSaved={(updated) => {
      profile = updated;
      showEditSheet = false;
    }}
  />
{/if}

{#if showActions}
  <div
    class="fixed inset-x-0 bottom-0 z-40 mx-auto w-full border-t border-border bg-surface p-4 pb-safe md:max-w-md"
  >
    <ActionButtons
      onPass={() => handleSwipe("pass")}
      onLike={() => handleSwipe("like")}
      disabled={swiping}
      passLabel={t.t("common.pass")}
      likeLabel={t.t("common.like")}
      onShare={handleShare}
      shareLabel={t.t("profile.share")}
      onMessage={handleMessage}
      messageLabel={t.t("common.message")}
    />
  </div>
{/if}

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

<ActivityMatchPicker
  open={activityPickerOpen}
  activities={activityPickerOptions}
  onConfirm={confirmActivityPicker}
  onCancel={cancelActivityPicker}
/>

{#if matchBanner}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex flex-col items-center gap-4 rounded-3xl bg-surface p-10 shadow-2xl text-center mx-6"
    >
      <PartyPopper class="size-16 text-primary" />
      <h2 class="text-3xl font-black text-primary">
        {t.t("discover.matchTitle")}
      </h2>
      <p class="text-muted">{t.t("discover.matchHint")}</p>
    </div>
  </div>
{/if}
