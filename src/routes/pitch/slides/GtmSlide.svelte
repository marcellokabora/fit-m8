<script lang="ts">
  import { Handshake, Sparkles, Rocket } from "@lucide/svelte";

  const GTM_PILLARS = [
    {
      icon: Handshake,
      title: "Anchor partnerships",
      desc: "Partner directly with local Padel clubs, beach volleyball hubs, and gym chains for exclusive member perks.",
    },
    {
      icon: Sparkles,
      title: "Micro-influencer & ambassador loops",
      desc: "Onboard local fitness creators and tournament organizers to host public match lobbies.",
    },
    {
      icon: Rocket,
      title: "Grassroots organic acquisition",
      desc: "Geo-targeted campaigns around major sport hotspots — beach volley hubs, municipal tennis courts.",
    },
  ] as const;

  const GTM_METRICS = [
    { label: "Target CAC", value: "< $3.50" },
    { label: "Target 6-month LTV", value: "$18.00" },
    { label: "Target LTV : CAC", value: "> 5.0×" },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Go-to-market
  </p>
  <h2
    class="text-2xl font-black text-text md:text-4xl text-balance text-center"
  >
    Hyper-local city rollout playbook targeting high-density sports hubs.
  </h2>
  <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
    {#each GTM_PILLARS as pillar}
      <div
        class="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-sm"
      >
        <span
          class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary md:size-16"
        >
          <pillar.icon class="size-7 md:size-8" />
        </span>
        <p class="font-bold text-text md:text-lg">{pillar.title}</p>
        <p class="text-sm text-muted md:text-base">{pillar.desc}</p>
      </div>
    {/each}
  </div>
  <div class="flex w-full flex-col gap-3 sm:flex-row sm:gap-6">
    {#each GTM_METRICS as metric}
      <div class="flex-1 rounded-2xl bg-primary/10 p-4 text-center">
        <p class="text-xl font-black text-primary md:text-2xl">
          {metric.value}
        </p>
        <p class="text-xs font-semibold uppercase tracking-widest text-muted">
          {metric.label}
        </p>
      </div>
    {/each}
  </div>
</div>
