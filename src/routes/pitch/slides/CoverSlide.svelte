<script lang="ts">
  import Logo from "$lib/components/LogoText.svelte";

  import { Globe } from "@lucide/svelte";
</script>

<div
  class="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-20 text-center"
>
  <div class="relative z-10 flex flex-col items-center gap-4">
    <a href="https://fit-m8.app" target="_blank" rel="noopener noreferrer">
      <Logo class="h-auto w-72 text-primary drop-shadow-md" />
    </a>
    <p class="text-2xl font-medium text-muted text-balance">
      <!-- Find Your Sports Match -->
      The swipe-and-meet matchmaking app for peer-to-peer sports, friends, and trainers
    </p>
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      Pre-Seed Pitch
    </p>
    <p class="text-sm text-muted">Marcello Annicchairico, Founder & Engineer</p>

    <a
      href="https://fit-m8.app"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-4 flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-base font-semibold text-muted shadow-sm transition-transform active:scale-95"
    >
      <Globe class="size-4" />
      fit-m8.app
    </a>
  </div>
</div>
