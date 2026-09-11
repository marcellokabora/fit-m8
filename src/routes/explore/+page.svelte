<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import {
    AlertTriangle,
    LocateFixed,
    Plus,
    SlidersHorizontal,
    Users,
    X,
  } from "@lucide/svelte";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    subscribeActiveCheckins,
    subscribeJoinRequests,
    startCheckin,
    endCheckin,
  } from "$lib/firebase/checkins";
  import {
    BARCELONA_LAT,
    BARCELONA_LNG,
    distanceKm,
    getCurrentCoords,
  } from "$lib/location";
  import {
    DEFAULT_DISTANCE_KM,
    type Checkin,
    type CheckinJoinRequest,
    type MapMarker,
  } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import GoogleMap from "$lib/components/GoogleMap.svelte";
  import CheckinSheet from "$lib/components/CheckinSheet.svelte";
  import MapFilterSheet from "$lib/components/MapFilterSheet.svelte";
  import MarkerInfoSheet from "$lib/components/MarkerInfoSheet.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let checkins = $state<Checkin[]>([]);
  let showCheckinSheet = $state(false);
  let showMarkerSheet = $state(false);
  let showFilterSheet = $state(false);
  // empty means "show all" — otherwise only these of the user's own sports are shown on the map
  let filterActivityIds = $state<string[]>([]);
  let selectedCheckin = $state<Checkin | null>(null);
  let myJoinRequests = $state<CheckinJoinRequest[]>([]);
  let confirmEndCheckin = $state(false);
  let ending = $state(false);

  let myUid = $derived($authUser?.uid ?? "");
  let myActivityIds = $derived(
    $userProfile?.activities?.map((a) => a.id) ?? [],
  );
  let myCheckin = $derived(checkins.find((c) => c.uid === myUid) ?? null);
  let joinedCount = $derived(
    myJoinRequests.filter((request) => request.status === "accepted").length,
  );
  let pendingCount = $derived(
    myJoinRequests.filter((request) => request.status === "pending").length,
  );
  let myLocation = $state<{ lat: number; lng: number } | null>(null);
  let locationResolved = $state(false);
  let isMadridTestLocation = $derived(
    dev && page.url.searchParams.get("testLocation") === "madrid",
  );

  $effect(() => {
    const checkinUid = myCheckin?.uid;
    if (!checkinUid) {
      myJoinRequests = [];
      return;
    }
    return subscribeJoinRequests(checkinUid, (next) => (myJoinRequests = next));
  });

  let mapCenter = $derived(
    myLocation ?? {
      lat: $userProfile?.lat ?? BARCELONA_LAT,
      lng: $userProfile?.lng ?? BARCELONA_LNG,
    },
  );

  let nearbyCheckins = $derived(
    locationResolved
      ? checkins.filter(
          (checkin) =>
            distanceKm(
              mapCenter.lat,
              mapCenter.lng,
              checkin.lat,
              checkin.lng,
            ) <= DEFAULT_DISTANCE_KM,
        )
      : [],
  );
  // Only sports with a nearby active check-in are offered as map filters.
  let availableActivityIds = $derived([
    ...new Set(nearbyCheckins.map((checkin) => checkin.activityId)),
  ]);

  let markers = $derived<MapMarker[]>(
    nearbyCheckins
      .filter(
        (c) =>
          filterActivityIds.length === 0 ||
          filterActivityIds.includes(c.activityId),
      )
      .map((c) => ({
        id: c.uid,
        lat: c.lat,
        lng: c.lng,
        activityId: c.activityId,
        isSelf: c.uid === myUid,
      })),
  );

  let unsubscribe: (() => void) | null = null;
  let mapRef = $state<{
    recenter: (coords: { lat: number; lng: number }) => void;
  }>();

  function getMapCoords() {
    if (isMadridTestLocation) {
      return Promise.resolve({ lat: 40.4168, lng: -3.7038 });
    }
    return getCurrentCoords();
  }

  function updateMyLocation(recenterMap: boolean) {
    return getMapCoords()
      .then((coords) => {
        myLocation = coords;
        if (recenterMap) mapRef?.recenter(coords);
      })
      .catch((err) => {
        // permission denied/unsupported — map just falls back to the profile/Barcelona center
        console.error("Failed to get current location:", err);
      })
      .finally(() => {
        locationResolved = true;
      });
  }

  // Fetch a fresh fix when tapped rather than reusing a potentially stale location.
  function locateMe() {
    return updateMyLocation(true);
  }

  onMount(() => {
    unsubscribe = subscribeActiveCheckins((next) => (checkins = next));
    updateMyLocation(true);
  });
  onDestroy(() => unsubscribe?.());

  function handleMarkerClick(id: string) {
    const checkin = checkins.find((c) => c.uid === id);
    if (!checkin) return;
    selectedCheckin = checkin;
    showMarkerSheet = true;
  }

  async function handleCheckin(
    activityId: string,
    lat: number,
    lng: number,
    durationHours: number,
  ) {
    if (!$userProfile) return;
    await startCheckin($userProfile, activityId, lat, lng, durationHours);
  }

  async function handleEndCheckin() {
    if (!myUid || ending) return;
    ending = true;
    try {
      await endCheckin(myUid);
      confirmEndCheckin = false;
    } catch (err) {
      console.error("Failed to end check-in:", err);
    } finally {
      ending = false;
    }
  }
</script>

<div class="relative flex min-h-dvh flex-1 flex-col bg-bg">
  <div class="relative flex-1">
    <GoogleMap
      bind:this={mapRef}
      center={mapCenter}
      {markers}
      userLocation={myLocation}
      fitToMarkers
      onMarkerClick={handleMarkerClick}
      class="absolute inset-0"
    />

    <button
      type="button"
      onclick={locateMe}
      aria-label={t.t("explore.recenter")}
      class="absolute bottom-24 left-4 z-10 flex size-11 items-center justify-center rounded-full border-2 border-text/40 bg-surface text-primary shadow-xl active:scale-95"
    >
      <LocateFixed class="size-5" />
    </button>

    <button
      type="button"
      onclick={() => (showFilterSheet = true)}
      aria-label={t.t("explore.filterButton")}
      class="absolute bottom-24 left-20 z-10 flex size-11 items-center justify-center rounded-full border-2 shadow-xl active:scale-95 {filterActivityIds.length >
      0
        ? 'border-text/60 bg-primary text-white'
        : 'border-text/40 bg-surface text-primary'}"
    >
      <SlidersHorizontal class="size-5" />
    </button>

    {#if myCheckin}
      <div
        class="absolute inset-x-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 rounded-2xl bg-surface/95 p-3 shadow-xl backdrop-blur"
      >
        <button
          type="button"
          onclick={() => {
            selectedCheckin = myCheckin;
            showMarkerSheet = true;
          }}
          class="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <ActivityIcon id={myCheckin.activityId} class="size-5" />
          </span>
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <span class="min-w-0 flex-1 truncate text-sm font-bold text-text">
              {t.activity(myCheckin.activityId)}
            </span>
            <span
              class="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted"
            >
              <Users class="size-3.5" aria-hidden="true" />
              <span aria-hidden="true">
                {joinedCount}/{joinedCount + pendingCount}
              </span>
              <span class="sr-only">
                {t.t("explore.joinedCount", { count: joinedCount })}.
                {t.t("explore.pendingCount", { count: pendingCount })}.
              </span>
            </span>
          </span>
        </button>
        <button
          type="button"
          onclick={() => (confirmEndCheckin = true)}
          disabled={ending}
          aria-label={t.t("explore.endCheckin")}
          class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-border text-text active:scale-95 disabled:opacity-40"
        >
          <X class="size-5" />
        </button>
      </div>
    {:else}
      <button
        type="button"
        onclick={() => (showCheckinSheet = true)}
        aria-label={t.t("explore.checkInCta")}
        class="absolute bottom-24 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95"
      >
        <Plus class="size-6" />
      </button>
    {/if}
  </div>

  <BottomNav active="explore" />
</div>

{#if confirmEndCheckin}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-center justify-center bg-black/60 px-6 backdrop-blur-sm md:max-w-md"
  >
    <div
      class="flex w-full flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-event-title"
    >
      <AlertTriangle class="size-12 text-error" />
      <h2 id="end-event-title" class="text-lg font-black text-text">
        {t.t("explore.endCheckinTitle")}
      </h2>
      <p class="text-sm text-muted">{t.t("explore.endCheckinHint")}</p>
      <div class="flex w-full gap-3">
        <button
          type="button"
          onclick={() => (confirmEndCheckin = false)}
          disabled={ending}
          class="flex-1 rounded-2xl border-2 border-border py-3 text-xs font-semibold text-text active:scale-95 disabled:opacity-50"
        >
          {t.t("common.cancel")}
        </button>
        <button
          type="button"
          onclick={handleEndCheckin}
          disabled={ending}
          class="flex-1 rounded-2xl bg-error py-3 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {ending ? t.t("common.loading") : t.t("explore.endCheckinConfirm")}
        </button>
      </div>
    </div>
  </div>
{/if}

<CheckinSheet
  bind:open={showCheckinSheet}
  {myActivityIds}
  onCheckin={handleCheckin}
/>

<MapFilterSheet
  bind:open={showFilterSheet}
  {myActivityIds}
  {availableActivityIds}
  selectedIds={filterActivityIds}
  onApply={(ids) => (filterActivityIds = ids)}
/>

<MarkerInfoSheet bind:open={showMarkerSheet} checkin={selectedCheckin} />
