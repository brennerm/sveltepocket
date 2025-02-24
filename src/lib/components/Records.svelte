<!-- @component 
A component that fetches multiple records from a Pocketbase collection and renders them.

```html
<Records collection="posts" sort="-views" expand="author" filter="published = true" realtime listOptions={{ perPage: 10 }}>
	{#snippet render(records: PostRecord[])}
	<ul>
		{#each records as post}
			<li>{post.title}</li>
		{/each}
	</ul>
	{/snippet}
</Records>
```
-->

<script lang="ts" generics="T extends {id: string} = RecordModel">
	import { type Snippet } from 'svelte';
	import { createRecordsStore } from '../stores.svelte.js';
	import type { RecordListOptions, RecordModel, RecordSubscribeOptions } from 'pocketbase';
	import type { CommonParams } from '../common.js';

	let {
		collection,
		sort,
		expand,
		filter,
		realtime = false,
		listOptions,
		subscribeOptions,
		loading,
		render,
		notFound,
		error
	}: CommonParams & {
		/** the options to pass to the pocketbase SDK when listing the records */
		listOptions?: RecordListOptions;
		/** the options to pass to the pocketbase SDK when subscribing to realtime updates */
		subscribeOptions?: RecordSubscribeOptions;
		/** the snippet to render the retrieved records and optionally show some pagination controls */
		render: Snippet<[records: T[], totalPages: number, totalItems: number]>;
	} = $props();

	let store = $derived(
		createRecordsStore<T>(collection, {
			sort,
			expand,
			filter,
			realtime,
			listOptions,
			subscribeOptions
		})
	);
</script>

{#if $store.isLoading}
	{@render loading?.()}
{:else if $store.error}
	{@render error?.($store.error)}
{:else if $store.records === null}
	{@render notFound?.()}
{:else if $store.records}
	{@render render?.($store.records, $store.totalPages, $store.totalItems)}
{/if}
