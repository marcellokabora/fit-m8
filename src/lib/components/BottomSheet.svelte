<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    onClose,
    closeLabel = "Close",
    bgClass = "bg-bg",
    maxHeightClass = "max-h-[90dvh]",
    children,
  }: {
    open?: boolean;
    onClose: () => void;
    closeLabel?: string;
    // callers own their own padding/layout inside — this only provides the shell
    bgClass?: string;
    maxHeightClass?: string;
    children: Snippet;
  } = $props();
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 mx-auto flex w-full items-end bg-black/60 backdrop-blur-sm md:max-w-md"
    transition:fade={{ duration: 150 }}
    role="button"
    tabindex="0"
    aria-label={closeLabel}
    onclick={onClose}
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && onClose()}
  >
    <div
      class="flex w-full flex-col overflow-hidden rounded-t-3xl {bgClass} {maxHeightClass} shadow-2xl"
      transition:fly={{ y: 400, duration: 250 }}
      role="dialog"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div
        class="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border"
      ></div>
      {@render children()}
    </div>
  </div>
{/if}
