<script lang="ts">
	import Multi from '$lib/components/Multi.svelte';
	import Single from '$lib/components/Single.svelte';
	import { auth, setPB } from '$lib/state.svelte.js';
	import Pocketbase from 'pocketbase';
	import type { PipelinesRecord } from '$lib/pocketbase-types.js';

	const pb = new Pocketbase('http://localhost:8090');
	setPB(pb);

	auth;
	let form = $state({ email: '', password: '' });
</script>

<h1>Welcome to your library project</h1>

{JSON.stringify($auth)}

{#if !pb.authStore.isValid}
	<form onsubmit={() => pb.collection('users').authWithPassword(form.email, form.password)}>
		<label for="email">Email</label>
		<input bind:value={form.email} type="email" id="email" name="email" required />
		<label for="password">Password</label>
		<input bind:value={form.password} type="password" id="password" name="password" required />
		<button type="submit">Login</button>
	</form>
{:else}
	<Multi collection="pipelines" realtime listOptions={{ perPage: 20 }}>
		{#snippet loading()}
			<p>Loading...</p>
		{/snippet}
		{#snippet notFound()}
			<p>Not found</p>
		{/snippet}
		{#snippet render(records)}
			<ul>
				{#each records as record}
					<li>
						{record.name}
					</li>
				{/each}
			</ul>
		{/snippet}
		{#snippet error(msg)}
			{JSON.stringify(msg)}
		{/snippet}
	</Multi>

	<Single collection="pipelines" filter="id = '89z4n7hc4c776j2'" realtime>
		{#snippet loading()}
			<p>Loading...</p>
		{/snippet}
		{#snippet render(record: PipelinesRecord)}
			<p>{record.name}</p>
		{/snippet}
		{#snippet notFound()}
			<p>Not found</p>
		{/snippet}
	</Single>

	<Single collection="pipelines" id="89z4n7hc4c776j2" realtime>
		{#snippet loading()}
			<p>Loading...</p>
		{/snippet}
		{#snippet render(record)}
			<p>{record.name}</p>
		{/snippet}
		{#snippet notFound()}
			<p>Not found</p>
		{/snippet}
	</Single>
{/if}
