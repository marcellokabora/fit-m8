<script lang="ts">
  import { Zap, MessageCircle, User } from "@lucide/svelte";
  import { unreadMatchCount } from "$lib/stores/unread";
  import { activeLanguage, createTranslator } from "$lib/stores/language";

  let { active }: { active: "discover" | "matches" | "profile" } = $props();

  let t = $derived(createTranslator($activeLanguage));
  const tabs = [
    { id: "discover", href: "/discover", icon: Zap, key: "nav.discover" },
    {
      id: "matches",
      href: "/matches",
      icon: MessageCircle,
      key: "nav.matches",
    },
    { id: "profile", href: "/profile", icon: User, key: "nav.profile" },
  ] as const;
</script>

<nav
  class="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface pb-safe"
>
  <div class="flex">
    {#each tabs as tab}
      <a
        href={tab.href}
        class="relative flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors {tab.id ===
        active
          ? 'text-primary'
          : 'text-muted'}"
      >
        <span class="relative">
          <tab.icon class="size-6" />
          {#if tab.id === "matches" && $unreadMatchCount > 0}
            <span
              class="absolute -right-1.5 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            >
              {$unreadMatchCount > 9 ? "9+" : $unreadMatchCount}
            </span>
          {/if}
        </span>
        {t.t(tab.key)}
      </a>
    {/each}
  </div>
</nav>
