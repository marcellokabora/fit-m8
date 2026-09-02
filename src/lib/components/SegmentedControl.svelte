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

  let selectedIndex = $derived(
    Math.max(
      0,
      options.findIndex((o) => o.value === value),
    ),
  );
</script>

<div
  role="group"
  aria-label={ariaLabel}
  class={size === "lg"
    ? "relative isolate flex rounded-full border-2 border-border bg-surface p-1"
    : "relative isolate flex rounded-full border-2 border-border bg-bg p-0.5"}
>
  <div
    class="absolute inset-y-0 left-0 rounded-full bg-primary transition-transform duration-300 ease-out"
    style="width: calc(100% / {options.length}); transform: translateX({selectedIndex *
      100}%);"
  ></div>
  {#each options as option}
    <button
      type="button"
      onclick={() => onchange(option.value)}
      aria-pressed={value === option.value}
      class="relative z-10 flex-1 font-bold transition-colors {size === 'lg'
        ? 'rounded-full py-4 text-base'
        : 'rounded-full px-2 py-1.5 text-sm'} {value === option.value
        ? 'text-white'
        : 'text-muted'}"
    >
      {option.label}
    </button>
  {/each}
</div>
