<script lang="ts">
  import { goto } from "$app/navigation";
  import { authUser } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import ActivityIcon from "$lib/components/ActivityIcon.svelte";

  onMount(() => {
    return authUser.subscribe((user) => {
      if (user) goto("/discover");
    });
  });

  const HERO_ACTIVITIES = [
    { id: "jogging", label: "Jogging" },
    { id: "padel", label: "Padel" },
    { id: "beach-volley", label: "Beach Volley" },
    { id: "tennis", label: "Tennis" },
    { id: "basketball", label: "Basketball" },
    { id: "cycling", label: "Cycling" },
  ];
</script>

<div
  class="flex min-h-screen flex-col items-center justify-between bg-primary px-6 pb-12 pt-20"
>
  <!-- Logo / Hero -->
  <div class="flex flex-col items-center gap-4 text-white">
    <div
      class="flex size-24 items-center justify-center overflow-hidden rounded-3xl bg-secondary shadow-xl"
    >
      <img
        src="/logo.jpg"
        alt="FitMate logo"
        class="h-full w-full object-cover"
      />
    </div>
    <h1 class="text-5xl font-black tracking-tight">FitMate</h1>
    <p class="text-center text-lg font-medium opacity-80">
      Find your perfect sports partner.<br />Swipe. Match. Play.
    </p>
  </div>

  <!-- Activity bubbles -->
  <div class="flex flex-wrap justify-center gap-3">
    {#each HERO_ACTIVITIES as activity}
      <span
        class="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
      >
        <ActivityIcon id={activity.id} class="size-4" />
        {activity.label}
      </span>
    {/each}
  </div>

  <!-- CTA -->
  <div class="flex w-full flex-col gap-3">
    <a
      href="/auth"
      class="block w-full rounded-2xl bg-secondary py-4 text-center text-lg font-bold text-white shadow-lg active:scale-95"
    >
      Get Started
    </a>
    <a
      href="/auth?mode=login"
      class="block w-full rounded-2xl border-2 border-white/30 py-4 text-center text-lg font-semibold text-white active:scale-95"
    >
      I already have an account
    </a>
  </div>
</div>
