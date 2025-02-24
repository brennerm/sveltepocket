<script lang="ts">
	import Records from '$lib/components/Records.svelte';
	import Record from '$lib/components/Record.svelte';
	import { auth, init } from '$lib/stores.svelte.js';
	import Pocketbase from 'pocketbase';

	type PostRecord = {
		id: string;
		title: string;
		published: boolean;
		author: string;
	};

	const pb = new Pocketbase('http://localhost:8090');
	init(pb);

	let form = $state({ email: '', password: '' });
</script>

<h1>Welcome to the PocketSvelte library</h1>

{#if $auth?.isAuthenticated === false}
	<form
		onsubmit={async (event) => {
			event.preventDefault();
			await pb.collection('users').authWithPassword(form.email, form.password);
		}}
	>
		<label for="email">Email</label>
		<input bind:value={form.email} type="email" id="email" name="email" required />
		<label for="password">Password</label>
		<input bind:value={form.password} type="password" id="password" name="password" required />
		<button type="submit">Login</button>
	</form>
{:else}
	<Records collection="posts" realtime listOptions={{ perPage: 20 }}>
		{#snippet loading()}
			<p>Loading...</p>
		{/snippet}
		{#snippet notFound()}
			<p>Not found</p>
		{/snippet}
		{#snippet render(records: PostRecord[])}
			<ul>
				{#each records as record}
					<li>
						{record.title}
					</li>
				{/each}
			</ul>
		{/snippet}
		{#snippet error(msg)}
			{JSON.stringify(msg)}
		{/snippet}
	</Records>

	<Record collection="posts" filter="id = '000000000000000'" realtime>
		{#snippet loading()}
			<p>Loading...</p>
		{/snippet}
		{#snippet render(record: PostRecord)}
			<p>{record.title}</p>
		{/snippet}
		{#snippet notFound()}
			<p>Not found</p>
		{/snippet}
	</Record>

	<Record collection="posts" id="000000000000000" realtime>
		{#snippet loading()}
			<p>Loading...</p>
		{/snippet}
		{#snippet render(record: PostRecord)}
			<p>{record.title}</p>
		{/snippet}
		{#snippet notFound()}
			<p>Not found</p>
		{/snippet}
	</Record>
{/if}
