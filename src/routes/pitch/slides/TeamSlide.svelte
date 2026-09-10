<script lang="ts">
  import { TrendingUp, Users } from "@lucide/svelte";
  import marcelloPhoto from "$lib/assets/marcello.jpg";

  // Key hires planned with this raise - not existing team members, framed honestly as a
  // solo-founder deck (see FOUNDER below).
  const NEXT_HIRES = [
    {
      icon: TrendingUp,
      role: "Head of Growth",
      desc: "Hyper-local consumer acquisition and community building for the pilot city launch.",
    },
    {
      icon: Users,
      role: "Advisors",
      desc: "Fitness industry veterans and marketplace-scaling advisors, being recruited now.",
    },
  ] as const;

  const FOUNDER = {
    photo: marcelloPhoto,
    name: "Marcello Annicchairico",
    role: "Founder / CEO & Engineer",
    desc: "Solo-founded and built the entire product end-to-end: product design, full-stack development, and infrastructure - shipped a mobile app already live with real users.",
  };
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Team & execution
  </p>
  <h2
    class="text-2xl font-black text-text md:text-4xl text-balance text-center"
  >
    A solo technical founder who has already built and shipped the product.
  </h2>
  <div
    class="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-sm"
  >
    <img
      src={FOUNDER.photo}
      alt={FOUNDER.name}
      class="size-24 rounded-full object-cover md:size-32"
    />
    <p class="font-bold text-text md:text-lg">{FOUNDER.name}</p>
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      {FOUNDER.role}
    </p>
    <p class="text-sm text-muted md:text-base text-balance">{FOUNDER.desc}</p>
  </div>
  <div class="flex w-full flex-col gap-2">
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      Key hires planned with this raise
    </p>
    <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {#each NEXT_HIRES as hire}
        <div
          class="flex items-start gap-3 rounded-2xl bg-surface p-4 text-left shadow-sm"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <hire.icon class="size-5" />
          </span>
          <div>
            <p class="font-bold text-text">{hire.role}</p>
            <p class="text-sm text-muted">{hire.desc}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
