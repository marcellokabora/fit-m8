<script lang="ts">
  import { fade } from "svelte/transition";
  import Logo from "$lib/components/Logo.svelte";
</script>

<!-- Fullscreen cover shown while auth state is still resolving -->
<div
  transition:fade={{ duration: 200 }}
  class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg"
>
  <div
    class="flex size-24 items-center justify-center rounded-3xl bg-primary p-4 text-white shadow-xl"
  >
    <Logo class="h-full w-full" />
  </div>
  <div
    class="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"
  ></div>
</div>
