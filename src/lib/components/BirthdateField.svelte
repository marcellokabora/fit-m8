<script lang="ts">
  import { untrack } from "svelte";
  import { Calendar } from "@lucide/svelte";
  import BottomSheet from "$lib/components/BottomSheet.svelte";
  import { MIN_AGE, calculateAge } from "$lib/types";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

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

  let t = $derived(createTranslator($activeLanguage));

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

  // Keeps the committed fields in sync if `value` is reset/loaded from outside (e.g. draft
  // reload). day/month/year reads are untracked so this only reacts to `value` changing.
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

  let age = $derived(value ? calculateAge(value) : 0);
  let isUnderage = $derived(value !== "" && age < MIN_AGE);
  let formattedValue = $derived(
    value
      ? new Intl.DateTimeFormat($activeLanguage, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(`${value}T00:00:00`))
      : "",
  );

  // --- Bottom sheet picker (draft values, only committed to `value` on confirm) ---
  let open = $state(false);
  let draftDay = $state<number | null>(null);
  let draftMonth = $state<number | null>(null);
  let draftYear = $state<number | null>(null);

  let draftDayCount = $derived(
    draftYear && draftMonth ? new Date(draftYear, draftMonth, 0).getDate() : 31,
  );
  let days = $derived(Array.from({ length: draftDayCount }, (_, i) => i + 1));
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
    if (draftDay !== null && draftDay > draftDayCount) draftDay = draftDayCount;
  });

  let dayColumn = $state<HTMLDivElement>();
  let monthColumn = $state<HTMLDivElement>();
  let yearColumn = $state<HTMLDivElement>();

  // Scroll each column to the current selection when the sheet opens
  $effect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      for (const column of [dayColumn, monthColumn, yearColumn]) {
        column
          ?.querySelector('[data-selected="true"]')
          ?.scrollIntoView({ block: "center" });
      }
    });
  });

  function openSheet() {
    draftDay = day;
    draftMonth = month;
    draftYear = year;
    open = true;
  }

  function closeSheet() {
    open = false;
  }

  function confirm() {
    if (draftDay === null || draftMonth === null || draftYear === null) return;
    day = draftDay;
    month = draftMonth;
    year = draftYear;
    value = `${draftYear}-${String(draftMonth).padStart(2, "0")}-${String(draftDay).padStart(2, "0")}`;
    open = false;
  }

  const optionClass =
    "block w-full shrink-0 rounded-xl px-3 py-3 text-center text-base";
</script>

<div>
  <button
    type="button"
    onclick={openSheet}
    class="flex w-full items-center gap-3 rounded-2xl border-2 bg-surface px-4 py-4 text-left {isUnderage
      ? 'border-error'
      : 'border-border'}"
  >
    <Calendar class="size-5 shrink-0 text-muted" />
    <span class="text-base {value ? 'text-text' : 'text-muted'}">
      {value ? formattedValue : label}
    </span>
  </button>
  {#if isUnderage}
    <p class="mt-2 text-xs font-semibold text-error">
      {underageMessage}
    </p>
  {/if}
</div>

<BottomSheet
  bind:open
  onClose={closeSheet}
  closeLabel={t.t("common.close")}
  bgClass="bg-surface"
  maxHeightClass="max-h-[70dvh]"
>
  <div class="flex flex-col gap-1 px-7 pb-2 pt-2">
    <h2 class="text-xl font-black text-text">{label}</h2>
  </div>
  <div class="grid h-64 grid-cols-3 gap-2 px-5 pb-4">
    <div
      bind:this={dayColumn}
      class="hide-scrollbar overflow-y-auto rounded-2xl border-2 border-border relative"
    >
      <p
        class="px-3 py-2 text-xs font-semibold uppercase text-muted text-center sticky top-0 bg-surface"
      >
        {dayLabel}
      </p>
      {#each days as d (d)}
        <button
          type="button"
          data-selected={draftDay === d}
          onclick={() => (draftDay = d)}
          class="{optionClass} {draftDay === d
            ? 'font-bold text-primary'
            : 'text-text'}"
        >
          {d}
        </button>
      {/each}
    </div>
    <div
      bind:this={monthColumn}
      class="hide-scrollbar overflow-y-auto rounded-2xl border-2 border-border"
    >
      <p
        class="px-3 py-2 text-xs font-semibold uppercase text-muted text-center sticky top-0 bg-surface"
      >
        {monthLabel}
      </p>
      {#each months as m (m.value)}
        <button
          type="button"
          data-selected={draftMonth === m.value}
          onclick={() => (draftMonth = m.value)}
          class="{optionClass} {draftMonth === m.value
            ? 'font-bold text-primary'
            : 'text-text'}"
        >
          {m.label}
        </button>
      {/each}
    </div>
    <div
      bind:this={yearColumn}
      class="hide-scrollbar overflow-y-auto rounded-2xl border-2 border-border"
    >
      <p
        class="px-3 py-2 text-xs font-semibold uppercase text-muted text-center sticky top-0 bg-surface"
      >
        {yearLabel}
      </p>
      {#each years as y (y)}
        <button
          type="button"
          data-selected={draftYear === y}
          onclick={() => (draftYear = y)}
          class="{optionClass} {draftYear === y
            ? 'font-bold text-primary'
            : 'text-text'}"
        >
          {y}
        </button>
      {/each}
    </div>
  </div>
  <div class="flex gap-3 border-t border-border px-7 py-4">
    <button
      type="button"
      onclick={closeSheet}
      class="flex-1 rounded-2xl border-2 border-border py-3 text-sm font-semibold text-text active:scale-95"
    >
      {t.t("common.cancel")}
    </button>
    <button
      type="button"
      onclick={confirm}
      disabled={draftDay === null || draftMonth === null || draftYear === null}
      class="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-40"
    >
      {t.t("common.done")}
    </button>
  </div>
</BottomSheet>
