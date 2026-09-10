<script lang="ts">
  import { onMount } from "svelte";
  import LocationPicker from "$lib/components/LocationPicker.svelte";
  import AppearancePicker from "$lib/components/AppearancePicker.svelte";
  import { Bell, Check, Loader2, MapPin, Palette } from "@lucide/svelte";
  import {
    requestPushToken,
    pushNotificationsSupported,
  } from "$lib/firebase/notifications";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    city = $bindable(""),
    lat = $bindable(undefined),
    lng = $bindable(undefined),
    pushToken = $bindable(null),
  }: {
    city?: string;
    lat?: number;
    lng?: number;
    pushToken?: string | null;
  } = $props();

  let t = $derived(createTranslator($activeLanguage));

  // Not persisted in the draft — re-requesting after a refresh is instant once the
  // browser has already granted/denied it.
  let pushSupported = $state(false);
  let pushRequesting = $state(false);
  let pushDenied = $state(false);

  onMount(() => {
    pushNotificationsSupported().then(
      (supported) => (pushSupported = supported),
    );
  });

  async function enableNotifications() {
    if (pushRequesting || pushToken) return;
    pushRequesting = true;
    pushToken = await requestPushToken();
    pushDenied = !pushToken;
    pushRequesting = false;
  }
</script>

<h2 class="mb-1 text-2xl font-black text-text">
  {t.t("onboarding.makeItYours")}
</h2>
<p class="mb-6 text-sm text-muted text-balance">
  {t.t("onboarding.appearanceHint")}
</p>
<div class="mb-4 flex flex-col gap-4">
  <div class="rounded-2xl border-2 border-border bg-surface p-4">
    <div class="mb-3 flex items-center gap-3">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <MapPin class="size-5" />
      </span>
      <div class="flex-1">
        <p class="font-bold text-text">
          {t.t("onboarding.locationTitle")}
        </p>
        <p class="text-sm text-muted">
          {t.t("onboarding.locationHint")}
        </p>
      </div>
    </div>
    <LocationPicker bind:city bind:lat bind:lng />
  </div>
  {#if pushSupported}
    <div class="rounded-2xl border-2 border-border bg-surface p-4">
      <div class="mb-3 flex items-center gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Bell class="size-5" />
        </span>
        <div class="flex-1">
          <p class="font-bold text-text">
            {t.t("onboarding.notificationsTitle")}
          </p>
          <p class="text-sm text-muted">
            {t.t("onboarding.notificationsHint")}
          </p>
        </div>
      </div>
      {#if pushToken}
        <div
          class="flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-4 py-4 text-sm font-semibold text-primary"
        >
          <Check class="size-5 shrink-0" />
          {t.t("onboarding.notificationsEnabled")}
        </div>
      {:else}
        <button
          type="button"
          onclick={enableNotifications}
          disabled={pushRequesting}
          class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface px-4 py-4 text-sm font-semibold text-primary transition-colors active:scale-95 disabled:opacity-40"
        >
          {#if pushRequesting}
            <Loader2 class="size-5 animate-spin" />
            {t.t("common.loading")}
          {:else}
            <Bell class="size-5" />
            {t.t("onboarding.enableNotifications")}
          {/if}
        </button>
        {#if pushDenied}
          <p class="mt-2 text-xs text-muted">
            {t.t("onboarding.notificationsBlocked")}
          </p>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<div class="rounded-2xl border-2 border-border bg-surface p-4">
  <div class="mb-3 flex items-center gap-3">
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
    >
      <Palette class="size-5" />
    </span>
    <div class="flex-1">
      <p class="font-bold text-text">
        {t.t("appearance.title")}
      </p>
    </div>
  </div>
  <AppearancePicker />
</div>
