<script lang="ts">
  import { Handshake, Sparkles, Rocket } from "@lucide/svelte";

  const GTM_PILLARS = [
    {
      icon: Handshake,
      title: "Anchor Hotspots",
      desc: "Direct integrations with high-volume sports hubs (Padel & Beach Volleyball) to capture existing athletic communities.",
    },
    {
      icon: Sparkles,
      title: "Creator Lobbies",
      desc: "Micro-influencer & organizer ambassador loops driving public match creation and user retention.",
    },
    {
      icon: Rocket,
      title: "Hyper-Local Acquisition",
      desc: "Geo-targeted physical activations & localized social campaigns around active sports hubs.",
    },
  ] as const;

  const GTM_METRICS = [
    { label: "Blended CAC", value: "< $3.00" },
    { label: "6-Month LTV", value: "$18.00" },
    { label: "LTV : CAC", value: "> 6.0×" },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Go-to-market
  </p>
  <h2 class="text-4xl font-black text-text text-balance text-center">
    Hyper-local rollout playbook starting in Barcelona's high-density sports
    hubs
  </h2>
  <div class="grid w-full grid-cols-3 gap-6">
    {#each GTM_PILLARS as pillar}
      <div
        class="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-sm"
      >
        <span
          class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <pillar.icon class="size-8" />
        </span>
        <p class="font-bold text-text text-lg">{pillar.title}</p>
        <p class="text-base text-muted">{pillar.desc}</p>
      </div>
    {/each}
  </div>
  <div class="flex w-full flex-row gap-6">
    {#each GTM_METRICS as metric}
      <div class="flex-1 rounded-2xl bg-primary/10 p-4 text-center">
        <p class="text-2xl font-black text-primary">
          {metric.value}
        </p>
        <p class="text-xs font-semibold uppercase tracking-widest text-muted">
          {metric.label}
        </p>
      </div>
    {/each}
  </div>
</div>
