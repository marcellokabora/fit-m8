<script lang="ts">
  import { X, Zap, Share2, Undo2, MessageCircle } from "@lucide/svelte";

  let {
    onPass,
    onLike,
    disabled = false,
    passLabel,
    likeLabel,
    onShare,
    onUndo,
    onMessage,
    shareLabel,
    undoLabel,
    canUndo = true,
    messageLabel,
    likeProgress = 0,
    passProgress = 0,
    class: className = "",
  }: {
    onPass: () => void;
    onLike: () => void;
    disabled?: boolean;
    passLabel: string;
    likeLabel: string;
    onShare?: () => void;
    onUndo?: () => void;
    onMessage: () => void;
    shareLabel?: string;
    undoLabel?: string;
    canUndo?: boolean;
    messageLabel: string;
    /** How much the current swipe favors "like", 0 (neutral) to 1 (fully committed) */
    likeProgress?: number;
    /** How much the current swipe favors "pass", 0 (neutral) to 1 (fully committed) */
    passProgress?: number;
    class?: string;
  } = $props();

  // Fill the button toward its accent color as the swipe commits, instead of always being solid
  let likePct = $derived(
    Math.round(Math.max(0, Math.min(1, likeProgress)) * 100),
  );
  let passPct = $derived(
    Math.round(Math.max(0, Math.min(1, passProgress)) * 100),
  );
</script>

<div class="flex shrink-0 items-center justify-center gap-5 {className}">
  {#if onUndo}
    <button
      onclick={onUndo}
      disabled={!canUndo}
      aria-label={undoLabel}
      class="flex size-12 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90 disabled:opacity-50"
    >
      <Undo2 class="size-5" />
    </button>
  {:else if onShare}
    <button
      onclick={onShare}
      aria-label={shareLabel}
      class="flex size-12 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90"
    >
      <Share2 class="size-5" />
    </button>
  {/if}
  <button
    onclick={onPass}
    {disabled}
    aria-label={passLabel}
    style="transition: transform 150ms ease, background-color 150ms ease, color 150ms ease; background-color: color-mix(in srgb, var(--color-error) {passPct}%, var(--color-surface)); color: color-mix(in srgb, white {passPct}%, var(--color-error));"
    class="flex size-16 items-center justify-center rounded-full text-3xl shadow-lg active:scale-90 disabled:opacity-50"
  >
    <X class="size-7" />
  </button>
  <button
    onclick={onLike}
    {disabled}
    aria-label={likeLabel}
    style="transition: transform 150ms ease, background-color 150ms ease, color 150ms ease; background-color: color-mix(in srgb, var(--color-success) {likePct}%, var(--color-surface)); color: color-mix(in srgb, white {likePct}%, var(--color-primary));"
    class="flex size-16 items-center justify-center rounded-full text-3xl shadow-lg active:scale-90 disabled:opacity-50"
  >
    <Zap class="size-7" />
  </button>
  <button
    onclick={onMessage}
    aria-label={messageLabel}
    class="flex size-12 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90"
  >
    <MessageCircle class="size-5" />
  </button>
</div>
