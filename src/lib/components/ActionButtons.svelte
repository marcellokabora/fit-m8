<script lang="ts">
  import { X, Zap, Share2, MessageCircle } from "@lucide/svelte";

  let {
    onPass,
    onLike,
    disabled = false,
    passLabel,
    likeLabel,
    onShare,
    onMessage,
    shareLabel,
    messageLabel,
    class: className = "",
  }: {
    onPass: () => void;
    onLike: () => void;
    disabled?: boolean;
    passLabel: string;
    likeLabel: string;
    onShare: () => void;
    onMessage: () => void;
    shareLabel: string;
    messageLabel: string;
    class?: string;
  } = $props();
</script>

<div class="flex shrink-0 items-center justify-center gap-5 {className}">
  <button
    onclick={onShare}
    aria-label={shareLabel}
    class="flex size-12 items-center justify-center rounded-full bg-surface text-text shadow-md transition-transform active:scale-90"
  >
    <Share2 class="size-5" />
  </button>
  <button
    onclick={onPass}
    {disabled}
    aria-label={passLabel}
    class="flex size-16 items-center justify-center rounded-full bg-surface text-3xl shadow-lg transition-transform active:scale-90 disabled:opacity-50"
  >
    <X class="size-7 text-error" />
  </button>
  <button
    onclick={onLike}
    {disabled}
    aria-label={likeLabel}
    class="flex size-16 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-lg transition-transform active:scale-90 disabled:opacity-50"
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
