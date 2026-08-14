import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		Icons({ compiler: 'svelte' }),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: 'index.html' }),
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
			manifest: {
				name: 'FitMate',
				short_name: 'FitMate',
				description: 'Match people for sports activities',
				theme_color: '#0066FF',
				background_color: '#F5F7FA',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
				]
			}
		})
	]
});
