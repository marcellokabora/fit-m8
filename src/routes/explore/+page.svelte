<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { LocateFixed, Plus } from "@lucide/svelte";
  import { authUser, userProfile } from "$lib/stores/auth";
  import {
    subscribeActiveCheckins,
    startCheckin,
    endCheckin,
  } from "$lib/firebase/checkins";
  import {
    BARCELONA_LAT,
    BARCELONA_LNG,
    getCurrentCoords,
  } from "$lib/location";
  import type { Checkin, MapMarker } from "$lib/types";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import GoogleMap from "$lib/components/GoogleMap.svelte";
  import CheckinSheet from "$lib/components/CheckinSheet.svelte";
  import MarkerInfoSheet from "$lib/components/MarkerInfoSheet.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let checkins = $state<Checkin[]>([]);
  let showCheckinSheet = $state(false);
  let showMarkerSheet = $state(false);
  let selectedCheckin = $state<Checkin | null>(null);
  let ending = $state(false);

  let myUid = $derived($authUser?.uid ?? "");
  let myCheckin = $derived(checkins.find((c) => c.uid === myUid) ?? null);
  let myLocation = $state<{ lat: number; lng: number } | null>(null);

  let mapCenter = $derived(
    myLocation ?? {
      lat: $userProfile?.lat ?? BARCELONA_LAT,
      lng: $userProfile?.lng ?? BARCELONA_LNG,
    },
  );

  let markers = $derived<MapMarker[]>(
    checkins.map((c) => ({
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

  // Also used by the recenter button — fetches a fresh fix each time rather than reusing a
  // stale one, since the device (and the map's own pan position) may have moved since.
  function locateMe() {
    return getCurrentCoords()
      .then((coords) => {
        myLocation = coords;
        mapRef?.recenter(coords);
      })
      .catch((err) => {
        // permission denied/unsupported — map just falls back to the profile/Barcelona center
        console.error("Failed to get current location:", err);
      });
  }

  onMount(() => {
    unsubscribe = subscribeActiveCheckins((next) => (checkins = next));
    locateMe();
  });
  onDestroy(() => unsubscribe?.());

  function handleMarkerClick(id: string) {
    // own status is shown via the top pill instead of the tap-to-message sheet
    if (id === myUid) return;
    const checkin = checkins.find((c) => c.uid === id);
    if (!checkin) return;
    selectedCheckin = checkin;
    showMarkerSheet = true;
  }

  async function handleCheckin(
    activityId: string,
    lat: number,
    lng: number,
    message: string,
  ) {
    if (!$userProfile) return;
    await startCheckin($userProfile, activityId, lat, lng, message);
  }

  async function handleEndCheckin() {
    if (!myUid || ending) return;
    ending = true;
    await endCheckin(myUid);
    ending = false;
  }
</script>

<div class="relative flex min-h-dvh flex-1 flex-col bg-bg">
  <div class="relative flex-1">
    <GoogleMap
      bind:this={mapRef}
      center={mapCenter}
      {markers}
      userLocation={myLocation}
      onMarkerClick={handleMarkerClick}
      class="absolute inset-0"
    />

    <button
      type="button"
      onclick={locateMe}
      aria-label={t.t("explore.recenter")}
      class="absolute bottom-24 left-4 z-10 flex size-11 items-center justify-center rounded-full bg-surface text-primary shadow-lg active:scale-95"
    >
      <LocateFixed class="size-5" />
    </button>

    {#if myCheckin}
      <div
        class="absolute inset-x-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 rounded-2xl bg-surface/95 p-3 shadow-lg backdrop-blur"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <ActivityIcon id={myCheckin.activityId} class="size-5" />
        </span>
        <span class="flex-1 truncate text-sm font-bold text-text">
          {t.t("explore.checkedInAs", {
            activity: t.activity(myCheckin.activityId),
          })}
        </span>
        <button
          type="button"
          onclick={handleEndCheckin}
          disabled={ending}
          class="shrink-0 rounded-xl border-2 border-border px-3 py-2 text-xs font-bold text-text active:scale-95 disabled:opacity-40"
        >
          {t.t("explore.endCheckin")}
        </button>
      </div>
    {:else}
      <button
        type="button"
        onclick={() => (showCheckinSheet = true)}
        class="absolute bottom-24 right-4 z-10 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white shadow-lg active:scale-95"
      >
        <Plus class="size-5" />
        {t.t("explore.checkInCta")}
      </button>
    {/if}
  </div>

  <BottomNav active="explore" />
</div>

<CheckinSheet
  bind:open={showCheckinSheet}
  myActivityIds={$userProfile?.activities?.map((a) => a.id) ?? []}
  onCheckin={handleCheckin}
/>

<MarkerInfoSheet bind:open={showMarkerSheet} checkin={selectedCheckin} />
