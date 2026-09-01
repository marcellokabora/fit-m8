<script lang="ts">
  import { MapPin, Loader2, Pencil } from "@lucide/svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";
  import {
    BARCELONA_LAT,
    BARCELONA_LNG,
    isBarcelonaCityName,
  } from "$lib/location";

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

  // Primary provider, no API key required.
  async function reverseGeocodeBigDataCloud(lat: number, lon: number) {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (!res.ok) throw new Error("bigdatacloud lookup failed");
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || "";
  }

  // Fallback provider used if the primary API is down or unreachable.
  async function reverseGeocodeNominatim(lat: number, lon: number) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("nominatim lookup failed");
    const data = await res.json();
    const addr = data.address ?? {};
    return addr.city || addr.town || addr.village || addr.county || "";
  }

  async function detect() {
    error = "";
    manualEntry = false;
    if (!("geolocation" in navigator)) {
      error = t.t("location.unsupported");
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
      let detected = "";
      try {
        detected = await reverseGeocodeBigDataCloud(latitude, longitude);
      } catch {
        detected = await reverseGeocodeNominatim(latitude, longitude);
      }
      if (!detected) throw new Error(t.t("location.resolveFailed"));
      city = detected;
      lat = latitude;
      lng = longitude;
    } catch (err: any) {
      error =
        err.code === 1 ? t.t("location.denied") : t.t("location.detectFailed");
      // geolocation unavailable/denied — ask the user to confirm their city instead of guessing it
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
  }

  function saveManualCity() {
    const trimmed = manualCity.trim();
    if (!trimmed) return;
    city = trimmed;
    // No real coordinates for manual entry — only give it a location fix when it's Barcelona,
    // so the app's Barcelona-only restriction can't be bypassed by typing any city name.
    if (isBarcelonaCityName(trimmed)) {
      lat = BARCELONA_LAT;
      lng = BARCELONA_LNG;
    } else {
      lat = undefined;
      lng = undefined;
    }
    manualEntry = false;
  }
</script>

<div class="flex flex-1 flex-col gap-2">
  {#if manualEntry}
    <div class="flex items-center gap-2">
      <input
        type="text"
        bind:value={manualCity}
        placeholder={t.t("location.enterCity")}
        maxlength="80"
        onkeydown={(e) => e.key === "Enter" && saveManualCity()}
        class="flex-1 rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base font-semibold text-text placeholder:text-text/40 focus:border-primary focus:outline-none"
      />
      <button
        type="button"
        onclick={saveManualCity}
        disabled={!manualCity.trim()}
        class="shrink-0 rounded-2xl bg-primary px-4 py-4 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
      >
        {t.t("common.save")}
      </button>
    </div>
  {:else if city}
    <div
      class="flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-4 py-4"
    >
      <MapPin class="size-5 shrink-0 text-primary" />
      <span class="flex-1 truncate text-base font-semibold text-text"
        >{city}</span
      >
      <button
        type="button"
        onclick={startManualEntry}
        class="shrink-0 text-primary"
        aria-label={t.t("location.editCity")}
      >
        <Pencil class="size-4" />
      </button>
      <button
        type="button"
        onclick={detect}
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
