<script lang="ts">
  import { MapPin, Loader2 } from "@lucide/svelte";

  let { city = $bindable("") }: { city?: string } = $props();

  let locating = $state(false);
  let error = $state("");

  async function detect() {
    error = "";
    if (!("geolocation" in navigator)) {
      error = "Geolocation isn't supported on this device";
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
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      );
      if (!res.ok) throw new Error("Couldn't resolve your city");
      const data = await res.json();
      const detected = data.city || data.locality || data.principalSubdivision;
      if (!detected) throw new Error("Couldn't resolve your city");
      city = detected;
    } catch (err: any) {
      error =
        err.code === 1
          ? "Location access denied"
          : (err.message ?? "Couldn't detect your location");
    } finally {
      locating = false;
    }
  }
</script>

<div class="flex flex-1 flex-col gap-2">
  {#if city}
    <div
      class="flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-4 py-4"
    >
      <MapPin class="size-5 shrink-0 text-primary" />
      <span class="flex-1 truncate text-base font-semibold text-text"
        >{city}</span
      >
      <button
        type="button"
        onclick={detect}
        disabled={locating}
        class="shrink-0 text-xs font-bold uppercase tracking-wide text-primary disabled:opacity-40"
      >
        {#if locating}
          <Loader2 class="size-4 animate-spin" />
        {:else}
          Refresh
        {/if}
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
        Detecting…
      {:else}
        <MapPin class="size-5" />
        Use my location
      {/if}
    </button>
  {/if}
  {#if error}
    <p class="text-xs font-medium text-red-500">{error}</p>
  {/if}
</div>
