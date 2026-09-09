<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Check, Copy, LoaderCircle, ShieldAlert } from "@lucide/svelte";
  import QRCode from "qrcode";
  import { slide } from "svelte/transition";
  import BackHeader from "$lib/components/BackHeader.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { CAROUSEL_ACTIVITIES } from "$lib/components/ActivityCarousel.svelte";
  import { isAdmin } from "$lib/stores/admin";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));

  let expandedId = $state<string | null>(null);
  // Rendered client-side per activity — data URLs aren't worth persisting anywhere
  let qrDataUrls = $state<Record<string, string>>({});
  let copiedId = $state<string | null>(null);

  function activityUrl(id: string) {
    return `${page.url.origin}/?activity=${id}`;
  }

  async function toggle(id: string) {
    if (expandedId === id) {
      expandedId = null;
      return;
    }
    expandedId = id;
    if (!qrDataUrls[id]) {
      qrDataUrls[id] = await QRCode.toDataURL(activityUrl(id), {
        margin: 1,
        width: 240,
      });
    }
  }

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(activityUrl(id));
    copiedId = id;
    setTimeout(() => (copiedId = null), 1500);
  }

  $effect(() => {
    if ($isAdmin === undefined) return; // still resolving auth state / the claim check
    if (!$isAdmin) goto("/discover");
  });
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-12">
  <BackHeader title={t.t("home.allActivities")} href="/profile" class="bg-bg" />

  {#if $isAdmin === undefined}
    <div class="flex flex-1 items-center justify-center text-muted">
      <LoaderCircle class="size-10 animate-spin" />
    </div>
  {:else if !$isAdmin}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-muted"
    >
      <ShieldAlert class="size-10" />
      <p>You don't have access to this page.</p>
    </div>
  {:else}
    <div class="flex flex-col gap-2 px-5 pb-6">
      {#each CAROUSEL_ACTIVITIES as activity}
        {@const expanded = expandedId === activity.id}
        <div
          class="rounded-2xl border-2 {expanded
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'}"
        >
          <button
            type="button"
            onclick={() => toggle(activity.id)}
            class="flex w-full items-center gap-3 p-4 text-left"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <ActivityIcon id={activity.id} class="size-5" />
            </span>
            <span class="flex-1 font-bold text-text">
              {t.activity(activity.id)}
            </span>
          </button>
          {#if expanded}
            <div
              class="flex flex-col items-center gap-3 px-4 pb-4"
              transition:slide={{ duration: 200 }}
            >
              {#if qrDataUrls[activity.id]}
                <img
                  src={qrDataUrls[activity.id]}
                  alt={`QR code for ${t.activity(activity.id)}`}
                  class="size-40 rounded-lg bg-white p-2"
                />
              {/if}
              <button
                type="button"
                onclick={() => copyLink(activity.id)}
                class="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2 text-xs font-bold text-primary active:scale-95"
              >
                {#if copiedId === activity.id}
                  <Check class="size-3.5" />
                  Copied
                {:else}
                  <Copy class="size-3.5" />
                  Copy link
                {/if}
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
