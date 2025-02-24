<!-- @component 
A component that fetches a single record either by ID or filter from a Pocketbase collection and renders it.

## by ID

```html
<Single collection="posts" id='12345' expand="author">
	{#snippet render(record)}
	<h1>{record.title}</h1>
	{/snippet}
</Single>
```

## by filter
```html
<Single collection="posts" filter="slug = 'hello-world'">
	{#snippet render(record)}
	<h1>{record.title}</h1>
	{/snippet}
</Single>
```
-->

<script lang="ts" generics="T extends {id: string} = RecordModel">
	import type { RecordModel } from 'pocketbase';
	import { single } from '$lib/state.svelte.js';
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

	let store = $derived(single<T>(collection, id, filter, expand, realtime));
</script>

{#if $store.isLoading}
	{@render loading?.()}
{:else if $store.error}
	{@render error?.($store.error)}
{:else if $store.record === null}
	{@render notFound?.()}
{:else if $store.record}
	{@render render($store.record)}
{/if}
