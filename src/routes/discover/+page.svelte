<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser, filterActivity, filterFormat } from '$lib/stores/auth';
	import { getDiscoverFeed, recordSwipe } from '$lib/firebase/swipe';
	import { ACTIVITIES, type UserProfile } from '$lib/types';
	import { get } from 'svelte/store';
	import BottomNav from '$lib/components/BottomNav.svelte';

	let users = $state<UserProfile[]>([]);
	let loading = $state(true);
	let matchBanner = $state(false);

	// Swipe state
	let cardEl = $state<HTMLDivElement | null>(null);
	let startX = $state(0);
	let currentX = $state(0);
	let dragging = $state(false);

	async function loadFeed() {
		loading = true;
		const uid = get(authUser)?.uid;
		if (!uid) return;
		users = await getDiscoverFeed(uid, get(filterActivity), get(filterFormat));
		loading = false;
	}

	onMount(loadFeed);

	// Reload when filters change
	$effect(() => {
		$filterActivity;
		$filterFormat;
		loadFeed();
	});

	function onPointerDown(e: PointerEvent) {
		dragging = true;
		startX = e.clientX;
		currentX = 0;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		currentX = e.clientX - startX;
	}

	async function onPointerUp() {
		if (!dragging) return;
		dragging = false;
		const THRESHOLD = 80;
		if (Math.abs(currentX) < THRESHOLD) {
			currentX = 0;
			return;
		}
		const direction = currentX > 0 ? 'like' : 'pass';
		await swipe(direction);
		currentX = 0;
	}

	async function swipe(direction: 'like' | 'pass') {
		const uid = get(authUser)?.uid;
		const top = users[0];
		if (!uid || !top) return;

		const activity = get(filterActivity) || top.activities[0]?.id || '';
		const format = get(filterFormat) || top.activities[0]?.format || '1v1';

		const isMatch = await recordSwipe(uid, top.uid, direction, activity, format);
		users = users.slice(1);

		if (isMatch) {
			matchBanner = true;
			setTimeout(() => (matchBanner = false), 3000);
		}
	}

	let rotation = $derived(dragging ? currentX * 0.08 : 0);
	let likeOpacity = $derived(Math.max(0, Math.min(1, currentX / 100)));
	let passOpacity = $derived(Math.max(0, Math.min(1, -currentX / 100)));
</script>

<div class="flex min-h-screen flex-col bg-bg pb-20">
	<!-- Header -->
	<div class="flex items-center justify-between px-5 pb-3 pt-12">
		<h1 class="text-2xl font-black text-text">Discover</h1>
		<a href="/profile" class="flex size-9 items-center justify-center rounded-full bg-surface shadow-sm">
			👤
		</a>
	</div>

	<!-- Filter bar -->
	<div class="px-5 pb-4">
		<div class="flex gap-2 overflow-x-auto pb-1">
			<!-- Format toggle -->
			<div class="flex shrink-0 rounded-xl border-2 border-gray-200 bg-surface p-0.5">
				{#each ['', '1v1', '2v2'] as fmt}
					<button
						onclick={() => filterFormat.set(fmt as any)}
						class="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors {$filterFormat === fmt
							? 'bg-primary text-white'
							: 'text-muted'}"
					>
						{fmt === '' ? 'All' : fmt}
					</button>
				{/each}
			</div>

			<!-- Activity chips -->
			<button
				onclick={() => filterActivity.set('')}
				class="shrink-0 rounded-xl border-2 px-4 py-1.5 text-sm font-semibold transition-colors {$filterActivity === ''
					? 'border-primary bg-primary text-white'
					: 'border-gray-200 bg-surface text-text'}"
			>
				All sports
			</button>
			{#each ACTIVITIES as act}
				<button
					onclick={() => filterActivity.set($filterActivity === act.id ? '' : act.id)}
					class="shrink-0 rounded-xl border-2 px-4 py-1.5 text-sm font-semibold transition-colors {$filterActivity === act.id
						? 'border-primary bg-primary text-white'
						: 'border-gray-200 bg-surface text-text'}"
				>
					{act.emoji} {act.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Card stack -->
	<div class="relative flex flex-1 flex-col items-center justify-center px-5">
		{#if loading}
			<div class="flex flex-col items-center gap-3 text-muted">
				<span class="text-4xl animate-spin">⚡</span>
				<p class="text-sm">Loading players…</p>
			</div>
		{:else if users.length === 0}
			<div class="flex flex-col items-center gap-4 text-center">
				<span class="text-6xl">😴</span>
				<p class="text-lg font-bold text-text">No more players</p>
				<p class="text-sm text-muted">Try changing your filters or check back later</p>
				<button
					onclick={loadFeed}
					class="rounded-2xl bg-primary px-6 py-3 font-bold text-white active:scale-95"
				>
					Refresh
				</button>
			</div>
		{:else}
			<!-- Background cards (stacked look) -->
			{#if users[2]}
				<div
					class="absolute inset-x-5 top-2 h-full max-h-[520px] scale-95 rounded-3xl bg-surface shadow-md"
				></div>
			{/if}
			{#if users[1]}
				<div
					class="absolute inset-x-5 top-1 h-full max-h-[520px] scale-[0.97] rounded-3xl bg-surface shadow-md"
				></div>
			{/if}

			<!-- Top card -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				bind:this={cardEl}
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointercancel={onPointerUp}
				style="transform: translateX({currentX}px) rotate({rotation}deg); transition: {dragging ? 'none' : 'transform 0.3s'};"
				class="relative w-full max-h-[520px] overflow-hidden rounded-3xl bg-surface shadow-xl select-none cursor-grab active:cursor-grabbing"
			>
				<!-- Profile image area -->
				<div class="h-80 w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
					{#if users[0].photoURL}
						<img src={users[0].photoURL} alt={users[0].displayName} class="h-full w-full object-cover" />
					{:else}
						<span class="text-8xl">👤</span>
					{/if}
				</div>

				<!-- Like / Pass overlays -->
				<div
					class="absolute inset-0 flex items-start justify-start p-6 pointer-events-none"
					style="opacity: {likeOpacity};"
				>
					<span class="rounded-xl border-4 border-success px-4 py-2 text-2xl font-black text-success rotate-[-15deg]">
						LIKE ✓
					</span>
				</div>
				<div
					class="absolute inset-0 flex items-start justify-end p-6 pointer-events-none"
					style="opacity: {passOpacity};"
				>
					<span class="rounded-xl border-4 border-error px-4 py-2 text-2xl font-black text-error rotate-[15deg]">
						PASS ✗
					</span>
				</div>

				<!-- Info -->
				<div class="p-5">
					<div class="flex items-baseline gap-2">
						<h3 class="text-xl font-black text-text">{users[0].displayName}</h3>
						{#if users[0].age}
							<span class="text-sm text-muted">{users[0].age}</span>
						{/if}
						{#if users[0].city}
							<span class="text-sm text-muted">📍 {users[0].city}</span>
						{/if}
					</div>
					{#if users[0].bio}
						<p class="mt-1 text-sm text-muted">{users[0].bio}</p>
					{/if}
					<div class="mt-3 flex flex-wrap gap-2">
						{#each users[0].activities ?? [] as act}
							{@const info = ACTIVITIES.find((a) => a.id === act.id)}
							<span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
								{info?.emoji ?? '🏃'} {info?.label ?? act.id} · {act.format} · {act.level}
							</span>
						{/each}
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="mt-6 flex gap-6">
				<button
					onclick={() => swipe('pass')}
					class="flex size-16 items-center justify-center rounded-full bg-surface text-3xl shadow-lg active:scale-90 transition-transform"
				>
					✗
				</button>
				<button
					onclick={() => swipe('like')}
					class="flex size-16 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-lg active:scale-90 transition-transform"
				>
					⚡
				</button>
			</div>
		{/if}
	</div>

	<!-- Match banner -->
	{#if matchBanner}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div class="flex flex-col items-center gap-4 rounded-3xl bg-surface p-10 shadow-2xl text-center mx-6">
				<span class="text-6xl">⚡🎉</span>
				<h2 class="text-3xl font-black text-primary">It's a Match!</h2>
				<p class="text-muted">You can now chat and plan your session!</p>
				<div class="flex gap-3 w-full">
					<button
						onclick={() => (matchBanner = false)}
						class="flex-1 rounded-2xl border-2 border-gray-200 py-3 font-semibold text-text"
					>
						Keep swiping
					</button>
					<a
						href="/matches"
						class="flex-1 rounded-2xl bg-primary py-3 text-center font-bold text-white"
					>
						View matches
					</a>
				</div>
			</div>
		</div>
	{/if}

	<BottomNav active="discover" />
</div>
