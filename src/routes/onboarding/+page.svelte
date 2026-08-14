<script lang="ts">
	import { goto } from '$app/navigation';
	import { authUser, userProfile } from '$lib/stores/auth';
	import { ACTIVITIES, type UserActivity, type SkillLevel, type ActivityFormat } from '$lib/types';
	import { get } from 'svelte/store';

	let step = $state(1);
	const TOTAL_STEPS = 4;

	// Step 1 — Basic info
	let displayName = $state('');
	let bio = $state('');
	let age = $state(25);
	let gender = $state('');
	let city = $state('');

	// Step 2 — Activities
	let selectedActivities = $state<string[]>([]);

	// Step 3 — For each selected activity: format + level
	let activitySettings = $state<Record<string, { format: ActivityFormat; level: SkillLevel }>>({});

	// Step 4 — Photo (optional, skip for now)
	let photoURL = $state('');
	let saving = $state(false);
	let error = $state('');

	function toggleActivity(id: string) {
		if (selectedActivities.includes(id)) {
			selectedActivities = selectedActivities.filter((a) => a !== id);
			delete activitySettings[id];
		} else {
			selectedActivities = [...selectedActivities, id];
			activitySettings[id] = { format: '1v1', level: 'beginner' };
		}
	}

	function next() {
		if (step < TOTAL_STEPS) step++;
	}

	function back() {
		if (step > 1) step--;
	}

	async function save() {
		error = '';
		saving = true;
		const user = get(authUser);
		if (!user) return;

		const activities: UserActivity[] = selectedActivities.map((id) => ({
			id,
			...activitySettings[id]
		}));

		try {
			await userProfile.save(user.uid, {
				displayName,
				bio,
				age,
				gender,
				city,
				photoURL: user.photoURL ?? photoURL,
				activities
			});
			goto('/discover');
		} catch (e: any) {
			error = e.message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-bg px-6 pb-10 pt-10">
	<!-- Progress -->
	<div class="mb-8 flex items-center gap-2">
		{#each Array(TOTAL_STEPS) as _, i}
			<div
				class="h-1.5 flex-1 rounded-full transition-all {i + 1 <= step ? 'bg-primary' : 'bg-gray-200'}"
			></div>
		{/each}
	</div>

	{#if step === 1}
		<h2 class="mb-1 text-2xl font-black text-text">About you</h2>
		<p class="mb-6 text-sm text-muted">Tell us who you are</p>
		<div class="flex flex-col gap-4">
			<input
				type="text"
				bind:value={displayName}
				placeholder="Your name"
				class="rounded-2xl border-2 border-gray-200 bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
			/>
			<textarea
				bind:value={bio}
				placeholder="Short bio (optional)"
				rows={3}
				class="rounded-2xl border-2 border-gray-200 bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
			></textarea>
			<div class="flex gap-3">
				<input
					type="number"
					bind:value={age}
					min={16}
					max={80}
					placeholder="Age"
					class="w-24 rounded-2xl border-2 border-gray-200 bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
				/>
				<input
					type="text"
					bind:value={city}
					placeholder="City"
					class="flex-1 rounded-2xl border-2 border-gray-200 bg-surface px-4 py-4 text-base text-text outline-none focus:border-primary"
				/>
			</div>
			<div class="flex gap-3">
				{#each ['Male', 'Female', 'Other'] as g}
					<button
						onclick={() => (gender = g)}
						class="flex-1 rounded-2xl border-2 py-3 text-sm font-semibold transition-colors {gender === g
							? 'border-primary bg-primary text-white'
							: 'border-gray-200 bg-surface text-text'}"
					>
						{g}
					</button>
				{/each}
			</div>
		</div>

	{:else if step === 2}
		<h2 class="mb-1 text-2xl font-black text-text">Your sports</h2>
		<p class="mb-6 text-sm text-muted">Pick the activities you enjoy</p>
		<div class="grid grid-cols-2 gap-3">
			{#each ACTIVITIES as activity}
				<button
					onclick={() => toggleActivity(activity.id)}
					class="flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 {selectedActivities.includes(activity.id)
						? 'border-primary bg-primary/10'
						: 'border-gray-200 bg-surface'}"
				>
					<span class="text-3xl">{activity.emoji}</span>
					<span class="text-sm font-semibold text-text">{activity.label}</span>
				</button>
			{/each}
		</div>

	{:else if step === 3}
		<h2 class="mb-1 text-2xl font-black text-text">Your settings</h2>
		<p class="mb-6 text-sm text-muted">For each sport, pick format and level</p>
		<div class="flex flex-col gap-5">
			{#each selectedActivities as id}
				{@const activity = ACTIVITIES.find((a) => a.id === id)}
				{@const settings = activitySettings[id]}
				<div class="rounded-2xl border-2 border-gray-200 bg-surface p-4">
					<p class="mb-3 font-bold text-text">{activity?.emoji} {activity?.label}</p>
					<div class="mb-3">
						<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Format</p>
						<div class="flex gap-2">
							{#each ['1v1', '2v2'] as fmt}
								<button
									onclick={() => (activitySettings[id].format = fmt as ActivityFormat)}
									class="flex-1 rounded-xl border-2 py-2 text-sm font-bold transition-colors {settings.format === fmt
										? 'border-primary bg-primary text-white'
										: 'border-gray-200 text-text'}"
								>
									{fmt}
								</button>
							{/each}
						</div>
					</div>
					<div>
						<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Level</p>
						<div class="flex gap-2">
							{#each ['beginner', 'intermediate', 'advanced'] as lvl}
								<button
									onclick={() => (activitySettings[id].level = lvl as SkillLevel)}
									class="flex-1 rounded-xl border-2 py-2 text-xs font-bold capitalize transition-colors {settings.level === lvl
										? 'border-accent-dark bg-accent text-text'
										: 'border-gray-200 text-muted'}"
								>
									{lvl}
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>

	{:else if step === 4}
		<h2 class="mb-1 text-2xl font-black text-text">Profile photo</h2>
		<p class="mb-6 text-sm text-muted">Add a photo so others can find you (optional)</p>
		<div class="flex flex-col items-center gap-4">
			<div class="flex size-32 items-center justify-center rounded-full bg-gray-200 text-6xl">
				{photoURL ? '📸' : '👤'}
			</div>
			<p class="text-sm text-muted">Photo upload will be available after setup</p>
		</div>
		{#if error}
			<p class="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
		{/if}
	{/if}

	<!-- Navigation -->
	<div class="mt-auto flex gap-3 pt-8">
		{#if step > 1}
			<button
				onclick={back}
				class="flex-1 rounded-2xl border-2 border-gray-200 py-4 text-base font-semibold text-text active:scale-95"
			>
				Back
			</button>
		{/if}
		{#if step < TOTAL_STEPS}
			<button
				onclick={next}
				disabled={step === 1 && !displayName}
				class="flex-1 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
			>
				Continue
			</button>
		{:else}
			<button
				onclick={save}
				disabled={saving}
				class="flex-1 rounded-2xl bg-accent py-4 text-base font-bold text-text shadow-md active:scale-95 disabled:opacity-40"
			>
				{saving ? 'Saving…' : "Let's go! ⚡"}
			</button>
		{/if}
	</div>
</div>
