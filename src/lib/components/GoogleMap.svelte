<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
  import { PUBLIC_GOOGLE_MAPS_API_KEY } from "$env/static/public";
  import { ACTIVITIES, type MapMarker } from "$lib/types";

  let {
    center,
    zoom = 15,
    markers = [],
    userLocation = null,
    onMarkerClick,
    class: className = "",
  }: {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: MapMarker[];
    // the device's actual current position — rendered as a distinct "you are here" dot,
    // separate from any check-in marker
    userLocation?: { lat: number; lng: number } | null;
    onMarkerClick?: (id: string) => void;
    class?: string;
  } = $props();

  let mapDiv = $state<HTMLDivElement>();
  let map: google.maps.Map | undefined;
  let MarkerCtor: typeof google.maps.Marker | undefined;
  let userMarker: google.maps.Marker | undefined;
  // set if recenter() is called before the map has finished loading, applied once it's ready
  let pendingRecenter: { lat: number; lng: number } | null = null;
  const gMarkers = new Map<string, google.maps.Marker>();
  const emojiById = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a.emoji]));

  // Imperatively pans the map to the given coordinates — exposed via bind:this so callers
  // (e.g. a "locate me" button) can recenter on demand without relying on prop reactivity.
  export function recenter(coords: { lat: number; lng: number }) {
    if (map) {
      map.panTo(coords);
    } else {
      pendingRecenter = coords;
    }
  }

  function userLocationIcon(): google.maps.Icon {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="7" fill="#4285F4" stroke="white" stroke-width="3"/></svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12),
    };
  }

  function iconFor(activityId: string, isSelf?: boolean): google.maps.Icon {
    const emoji = emojiById[activityId] ?? "📍";
    const fill = isSelf ? "#f97316" : "#16a34a";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42"><circle cx="21" cy="21" r="18" fill="${fill}" stroke="white" stroke-width="3"/><text x="21" y="28" font-size="18" text-anchor="middle">${emoji}</text></svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(42, 42),
      anchor: new google.maps.Point(21, 21),
    };
  }

  function renderUserLocation() {
    if (!map || !MarkerCtor) return;
    if (!userLocation) {
      userMarker?.setMap(null);
      userMarker = undefined;
      return;
    }
    if (!userMarker) {
      userMarker = new MarkerCtor({
        position: userLocation,
        map,
        icon: userLocationIcon(),
        zIndex: 20,
        clickable: false,
      });
    } else {
      userMarker.setPosition(userLocation);
    }
  }

  function renderMarkers() {
    if (!map || !MarkerCtor) return;
    const ids = new Set(markers.map((m) => m.id));
    for (const [id, marker] of gMarkers) {
      if (!ids.has(id)) {
        marker.setMap(null);
        gMarkers.delete(id);
      }
    }
    for (const m of markers) {
      const position = { lat: m.lat, lng: m.lng };
      let marker = gMarkers.get(m.id);
      if (!marker) {
        marker = new MarkerCtor({
          position,
          map,
          icon: iconFor(m.activityId, m.isSelf),
          zIndex: m.isSelf ? 10 : 1,
        });
        marker.addListener("click", () => onMarkerClick?.(m.id));
        gMarkers.set(m.id, marker);
      } else {
        marker.setPosition(position);
        marker.setIcon(iconFor(m.activityId, m.isSelf));
      }
    }
  }

  onMount(() => {
    let cancelled = false;
    setOptions({ key: PUBLIC_GOOGLE_MAPS_API_KEY, v: "weekly" });
    Promise.all([importLibrary("maps"), importLibrary("marker")]).then(
      ([{ Map }, { Marker }]) => {
        if (cancelled || !mapDiv) return;
        MarkerCtor = Marker;
        map = new Map(mapDiv, {
          center,
          zoom,
          disableDefaultUI: true,
          clickableIcons: false,
        });
        if (pendingRecenter) {
          map.panTo(pendingRecenter);
          pendingRecenter = null;
        }
        renderMarkers();
        renderUserLocation();
      },
    );
    return () => {
      cancelled = true;
    };
  });

  onDestroy(() => {
    for (const marker of gMarkers.values()) marker.setMap(null);
    gMarkers.clear();
    userMarker?.setMap(null);
  });

  $effect(() => {
    markers;
    renderMarkers();
  });

  $effect(() => {
    userLocation;
    renderUserLocation();
  });
</script>

<!-- isolate: Google Maps injects internal panes with very high z-indices (e.g. controls) —
     without a stacking context boundary here, those would bleed above sibling UI like the
     bottom nav/FAB instead of staying contained within the map itself. -->
<div bind:this={mapDiv} class="isolate h-full w-full {className}"></div>
