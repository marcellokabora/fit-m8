<script lang="ts">
  import { Check, Sun, Moon } from "@lucide/svelte";
  import { activeTheme, THEMES } from "$lib/stores/theme";
</script>

<div>
  <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
    Appearance
  </h3>
  <div class="mb-4 flex rounded-xl border-2 border-border bg-bg p-0.5">
    <button
      onclick={() => activeTheme.selectMode("light")}
      class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors {$activeTheme.mode ===
      'light'
        ? 'bg-primary text-white'
        : 'text-muted'}"
    >
      <Sun class="size-4" />
      Light
    </button>
    <button
      onclick={() => activeTheme.selectMode("dark")}
      class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors {$activeTheme.mode ===
      'dark'
        ? 'bg-primary text-white'
        : 'text-muted'}"
    >
      <Moon class="size-4" />
      Dark
    </button>
  </div>

  <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
    App Theme
  </h3>
  <div class="grid grid-cols-3 gap-3">
    {#each THEMES as theme}
      <button
        onclick={() => activeTheme.selectTheme(theme.id)}
        class="flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all active:scale-95 {$activeTheme.themeId ===
        theme.id
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface'}"
      >
        <span
          class="relative flex size-10 items-center justify-center rounded-full shadow-sm"
          style="background: linear-gradient(135deg, {theme.primary} 50%, {theme.secondary} 50%); box-shadow: 0 0 0 3px {$activeTheme.mode ===
          'dark'
            ? theme.dark.bg
            : theme.light.bg}"
        >
          {#if $activeTheme.themeId === theme.id}
            <Check class="size-5 text-white drop-shadow" />
          {/if}
        </span>
        <span class="text-xs font-semibold text-text">{theme.label}</span>
      </button>
    {/each}
  </div>
</div>
