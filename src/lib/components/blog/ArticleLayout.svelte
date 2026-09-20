<script lang="ts">
  import type { Snippet } from "svelte";
  import BlogHeader from "$lib/components/blog/BlogHeader.svelte";
  import type { BlogPostMetadata } from "$lib/blog";

  let {
    metadata,
    children,
  }: { metadata: BlogPostMetadata; children: Snippet } = $props();

  let formattedDate = $derived(
    new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(metadata.date)),
  );
</script>

<div class="flex min-h-dvh flex-col bg-bg pb-16">
  <div class="mx-auto flex w-full max-w-3xl flex-1 flex-col">
    <BlogHeader logoHref="/blog" />

    <img
      src={metadata.cover}
      alt={metadata.title}
      class="aspect-video w-full object-cover md:rounded-2xl"
    />

    <div class="flex flex-col gap-1 px-5 pt-6">
      <p class="text-xs font-semibold text-muted">{formattedDate}</p>
      <h1 class="text-2xl font-black text-text text-balance">
        {metadata.title}
      </h1>
    </div>

    <div
      class="article-content flex flex-col gap-4 px-5 pt-6 text-sm leading-relaxed text-text"
    >
      {@render children()}
    </div>
  </div>
</div>

<style>
  /* mdsvex compiles markdown straight to plain tags (h2/p/img/ul/...) with no classes, so
     this styles them directly using the app's existing color tokens. */
  .article-content :global(h2) {
    margin-top: 0.5rem;
    font-size: 1.125rem;
    font-weight: 800;
    color: var(--color-text);
  }
  .article-content :global(h3) {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text);
  }
  .article-content :global(p) {
    color: var(--color-text);
  }
  .article-content :global(ul),
  .article-content :global(ol) {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-left: 1.25rem;
  }
  .article-content :global(ul) {
    list-style: disc;
  }
  .article-content :global(ol) {
    list-style: decimal;
  }
  .article-content :global(blockquote) {
    border-left: 3px solid var(--color-primary);
    padding-left: 1rem;
    color: var(--color-muted);
    font-style: italic;
  }
  .article-content :global(img) {
    width: 100%;
    border-radius: 1rem;
    object-fit: cover;
  }
  .article-content :global(a) {
    color: var(--color-primary);
    font-weight: 600;
  }
  .article-content :global(strong) {
    font-weight: 700;
    color: var(--color-text);
  }
</style>
