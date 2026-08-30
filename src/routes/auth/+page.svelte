<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // The auth flow now lives in a modal on the home page; keep this route
  // around only to redirect old bookmarks/links there.
  onMount(() => {
    goto("/", { replaceState: true });
  });
</script>
