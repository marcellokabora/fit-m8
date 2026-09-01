<script lang="ts">
  import { Check, Sun, Moon } from "@lucide/svelte";
  import { activeTheme, THEMES } from "$lib/stores/theme";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));
  let paletteOpen = $state(false);
  let currentTheme = $derived(
    THEMES.find((theme) => theme.id === $activeTheme.themeId) ?? THEMES[0],
  );
</script>

<svelte:window onclick={() => (paletteOpen = false)} />

<div>
  <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
    {t.t("appearance.title")}
  </h3>
  <div class="flex gap-2">
    <div class="flex flex-1 rounded-xl border-2 border-border bg-bg p-0.5">
      <button
        onclick={() => activeTheme.selectMode("light")}
        class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors {$activeTheme.mode ===
        'light'
          ? 'bg-primary text-white'
          : 'text-muted'}"
      >
        <Sun class="size-4" />
        {t.t("appearance.light")}
      </button>
      <button
        onclick={() => activeTheme.selectMode("dark")}
        class="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors {$activeTheme.mode ===
        'dark'
          ? 'bg-primary text-white'
          : 'text-muted'}"
      >
        <Moon class="size-4" />
        {t.t("appearance.dark")}
      </button>
    </div>

    <div class="relative">
      <button
        type="button"
        onclick={(e) => {
          e.stopPropagation();
          paletteOpen = !paletteOpen;
        }}
        aria-label={t.t("appearance.appTheme")}
        aria-expanded={paletteOpen}
        aria-haspopup="true"
        class="flex h-full items-center rounded-xl border-2 border-border bg-bg px-3"
      >
        <span
          class="size-6 rounded-full shadow-sm"
          style="background: linear-gradient(135deg, {currentTheme.primary} 50%, {currentTheme.primaryDark} 50%);"
        ></span>
      </button>

      {#if paletteOpen}
        <div
          role="menu"
          onclick={(e) => e.stopPropagation()}
          class="absolute right-0 top-full z-10 mt-2 flex gap-2 rounded-2xl border-2 border-border bg-surface p-3 shadow-lg"
        >
          {#each THEMES as theme}
            <button
              onclick={() => {
                activeTheme.selectTheme(theme.id);
                paletteOpen = false;
              }}
              aria-label={t.t(`appearance.${theme.id}` as any)}
              class="relative flex size-10 items-center justify-center rounded-full shadow-sm transition-transform active:scale-95"
              style="background: linear-gradient(135deg, {theme.primary} 50%, {theme.primaryDark} 50%); box-shadow: 0 0 0 3px {$activeTheme.mode ===
              'dark'
                ? theme.dark.bg
                : theme.light.bg}, 0 0 0 {$activeTheme.themeId === theme.id
                ? '5px'
                : '3px'} {$activeTheme.themeId === theme.id
                ? theme.primary
                : 'transparent'}"
            >
              {#if $activeTheme.themeId === theme.id}
                <Check class="size-5 text-white drop-shadow" />
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
