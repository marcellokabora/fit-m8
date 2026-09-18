<script lang="ts">
  import { PiggyBank, Target } from "@lucide/svelte";
  import { PREMIUM_PRICE_USD } from "$lib/types";

  const FUNDING_ALLOCATION = [
    {
      label: "Product & Engineering",
      pct: 45,
      desc: "Expand map features, automated matching algorithms, and venue integration APIs.",
    },
    {
      label: "Growth & Acquisition",
      pct: 35,
      desc: "Launch the city playbook in the initial pilot metro — Barcelona.",
    },
    {
      label: "Operations & Community",
      pct: 20,
      desc: "Local ambassador management and legal/compliance.",
    },
  ] as const;

  const MILESTONES = [
    "10,000 Active Monthly Users (MAU).",
    `8% conversion to the $${PREMIUM_PRICE_USD} Premium tier (~$8k/mo MRR).`,
    "Validate Barcelona as the pilot city before expanding to the next metro.",
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-5"
>
  <span
    class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
  >
    <PiggyBank class="size-6" />
  </span>
  <h2 class="text-4xl font-black text-text text-balance text-center">
    Raising €100K Pre-Seed to hit 10,000 MAU.
  </h2>
  <div class="flex w-full flex-col gap-2">
    {#each FUNDING_ALLOCATION as bucket}
      <div class="rounded-2xl bg-surface p-3 shadow-sm">
        <div class="mb-1 flex items-baseline justify-between gap-3">
          <p class="font-bold text-text">{bucket.label}</p>
          <p class="font-black text-primary">{bucket.pct}%</p>
        </div>
        <div class="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            class="h-full rounded-full bg-primary"
            style="width: {bucket.pct}%"
          ></div>
        </div>
        <p class="text-sm text-muted">{bucket.desc}</p>
      </div>
    {/each}
  </div>
  <div
    class="mx-auto flex w-full max-w-xl flex-col gap-1 rounded-2xl bg-primary/10 p-3 text-center"
  >
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      18-month target milestones
    </p>
    {#each MILESTONES as milestone}
      <p class="flex items-center justify-center gap-1.5 text-sm text-text">
        <Target class="size-3.5 shrink-0 text-primary" />
        {milestone}
      </p>
    {/each}
  </div>
</div>
