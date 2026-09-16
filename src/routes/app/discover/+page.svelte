<script lang="ts">
  import { onMount } from "svelte";
  import type { UserProfile } from "$lib/types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    SlidersHorizontal,
    User,
    Users,
    Heart,
    UserShield,
    X,
    Moon,
    Check,
    PartyPopper,
    MailCheck,
    Info,
    Crown,
  } from "@lucide/svelte";
  import Loading from "$lib/components/Loading.svelte";
  import ProfileCardInfo from "$lib/components/ProfileCardInfo.svelte";
  import { getFallbackPhoto } from "$lib/image";
  import ActionButtons from "$lib/components/ActionButtons.svelte";
  import MessageComposeSheet from "$lib/components/MessageComposeSheet.svelte";
  import {
    authUser,
    userProfile,
    filterActivities,
    filterFormat,
    filterLevel,
    filterGender,
    filterSexualOrientation,
    filterMinAge,
    filterMaxAge,
    filterMaxDistanceKm,
    filterSingle,
    filterTrainer,
  } from "$lib/stores/auth";
  import {
    getDiscoverFeed,
    recordSwipe,
    undoSwipe,
    unmatch,
    startDirectMessage,
    LikeLimitReachedError,
  } from "$lib/firebase/swipe";
  import {
    ACTIVITIES,
    DEFAULT_DISTANCE_KM,
    getRemainingLikes,
    type ActivityFormat,
    type DiscoverFilters,
    type Gender,
  } from "$lib/types";
  import { get } from "svelte/store";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import PresetSheet from "$lib/components/PresetSheet.svelte";
  import {
    getDiscoverPresetValues,
    matchesDiscoverPreset,
    type DiscoverPresetKind,
  } from "$lib/discoverPresets";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let users = $state<UserProfile[]>([]);
  let loading = $state(true);
  let filtersSyncedFor = $state<string | null>(null);
  let lastLoadedKey = $state<string | null>(null);

  let matchBanner = $state(false);
  // The most recently swiped profile (like or pass), restorable via the undo button; cleared on undo
  let lastSwipe = $state<{
    profile: UserProfile;
    isMatch: boolean;
  } | null>(null);
  let profileActivities = $derived(
    ACTIVITIES.filter((activity) =>
      $userProfile?.activities?.some(
        (profileActivity) => profileActivity.id === activity.id,
      ),
    ),
  );

  // Used by the Dating/Friends quick-filter presets below
  let myGender: Gender | "" = $derived($userProfile?.gender ?? "");
  let oppositeGender: Gender | "" = $derived(
    myGender === "male" ? "female" : myGender === "female" ? "male" : "",
  );
  let myOrientation = $derived($userProfile?.orientation ?? "hetero");
  let presetContext = $derived({ myGender, oppositeGender, myOrientation });
  let currentFilterValues = $derived({
    format: $filterFormat,
    level: $filterLevel,
    gender: $filterGender,
    orientation: $filterSexualOrientation,
    single: $filterSingle,
    trainer: $filterTrainer,
  });

  let isDatingPreset = $derived(
    matchesDiscoverPreset("dating", currentFilterValues, presetContext),
  );
  let isFriendsPreset = $derived(
    matchesDiscoverPreset("friends", currentFilterValues, presetContext),
  );
  let isTrainerPreset = $derived(
    matchesDiscoverPreset("trainer", currentFilterValues, presetContext),
  );
  // Matches the state applyDefaultPreset() puts the filters in - no restrictions on anything
  let isDefaultPreset = $derived(
    $filterActivities.length === 0 &&
      $filterMinAge === null &&
      $filterMaxAge === null &&
      $filterMaxDistanceKm === null &&
      matchesDiscoverPreset("default", currentFilterValues, presetContext),
  );
  let pageTitle = $derived(
    isDatingPreset
      ? t.t("discover.titleDating")
      : isFriendsPreset
        ? t.t("discover.titleFriends")
        : isTrainerPreset
          ? t.t("discover.titleTrainer")
          : t.t("nav.discover"),
  );
  // Any filter set beyond the defaults, that isn't one of the quick presets above (those highlight themselves)
  let isCustomFilter = $derived(
    !isDefaultPreset &&
      !isDatingPreset &&
      !isFriendsPreset &&
      !isTrainerPreset &&
      ($filterActivities.length > 0 ||
        $filterFormat !== "" ||
        $filterLevel !== "" ||
        $filterGender !== "" ||
        $filterSexualOrientation !== "" ||
        $filterMinAge !== null ||
        $filterMaxAge !== null ||
        $filterMaxDistanceKm !== DEFAULT_DISTANCE_KM ||
        $filterSingle !== "" ||
        $filterTrainer !== ""),
  );

  // Email/password accounts must confirm their inbox link before they're visible in Discover;
  // Google accounts come back already verified. Refreshed on mount in case it just happened elsewhere.
  let needsVerification = $derived($authUser?.emailVerified === false);
  let verificationSending = $state(false);
  let verificationMessage = $state("");
  let checkingVerification = $state(false);
  let justVerified = $state(false);

  async function resendVerification() {
    verificationSending = true;
    verificationMessage = "";
    try {
      await authUser.resendVerificationEmail();
      verificationMessage = t.t("auth.verificationEmailSent");
    } catch (e: any) {
      verificationMessage = e.message ?? t.t("errors.generic");
    } finally {
      verificationSending = false;
    }
  }

  async function checkVerification() {
    checkingVerification = true;
    verificationMessage = "";
    const verified = await authUser.refreshUser();
    if (verified) {
      const uid = get(authUser)?.uid;
      if (uid) await userProfile.save(uid, { emailVerified: true });
    } else {
      verificationMessage = t.t("auth.stillNotVerified");
    }
    checkingVerification = false;
  }

  // Backfill coordinates for profiles saved before distance filtering existed —
  // only runs if the browser already granted geolocation, so it never prompts.
  onMount(() => {
    authUser.refreshUser();
    // Firebase's verification email links back here with ?verified=1 once it confirms the address
    if (page.url.searchParams.get("verified") === "1") {
      justVerified = true;
      setTimeout(() => (justVerified = false), 5000);
      goto("/discover", {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    }
    if (typeof navigator === "undefined") return;
    if (!("geolocation" in navigator) || !("permissions" in navigator)) return;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (status.state !== "granted") return;
        const uid = get(authUser)?.uid;
        const profile = get(userProfile);
        if (!uid || !profile || profile.lat !== undefined) return;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userProfile.save(uid, {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {},
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
        );
      })
      .catch(() => {});
  });

  // Swipe state
  let cardEl = $state<HTMLDivElement | null>(null);
  let photoEl = $state<HTMLDivElement | null>(null);
  let startX = $state(0);
  let currentX = $state(0);
  let dragging = $state(false);
  let exiting = $state(false);

  // Photo carousel state (top card only) — tap left/right like Tinder
  let photoIndex = $state(0);
  let currentPhotos = $derived.by(() => {
    const top = users[0];
    if (!top) return [] as string[];
    if (top.photos?.length) return top.photos;
    return [getFallbackPhoto(top.uid, top.gender)];
  });

  $effect(() => {
    users[0]?.uid;
    photoIndex = 0;
  });

  function applyFilters(filters: DiscoverFilters) {
    filterActivities.set(filters.activities ?? []);
    filterFormat.set(filters.format);
    filterLevel.set(filters.level);
    filterGender.set(filters.gender);
    filterSexualOrientation.set(filters.orientation);
    filterMinAge.set(filters.minAge ?? null);
    filterMaxAge.set(filters.maxAge ?? null);
    // undefined means the profile predates this filter, so fall back to the default;
    // an explicit null means the user picked "Any" and should stay that way
    filterMaxDistanceKm.set(
      filters.maxDistanceKm === undefined
        ? DEFAULT_DISTANCE_KM
        : filters.maxDistanceKm,
    );
    filterSingle.set(filters.single ?? "");
    filterTrainer.set(filters.trainer ?? "");
  }

  async function saveFilters() {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    await userProfile.save(uid, {
      discoverFilters: {
        activities: get(filterActivities),
        format: get(filterFormat),
        level: get(filterLevel),
        gender: get(filterGender),
        orientation: get(filterSexualOrientation),
        minAge: get(filterMinAge),
        maxAge: get(filterMaxAge),
        maxDistanceKm: get(filterMaxDistanceKm),
        single: get(filterSingle),
        trainer: get(filterTrainer),
      },
    });
  }

  // Quick presets shown as buttons next to the filters icon; each resets sport selection to "any" and saves immediately
  function setPresetFilters(preset: DiscoverPresetKind) {
    const values = getDiscoverPresetValues(preset, presetContext);
    filterActivities.set([]);
    filterFormat.set(values.format);
    filterLevel.set(values.level);
    filterGender.set(values.gender);
    filterSexualOrientation.set(values.orientation);
    filterSingle.set(values.single);
    filterTrainer.set(values.trainer);
  }

  function applyDatingPreset() {
    setPresetFilters("dating");
    saveFilters();
  }

  function applyFriendsPreset() {
    setPresetFilters("friends");
    saveFilters();
  }

  function applyTrainerPreset() {
    setPresetFilters("trainer");
    saveFilters();
  }

  function applyDefaultPreset() {
    setPresetFilters("default");
    filterMinAge.set(null);
    filterMaxAge.set(null);
    filterMaxDistanceKm.set(null);
    saveFilters();
  }

  // Bridges PresetSheet's toggle picker to the preset functions above
  function selectDiscoverPreset(preset: DiscoverPresetKind) {
    if (preset === "dating") applyDatingPreset();
    else if (preset === "friends") applyFriendsPreset();
    else if (preset === "trainer") applyTrainerPreset();
    else applyDefaultPreset();
  }

  // Sync filter stores from the saved profile once per user; defaults are used until they save filters explicitly
  $effect(() => {
    const uid = $authUser?.uid;
    const profile = $userProfile;
    if (!uid || !profile || filtersSyncedFor === uid) return;
    filtersSyncedFor = uid;

    if (profile.discoverFilters) {
      applyFilters(profile.discoverFilters);
    }
  });

  async function loadFeed() {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    loading = true;
    const profile = get(userProfile);
    users = await getDiscoverFeed(
      uid,
      (profile?.activities ?? []).map((a) => a.id),
      get(filterActivities),
      get(filterFormat),
      get(filterLevel),
      get(filterGender),
      get(filterSexualOrientation),
      get(filterMinAge),
      get(filterMaxAge),
      get(filterMaxDistanceKm),
      { lat: profile?.lat, lng: profile?.lng },
      get(filterSingle),
      get(filterTrainer),
      profile?.city ?? "",
    );
    loading = false;
  }

  // Reload when auth resolves or filters change; skipped if we already loaded this exact feed
  // (e.g. navigating back from a profile page shouldn't refetch and reshuffle the cards)
  $effect(() => {
    $authUser;
    $userProfile;
    $filterActivities;
    $filterFormat;
    $filterLevel;
    $filterGender;
    $filterSexualOrientation;
    $filterMinAge;
    $filterMaxAge;
    $filterMaxDistanceKm;
    $filterSingle;
    $filterTrainer;

    if (
      $filterActivities.length > 0 &&
      $filterActivities.some(
        (id) => !profileActivities.some((activity) => activity.id === id),
      )
    ) {
      filterActivities.set(
        $filterActivities.filter((id) =>
          profileActivities.some((activity) => activity.id === id),
        ),
      );
      return;
    }

    const key = JSON.stringify([
      $authUser?.uid,
      $filterActivities,
      $filterFormat,
      $filterLevel,
      $filterGender,
      $filterSexualOrientation,
      $filterMinAge,
      $filterMaxAge,
      $filterMaxDistanceKm,
      $filterSingle,
      $filterTrainer,
    ]);
    if (key === lastLoadedKey) return;
    lastLoadedKey = key;
    loadFeed();
  });

  function onPointerDown(e: PointerEvent) {
    if (exiting) return;
    dragging = true;
    startX = e.clientX;
    currentX = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    currentX = e.clientX - startX;
  }

  async function onPointerUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    const TAP_THRESHOLD = 8;
    const distance = Math.abs(currentX);
    if (distance < TAP_THRESHOLD) {
      currentX = 0;
      handleTap(e);
      return;
    }
    const SWIPE_THRESHOLD = 80;
    if (distance < SWIPE_THRESHOLD) {
      currentX = 0;
      return;
    }
    const direction = currentX > 0 ? "like" : "pass";
    await swipe(direction);
  }

  function handleTap(e: PointerEvent) {
    if (!photoEl) return;
    const rect = photoEl.getBoundingClientRect();
    handlePhotoTap(e, rect);
  }

  function handlePhotoTap(e: PointerEvent, rect: DOMRect) {
    const total = currentPhotos.length;
    if (total <= 1) return;
    const isRightSide = e.clientX - rect.left > rect.width / 2;
    photoIndex = isRightSide
      ? (photoIndex + 1) % total
      : (photoIndex - 1 + total) % total;
  }

  const EXIT_DURATION = 320;

  // Activities the current user and the top candidate both practice, ranked so ones
  // matching the active discover filter come first (mirrors the old auto-pick preference)
  function sharedActivitiesWith(top: UserProfile) {
    const myIds = new Set(($userProfile?.activities ?? []).map((a) => a.id));
    const activityFilter = get(filterActivities);
    const shared = top.activities.filter((a) => myIds.has(a.id));
    if (activityFilter.length) {
      shared.sort(
        (a, b) =>
          Number(!activityFilter.includes(a.id)) -
          Number(!activityFilter.includes(b.id)),
      );
    }
    return shared;
  }

  async function swipe(direction: "like" | "pass") {
    if (exiting) return;
    const top = users[0];
    if (!top) return;

    if (direction === "pass") {
      await completeSwipe("pass", []);
      return;
    }

    const shared = sharedActivitiesWith(top);
    await completeSwipe(
      "like",
      shared.map((a) => a.id),
    );
  }

  async function completeSwipe(
    direction: "like" | "pass",
    activities: string[],
  ) {
    const uid = get(authUser)?.uid;
    const top = users[0];
    if (!uid || !top) return;

    if (direction === "like" && getRemainingLikes($userProfile) <= 0) {
      showLikeLimitModal = true;
      return;
    }

    // Fly the top card off-screen, then swap in the next one once it's clear
    exiting = true;
    dragging = false;
    const flyDistance =
      (typeof window !== "undefined" ? window.innerWidth : 400) * 1.2;
    currentX = direction === "like" ? flyDistance : -flyDistance;

    let isMatch = false;
    try {
      [isMatch] = await Promise.all([
        recordSwipe(uid, top.uid, direction, activities),
        new Promise((resolve) => setTimeout(resolve, EXIT_DURATION)),
      ]);
    } catch (e) {
      currentX = 0;
      exiting = false;
      if (e instanceof LikeLimitReachedError) {
        showLikeLimitModal = true;
        return;
      }
      throw e;
    }

    lastSwipe = { profile: top, isMatch };
    users = users.slice(1);
    currentX = 0;
    exiting = false;

    if (isMatch) {
      matchBanner = true;
      setTimeout(() => (matchBanner = false), 3000);
    }
  }

  async function undoLastSwipe() {
    const uid = get(authUser)?.uid;
    if (!uid || !lastSwipe) return;
    const { profile, isMatch } = lastSwipe;
    lastSwipe = null;
    await undoSwipe(uid, profile.uid);
    // A mutual like created a match - undoing the like should undo that match too
    if (isMatch) await unmatch([uid, profile.uid].sort().join("_"));
    users = [profile, ...users];
  }

  let showMessageModal = $state(false);
  let showLikeLimitModal = $state(false);
  let showComposeSheet = $state(false);
  let messaging = $state(false);
  let messageTarget = $state<{
    uid: string;
    activities: string[];
  } | null>(null);

  async function handleMessage() {
    const uid = get(authUser)?.uid;
    const top = users[0];
    if (!uid || !top || messaging) return;

    if (!$userProfile?.isPremium) {
      showMessageModal = true;
      return;
    }

    const shared = sharedActivitiesWith(top);
    messageTarget = { uid: top.uid, activities: shared.map((a) => a.id) };
    showComposeSheet = true;
  }

  async function handleSendDirectMessage(text: string) {
    const uid = get(authUser)?.uid;
    if (!uid || !messageTarget || messaging) return;

    messaging = true;
    const matchId = await startDirectMessage(
      uid,
      messageTarget.uid,
      messageTarget.activities,
      text,
    );
    messaging = false;
    showComposeSheet = false;
    goto(`/chat/${matchId}`);
  }

  let rotation = $derived(
    dragging || exiting ? Math.max(-20, Math.min(20, currentX * 0.08)) : 0,
  );
  let likeOpacity = $derived(Math.max(0, Math.min(1, currentX / 100)));
  let passOpacity = $derived(Math.max(0, Math.min(1, -currentX / 100)));
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-bg pb-18">
  {#if needsVerification}
    <!-- Email verification gate: keeps unverified email/password accounts out of Discover -->
    <div
      class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
    >
      <MailCheck class="size-16 text-primary" />
      <h1 class="text-xl font-black text-text">
        {t.t("auth.verifyEmailTitle")}
      </h1>
      <p class="text-sm text-muted">
        {t.t("auth.verifyEmailHint", { email: $authUser?.email ?? "" })}
      </p>
      {#if verificationMessage}
        <p class="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
          {verificationMessage}
        </p>
      {/if}
      <button
        onclick={checkVerification}
        disabled={checkingVerification}
        class="w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
      >
        {checkingVerification
          ? t.t("common.loading")
          : t.t("auth.iHaveVerified")}
      </button>
      <button
        onclick={resendVerification}
        disabled={verificationSending}
        class="w-full rounded-2xl border-2 border-border py-4 text-base font-semibold text-text active:scale-95 disabled:opacity-50"
      >
        {verificationSending
          ? t.t("common.loading")
          : t.t("auth.resendVerification")}
      </button>
      <button
        onclick={() => authUser.signOut()}
        class="mt-2 text-sm font-semibold text-muted"
      >
        {t.t("profile.signOut")}
      </button>
    </div>
  {:else}
    {#if justVerified}
      <div
        class="mx-5 mt-5 flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success"
      >
        <MailCheck class="size-5 shrink-0" />
        {t.t("auth.emailVerifiedSuccess")}
      </div>
    {/if}
    <!-- Header -->
    <div class="flex items-center justify-between px-5 pb-3 pt-5">
      <h1 class="text-2xl font-black text-text">{pageTitle}</h1>
      <div class="flex items-center gap-2">
        <button
          onclick={applyDatingPreset}
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isDatingPreset
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.datingPreset")}
        >
          <Heart class="size-5" />
        </button>
        <button
          onclick={applyFriendsPreset}
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isFriendsPreset
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.friendsPreset")}
        >
          <Users class="size-5" />
        </button>
        <button
          onclick={applyTrainerPreset}
          class="size-9 items-center justify-center rounded-full shadow-sm flex {isTrainerPreset
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.trainerPreset")}
        >
          <UserShield class="size-5" />
        </button>
        <PresetSheet
          preset={isDefaultPreset
            ? "default"
            : isDatingPreset
              ? "dating"
              : isFriendsPreset
                ? "friends"
                : isTrainerPreset
                  ? "trainer"
                  : null}
          onSelectPreset={selectDiscoverPreset}
        />
        <button
          onclick={() => goto("/discover/filters")}
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isCustomFilter
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.filters")}
        >
          <SlidersHorizontal class="size-5" />
        </button>
      </div>
    </div>

    <!-- Card stack -->
    <div
      class="relative flex min-h-0 flex-1 flex-col items-center justify-center"
    >
      {#if loading}
        <Loading fullscreen={false} class="absolute inset-0" />
      {:else if users.length === 0}
        <div class="flex flex-col items-center gap-4 text-center">
          <Moon class="size-16 text-muted" />
          <p class="text-lg font-bold text-text">
            {t.t("discover.noMorePlayers")}
          </p>
          <p class="text-sm text-muted">
            {t.t("discover.tryFilters")}
          </p>
          <button
            onclick={loadFeed}
            class="rounded-2xl bg-primary px-6 py-3 font-bold text-white active:scale-95"
          >
            {t.t("discover.refresh")}
          </button>
        </div>
      {:else}
        <!-- Card stack wrapper: keeps all layers anchored to the same box -->
        <div class="relative min-h-0 w-full flex-1">
          <!-- Background cards (stacked look) -->
          {#if users[2]}
            <div
              class="absolute inset-0 z-0 flex flex-col overflow-hidden bg-surface shadow-md"
            >
              <div
                class="flex-1 min-h-0 w-full flex items-center justify-center"
              >
                <img
                  src={users[2].photos?.[0] ||
                    getFallbackPhoto(users[2].uid, users[2].gender)}
                  alt={users[2].displayName}
                  draggable="false"
                  class="h-full w-full object-cover pointer-events-none"
                />
              </div>
            </div>
          {/if}
          {#if users[1]}
            <div
              class="absolute inset-0 z-10 flex flex-col overflow-hidden bg-surface shadow-md"
            >
              <div
                class="flex-1 min-h-0 w-full flex items-center justify-center"
              >
                <img
                  src={users[1].photos?.[0] ||
                    getFallbackPhoto(users[1].uid, users[1].gender)}
                  alt={users[1].displayName}
                  draggable="false"
                  class="h-full w-full object-cover pointer-events-none"
                />
              </div>
              <ProfileCardInfo user={users[1]} {t} />
            </div>
          {/if}

          <!-- Top card -->
          {#key users[0]?.uid}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              bind:this={cardEl}
              onpointerdown={onPointerDown}
              onpointermove={onPointerMove}
              onpointerup={onPointerUp}
              onpointercancel={onPointerUp}
              style="transform: translateX({currentX}px) rotate({rotation}deg); transition: {dragging
                ? 'none'
                : exiting
                  ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'
                  : 'transform 0.3s'}, border-radius 0.2s; touch-action: none;"
              class="absolute inset-0 z-20 flex flex-col overflow-hidden bg-surface shadow-xl select-none cursor-grab active:cursor-grabbing {dragging ||
              exiting
                ? 'rounded-3xl'
                : ''}"
            >
              <!-- Photo progress segments (Tinder-style tap navigation) -->
              {#if currentPhotos.length > 1}
                <div
                  class="absolute left-1/2 top-6 z-10 flex w-1/3 -translate-x-1/2 gap-1"
                >
                  {#each currentPhotos as _, i}
                    <div
                      class="h-1 flex-1 overflow-hidden rounded-full bg-white/40"
                    >
                      <div
                        class="h-full rounded-full bg-white"
                        style="width: {i === photoIndex ? '100%' : '0%'}"
                      ></div>
                    </div>
                  {/each}
                </div>
              {/if}

              <!-- Profile image area (fills remaining vertical space) -->
              <div
                bind:this={photoEl}
                class="relative flex-1 min-h-0 w-full flex items-center justify-center"
              >
                {#if currentPhotos[photoIndex]}
                  <img
                    src={currentPhotos[photoIndex]}
                    alt={users[0].displayName}
                    draggable="false"
                    class="h-full w-full object-cover pointer-events-none"
                  />
                {:else}
                  <User class="size-24 text-primary/40" />
                {/if}
              </div>

              <!-- Like / Pass overlays -->
              <div
                class="absolute inset-0 flex items-start justify-start p-6 pointer-events-none"
                style="opacity: {likeOpacity};"
              >
                <span
                  class="flex items-center gap-1 rounded-xl border-4 border-success px-4 py-2 text-2xl font-black text-success rotate-[-15deg]"
                >
                  LIKE <Check class="size-6" />
                </span>
              </div>
              <div
                class="absolute inset-0 flex items-start justify-end p-6 pointer-events-none"
                style="opacity: {passOpacity};"
              >
                <span
                  class="flex items-center gap-1 rounded-xl border-4 border-error px-4 py-2 text-2xl font-black text-error rotate-[15deg]"
                >
                  PASS <X class="size-6" />
                </span>
              </div>

              <!-- Info -->
              <ProfileCardInfo user={users[0]} {t} />
            </div>
          {/key}

          <!-- Action buttons: overlaid on the card's bottom shadow, not in flex flow -->
          <ActionButtons
            class="absolute inset-x-0 bottom-4 z-30"
            onPass={() => swipe("pass")}
            onLike={() => swipe("like")}
            disabled={exiting}
            likeProgress={likeOpacity}
            passProgress={passOpacity}
            passLabel={t.t("common.pass")}
            likeLabel={t.t("common.like")}
            onUndo={undoLastSwipe}
            canUndo={!!lastSwipe}
            undoLabel={t.t("common.undo")}
            onMessage={handleMessage}
            messageLabel={t.t("common.message")}
          />
        </div>
      {/if}
    </div>

    <!-- Match banner -->
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
          <div class="flex gap-3 w-full">
            <button
              onclick={() => (matchBanner = false)}
              class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text"
            >
              {t.t("common.keepSwiping")}
            </button>
            <a
              href="/matches"
              class="flex-1 rounded-2xl bg-primary py-3 text-center text-sm font-bold text-white"
            >
              {t.t("matches.viewMatches")}
            </a>
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <BottomNav active="discover" />
</div>

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
      <p class="text-sm text-muted text-balance">
        {t.t("premium.messageUpsellHint")}
      </p>
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

{#if showLikeLimitModal}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="relative flex flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
    >
      <button
        onclick={() => (showLikeLimitModal = false)}
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
        {t.t("premium.likeLimitTitle")}
      </h2>
      <p class="text-sm text-muted text-balance">
        {t.t("premium.likeLimitHint")}
      </p>
      <a
        href="/premium"
        class="mt-2 w-full rounded-2xl bg-primary py-3 font-bold text-white active:scale-95"
      >
        {t.t("profile.goPremium")}
      </a>
      <button
        onclick={() => (showLikeLimitModal = false)}
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
