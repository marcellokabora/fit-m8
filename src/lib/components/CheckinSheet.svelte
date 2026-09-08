<script lang="ts">
  import { Loader2, MapPin } from "@lucide/svelte";
  import BottomSheet from "$lib/components/BottomSheet.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { ACTIVITIES } from "$lib/types";
  import { getCurrentCoords } from "$lib/location";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    open = $bindable(false),
    myActivityIds = [],
    onCheckin,
  }: {
    open?: boolean;
    // the user's own sports surface first in the picker, ahead of the rest
    myActivityIds?: string[];
    onCheckin: (
      activityId: string,
      lat: number,
      lng: number,
      message: string,
    ) => Promise<void>;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));

  let selectedId = $state<string | null>(null);
  let message = $state("");
  let locating = $state(false);
  let error = $state("");

  let orderedActivities = $derived(
    [...ACTIVITIES].sort(
      (a, b) =>
        Number(myActivityIds.includes(b.id)) -
        Number(myActivityIds.includes(a.id)),
    ),
  );

  // Reset the form each time the sheet is opened for a fresh check-in
  $effect(() => {
    if (open) {
      selectedId = null;
      message = "";
      error = "";
    }
  });

  function close() {
    if (locating) return;
    open = false;
  }

  async function confirm() {
    if (!selectedId || locating) return;
    error = "";
    locating = true;
    try {
      const { lat, lng } = await getCurrentCoords();
      await onCheckin(selectedId, lat, lng, message.trim());
      open = false;
    } catch (err: any) {
      error =
        err?.code === 1 ? t.t("location.denied") : t.t("location.detectFailed");
    } finally {
      locating = false;
    }
  }
</script>

<BottomSheet
  bind:open
  onClose={close}
  closeLabel={t.t("common.close")}
  bgClass="bg-surface"
  maxHeightClass="max-h-[85dvh]"
>
  <div class="flex flex-col gap-1 px-7 pb-4 pt-2">
    <h2 class="text-xl font-black text-text">{t.t("explore.sheetTitle")}</h2>
    <p class="text-sm text-muted">{t.t("explore.pickSport")}</p>
  </div>

  <div class="grid grid-cols-4 gap-3 overflow-y-auto px-7 pb-4">
    {#each orderedActivities as activity}
      {@const isSelected = selectedId === activity.id}
      <button
        type="button"
        onclick={() => (selectedId = activity.id)}
        aria-pressed={isSelected}
        class="flex flex-col items-center gap-1 rounded-2xl border-2 p-3 {isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-bg'}"
      >
        <ActivityIcon
          id={activity.id}
          class="size-5 {isSelected ? 'text-primary' : 'text-text'}"
        />
        <span class="truncate text-[10px] font-semibold text-text"
          >{t.activity(activity.id)}</span
        >
      </button>
    {/each}
  </div>

  <div class="flex flex-col gap-2 px-7 pb-4">
    <input
      type="text"
      bind:value={message}
      maxlength="80"
      placeholder={t.t("explore.messagePlaceholder")}
      class="rounded-2xl border-2 border-border bg-bg px-4 py-3 text-sm font-medium text-text placeholder:text-text/40 focus:border-primary focus:outline-none"
    />
    {#if error}
      <p class="text-xs font-medium text-red-500">{error}</p>
    {/if}
  </div>

  <div class="flex gap-3 border-t border-border px-7 py-4">
    <button
      onclick={close}
      disabled={locating}
      class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95 disabled:opacity-40"
    >
      {t.t("common.cancel")}
    </button>
    <button
      onclick={confirm}
      disabled={!selectedId || locating}
      class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
    >
      {#if locating}
        <Loader2 class="size-4 animate-spin" />
        {t.t("location.detecting")}
      {:else}
        <MapPin class="size-4" />
        {t.t("explore.checkInCta")}
      {/if}
    </button>
  </div>
</BottomSheet>
