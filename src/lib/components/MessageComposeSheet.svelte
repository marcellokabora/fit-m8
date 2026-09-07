<script lang="ts">
  import { Send, X } from "@lucide/svelte";
  import BottomSheet from "$lib/components/BottomSheet.svelte";

  let {
    open = $bindable(false),
    sending = false,
    onSubmit,
    title,
    hint,
    placeholder,
    sendLabel,
    sendingLabel,
    closeLabel,
  }: {
    open?: boolean;
    sending?: boolean;
    onSubmit: (text: string) => void;
    title: string;
    hint?: string;
    placeholder: string;
    sendLabel: string;
    sendingLabel: string;
    closeLabel: string;
  } = $props();

  let text = $state("");

  function close() {
    if (sending) return;
    open = false;
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSubmit(trimmed);
  }

  // Reset the draft each time the sheet is (re)opened for a new recipient
  $effect(() => {
    if (open) text = "";
  });
</script>

<BottomSheet
  bind:open
  onClose={close}
  {closeLabel}
  bgClass="bg-bg"
  maxHeightClass="max-h-[85dvh]"
>
  {#snippet children()}
    <div class="px-6 pb-8 pt-2">
      <div class="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 class="font-heading text-lg font-bold text-text">{title}</h2>
          {#if hint}
            <p class="text-sm text-muted">{hint}</p>
          {/if}
        </div>
        <button
          type="button"
          onclick={close}
          aria-label={closeLabel}
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted active:scale-95"
        >
          <X class="size-5" />
        </button>
      </div>
      <textarea
        bind:value={text}
        {placeholder}
        rows="4"
        disabled={sending}
        class="w-full resize-none rounded-2xl border-2 border-border bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary disabled:opacity-50"
      ></textarea>
      <button
        type="button"
        onclick={submit}
        disabled={sending || !text.trim()}
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
      >
        <Send class="size-5" />
        {sending ? sendingLabel : sendLabel}
      </button>
    </div>
  {/snippet}
</BottomSheet>
