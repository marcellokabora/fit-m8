<script lang="ts">
  import { MapPin, Loader2, Pencil } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let {
    city = $bindable(""),
    lat = $bindable<number | undefined>(undefined),
    lng = $bindable<number | undefined>(undefined),
  }: {
    city?: string;
    lat?: number;
    lng?: number;
  } = $props();

  let locating = $state(false);
  let error = $state("");
  let manualEntry = $state(false);
  let manualCity = $state("");
  let suggestions = $state<{ display: string; lat: number; lng: number }[]>([]);
  let searching = $state(false);
  // guards against a slower, stale request overwriting a faster, newer one
  let searchId = 0;

  // Single provider, no API key required.
  async function reverseGeocode(lat: number, lon: number) {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (!res.ok) throw new Error("reverse geocode lookup failed");
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || "";
  }

  // Forward geocode: looks up candidate locations for a manually-typed query so the user
  // can pick the exact match (city names alone are often ambiguous - many cities share a name).
  async function forwardGeocode(query: string) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&limit=5`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return [];
    const results = await res.json();
    return (results ?? []).map((result: any) => ({
      display: result.display_name as string,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }));
  }

  async function detect() {
    error = "";
    manualEntry = false;
    if (!("geolocation" in navigator)) {
      error = t.t("location.unsupported");
      manualCity = city;
      manualEntry = true;
      return;
    }

    locating = true;
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          }),
      );
      const { latitude, longitude } = position.coords;
      const detected = await reverseGeocode(latitude, longitude);
      if (!detected) throw new Error(t.t("location.resolveFailed"));
      city = detected;
      lat = latitude;
      lng = longitude;
    } catch (err: any) {
      // any failure here - permission denied, timeout, or a reverse-geocode error -
      // falls back to asking the user to type their city in themselves
      error =
        err.code === 1 ? t.t("location.denied") : t.t("location.detectFailed");
      manualCity = city;
      manualEntry = true;
    } finally {
      locating = false;
    }
  }

  function startManualEntry() {
    error = "";
    manualCity = city;
    manualEntry = true;
    suggestions = [];
  }

  // debounced search: waits for a pause in typing, then looks up matching places
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  function queueSearch() {
    clearTimeout(searchTimer);
    const query = manualCity.trim();
    if (query.length < 3) {
      suggestions = [];
      searching = false;
      return;
    }
    searching = true;
    searchTimer = setTimeout(async () => {
      const id = ++searchId;
      const results = await forwardGeocode(query);
      if (id !== searchId) return; // a newer search superseded this one
      suggestions = results;
      searching = false;
    }, 400);
  }

  function selectSuggestion(suggestion: {
    display: string;
    lat: number;
    lng: number;
  }) {
    // the dropdown shows the full display name to disambiguate; only the leading
    // place name (e.g. "Rome" out of "Rome, Roma Capitale, Lazio, Italy") is saved
    city = suggestion.display.split(",")[0].trim();
    lat = suggestion.lat;
    lng = suggestion.lng;
    manualEntry = false;
    suggestions = [];
  }
</script>

<div class="flex flex-1 flex-col gap-2">
  {#if manualEntry}
    <div class="relative flex flex-col gap-2">
      <input
        type="text"
        bind:value={manualCity}
        oninput={queueSearch}
        placeholder={t.t("location.enterCity")}
        maxlength="80"
        class="w-full rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base font-semibold text-text placeholder:text-text/40 focus:border-primary focus:outline-none"
      />
      {#if searching}
        <p class="flex items-center gap-2 px-1 text-xs font-medium text-muted">
          <Loader2 class="size-3.5 animate-spin" />
          {t.t("location.searching")}
        </p>
      {:else if suggestions.length > 0}
        <ul
          class="flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-surface"
        >
          <li class="px-4 pt-3 text-xs font-semibold text-muted">
            {t.t("location.selectMatch")}
          </li>
          {#each suggestions as suggestion}
            <li>
              <button
                type="button"
                onclick={() => selectSuggestion(suggestion)}
                class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text hover:bg-primary/10"
              >
                <MapPin class="size-4 shrink-0 text-primary" />
                <span class="truncate">{suggestion.display}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else if manualCity.trim().length >= 3}
        <p class="px-1 text-xs font-medium text-muted">
          {t.t("location.noMatches")}
        </p>
      {/if}
    </div>
  {:else if city}
    <div
      role="button"
      tabindex="0"
      aria-label={t.t("location.editCity")}
      onclick={startManualEntry}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startManualEntry();
        }
      }}
      class="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-4 py-4"
    >
      <MapPin class="size-5 shrink-0 text-primary" />
      <span class="flex-1 truncate text-base font-semibold text-text"
        >{city}</span
      >
      <span class="shrink-0 text-primary" aria-hidden="true">
        <Pencil class="size-4" />
      </span>
      <button
        type="button"
        onclick={(e) => {
          e.stopPropagation();
          detect();
        }}
        disabled={locating}
        class="shrink-0 text-xs font-bold uppercase tracking-wide text-primary disabled:opacity-40"
      >
        <!-- {#if locating}
          <Loader2 class="size-4 animate-spin" />
        {:else}
          {t.t("common.refresh")}
        {/if} -->
      </button>
    </div>
  {:else}
    <button
      type="button"
      onclick={detect}
      disabled={locating}
      class="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface px-4 py-4 text-sm font-semibold text-primary transition-colors active:scale-95 disabled:opacity-40"
    >
      {#if locating}
        <Loader2 class="size-5 animate-spin" />
        {t.t("location.detecting")}
      {:else}
        <MapPin class="size-5" />
        {t.t("location.useMyLocation")}
      {/if}
    </button>
  {/if}
  {#if error}
    <p class="text-xs font-medium text-red-500">{error}</p>
  {/if}
</div>
