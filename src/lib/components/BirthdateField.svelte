<script lang="ts">
  import { untrack } from "svelte";
  import { ChevronDown } from "@lucide/svelte";
  import { MIN_AGE, calculateAge } from "$lib/types";
  import { activeLanguage } from "$lib/stores/language";

  let {
    value = $bindable(""),
    label,
    underageMessage,
    dayLabel = "Day",
    monthLabel = "Month",
    yearLabel = "Year",
  }: {
    value?: string;
    label: string;
    underageMessage: string;
    dayLabel?: string;
    monthLabel?: string;
    yearLabel?: string;
  } = $props();

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - MIN_AGE;
  const minYear = currentYear - 100;

  function parseValue(raw: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!match) return { day: null, month: null, year: null };
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  const initial = parseValue(value);
  let day = $state<number | null>(initial.day);
  let month = $state<number | null>(initial.month);
  let year = $state<number | null>(initial.year);

  // Keeps the selects in sync if `value` is reset/loaded from outside (e.g. draft reload).
  // day/month/year reads are untracked so this only reacts to `value` changing, not to the
  // user's own select changes (which would otherwise immediately reset the just-picked value).
  $effect(() => {
    const parsed = parseValue(value);
    untrack(() => {
      if (
        parsed.day !== day ||
        parsed.month !== month ||
        parsed.year !== year
      ) {
        day = parsed.day;
        month = parsed.month;
        year = parsed.year;
      }
    });
  });

  let dayCount = $derived(
    year && month ? new Date(year, month, 0).getDate() : 31,
  );
  let days = $derived(Array.from({ length: dayCount }, (_, i) => i + 1));
  let years = $derived(
    Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
  );
  let months = $derived(
    Array.from({ length: 12 }, (_, i) => {
      const name = new Intl.DateTimeFormat($activeLanguage, {
        month: "short",
      }).format(new Date(2000, i, 1));
      return {
        value: i + 1,
        label: name.charAt(0).toUpperCase() + name.slice(1),
      };
    }),
  );

  $effect(() => {
    // Clamp e.g. day 30 when switching from a 31-day month to a 30/28-day one
    if (day !== null && day > dayCount) day = dayCount;
  });

  $effect(() => {
    if (day !== null && month !== null && year !== null) {
      const next = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      untrack(() => {
        if (next !== value) value = next;
      });
    } else {
      untrack(() => {
        if (value !== "") value = "";
      });
    }
  });

  let age = $derived(value ? calculateAge(value) : 0);
  let isUnderage = $derived(value !== "" && age < MIN_AGE);

  const selectClass =
    "w-full appearance-none rounded-2xl border-2 border-border bg-surface px-3 py-4 text-center text-base text-text outline-none focus:border-primary";
</script>

<div>
  <!-- <p class="mb-2 text-sm font-semibold text-text">{label}</p> -->
  <div class="grid grid-cols-3 gap-2">
    <div class="relative">
      <select bind:value={day} class={selectClass}>
        <option value={null} disabled>{dayLabel}</option>
        {#each days as d (d)}
          <option value={d}>{d}</option>
        {/each}
      </select>
      <ChevronDown
        class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
    <div class="relative">
      <select bind:value={month} class={selectClass}>
        <option value={null} disabled>{monthLabel}</option>
        {#each months as m (m.value)}
          <option value={m.value}>{m.label}</option>
        {/each}
      </select>
      <ChevronDown
        class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
    <div class="relative">
      <select bind:value={year} class={selectClass}>
        <option value={null} disabled>{yearLabel}</option>
        {#each years as y (y)}
          <option value={y}>{y}</option>
        {/each}
      </select>
      <ChevronDown
        class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  </div>
  {#if isUnderage}
    <p class="mt-2 text-xs font-semibold text-error">
      {underageMessage}
    </p>
  {/if}
</div>
