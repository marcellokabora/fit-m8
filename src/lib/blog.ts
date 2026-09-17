// Loads every markdown post under src/lib/content/blog via mdsvex (see vite.config.ts's
// sveltekit({ extensions, preprocess }) - each .md file compiles to a Svelte component plus a
// named `metadata` export (its frontmatter).
import type { Component } from 'svelte';

export interface BlogPostMetadata {
    title: string;
    date: string;
    excerpt: string;
    cover: string;
}

export interface BlogPost {
    slug: string;
    metadata: BlogPostMetadata;
    component: Component;
}

const modules = import.meta.glob<{ default: Component; metadata: BlogPostMetadata }>(
    '/src/lib/content/blog/*.md',
    { eager: true }
);

const posts: BlogPost[] = Object.entries(modules)
    .map(([path, mod]) => ({
        slug: path.split('/').pop()!.replace(/\.md$/, ''),
        metadata: mod.metadata,
        component: mod.default
    }))
    .sort((a, b) => (a.metadata.date < b.metadata.date ? 1 : -1));

export function getAllPosts(): BlogPost[] {
    return posts;
}

export function getPost(slug: string): BlogPost | undefined {
    return posts.find((post) => post.slug === slug);
}
