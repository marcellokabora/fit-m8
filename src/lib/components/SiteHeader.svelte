<script lang="ts">
  import LogoText from "$lib/components/LogoText.svelte";
  import SideMenu from "$lib/components/SideMenu.svelte";

  let {
    logoHref = "/",
    showLogo = true,
  }: { logoHref?: string; showLogo?: boolean } = $props();
</script>

<SideMenu />

{#if showLogo}
  <div
    class="sticky top-0 z-10 flex items-center justify-center bg-bg px-4 pb-3 pt-5"
  >
    <a href={logoHref} aria-label="FIT-M8 home">
      <LogoText class="h-8 w-auto text-primary" />
    </a>
  </div>
{/if}
