<script lang="ts">
  import { TrendingUp, HeartHandshake, MapPinned } from "@lucide/svelte";

  const WHY_NOW = [
    {
      icon: TrendingUp,
      title: "Explosion of social racket sports",
      desc: "Padel and Pickleball are experiencing >25% YoY player growth globally, creating urgent demand for 4-player matchmaking.",
    },
    {
      icon: HeartHandshake,
      title: "Loneliness epidemic & social fitness",
      desc: "Gen Z and Millennials are replacing nightlife with active social clubs and fitness communities.",
    },
    {
      icon: MapPinned,
      title: "Location-based matchmaking maturity",
      desc: "Consumers are universally accustomed to swipe/map-based discovery, eliminating user onboarding friction.",
    },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 text-center"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Why now?
  </p>
  <h2 class="text-2xl font-black text-text md:text-4xl text-balance">
    A confluence of social fitness trends and sports booms creates an immediate
    market window.
  </h2>
  <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
    {#each WHY_NOW as driver}
      <div
        class="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-sm"
      >
        <span
          class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary md:size-16"
        >
          <driver.icon class="size-7 md:size-8" />
        </span>
        <p class="font-bold text-text md:text-lg text-balance">
          {driver.title}
        </p>
        <p class="text-sm text-muted md:text-base">{driver.desc}</p>
      </div>
    {/each}
  </div>
</div>
