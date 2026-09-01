<script lang="ts">
  import { onMount } from "svelte";
  import type { UserProfile } from "$lib/types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { scale } from "svelte/transition";
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
    MessageCircle,
    MailCheck,
    Info,
  } from "@lucide/svelte";
  import Loading from "$lib/components/Loading.svelte";
  import ProfileCardInfo from "$lib/components/ProfileCardInfo.svelte";
  import ActionButtons from "$lib/components/ActionButtons.svelte";
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
  import { getDiscoverFeed, recordSwipe, undoSwipe } from "$lib/firebase/swipe";
  import {
    ACTIVITIES,
    DEFAULT_DISTANCE_KM,
    type DiscoverFilters,
    type Gender,
  } from "$lib/types";
  import { get } from "svelte/store";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import PresetHint from "$lib/components/PresetHint.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let users = $state<UserProfile[]>([]);
  let loading = $state(true);
  let filtersSyncedFor = $state<string | null>(null);
  let lastLoadedKey = $state<string | null>(null);

  let matchBanner = $state(false);
  // The most recently dismissed "pass" profile, restorable via the undo button; cleared on undo or on any "like" swipe
  let lastPass = $state<UserProfile | null>(null);
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

  let isDatingPreset = $derived(
    $filterFormat === "1v1" &&
      $filterLevel === "" &&
      $filterGender === oppositeGender &&
      $filterSexualOrientation === myOrientation &&
      $filterSingle === "yes" &&
      $filterTrainer === "",
  );
  let isFriendsPreset = $derived(
    $filterFormat === "" &&
      $filterLevel === "" &&
      $filterGender === myGender &&
      $filterSexualOrientation === myOrientation &&
      $filterSingle === "" &&
      $filterTrainer === "",
  );
  let isTrainerPreset = $derived(
    $filterFormat === "" &&
      $filterLevel === "expert" &&
      $filterGender === "" &&
      $filterSexualOrientation === "" &&
      $filterSingle === "" &&
      $filterTrainer === "yes",
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
    return top.photos?.length ? top.photos : top.photoURL ? [top.photoURL] : [];
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
  function applyDatingPreset() {
    filterActivities.set([]);
    filterFormat.set("1v1");
    filterLevel.set("");
    filterGender.set(oppositeGender);
    filterSexualOrientation.set(myOrientation);
    filterSingle.set("yes");
    filterTrainer.set("");
    saveFilters();
  }

  function applyFriendsPreset() {
    filterActivities.set([]);
    filterFormat.set("");
    filterLevel.set("");
    filterGender.set(myGender);
    filterSexualOrientation.set(myOrientation);
    filterSingle.set("");
    filterTrainer.set("");
    saveFilters();
  }

  function applyTrainerPreset() {
    filterActivities.set([]);
    filterFormat.set("");
    filterLevel.set("expert");
    filterGender.set("");
    filterSexualOrientation.set("");
    filterSingle.set("");
    filterTrainer.set("yes");
    saveFilters();
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

  async function swipe(direction: "like" | "pass") {
    if (exiting) return;
    const uid = get(authUser)?.uid;
    const top = users[0];
    if (!uid || !top) return;

    // Fly the top card off-screen, then swap in the next one once it's clear
    exiting = true;
    dragging = false;
    const flyDistance =
      (typeof window !== "undefined" ? window.innerWidth : 400) * 1.2;
    currentX = direction === "like" ? flyDistance : -flyDistance;

    // Prefer a sport both users share that's actually in the active filter, falling back to their first shared sport
    const activityFilter = get(filterActivities);
    const activity =
      top.activities.find((a) => activityFilter.includes(a.id))?.id ||
      top.activities[0]?.id ||
      "";
    const format = get(filterFormat) || top.activities[0]?.format || "all";

    const [isMatch] = await Promise.all([
      recordSwipe(uid, top.uid, direction, activity, format),
      new Promise((resolve) => setTimeout(resolve, EXIT_DURATION)),
    ]);

    lastPass = direction === "pass" ? top : null;
    users = users.slice(1);
    currentX = 0;
    exiting = false;

    if (isMatch) {
      matchBanner = true;
      setTimeout(() => (matchBanner = false), 3000);
    }
  }

  async function undoLastPass() {
    const uid = get(authUser)?.uid;
    if (!uid || !lastPass) return;
    const profile = lastPass;
    lastPass = null;
    await undoSwipe(uid, profile.uid);
    users = [profile, ...users];
  }

  let showMessageModal = $state(false);
  function handleMessage() {
    showMessageModal = true;
  }

  let rotation = $derived(
    dragging || exiting ? Math.max(-20, Math.min(20, currentX * 0.08)) : 0,
  );
  let likeOpacity = $derived(Math.max(0, Math.min(1, currentX / 100)));
  let passOpacity = $derived(Math.max(0, Math.min(1, -currentX / 100)));
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-bg pb-22">
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
          onclick={() => goto("/discover/filters")}
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isCustomFilter
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.filters")}
        >
          <SlidersHorizontal class="size-5" />
        </button>
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
          class="flex size-9 items-center justify-center rounded-full shadow-sm {isTrainerPreset
            ? 'bg-primary text-white'
            : 'bg-surface text-text'}"
          aria-label={t.t("discover.trainerPreset")}
        >
          <UserShield class="size-5" />
        </button>
        <PresetHint />
      </div>
    </div>

    <!-- Card stack -->
    <div
      class="relative flex min-h-0 flex-1 flex-col items-center justify-center px-5"
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
        <div class="relative min-h-0 w-full max-w-md flex-1">
          <!-- Background cards (stacked look) -->
          {#if users[2]}
            <div
              class="absolute inset-0 flex flex-col scale-[0.94] overflow-hidden rounded-3xl bg-surface shadow-md"
            >
              <div
                class="flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center"
              >
                {#if users[2].photos?.[0] ?? users[2].photoURL}
                  <img
                    src={users[2].photos?.[0] ?? users[2].photoURL}
                    alt={users[2].displayName}
                    draggable="false"
                    class="h-full w-full object-cover pointer-events-none"
                  />
                {:else}
                  <User class="size-24 text-primary/40" />
                {/if}
              </div>
            </div>
          {/if}
          {#if users[1]}
            <div
              class="absolute inset-0 flex flex-col scale-[0.97] overflow-hidden rounded-3xl bg-surface shadow-md"
            >
              <div
                class="flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center"
              >
                {#if users[1].photos?.[0] ?? users[1].photoURL}
                  <img
                    src={users[1].photos?.[0] ?? users[1].photoURL}
                    alt={users[1].displayName}
                    draggable="false"
                    class="h-full w-full object-cover pointer-events-none"
                  />
                {:else}
                  <User class="size-24 text-primary/40" />
                {/if}
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
              in:scale={{ start: 0.95, duration: 220, opacity: 1 }}
              style="transform: translateX({currentX}px) rotate({rotation}deg); transition: {dragging
                ? 'none'
                : exiting
                  ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'
                  : 'transform 0.3s'}; touch-action: none;"
              class="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-surface shadow-xl select-none cursor-grab active:cursor-grabbing"
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
                class="relative flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center"
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

                <!-- View profile -->
                <button
                  onpointerdown={(e) => e.stopPropagation()}
                  onclick={(e) => {
                    e.stopPropagation();
                    goto(`/profile/${users[0].uid}`);
                  }}
                  aria-label={t.t("profile.viewProfile")}
                  class="absolute bottom-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm"
                >
                  <Info class="size-5" />
                </button>
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
        </div>

        <!-- Action buttons -->
        <ActionButtons
          class="mt-4"
          onPass={() => swipe("pass")}
          onLike={() => swipe("like")}
          disabled={exiting}
          passLabel={t.t("common.pass")}
          likeLabel={t.t("common.like")}
          onUndo={undoLastPass}
          canUndo={!!lastPass}
          undoLabel={t.t("common.undo")}
          onMessage={handleMessage}
          messageLabel={t.t("common.message")}
        />
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
      <MessageCircle class="size-12 text-primary" />
      <h2 class="text-lg font-black text-text">
        {t.t("profile.messageLockedTitle")}
      </h2>
      <p class="text-sm text-muted">{t.t("profile.messageLockedHint")}</p>
      <button
        onclick={() => (showMessageModal = false)}
        class="mt-2 w-full rounded-2xl bg-primary py-3 font-bold text-white active:scale-95"
      >
        {t.t("common.gotIt")}
      </button>
    </div>
  </div>
{/if}
