<script lang="ts">
  import activitiesScreen from "$lib/assets/screens/activities.png?enhanced";
  import TinderIcon from "~icons/simple-icons/tinder";
  import StravaIcon from "~icons/simple-icons/strava";
  import MeetupIcon from "~icons/simple-icons/meetup";

  const PROBLEM_POINTS = [
    {
      icon: TinderIcon,
      title: "Tinder & Bumble — Wrong Intent",
      desc: "Romance-first focus creates awkward dynamics when users strictly want a tennis, padel, or gym partner.",
    },
    {
      icon: StravaIcon,
      title: "Strava & Playtomic — Solo & Post-Activity Focus",
      desc: "Great for logging solo workouts after the fact, but lacks 1-on-1 discovery and real-time match coordination.",
    },
    {
      icon: MeetupIcon,
      title: "Meetup & Facebook — High Friction & Rigid",
      desc: "Built for broad, group-based events with fixed schedules—making spontaneous 1-on-1 or 4-player matches difficult to organize.",
    },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-5xl flex-1 flex-row items-center justify-center gap-16 print:max-w-2xl print:flex-col"
>
  <div class="flex flex-1 flex-col gap-6 text-left print:text-center">
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">
      The Problem
    </p>
    <h2 class="text-4xl font-black text-text text-balance">
      Existing Social Platforms Fail Active Adults Seeking Sports Partners
    </h2>
    <p class="text-lg text-muted">
      Active adults (18–45) moving to new cities, picking up racket sports, or
      seeking workout accountability have no dedicated space to find partners.
    </p>
    <div class="flex flex-col gap-4">
      {#each PROBLEM_POINTS as point}
        <div class="flex gap-4 rounded-2xl bg-surface p-5 shadow-sm">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <point.icon class="size-5" />
          </span>
          <div>
            <p class="font-bold text-text text-lg">{point.title}</p>
            <p class="text-base text-muted">{point.desc}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="relative w-90 shrink-0 -rotate-3 print:hidden">
    <div
      class="absolute inset-8 -z-10 rounded-full bg-primary/30 blur-3xl"
      aria-hidden="true"
    ></div>
    <enhanced:img
      src={activitiesScreen}
      alt=""
      aria-hidden="true"
      sizes="360px"
      class="h-auto w-full rounded-2xl drop-shadow-2xl"
    />
    <!-- <div
      class="absolute inset-x-[4%] top-[3.5%] bottom-[3.5%] flex items-center justify-center"
    >
      <img src="/icons/mipmap-xxxhdpi/ic_launcher.png" alt="FIT-M8" class="" />
    </div> -->
  </div>
</div>
