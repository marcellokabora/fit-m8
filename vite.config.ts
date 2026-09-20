import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Icons from 'unplugin-icons/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { mdsvex } from 'mdsvex';

// mdsvex 0.12.8 still emits `<script context="module">` for frontmatter exports, which Svelte 5
// deprecated in favor of `<script module>` - patch its output until mdsvex updates upstream.
const fixMdsvexModuleContext = {
	markup: ({ content, filename }: { content: string; filename?: string }) => {
		if (!filename?.endsWith('.md')) return;
		return { code: content.replace('<script context="module">', '<script module>') };
	}
};

export default defineConfig({
	plugins: [
		tailwindcss(),
		Icons({ compiler: 'svelte' }),
		enhancedImages(),
		sveltekit({
			// there's no svelte.config.js in this project - passing options directly here makes
			// SvelteKit ignore one entirely (see @sveltejs/kit/vite's sveltekit() docs), so any
			// svelte-config-shaped option (extensions/preprocess included) must live here instead
			extensions: ['.svelte', '.md'],
			preprocess: [mdsvex({ extensions: ['.md'] }), fixMdsvexModuleContext],
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// 'index.html' is now the real prerendered homepage, so the SPA fallback (used for
			// every other, client-only route) needs its own filename to avoid overwriting it
			adapter: adapter({ fallback: '200.html' }),
			inspector: true
		}),
		VitePWA({
			registerType: 'autoUpdate',
			// avoid the inline SW-registration script vite-plugin-pwa injects by default,
			// which gets blocked by a strict `script-src` CSP; register manually instead
			injectRegister: false,
			devOptions: {
				// dev server has no static index.html to precache, so keep the SW
				// disabled in dev and only register it in production builds
				enabled: false
			},
			// offline hard-navigations to client-only routes must fall back to the SPA shell,
			// not the prerendered homepage's markup
			workbox: {
				navigateFallback: '/200.html'
			},
			manifest: {
				id: '/',
				name: 'FIT-M8',
				short_name: 'FIT-M8',
				description: 'Match people for sports activities',
				theme_color: '#06170b',
				background_color: '#06170b',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
					{
						src: '/icons/icon-192-maskable.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/icons/icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	]
});
