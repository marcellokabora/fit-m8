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
    size = "sm",
  }: {
    options: readonly Option<T>[];
    value: T;
    ariaLabel: string;
    onchange: (value: T) => void;
    // "sm" keeps the compact filter-panel look; "lg" matches the height of surrounding form fields
    size?: "sm" | "lg";
  } = $props();
</script>

<div
  role="group"
  aria-label={ariaLabel}
  class={size === "lg"
    ? "flex rounded-2xl border-2 border-border bg-surface p-1"
    : "flex rounded-xl border-2 border-border bg-bg p-0.5"}
>
  {#each options as option}
    <button
      type="button"
      onclick={() => onchange(option.value)}
      aria-pressed={value === option.value}
      class="flex-1 font-bold transition-colors {size === 'lg'
        ? 'rounded-xl py-4 text-base'
        : 'rounded-lg px-2 py-1.5 text-sm'} {value === option.value
        ? 'bg-primary text-white'
        : 'text-muted'}"
    >
      {option.label}
    </button>
  {/each}
</div>
