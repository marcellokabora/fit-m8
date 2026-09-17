<script lang="ts">
  import type { BlogPostMetadata } from "$lib/blog";

  let { post }: { post: { slug: string; metadata: BlogPostMetadata } } = $props();

  let formattedDate = $derived(
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(post.metadata.date),
    ),
  );
</script>

<a
  href="/blog/{post.slug}"
  class="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-sm transition-transform active:scale-[0.98]"
>
  <img
    src={post.metadata.cover}
    alt={post.metadata.title}
    class="aspect-video w-full object-cover"
    loading="lazy"
  />
  <div class="flex flex-col gap-1.5 p-4">
    <p class="text-xs font-semibold text-muted">{formattedDate}</p>
    <h2 class="text-lg font-black text-text">{post.metadata.title}</h2>
    <p class="text-sm text-muted">{post.metadata.excerpt}</p>
  </div>
</a>
