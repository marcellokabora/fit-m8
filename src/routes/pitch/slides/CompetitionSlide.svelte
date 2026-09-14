<script lang="ts">
  import { CircleCheck, CircleX, CircleAlert } from "@lucide/svelte";
  import TinderIcon from "~icons/simple-icons/tinder";
  import StravaIcon from "~icons/simple-icons/strava";
  import MeetupIcon from "~icons/simple-icons/meetup";
  import LogoIcon from "$lib/components/LogoIcon.svelte";

  const COMPETITORS = ["Tinder", "Strava", "Meetup", "FIT-M8"] as const;
  const COMPETITOR_ICONS = [
    TinderIcon,
    StravaIcon,
    MeetupIcon,
    LogoIcon,
  ] as const;

  type Support = "yes" | "no" | "partial";
  type Cell = { label: string; support?: Support };
  type Row = { dimension: string; cells: Cell[] };
  const COMPETITION_ROWS: Row[] = [
    {
      dimension: "Primary intent",
      cells: [
        { label: "Romantic / Dating" },
        { label: "Fitness Tracking & Social Feed" },
        { label: "Large Group Events" },
        { label: "Peer-to-Peer Sports Matching" },
      ],
    },
    {
      dimension: "Sport & skill filtering",
      cells: [
        { label: "None", support: "no" },
        { label: "Activity Type Tags Only", support: "partial" },
        { label: "Event Categories Only", support: "partial" },
        { label: "100+ Sports & Skill Levels", support: "yes" },
      ],
    },
    {
      dimension: "Match dynamics",
      cells: [
        { label: "1-on-1" },
        { label: "Follow / Kudos, No Matching" },
        { label: "Group / Event Host" },
        { label: "1-on-1 & 4-Player Activity Loops" },
      ],
    },
    {
      dimension: "Real-time map check-in",
      cells: [
        { label: "No", support: "no" },
        { label: "No", support: "no" },
        { label: "No", support: "no" },
        { label: "Live Spot Check-Ins", support: "yes" },
      ],
    },
    {
      dimension: "Frictionless swipe UI",
      cells: [
        { label: "Yes", support: "yes" },
        { label: "No", support: "no" },
        { label: "No", support: "no" },
        { label: "Yes", support: "yes" },
      ],
    },
  ];
</script>

<div
  class="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6"
>
  <p class="text-xs font-semibold uppercase tracking-widest text-primary">
    Competitive landscape
  </p>
  <h2
    class="text-2xl font-black text-text md:text-4xl text-balance text-center"
  >
    FIT-M8 captures the unserved space between romantic dating apps, passive
    fitness trackers, and rigid group organizers.
  </h2>

  <!-- Mobile: stacked cards, one per dimension -->
  <div class="flex w-full flex-col gap-3 md:hidden print:hidden">
    {#each COMPETITION_ROWS as row}
      <div class="rounded-2xl bg-surface p-4 shadow-sm">
        <p
          class="mb-2 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          {row.dimension}
        </p>
        <div class="flex flex-col gap-1.5 text-sm">
          {#each row.cells as cell, i}
            <div class="flex items-center justify-between gap-3">
              <span class="flex items-center gap-1.5 text-muted">
                {#if COMPETITOR_ICONS[i]}
                  {@const Icon = COMPETITOR_ICONS[i]}
                  <Icon class="size-3.5 shrink-0" />
                {/if}
                {COMPETITORS[i]}
              </span>
              <span
                class="flex items-center gap-1 font-semibold {i === 3
                  ? 'text-primary'
                  : 'text-text'}"
              >
                {#if cell.support === "yes"}
                  <CircleCheck class="size-4 text-primary" />
                {:else if cell.support === "no"}
                  <CircleX class="size-4 text-muted" />
                {:else if cell.support === "partial"}
                  <CircleAlert class="size-4 text-muted" />
                {/if}
                {cell.label}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Desktop/print: full table -->
  <table
    class="hidden w-full border-collapse overflow-hidden rounded-2xl bg-surface text-sm shadow-sm md:table print:table"
  >
    <thead>
      <tr class="border-b border-border">
        <th class="p-3 text-left font-semibold text-muted">Dimension</th>
        {#each COMPETITORS as name, i}
          <th
            class="p-3 text-left font-semibold {i === 3
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
              class="p-3 {i === 3
                ? 'font-semibold text-primary'
                : 'text-muted'}"
            >
              <span class="inline-flex items-center gap-1.5">
                {#if cell.support === "yes"}
                  <CircleCheck class="size-4 shrink-0 text-primary" />
                {:else if cell.support === "no"}
                  <CircleX class="size-4 shrink-0 text-muted" />
                {:else if cell.support === "partial"}
                  <CircleAlert class="size-4 shrink-0 text-muted" />
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
