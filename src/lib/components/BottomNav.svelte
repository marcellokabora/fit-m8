<script lang="ts">
  import { Zap, MessageCircle, User } from "@lucide/svelte";

  let { active }: { active: "discover" | "matches" | "profile" } = $props();

  const tabs = [
    { id: "discover", href: "/discover", icon: Zap, label: "Discover" },
    { id: "matches", href: "/matches", icon: MessageCircle, label: "Matches" },
    { id: "profile", href: "/profile", icon: User, label: "Profile" },
  ] as const;
</script>

<nav
  class="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-surface pb-safe"
>
  <div class="flex">
    {#each tabs as tab}
      <a
        href={tab.href}
        class="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors {tab.id ===
        active
          ? 'text-primary'
          : 'text-muted'}"
      >
        <tab.icon class="size-6" />
        {tab.label}
      </a>
    {/each}
  </div>
</nav>
