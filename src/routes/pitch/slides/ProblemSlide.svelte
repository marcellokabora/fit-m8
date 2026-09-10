<script lang="ts">
  import phoneImg from "$lib/assets/phone.png";

  const PROBLEM_POINTS = [
    {
      title: "Tinder / dating apps are misaligned",
      desc: "Romance-first focus creates awkward dynamics when users strictly want a tennis partner or workout buddy.",
    },
    {
      title: "Bumble (BFF / Date) lacks sports intent",
      desc: "Generic social profiles don't filter by sport, skill level, position, or schedule availability.",
    },
    {
      title: "Meetup is group-heavy & rigid",
      desc: "Designed for large group events with fixed schedules, making spontaneous 1-on-1 or 4-player match-ups difficult to organize.",
    },
  ] as const;
</script>

<div
  class="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 md:flex-row md:gap-16 print:max-w-2xl print:flex-col"
>
  <div
    class="flex flex-1 flex-col gap-6 text-center md:text-left print:text-center"
  >
    <h2 class="text-2xl font-black text-text md:text-4xl text-balance">
      Existing social platforms fail active adults looking for sports partners.
    </h2>
    <p class="text-base text-muted md:text-lg">
      Active adults (18–45) moving to new cities, picking up racket or group
      sports, or seeking gym accountability have nowhere dedicated to look for a
      partner.
    </p>
    <div class="flex flex-col gap-3 md:gap-4">
      {#each PROBLEM_POINTS as point}
        <div class="rounded-2xl bg-surface p-4 shadow-sm md:p-5">
          <p class="font-bold text-text md:text-lg">{point.title}</p>
          <p class="text-sm text-muted md:text-base">{point.desc}</p>
        </div>
      {/each}
    </div>
  </div>
  <div
    class="relative hidden w-36 shrink-0 -rotate-3 md:block md:w-90 print:hidden"
  >
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
        src="/logo/fit-m8-logo-green.png"
        alt="FIT-M8"
        class="size-12 rounded-full object-cover md:size-40"
      />
    </div>
  </div>
</div>
