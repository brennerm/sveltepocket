# SveltePocket

![The Svelte and Pocketbase logo shaking hands](https://github.com/brennerm/sveltepocket/blob/main/logo.png?raw=true)

Svelte 5-ready stores and components to bring data from any Pocketbase instance into your Svelte application (even with realtime updates 🤫).

## Installation

```bash
npm install @shipitdev/sveltepocket
```

## Setup

Call the init method to pass your Pocketbase client SDK instance. This will be used by all stores and components so make sure it's authenticated according to your needs.

```svelte
<script>
  import { init } from '@shipitdev/sveltepocket';
  import Pocketbase from 'pocketbase';

  const pb = new Pocketbase(POCKETBASE_URL);
  init(pb)
</script>
```

## Stores

The stores provide an low level API to query data from your Pocketbase instance and are the best choice when you need to pre/postprocess the data instead of just rendering it onto the page.

### auth

A readable store that holds the current user's authentication status and user record.

```svelte
<script>
  import { auth } from '@shipitdev/sveltepocket';
</script>

{#if $auth.isAuthenticated}
  <p>Welcome, {$auth.user.email}!</p>
{/if}
```

### createRecordStore

Creates a readable store that fetches a single record identified by id or filter from a Pocketbase collection.

```svelte
<script>
  import { createRecordStore } from '@shipitdev/sveltepocket';

  const post = createRecordStore('posts', { id: 'YOUR_RECORD_ID' });
</script>

{#if $post.record}
  <h1>{$post.record.title}</h1>
{/if}
```

### createRecordsStore

Creates a readable store that fetches multiple records from a Pocketbase collection.

```svelte
<script>
  import { createRecordsStore } from '@shipitdev/sveltepocket';

  const posts = createRecordsStore('posts');
</script>

{#if $posts.records}
  <ul>
    {#each $posts.records as post}
      <li>{post.title}</li>
    {/each}
  </ul>
{/if}
```

## Components

If you only care about rendering the queried data, these components are the way to go.

You can pass snippets that will be rendered during different states, e.g. when loading the data, when data is not found or when an error occurs.

### <Record>

A component that fetches a single record either by ID or filter from a Pocketbase collection and renders it.

```svelte
<Record collection="posts" id="YOUR_RECORD_ID">
  {#snippet render(record)}
    <h1>{record.title}</h1>
  {/snippet}
</Record>
```

### <Records>

A component that fetches multiple records from a Pocketbase collection and renders them.

```svelte
<Records collection="posts">
  {#snippet render(records)}
    <ul>
      {#each records as record}
        <li>{record.title}</li>
      {/each}
    </ul>
  {/snippet}
</Records>
```

## Type Safety

All stores and components take an optional record type, e.g. generated by [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen).
This gives you full type safety on the returned records.

### Store

```svelte
<script>
  import { createRecordsStore } from '@shipitdev/sveltepocket';
  import type { PostRecord } from './pocketbase-types.d.ts';

  const posts = createRecordsStore<PostRecord>('posts');
</script>
```

### Components

```svelte
<Records collection="posts">
  {#snippet render(records: PostRecord[])}
    ...
  {/snippet}
</Records>
```