<script lang="ts">
  import { fade } from "svelte/transition";

  // fullscreen (default): covers the whole viewport (e.g. initial auth splash)
  // non-fullscreen: sits inline within a parent that already centers it
  let {
    fullscreen = true,
    message = "",
    class: className = "",
  }: { fullscreen?: boolean; message?: string; class?: string } = $props();
</script>

<div
  transition:fade={{ duration: 200 }}
  class="{fullscreen
    ? 'fixed inset-0 z-50 mx-auto w-full bg-bg md:max-w-md'
    : ''} flex flex-col items-center justify-center gap-4 {className}"
>
  <div
    class="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"
  ></div>
  {#if message}
    <p class="text-sm text-muted">{message}</p>
  {/if}
</div>
