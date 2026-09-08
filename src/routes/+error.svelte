<script lang="ts">
  import { page } from "$app/state";
  import { Compass } from "@lucide/svelte";
  import Logo from "$lib/components/Logo.svelte";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let t = $derived(createTranslator($activeLanguage));
</script>

<div
  class="flex min-h-dvh w-full flex-1 flex-col items-center justify-center gap-6 bg-bg px-8 text-center"
>
  <Logo class="h-10 w-auto text-primary" />
  <div class="flex flex-col gap-2">
    <p class="text-7xl font-black text-primary">{page.status}</p>
    <h1 class="text-xl font-black text-text">{t.t("errors.notFoundTitle")}</h1>
    <p class="text-sm text-muted">{t.t("errors.notFoundHint")}</p>
  </div>
  <a
    href="/"
    class="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white active:scale-95"
  >
    <Compass class="size-4" />
    {t.t("errors.goHome")}
  </a>
</div>
