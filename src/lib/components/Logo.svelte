<script lang="ts">
  let { class: className = "" }: { class?: string } = $props();
</script>

<!-- Raster mark (no vector source exists for this artwork) - bg already matches --color-bg -->
<img src="/icons/icon-512.png" alt="FIT-M8" class={className} />
