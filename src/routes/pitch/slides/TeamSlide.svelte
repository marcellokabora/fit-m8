<script lang="ts">
  import { TrendingUp, Users, Globe } from "@lucide/svelte";
  import LinkedinIcon from "~icons/simple-icons/linkedin";
  import GithubIcon from "~icons/simple-icons/github";
  import marcelloPhoto from "$lib/assets/marcello.jpg";

  // Key hires planned with this raise - not existing team members, framed honestly as a
  // solo-founder deck (see FOUNDER below).
  const NEXT_HIRES = [
    {
      icon: TrendingUp,
      role: "Head of Growth",
      desc: "Hyper-local consumer acquisition and community building for the Barcelona launch.",
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
    role: "Founder, CEO & Software/Product Engineer",
    desc: "A rare CEO who is also the engineer: designed, built, and shipped the entire product solo - product, full-stack development, and infrastructure - with a mobile app already live with real users. No dev team, no agency, no delays - pure execution speed.",
    links: [
      {
        url: "https://www.linkedin.com/in/marcellokabora",
        label: "LinkedIn",
        icon: LinkedinIcon,
      },
      {
        url: "https://github.com/marcellokabora",
        label: "GitHub",
        icon: GithubIcon,
      },
      {
        url: "https://marcellokabora.com",
        label: "Portfolio",
        icon: Globe,
      },
    ],
  };
</script>

<div
  class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Team & execution
  </p>
  <h2 class="text-4xl font-black text-text text-balance text-center">
    A solo technical founder who has already built and shipped the product.
  </h2>
  <div
    class="flex w-full flex-row items-center gap-8 rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface to-surface p-8 text-left shadow-sm"
  >
    <img
      src={FOUNDER.photo}
      alt={FOUNDER.name}
      class="size-36 shrink-0 rounded-full object-cover ring-4 ring-primary/30"
    />
    <div class="flex flex-col items-start gap-2">
      <p class="font-bold text-text text-xl">{FOUNDER.name}</p>
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">
        {FOUNDER.role}
      </p>
      <p class="text-base text-muted text-balance">
        {FOUNDER.desc}
      </p>
      <div class="flex gap-4 pt-1">
        {#each FOUNDER.links as link (link.url)}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            class="text-muted transition-colors hover:text-primary"
          >
            <link.icon class="size-5" />
          </a>
        {/each}
      </div>
    </div>
  </div>
  <div class="flex w-full flex-col gap-2">
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      Key hires planned with this raise
    </p>
    <div class="grid w-full grid-cols-2 gap-4">
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
