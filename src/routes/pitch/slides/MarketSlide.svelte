<script lang="ts">
  import { ChartPie } from "@lucide/svelte";

  const MARKET_BREAKDOWN = [
    {
      tier: "TAM",
      value: "€18.4B",
      label: "Total Addressable Market",
      detail: "Global fitness & social matching market (600M active adults).",
    },
    {
      tier: "SAM",
      value: "€2.16B",
      label: "Serviceable Addressable Market",
      detail:
        "180M urban European athletes playing racket, team, or fitness sports.",
    },
    {
      tier: "SOM",
      value: "€43.2M",
      label: "Serviceable Obtainable Market",
      detail: "3-year capture across top 15 Tier-1 European cities.",
    },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8"
>
  <span
    class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
  >
    <ChartPie class="size-8" />
  </span>
  <h2 class="text-4xl font-black text-text text-balance text-center">
    A €2.1B+ Addressable Market Powered by Active Sports Enthusiasts
  </h2>
  <div class="grid w-full grid-cols-3 gap-6">
    {#each MARKET_BREAKDOWN as tier}
      <div
        class="flex flex-col gap-2 rounded-2xl bg-surface p-5 text-center shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          {tier.tier}
        </p>
        <p class="text-3xl font-black text-text">{tier.value}</p>
        <p class="text-sm font-semibold text-text">{tier.label}</p>
        <p class="text-sm text-muted">{tier.detail}</p>
      </div>
    {/each}
  </div>
</div>
