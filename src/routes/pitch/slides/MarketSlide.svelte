<script lang="ts">
  import { ChartPie } from "@lucide/svelte";

  const MARKET_BREAKDOWN = [
    {
      tier: "TAM",
      value: "$18.4B",
      label: "Total addressable market",
      detail:
        "600M global adults participating in regular sports/fitness activities.",
    },
    {
      tier: "SAM",
      value: "$2.16B",
      label: "Serviceable addressable market",
      detail:
        "180M active urban sports enthusiasts in Europe & North America who play partner/group sports (Padel, Tennis, Gym, Running), at an estimated $12.00 annual ARPU.",
    },
    {
      tier: "SOM",
      value: "$43.2M",
      label: "Serviceable obtainable market",
      detail:
        "Initial 3-year capture of 3.6M active users across the top 15 European metro hubs (Barcelona, Madrid, London, Berlin, Milan).",
    },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8"
>
  <span
    class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary md:size-16"
  >
    <ChartPie class="size-7 md:size-8" />
  </span>
  <h2
    class="text-2xl font-black text-text md:text-4xl text-balance text-center"
  >
    A $2.1B+ addressable market built on sports enthusiast ARPU.
  </h2>
  <div class="flex w-full flex-col gap-4 md:grid md:grid-cols-3 md:gap-6">
    {#each MARKET_BREAKDOWN as tier}
      <div
        class="flex flex-col gap-2 rounded-2xl bg-surface p-5 text-center shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          {tier.tier}
        </p>
        <p class="text-2xl font-black text-text md:text-3xl">{tier.value}</p>
        <p class="text-sm font-semibold text-text">{tier.label}</p>
        <p class="text-sm text-muted">{tier.detail}</p>
      </div>
    {/each}
  </div>
</div>
