<script lang="ts" generics="T extends string">
  interface Option<T extends string> {
    value: T;
    label: string;
  }

  let {
    options,
    value,
    ariaLabel,
    onchange,
  }: {
    options: readonly Option<T>[];
    value: T;
    ariaLabel: string;
    onchange: (value: T) => void;
  } = $props();
</script>

<div
  role="group"
  aria-label={ariaLabel}
  class="flex rounded-xl border-2 border-border bg-bg p-0.5"
>
  {#each options as option}
    <button
      type="button"
      onclick={() => onchange(option.value)}
      aria-pressed={value === option.value}
      class="flex-1 rounded-lg px-2 py-1.5 text-sm font-bold transition-colors {value ===
      option.value
        ? 'bg-primary text-white'
        : 'text-muted'}"
    >
      {option.label}
    </button>
  {/each}
</div>
