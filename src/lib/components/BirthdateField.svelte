<script lang="ts">
  import { MIN_AGE, calculateAge } from "$lib/types";

  let {
    value = $bindable(""),
    label,
    underageMessage,
  }: {
    value?: string;
    label: string;
    underageMessage: string;
  } = $props();

  let age = $derived(value ? calculateAge(value) : 0);
  let isUnderage = $derived(value !== "" && age < MIN_AGE);
  // Native date input max — caps the picker at the most recent day someone could turn MIN_AGE
  let maxBirthdate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - MIN_AGE);
    return d.toISOString().slice(0, 10);
  })();
</script>

<div>
  <div
    class="flex items-center justify-between rounded-2xl border-2 bg-surface px-4 py-4 {isUnderage
      ? 'border-error'
      : 'border-border'}"
  >
    <label for="birthdate-field-input" class="text-sm font-semibold text-text">
      {label}
    </label>
    <input
      id="birthdate-field-input"
      type="date"
      bind:value
      max={maxBirthdate}
      class="bg-transparent text-right text-base text-text outline-none"
    />
  </div>
  {#if isUnderage}
    <p class="mt-2 text-xs font-semibold text-error">
      {underageMessage}
    </p>
  {/if}
</div>
