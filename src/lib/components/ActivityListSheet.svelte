<script lang="ts">
  import { Check, Copy, X } from "@lucide/svelte";
  import { page } from "$app/state";
  import QRCode from "qrcode";
  import { slide } from "svelte/transition";
  import BottomSheet from "$lib/components/BottomSheet.svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let {
    open = $bindable(false),
    activities,
    title,
  }: {
    open?: boolean;
    activities: { id: string }[];
    title: string;
  } = $props();

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

  function close() {
    open = false;
    expandedId = null;
  }
</script>

<BottomSheet
  bind:open
  onClose={close}
  closeLabel={t.t("common.close")}
  bgClass="bg-surface"
  maxHeightClass="max-h-[85dvh]"
>
  <div class="flex items-center justify-between px-7 pb-4 pt-2">
    <h2 class="text-xl font-black text-text">{title}</h2>
    <button
      type="button"
      onclick={close}
      aria-label={t.t("common.close")}
      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg text-muted active:scale-95"
    >
      <X class="size-4" />
    </button>
  </div>
  <div
    class="flex flex-col gap-2 overflow-y-auto px-7 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
  >
    {#each activities as activity}
      {@const expanded = expandedId === activity.id}
      <div
        class="rounded-2xl border-2 {expanded
          ? 'border-primary bg-primary/10'
          : 'border-border bg-bg'}"
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
</BottomSheet>
