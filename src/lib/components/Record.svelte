<!-- @component 
A component that fetches a single record either by ID or filter from a Pocketbase collection and renders it.

## by ID
```html
<Record collection="posts" id='12345' expand="author">
	{#snippet render(record: PostRecord)}
	<h1>{record.title}</h1>
	{/snippet}
</Record>
```

## by filter
```html
<Record collection="posts" filter="slug = 'hello-world'">
	{#snippet render(record: PostRecord)}
	<h1>{record.title}</h1>
	{/snippet}
</Record>
```
-->

<script lang="ts" generics="T extends {id: string} = RecordModel">
	import type { RecordModel } from 'pocketbase';
	import { createRecordStore } from '$lib/stores.svelte.js';
	import type { Snippet } from 'svelte';
	import type { CommonParams } from '$lib/common.js';

	let {
		collection,
		id,
		filter,
		expand,
		realtime = false,
		loading,
		render,
		notFound,
		error
	}: CommonParams & {
		/** the ID of the record to fetch, make sure to set this or `filter` */
		id?: string;
		/** the snippet to render the retrieved record */
		render: Snippet<[record: T]>;
	} = $props();

	let store = $derived(createRecordStore<T>(collection, { id, filter, expand, realtime }));
</script>

{JSON.stringify($store)}

{#if $store.isLoading}
	{@render loading?.()}
{:else if $store.error}
	{@render error?.($store.error)}
{:else if $store.record === null}
	{@render notFound?.()}
{:else if $store.record}
	{@render render?.($store.record)}
{/if}
