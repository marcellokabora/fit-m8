<script lang="ts">
  import {
    Crown,
    Heart,
    MessageCircle,
    Dumbbell,
    Zap,
    Building2,
    Handshake,
  } from "@lucide/svelte";
  import {
    MAX_LIKES_FREE_PER_DAY,
    MAX_SPORTS_FREE,
    MAX_SPORTS_PREMIUM,
    PREMIUM_PRICE_USD,
  } from "$lib/types";

  const PREMIUM_FEATURES = [
    {
      icon: Heart,
      title: "Unlimited daily likes",
      desc: `Free accounts get ${MAX_LIKES_FREE_PER_DAY} likes a day.`,
    },
    {
      icon: MessageCircle,
      title: "Message directly",
      desc: "Skip the match — reach out to any profile without waiting.",
    },
    {
      icon: Dumbbell,
      title: "Full activity access",
      desc: `Up to ${MAX_SPORTS_PREMIUM} sports instead of ${MAX_SPORTS_FREE}.`,
    },
    {
      icon: Zap,
      title: "Priority boost",
      desc: "Get surfaced first in local discovery feeds.",
    },
  ] as const;

  const PHASE2_UPSIDES = [
    {
      icon: Building2,
      title: "Venue booking commissions",
      desc: "Take-rate on court bookings (Padel/Tennis) initiated inside match chats.",
    },
    {
      icon: Handshake,
      title: "Certified trainer marketplace",
      desc: "15% commission on private session bookings with verified trainers.",
    },
  ] as const;
</script>

<div class="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8">
  <div class="flex flex-col items-center gap-2 text-center">
    <span
      class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
    >
      <Crown class="size-8" />
    </span>
    <h2 class="text-4xl font-black text-text text-balance">
      Freemium core driving high-margin subscription and transactional upside.
    </h2>
    <p class="text-5xl font-black text-primary">
      ${PREMIUM_PRICE_USD} / month
    </p>
  </div>
  <div class="grid grid-cols-2 gap-4">
    {#each PREMIUM_FEATURES as feature}
      <div class="flex items-start gap-4 rounded-2xl bg-surface p-4 shadow-sm">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <feature.icon class="size-5" />
        </span>
        <div>
          <p class="font-bold text-text">{feature.title}</p>
          <p class="text-sm text-muted">{feature.desc}</p>
        </div>
      </div>
    {/each}
  </div>
  <div class="flex flex-col gap-3 rounded-2xl bg-surface p-6">
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      Future platform upsides — Phase 2
    </p>
    <div class="grid grid-cols-2 gap-4">
      {#each PHASE2_UPSIDES as upside}
        <div class="flex items-start gap-3">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <upside.icon class="size-4" />
          </span>
          <div>
            <p class="text-base font-bold text-text">
              {upside.title}
            </p>
            <p class="text-sm text-muted">{upside.desc}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
