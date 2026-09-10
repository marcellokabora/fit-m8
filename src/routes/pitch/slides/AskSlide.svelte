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
    "Validate the initial pilot city before expanding to the next metro.",
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8"
>
  <span
    class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary md:size-16"
  >
    <PiggyBank class="size-7 md:size-8" />
  </span>
  <h2
    class="text-2xl font-black text-text md:text-4xl text-balance text-center"
  >
    Raising €100K Pre-Seed to hit 10,000 MAU and validate core conversion
    mechanics.
  </h2>
  <div class="flex w-full flex-col gap-3">
    {#each FUNDING_ALLOCATION as bucket}
      <div class="rounded-2xl bg-surface p-4 shadow-sm">
        <div class="mb-1 flex items-baseline justify-between gap-3">
          <p class="font-bold text-text">{bucket.label}</p>
          <p class="font-black text-primary">{bucket.pct}%</p>
        </div>
        <div class="mb-2 h-2 w-full overflow-hidden rounded-full bg-border">
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
    class="flex w-full flex-col gap-2 rounded-2xl bg-primary/10 p-4 text-center md:p-5"
  >
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      18-month target milestones
    </p>
    {#each MILESTONES as milestone}
      <p
        class="flex items-center justify-center gap-2 text-sm text-text md:text-base"
      >
        <Target class="size-4 shrink-0 text-primary" />
        {milestone}
      </p>
    {/each}
  </div>
</div>
