<script lang="ts">
  import { TrendingUp, HeartHandshake, MapPinned } from "@lucide/svelte";

  const WHY_NOW = [
    {
      icon: TrendingUp,
      title: "Global Explosion of Social Racket Sports",
      desc: "Padel and Pickleball are growing at >25% YoY. Both require exactly 4 balanced players, creating urgent daily demand for hyper-local matchmaking.",
    },
    {
      icon: HeartHandshake,
      title: "The Shift From Nightlife to Social Fitness",
      desc: "Gen Z and Millennials are swapping bars for active social clubs, run clubs, and fitness communities to fight urban isolation.",
    },
    {
      icon: MapPinned,
      title: "Normalization of Matchmaking UI",
      desc: "Location-based swiping and map discovery are now universal consumer habits, eliminating onboarding friction for non-dating apps.",
    },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 text-center"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Why now?
  </p>
  <h2 class="text-4xl font-black text-text text-balance">
    Three Macro Tailwinds Driving Immediate Market Demand
  </h2>
  <div class="grid w-full grid-cols-3 gap-6">
    {#each WHY_NOW as driver}
      <div
        class="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-sm"
      >
        <span
          class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <driver.icon class="size-8" />
        </span>
        <p class="font-bold text-text text-lg text-balance">
          {driver.title}
        </p>
        <p class="text-base text-muted">{driver.desc}</p>
      </div>
    {/each}
  </div>
</div>
