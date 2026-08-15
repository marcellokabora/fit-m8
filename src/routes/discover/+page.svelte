<script lang="ts">
  import { fly, fade } from "svelte/transition";
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
    filterGender,
    filterSexualOrientation,
  } from "$lib/stores/auth";
  import { getDiscoverFeed, recordSwipe } from "$lib/firebase/swipe";
  import {
    ACTIVITIES,
    SEXUAL_ORIENTATIONS,
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
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ] as const;

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

  // Swipe state
  let cardEl = $state<HTMLDivElement | null>(null);
  let startX = $state(0);
  let currentX = $state(0);
  let dragging = $state(false);

  let filtersOpen = $state(false);

  function pickActivity(id: string) {
    filterActivity.set(id);
  }

  async function loadFeed() {
    const uid = get(authUser)?.uid;
    if (!uid) return;
    loading = true;
    users = await getDiscoverFeed(
      uid,
      get(filterActivity),
      get(filterFormat),
      get(filterGender),
      get(filterSexualOrientation),
    );
    loading = false;
  }

  // Reload when auth resolves or filters change
  $effect(() => {
    $authUser;
    $userProfile;
    $filterActivity;
    $filterFormat;
    $filterGender;
    $filterSexualOrientation;

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
    dragging = true;
    startX = e.clientX;
    currentX = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    currentX = e.clientX - startX;
  }

  async function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    const THRESHOLD = 80;
    if (Math.abs(currentX) < THRESHOLD) {
      currentX = 0;
      return;
    }
    const direction = currentX > 0 ? "like" : "pass";
    try {
      await swipe(direction);
    } finally {
      currentX = 0;
    }
  }

  async function swipe(direction: "like" | "pass") {
    const uid = get(authUser)?.uid;
    const top = users[0];
    if (!uid || !top) return;

    const activity = get(filterActivity) || top.activities[0]?.id || "";
    const format = get(filterFormat) || top.activities[0]?.format || "1v1";

    const isMatch = await recordSwipe(
      uid,
      top.uid,
      direction,
      activity,
      format,
    );
    users = users.slice(1);

    if (isMatch) {
      matchBanner = true;
      setTimeout(() => (matchBanner = false), 3000);
    }
  }

  let rotation = $derived(dragging ? currentX * 0.08 : 0);
  let likeOpacity = $derived(Math.max(0, Math.min(1, currentX / 100)));
  let passOpacity = $derived(Math.max(0, Math.min(1, -currentX / 100)));
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-bg pb-20">
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
      <a
        href="/profile"
        class="flex size-9 items-center justify-center rounded-full bg-surface shadow-sm"
      >
        <User class="size-5 text-text" />
      </a>
    </div>
  </div>

  <!-- Filters side nav -->
  {#if filtersOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      transition:fade={{ duration: 200 }}
      class="fixed inset-0 z-50 flex justify-end bg-black/40"
      onclick={() => (filtersOpen = false)}
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
            onclick={() => (filtersOpen = false)}
            class="flex size-8 items-center justify-center rounded-full bg-bg text-muted"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- Format -->
        <p class="mb-2 text-sm font-bold text-muted">Players</p>
        <div class="mb-5">
          <SegmentedControl
            options={FORMAT_FILTER_OPTIONS}
            value={$filterFormat}
            ariaLabel="Players"
            onchange={(value) => filterFormat.set(value)}
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

        <!-- Sexual orientation -->
        <p class="mb-2 text-sm font-bold text-muted">Sexual orientation</p>
        <div class="mb-5">
          <SegmentedControl
            options={SEXUAL_ORIENTATIONS}
            value={$filterSexualOrientation}
            ariaLabel="Sexual orientation"
            onchange={(value) => filterSexualOrientation.set(value)}
          />
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
  <div class="relative flex flex-1 flex-col items-center justify-center px-5">
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
      <div class="relative w-full max-h-[520px] aspect-[3/4]">
        <!-- Background cards (stacked look) -->
        {#if users[2]}
          <div
            class="absolute inset-0 flex flex-col scale-[0.94] overflow-hidden rounded-3xl bg-surface shadow-md"
          >
            <div
              class="flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
            >
              {#if users[2].photoURL}
                <img
                  src={users[2].photoURL}
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
              {#if users[1].photoURL}
                <img
                  src={users[1].photoURL}
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
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          bind:this={cardEl}
          onpointerdown={onPointerDown}
          onpointermove={onPointerMove}
          onpointerup={onPointerUp}
          onpointercancel={onPointerUp}
          style="transform: translateX({currentX}px) rotate({rotation}deg); transition: {dragging
            ? 'none'
            : 'transform 0.3s'}; touch-action: none;"
          class="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-surface shadow-xl select-none cursor-grab active:cursor-grabbing"
        >
          <!-- Profile image area (fills remaining vertical space) -->
          <div
            class="flex-1 min-h-0 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
          >
            {#if users[0].photoURL}
              <img
                src={users[0].photoURL}
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
              <p class="mt-1 text-sm text-muted">{users[0].bio}</p>
            {/if}
            <div class="mt-3 flex flex-wrap gap-2">
              {#each users[0].activities ?? [] as act}
                {@const info = ACTIVITIES.find((a) => a.id === act.id)}
                <span
                  class="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  <ActivityIcon id={act.id} class="size-3.5" />
                  {info?.label ?? act.id} · {act.format} · {act.level}
                </span>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="mt-6 flex gap-6">
        <button
          onclick={() => swipe("pass")}
          class="flex size-16 items-center justify-center rounded-full bg-surface text-3xl shadow-lg active:scale-90 transition-transform"
        >
          <X class="size-7 text-error" />
        </button>
        <button
          onclick={() => swipe("like")}
          class="flex size-16 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-lg active:scale-90 transition-transform"
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
