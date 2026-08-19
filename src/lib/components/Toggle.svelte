<script lang="ts">
  let {
    checked,
    ariaLabel,
    onchange,
  }: {
    checked: boolean;
    ariaLabel: string;
    onchange: (checked: boolean) => void;
  } = $props();
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={ariaLabel}
  onclick={() => onchange(!checked)}
  class="relative h-7 w-12 shrink-0 rounded-full transition-colors {checked
    ? 'bg-primary'
    : 'bg-border'}"
>
  <span
    class="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform {checked
      ? 'translate-x-5'
      : 'translate-x-0'}"
  ></span>
</button>
