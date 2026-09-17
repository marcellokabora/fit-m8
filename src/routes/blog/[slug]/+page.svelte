<script lang="ts">
  import ArticleLayout from "$lib/components/blog/ArticleLayout.svelte";
  import type { BlogPost } from "$lib/blog";

  let { data }: { data: { post: BlogPost } } = $props();

  let post = $derived(data.post);
  let url = $derived(`https://fit-m8.app/blog/${post.slug}`);
  let coverUrl = $derived(`https://fit-m8.app${post.metadata.cover}`);
</script>

<svelte:head>
  <title>{post.metadata.title} · FIT-M8</title>
  <meta name="description" content={post.metadata.excerpt} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={post.metadata.title} />
  <meta property="og:description" content={post.metadata.excerpt} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={coverUrl} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={post.metadata.title} />
  <meta name="twitter:description" content={post.metadata.excerpt} />
  <meta name="twitter:image" content={coverUrl} />
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    description: post.metadata.excerpt,
    image: coverUrl,
    datePublished: post.metadata.date,
    url,
    publisher: { "@type": "Organization", name: "FIT-M8" },
  })}<\/script>`}
</svelte:head>

<ArticleLayout metadata={post.metadata}>
  <post.component />
</ArticleLayout>
