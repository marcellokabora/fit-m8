<script lang="ts">
  import Logo from "$lib/components/Logo.svelte";
  import ActivityCarousel from "$lib/components/ActivityCarousel.svelte";
</script>

<div
  class="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-20 text-center"
>
  <div class="relative z-10 flex flex-col items-center gap-4">
    <Logo class="h-auto w-56 text-primary drop-shadow-md md:w-72" />
    <p class="text-lg font-medium text-muted text-balance md:text-2xl">
      Find Your Sports Match
    </p>
  </div>
  <div class="relative flex w-full justify-center print:hidden">
    <ActivityCarousel />
  </div>
</div>
