<script lang="ts">
  import phoneImg from "$lib/assets/phone.png";

  const PROBLEM_POINTS = [
    {
      title: "Tinder dating apps are misaligned",
      desc: "Romance-first focus creates awkward dynamics when users strictly want a tennis partner or workout buddy.",
    },
    {
      title: "Strava lacks real matchmaking",
      desc: "Great for logging solo activity, but it doesn't connect you with nearby people to actually play or train with.",
    },
    {
      title: "Meetup is group-heavy & rigid",
      desc: "Designed for large group events with fixed schedules, making spontaneous 1-on-1 or 4-player match-ups difficult to organize.",
    },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-5xl flex-1 flex-row items-center justify-center gap-16 print:max-w-2xl print:flex-col"
>
  <div class="flex flex-1 flex-col gap-6 text-left print:text-center">
    <h2 class="text-4xl font-black text-text text-balance">
      Existing social platforms fail active adults looking for sports partners.
    </h2>
    <p class="text-lg text-muted">
      Active adults (18–45) moving to new cities, picking up racket or group
      sports, or seeking gym accountability have nowhere dedicated to look for a
      partner.
    </p>
    <div class="flex flex-col gap-4">
      {#each PROBLEM_POINTS as point}
        <div class="rounded-2xl bg-surface p-5 shadow-sm">
          <p class="font-bold text-text text-lg">{point.title}</p>
          <p class="text-base text-muted">{point.desc}</p>
        </div>
      {/each}
    </div>
  </div>
  <div class="relative w-90 shrink-0 -rotate-3 print:hidden">
    <img
      src={phoneImg}
      alt=""
      aria-hidden="true"
      class="h-auto w-full drop-shadow-2xl"
    />
    <div
      class="absolute inset-x-[4%] top-[3.5%] bottom-[3.5%] flex items-center justify-center"
    >
      <img
        src="/logo/logo-zoom.png"
        alt="FIT-M8"
        class="size-50 rounded-full object-cover"
      />
    </div>
  </div>
</div>
