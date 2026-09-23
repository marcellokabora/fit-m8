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
				theme_color: '#0B3692',
				background_color: '#0B3692',
				display: 'standalone',
				orientation: 'portrait',
				// launching from the installed home-screen icon skips the marketing homepage and
				// goes straight into the app (still gated by the /app layout's auth redirect) -
				// browser/URL visits to "/" are unaffected, only the installed-app launch path
				start_url: '/app/discover',
				// without an explicit scope, it defaults to start_url's directory ("/app/") instead
				// of the whole site - keep the full origin in scope so e.g. blog/legal links opened
				// from within the installed app still stay inside the standalone window
				scope: '/',
				// ic_launcher.png's wordmark sits well within the maskable safe zone (center 80%
				// circle) already, so the same file can serve both purposes - without a declared
				// "maskable" icon, Android/Chrome synthesizes its own fallback that shrinks+pads the
				// icon further (small logo floating in a white circle), which is what "not filling all
				// the space" looked like.
				icons: [
					{
						src: '/icons/ic_launcher.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: '/icons/ic_launcher.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					},
					// Android 13+ "themed icon" support (Material You tinting to match wallpaper) - the OS
					// only reads this shape's alpha channel and recolors it itself, so the source fill
					// color doesn't matter. Reuses the adaptive-icon foreground layer already generated
					// alongside ic_launcher.png (previously unused).
					{
						src: '/icons/drawable-anydpi/ic_launcher.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'monochrome'
					}
				]
			}
		})
	]
});
