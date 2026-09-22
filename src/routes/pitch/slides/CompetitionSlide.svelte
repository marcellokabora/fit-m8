<script lang="ts">
  import {
    CircleCheck,
    CircleX,
    CircleAlert,
    Volleyball,
  } from "@lucide/svelte";
  import TinderIcon from "~icons/simple-icons/tinder";
  import StravaIcon from "~icons/simple-icons/strava";
  import MeetupIcon from "~icons/simple-icons/meetup";
  import LogoMark from "$lib/components/LogoMark.svelte";

  const COMPETITORS = [
    "Tinder",
    "Playtomic",
    "Strava",
    "Meetup",
    "FIT-M8",
  ] as const;
  const COMPETITOR_ICONS = [
    TinderIcon,
    Volleyball,
    StravaIcon,
    MeetupIcon,
    LogoMark,
  ] as const;

  // kept short on purpose - this table is a quick scan, not a spec sheet
  type Support = "yes" | "no" | "partial";
  type Cell = { label: string; support?: Support };
  type Row = { dimension: string; cells: Cell[] };
  const COMPETITION_ROWS: Row[] = [
    {
      dimension: "Primary intent",
      cells: [
        { label: "Romantic / Dating", support: "no" },
        { label: "Court & Club Booking", support: "no" },
        { label: "Fitness Tracking", support: "no" },
        { label: "Large Group Events", support: "no" },
        { label: "Peer-to-Peer Sports Matching", support: "yes" },
      ],
    },
    {
      dimension: "Sport & skill filtering",
      cells: [
        { label: "None", support: "no" },
        { label: "Racket Sports Only", support: "partial" },
        { label: "Activity Tags Only", support: "partial" },
        { label: "Event Categories Only", support: "partial" },
        { label: "100+ Sports & Skill Levels", support: "yes" },
      ],
    },
    {
      dimension: "Match dynamics",
      cells: [
        { label: "1-on-1 Only", support: "no" },
        { label: "Court Lobby Rentals", support: "no" },
        { label: "Follow / Kudos", support: "no" },
        { label: "Group Only", support: "partial" },
        { label: "1-on-1 & 4-Player Activity Loops", support: "yes" },
      ],
    },
    {
      dimension: "Real-time map discovery",
      cells: [
        { label: "No", support: "no" },
        { label: "Venue Map Only", support: "partial" },
        { label: "Heatmap Only", support: "partial" },
        { label: "No", support: "no" },
        { label: "Live Spot Check-Ins & Heatmaps", support: "yes" },
      ],
    },
    {
      dimension: "Frictionless swipe UI",
      cells: [
        { label: "Yes", support: "yes" },
        { label: "No", support: "no" },
        { label: "No", support: "no" },
        { label: "No", support: "no" },
        { label: "Yes (Swipe + Map Views)", support: "yes" },
      ],
    },
    {
      dimension: "Monetization engine",
      cells: [
        { label: "Dating Subscriptions" },
        { label: "Court Commission Only" },
        { label: "Subscription (Premium)" },
        { label: "Ticket / Group Fees" },
        {
          label: "Subscriptions + Trainer & Venue Marketplace",
          support: "yes",
        },
      ],
    },
  ];
</script>

<div
  class="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Competitive landscape
  </p>
  <h2 class="text-4xl font-black text-text text-balance text-center">
    FIT-M8 fills the gap between dating apps, fitness trackers, and group
    organizers
  </h2>

  <!-- Desktop/print: full table -->
  <table
    class="w-full border-collapse overflow-hidden rounded-2xl bg-surface text-sm shadow-sm"
  >
    <thead>
      <tr
        class="border-b border-border bg-linear-to-r from-primary/25 to-primary/5"
      >
        <th class="p-3 text-left font-semibold text-muted">Dimension</th>
        {#each COMPETITORS as name, i}
          <th
            class="p-3 text-left font-semibold {i === COMPETITORS.length - 1
              ? 'text-primary'
              : 'text-text'}"
          >
            <span class="inline-flex items-center gap-1.5">
              {#if COMPETITOR_ICONS[i]}
                {@const Icon = COMPETITOR_ICONS[i]}
                <Icon class="size-4 shrink-0" />
              {/if}
              {name}
            </span>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each COMPETITION_ROWS as row}
        <tr class="border-b border-border last:border-0">
          <td class="p-3 font-semibold text-text">{row.dimension}</td>
          {#each row.cells as cell, i}
            <td
              class="p-3 {i === COMPETITORS.length - 1
                ? 'font-semibold text-primary'
                : 'text-muted'}"
            >
              <span class="inline-flex items-center gap-1.5">
                {#if cell.support === "yes"}
                  <CircleCheck class="size-4 shrink-0 text-emerald-500" />
                {:else if cell.support === "no"}
                  <CircleX class="size-4 shrink-0 text-red-500" />
                {:else if cell.support === "partial"}
                  <CircleAlert class="size-4 shrink-0 text-amber-500" />
                {/if}
                {cell.label}
              </span>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- <div class="flex flex-col gap-2 text-center text-sm text-muted md:text-base">
    <p>
      <span class="font-semibold text-text">vs. Tinder:</span> removes romantic tension;
      filters specifically by sport preferences, skill tier, and activity availability.
    </p>
    <p>
      <span class="font-semibold text-text">vs. Strava:</span> complements activity
      trackers by turning logged activity into real-time, skill-matched sessions
      with other people, not just a solo feed.
    </p>
    <p>
      <span class="font-semibold text-text">vs. Meetup:</span> eliminates the friction
      of group event planning and static scheduling with direct 1-on-1 or 4-person
      instant matchmaking.
    </p>
  </div> -->
</div>
