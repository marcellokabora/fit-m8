<script lang="ts">
  import { TrendingUp, Users, Globe, Megaphone } from "@lucide/svelte";
  import LinkedinIcon from "~icons/simple-icons/linkedin";
  import GithubIcon from "~icons/simple-icons/github";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import marcelloPhoto from "$lib/assets/marcello.jpg";

  const FOUNDER = {
    photo: marcelloPhoto,
    name: "Marcello Annicchairico",
    role: "Founder & Engineer",
    desc: "Engineered and launched Fit-m8 end-to-end. Focused on core product architecture, feature iteration, and tech infrastructure.",
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

  // Open roles we're hiring for - not existing team members yet.
  const OPEN_ROLES = [
    {
      icon: TrendingUp,
      role: "Head of Growth",
      desc: "Drive hyper-local CAC reduction, sports club partnerships.",
    },
    {
      icon: Megaphone,
      role: "Community Manager",
      desc: "Event management & organic user retention.",
    },
    {
      icon: Users,
      role: "Advisory Board",
      desc: "Fitness industry veterans and marketplace-scaling advisors.",
    },
  ] as const;
</script>

<svelte:head>
  <title>Team · FIT-M8</title>
  <meta
    name="description"
    content="Meet the founder behind FIT-M8 and the open roles we're hiring for."
  />
  <link rel="canonical" href="https://fit-m8.app/team" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Team · FIT-M8" />
  <meta
    property="og:description"
    content="Meet the founder behind FIT-M8 and the open roles we're hiring for."
  />
  <meta property="og:url" content="https://fit-m8.app/team" />
  <meta
    property="og:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Team · FIT-M8" />
  <meta
    name="twitter:description"
    content="Meet the founder behind FIT-M8 and the open roles we're hiring for."
  />
  <meta
    name="twitter:image"
    content="https://fit-m8.app/logo/social-preview.png"
  />
</svelte:head>

<div class="mx-auto flex w-full container flex-col pb-6">
  <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col">
    <SiteHeader />

    <div class="flex flex-col gap-8 px-5 pt-6 text-text">
      <div class="flex flex-col gap-2 text-center">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          Team
        </p>
        <h1 class="text-3xl font-black text-text text-balance">
          The people building FIT-M8
        </h1>
      </div>

      <div
        class="flex w-full flex-col items-center gap-6 rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface to-surface p-6 text-center shadow-sm sm:flex-row sm:items-center sm:gap-8 sm:p-8 sm:text-left"
      >
        <img
          src={FOUNDER.photo}
          alt={FOUNDER.name}
          class="size-36 shrink-0 rounded-full object-cover ring-4 ring-primary/30"
        />
        <div class="flex flex-col items-center gap-2 sm:items-start">
          <p class="text-xl font-bold text-text">{FOUNDER.name}</p>
          <p
            class="text-sm font-semibold uppercase tracking-widest text-primary"
          >
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

      <div class="flex w-full flex-col gap-4">
        <p
          class="text-center text-xs font-semibold uppercase tracking-widest text-primary"
        >
          Open roles we're hiring for
        </p>
        <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {#each OPEN_ROLES as role (role.role)}
            <div
              class="flex items-start gap-3 rounded-2xl bg-surface p-4 text-left shadow-sm"
            >
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <role.icon class="size-5" />
              </span>
              <div>
                <p class="font-bold text-text">{role.role}</p>
                <p class="text-sm text-muted">{role.desc}</p>
              </div>
            </div>
          {/each}
        </div>
        <a
          href="/contact"
          class="mx-auto flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-bg active:scale-95 mt-4"
        >
          Interested? Get in touch
        </a>
      </div>
    </div>
  </div>
</div>
