<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fly, fade, scale } from "svelte/transition";
  import {
    SlidersHorizontal,
    User,
    X,
    LoaderCircle,
    Moon,
    MapPin,
    Check,
    Zap,
    PartyPopper,
  } from "@lucide/svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import {
    authUser,
    userProfile,
    filterActivity,
    filterFormat,
    filterLevel,
    filterGender,
    filterSexualOrientation,
    filterMinAge,
    filterMaxAge,
    filterMaxDistanceKm,
  } from "$lib/stores/auth";
  import { getDiscoverFeed, recordSwipe } from "$lib/firebase/swipe";
  import {
    ACTIVITIES,
    GENDER_OPTIONS,
    ORIENTATIONS,
    SKILL_LEVEL_OPTIONS,
    DEFAULT_DISTANCE_KM,
    formatLabel,
    type DiscoverFilters,
    type UserProfile,
  } from "$lib/types";
  import { get } from "svelte/store";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import SegmentedControl from "$lib/components/SegmentedControl.svelte";

  const FORMAT_FILTER_OPTIONS = [
    { value: "", label: "All" },
    { value: "1v1", label: "1v1" },
    { value: "2v2", label: "2v2" },
  ] as const;

  const GENDER_FILTER_OPTIONS = [
    { value: "", label: "All" },
    ...GENDER_OPTIONS,
  ] as const;

  const LEVEL_FILTER_OPTIONS = [
    { value: "", label: "All" },
    ...SKILL_LEVEL_OPTIONS,
  ] as const;

  const SEX_FILTER_OPTIONS = [
    { value: "", label: "All" },
    ...ORIENTATIONS,
  ] as const;

  const AGE_MIN = 18;
  const AGE_MAX = 60;

  let users = $state<UserProfile[]>([]);
  let loading = $state(true);
  let matchBanner = $state(false);
  let profileActivities = $derived(
    ACTIVITIES.filter((activity) =>
      $userProfile?.activities?.some(
        (profileActivity) => profileActivity.id === activity.id,
      ),
    ),
  );
  let hasCoords = $derived(
    $userProfile?.lat !== undefined && $userProfile?.lng !== undefined,
  );

  // Draft slider values track drag position live; the underlying filter
  // stores (which trigger the Firestore query) only get updated on release.
  let ageMinDraft = $state(AGE_MIN);
  let ageMaxDraft = $state(AGE_MAX);
  let distanceDraft = $state<number | null>(DEFAULT_DISTANCE_KM);

  $effect(() => {
    ageMinDraft = $filterMinAge ?? AGE_MIN;
  });
  $effect(() => {
    ageMaxDraft = $filterMaxAge ?? AGE_MAX;
  });
  $effect(() => {
    distanceDraft = $filterMaxDistanceKm;
  });

  function updateAgeMinDraft(value: number) {
    ageMinDraft = Math.min(value, ageMaxDraft);
  }

  function updateAgeMaxDraft(value: number) {
    ageMaxDraft = Math.max(value, ageMinDraft);
  }

  function commitAgeMin() {
    filterMinAge.set(ageMinDraft === AGE_MIN ? null : ageMinDraft);
  }

  function commitAgeMax() {
    filterMaxAge.set(ageMaxDraft === AGE_MAX ? null : ageMaxDraft);
  }

  function commitDistance() {
    filterMaxDistanceKm.set(distanceDraft);
  }

  // Backfill coordinates for profiles saved before distance filtering existed —
  // only runs if the browser already granted geolocation, so it never prompts.
  onMount(() => {
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

  let filtersOpen = $state(false);
  // uid for which we've already synced filter stores from Firestore, so we don't redo it on every profile update
  let filtersSyncedFor = $state<string | null>(null);

  function pickActivity(id: string) {
    filterActivity.set(id);
  }

  function applyFilters(filters: DiscoverFilters) {
    filterActivity.set(filters.activity);
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
  }

  async function saveFilters() {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    await userProfile.save(uid, {
      discoverFilters: {
        activity: get(filterActivity),
        format: get(filterFormat),
        level: get(filterLevel),
        gender: get(filterGender),
        orientation: get(filterSexualOrientation),
        minAge: get(filterMinAge),
        maxAge: get(filterMaxAge),
        maxDistanceKm: get(filterMaxDistanceKm),
      },
    });
  }

  function closeFilters() {
    filtersOpen = false;
    saveFilters();
  }

  // Sync filter stores from the saved profile once per user; if none saved yet, open the modal for first-time setup
  $effect(() => {
    const uid = $authUser?.uid;
    const profile = $userProfile;
    if (!uid || !profile || filtersSyncedFor === uid) return;
    filtersSyncedFor = uid;

    if (profile.discoverFilters) {
      applyFilters(profile.discoverFilters);
    } else {
      filtersOpen = true;
    }
  });

  async function loadFeed() {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    loading = true;
    const profile = get(userProfile);
    users = await getDiscoverFeed(
      uid,
      get(filterActivity),
      get(filterFormat),
      get(filterLevel),
      get(filterGender),
      get(filterSexualOrientation),
      get(filterMinAge),
      get(filterMaxAge),
      get(filterMaxDistanceKm),
      { lat: profile?.lat, lng: profile?.lng },
    );
    loading = false;
  }

  // Reload when auth resolves or filters change
  $effect(() => {
    $authUser;
    $userProfile;
    $filterActivity;
    $filterFormat;
    $filterLevel;
    $filterGender;
    $filterSexualOrientation;
    $filterMinAge;
    $filterMaxAge;
    $filterMaxDistanceKm;

    if (
      $filterActivity &&
      !profileActivities.some((activity) => activity.id === $filterActivity)
    ) {
      filterActivity.set("");
      return;
    }

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
    const top = users[0];
    if (!photoEl || !top) return;
    const rect = photoEl.getBoundingClientRect();
    const withinPhoto = e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (withinPhoto) {
      handlePhotoTap(e, rect);
    } else {
      goto(`/profile/${top.uid}`);
    }
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

    const activity = get(filterActivity) || top.activities[0]?.id || "";
    const format = get(filterFormat) || top.activities[0]?.format || "all";

    const [isMatch] = await Promise.all([
      recordSwipe(uid, top.uid, direction, activity, format),
      new Promise((resolve) => setTimeout(resolve, EXIT_DURATION)),
    ]);

    users = users.slice(1);
    currentX = 0;
    exiting = false;

    if (isMatch) {
      matchBanner = true;
      setTimeout(() => (matchBanner = false), 3000);
    }
  }

  let rotation = $derived(
    dragging || exiting ? Math.max(-20, Math.min(20, currentX * 0.08)) : 0,
  );
  let likeOpacity = $derived(Math.max(0, Math.min(1, currentX / 100)));
  let passOpacity = $derived(Math.max(0, Math.min(1, -currentX / 100)));
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-bg pb-22">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 pb-3 pt-5">
    <h1 class="text-2xl font-black text-text">Discover</h1>
    <div class="flex items-center gap-2">
      <button
        onclick={() => (filtersOpen = true)}
        class="flex size-9 items-center justify-center rounded-full bg-surface shadow-sm"
        aria-label="Filters"
      >
        <SlidersHorizontal class="size-5 text-text" />
      </button>
    </div>
  </div>

  <!-- Filters side nav -->
  {#if filtersOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      transition:fade={{ duration: 200 }}
      class="fixed inset-0 z-50 flex justify-end bg-black/40"
      onclick={closeFilters}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        onclick={(e) => e.stopPropagation()}
        transition:fly={{ x: 300, duration: 250, opacity: 1 }}
        class="flex h-full w-full max-w-xs flex-col overflow-y-auto bg-surface p-5"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-black text-text">Filters</h2>
          <button
            onclick={closeFilters}
            class="flex size-8 items-center justify-center rounded-full bg-bg text-muted"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- Format -->
        <p class="mb-2 text-sm font-bold text-muted">Format</p>
        <div class="mb-5">
          <SegmentedControl
            options={FORMAT_FILTER_OPTIONS}
            value={$filterFormat}
            ariaLabel="Format"
            onchange={(value) => filterFormat.set(value)}
          />
        </div>

        <!-- Level -->
        <p class="mb-2 text-sm font-bold text-muted">Level</p>
        <div class="mb-5">
          <SegmentedControl
            options={LEVEL_FILTER_OPTIONS}
            value={$filterLevel}
            ariaLabel="Level"
            onchange={(value) => filterLevel.set(value)}
          />
        </div>

        <!-- Gender -->
        <p class="mb-2 text-sm font-bold text-muted">Gender</p>
        <div class="mb-5">
          <SegmentedControl
            options={GENDER_FILTER_OPTIONS}
            value={$filterGender}
            ariaLabel="Gender"
            onchange={(value) => filterGender.set(value)}
          />
        </div>

        <!-- Sex -->
        <p class="mb-2 text-sm font-bold text-muted">Orientation</p>
        <div class="mb-5">
          <SegmentedControl
            options={SEX_FILTER_OPTIONS}
            value={$filterSexualOrientation}
            ariaLabel="Orientation"
            onchange={(value) => filterSexualOrientation.set(value)}
          />
        </div>

        <!-- Age -->
        <div class="mb-2 flex items-center justify-between">
          <p class="text-sm font-bold text-muted">Age range</p>
          <span class="text-xs font-semibold text-muted"
            >{ageMinDraft} - {ageMaxDraft}</span
          >
        </div>
        <div class="relative mb-5 h-6">
          <div
            class="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border"
          ></div>
          <div
            class="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
            style="left: {((ageMinDraft - AGE_MIN) / (AGE_MAX - AGE_MIN)) *
              100}%; right: {100 -
              ((ageMaxDraft - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100}%;"
          ></div>
          <input
            type="range"
            min={AGE_MIN}
            max={AGE_MAX}
            value={ageMinDraft}
            oninput={(e) =>
              updateAgeMinDraft(
                Number((e.currentTarget as HTMLInputElement).value),
              )}
            onchange={commitAgeMin}
            class="range-thumb absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent accent-primary"
          />
          <input
            type="range"
            min={AGE_MIN}
            max={AGE_MAX}
            value={ageMaxDraft}
            oninput={(e) =>
              updateAgeMaxDraft(
                Number((e.currentTarget as HTMLInputElement).value),
              )}
            onchange={commitAgeMax}
            class="range-thumb absolute inset-x-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent accent-primary"
          />
        </div>

        <!-- Distance -->
        <div class="mb-2 flex items-center justify-between">
          <p class="text-sm font-bold text-muted">Distance</p>
          <span class="text-xs font-semibold text-muted">
            {distanceDraft ? `Within ${distanceDraft} km` : "Any"}
          </span>
        </div>
        <div class="mb-5">
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            disabled={!hasCoords}
            value={distanceDraft ?? 200}
            oninput={(e) => {
              distanceDraft = Number(
                (e.currentTarget as HTMLInputElement).value,
              );
            }}
            onchange={commitDistance}
            class="w-full accent-primary disabled:opacity-40"
          />
          {#if distanceDraft !== null}
            <button
              onclick={() => {
                distanceDraft = null;
                commitDistance();
              }}
              class="mt-1 text-xs font-semibold text-primary"
            >
              Clear
            </button>
          {/if}
          {#if !hasCoords}
            <p class="mt-1 text-xs text-muted">
              Enable location detection in your profile to filter by distance.
            </p>
          {/if}
        </div>

        <!-- Sport -->
        <p class="mb-2 text-sm font-bold text-muted">Sport</p>
        <div class="flex flex-col gap-1">
          <button
            onclick={() => pickActivity("")}
            class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors {$filterActivity ===
            ''
              ? 'bg-primary text-white'
              : 'text-text hover:bg-bg'}"
          >
            All sports
          </button>
          {#each profileActivities as act}
            <button
              onclick={() => pickActivity(act.id)}
              class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors {$filterActivity ===
              act.id
                ? 'bg-primary text-white'
                : 'text-text hover:bg-bg'}"
            >
              <ActivityIcon id={act.id} class="size-4" />
              {act.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Card stack -->
  <div
    class="relative flex min-h-0 flex-1 flex-col items-center justify-center px-5"
  >
    {#if loading}
      <div class="flex flex-col items-center gap-3 text-muted">
        <LoaderCircle class="size-10 animate-spin" />
        <p class="text-sm">Loading players…</p>
      </div>
    {:else if users.length === 0}
      <div class="flex flex-col items-center gap-4 text-center">
        <Moon class="size-16 text-muted" />
        <p class="text-lg font-bold text-text">No more players</p>
        <p class="text-sm text-muted">
          Try changing your filters or check back later
        </p>
        <button
          onclick={loadFeed}
          class="rounded-2xl bg-primary px-6 py-3 font-bold text-white active:scale-95"
        >
          Refresh
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
              class="flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
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
              class="flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
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
            <div class="shrink-0 p-5">
              <div class="flex items-baseline gap-2">
                <h3 class="text-xl font-black text-text">
                  {users[1].displayName}
                </h3>
                {#if users[1].age}
                  <span class="text-sm text-muted">{users[1].age}</span>
                {/if}
              </div>
            </div>
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
            in:scale={{ start: 0.95, duration: 220, opacity: 0.6 }}
            style="transform: translateX({currentX}px) rotate({rotation}deg); transition: {dragging
              ? 'none'
              : exiting
                ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'transform 0.3s'}; touch-action: none;"
            class="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-surface shadow-xl select-none cursor-grab active:cursor-grabbing"
          >
            <!-- Photo progress segments (Tinder-style tap navigation) -->
            {#if currentPhotos.length > 1}
              <div class="absolute inset-x-12 top-6 z-10 flex gap-1">
                {#each currentPhotos as _, i}
                  <div
                    class="h-1 flex-1 overflow-hidden rounded-full bg-white/40"
                  >
                    <div
                      class="h-full rounded-full bg-white"
                      style="width: {i <= photoIndex ? '100%' : '0%'}"
                    ></div>
                  </div>
                {/each}
              </div>
            {/if}

            <!-- Profile image area (fills remaining vertical space) -->
            <div
              bind:this={photoEl}
              class="flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
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
            <div class="shrink-0 p-5">
              <div class="flex items-baseline gap-2">
                <h3 class="text-xl font-black text-text">
                  {users[0].displayName}
                </h3>
                {#if users[0].age}
                  <span class="text-sm text-muted">{users[0].age}</span>
                {/if}
                {#if users[0].city}
                  <span class="flex items-center gap-0.5 text-sm text-muted">
                    <MapPin class="size-3.5" />
                    {users[0].city}
                  </span>
                {/if}
              </div>
              {#if users[0].bio}
                <p class="mt-1 text-sm text-muted text-balance">
                  {users[0].bio}
                </p>
              {/if}
              <div class="mt-3 flex flex-wrap gap-2">
                {#each (users[0].activities ?? []).slice(0, 4) as act}
                  {@const info = ACTIVITIES.find((a) => a.id === act.id)}
                  <span
                    class="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    <ActivityIcon id={act.id} class="size-3.5" />
                    {info?.label ?? act.id}
                  </span>
                {/each}
              </div>
            </div>
          </div>
        {/key}
      </div>

      <!-- Action buttons -->
      <div class="mt-4 flex shrink-0 gap-6">
        <button
          onclick={() => swipe("pass")}
          disabled={exiting}
          class="flex size-16 items-center justify-center rounded-full bg-surface text-3xl shadow-lg transition-transform active:scale-90 disabled:opacity-50"
        >
          <X class="size-7 text-error" />
        </button>
        <button
          onclick={() => swipe("like")}
          disabled={exiting}
          class="flex size-16 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-lg transition-transform active:scale-90 disabled:opacity-50"
        >
          <Zap class="size-7" />
        </button>
      </div>
    {/if}
  </div>

  <!-- Match banner -->
  {#if matchBanner}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        class="flex flex-col items-center gap-4 rounded-3xl bg-surface p-10 shadow-2xl text-center mx-6"
      >
        <PartyPopper class="size-16 text-primary" />
        <h2 class="text-3xl font-black text-primary">It's a Match!</h2>
        <p class="text-muted">You can now chat and plan your session!</p>
        <div class="flex gap-3 w-full">
          <button
            onclick={() => (matchBanner = false)}
            class="flex-1 rounded-2xl border-2 border-border py-3 font-semibold text-text"
          >
            Keep swiping
          </button>
          <a
            href="/matches"
            class="flex-1 rounded-2xl bg-primary py-3 text-center font-bold text-white"
          >
            View matches
          </a>
        </div>
      </div>
    </div>
  {/if}

  <BottomNav active="discover" />
</div>

<style>
  /* Two overlapping range inputs form one dual-thumb slider; only the thumbs
     should capture pointer events so clicks pass through to the top-most track. */
  .range-thumb {
    pointer-events: none;
  }
  .range-thumb::-webkit-slider-thumb {
    pointer-events: auto;
  }
  .range-thumb::-moz-range-thumb {
    pointer-events: auto;
  }
</style>
