import { describe, expect, vi } from 'vitest';
import { createRecordStore, createRecordsStore, auth } from './stores.svelte.js';
import { get } from 'svelte/store';
import { AUTHORS, pbtest, POSTS, USERS } from '../../tests/vitest-pocketbase-setup.js';

describe.sequential('record store', () => {
	pbtest('non-existing collection', async () => {
		const store = createRecordStore('non-existing-collection', { id: 'id' });
		store.subscribe(() => { })

		await vi.waitUntil(() => get(store).record !== undefined)
		expect(get(store).record).toBe(null);
	});

	pbtest('non-existing id', async () => {
		const store = createRecordStore('posts', { id: 'non-existing-id' });
		store.subscribe(() => { })

		await vi.waitUntil(() => get(store).record !== undefined)
		expect(get(store).record).toBe(null);
	})

	pbtest('id', async () => {
		const store = createRecordStore('posts', { id: '000000000000000' });
		store.subscribe(() => { })

		await vi.waitUntil(() => get(store).record !== undefined)
		const record = get(store).record;
		expect(record.id).toBe(POSTS[0].id);
		expect(record.title).toBe(POSTS[0].title);
		expect(record.published).toBe(POSTS[0].published);
	})

	pbtest('filter', async () => {
		const store = createRecordStore('posts', { filter: 'published = false' });
		store.subscribe(() => { })

		await vi.waitUntil(() => get(store).record !== undefined)
		const record = get(store).record;
		expect(record.id).toBe(POSTS[1].id);
		expect(record.title).toBe(POSTS[1].title);
		expect(record.published).toBe(POSTS[1].published);
	})

	pbtest('expand', async () => {
		const store = createRecordStore('posts', { id: '000000000000000', expand: 'author' });
		store.subscribe(() => { })

		await vi.waitUntil(() => get(store).record !== undefined)
		const record = get(store).record;
		expect(record.id).toBe(POSTS[0].id);
		expect(record.title).toBe(POSTS[0].title);
		expect(record.published).toBe(POSTS[0].published);
		expect(record.expand.author.id).toBe(AUTHORS[0].id);
		expect(record.expand.author.name).toBe(AUTHORS[0].name);
	})

	pbtest('realtime', async ({ pb, skip }) => {
		skip('Realtime test is skipped because we need to find a way to mock the EventSource object');

		const store = createRecordStore('posts', { id: '000000000000000', realtime: true });
		store.subscribe(() => { })

		await vi.waitUntil(() => get(store).record !== undefined)
		const record = get(store).record;
		expect(record.id).toBe(POSTS[0].id);
		expect(record.title).toBe(POSTS[0].title);
		expect(record.published).toBe(POSTS[0].published);

		await pb.collection('posts').update(POSTS[0].id, { title: 'New Title' });

		await vi.waitUntil(() => get(store).record.title === 'New Title');
	})
});

describe.sequential('records store', () => {
	pbtest('non-existing collection', async () => {
		const store = createRecordsStore('non-existing-collection');
		store.subscribe(() => { })
		await vi.waitUntil(() => get(store).records !== undefined)

		expect(get(store).records).toBe(null);
	});

	pbtest('existing collection', async () => {
		const store = createRecordsStore('posts');
		store.subscribe(() => { })
		await vi.waitUntil(() => get(store).records !== undefined)

		const records = get(store).records;
		expect(records.length).toBe(POSTS.length);
		records.forEach((record, i) => {
			expect(record.id).toBe(POSTS[i].id);
			expect(record.title).toBe(POSTS[i].title);
			expect(record.published).toBe(POSTS[i].published);
		})
	})

	pbtest('sort', async () => {
		const store = createRecordsStore('posts', { sort: '-id' });
		store.subscribe(() => { })
		await vi.waitUntil(() => get(store).records !== undefined)

		const records = get(store).records;
		expect(records.length).toBe(POSTS.length);
		records.forEach((record, i) => {
			expect(record.id).toBe(POSTS[9 - i].id);
			expect(record.title).toBe(POSTS[9 - i].title);
			expect(record.published).toBe(POSTS[9 - i].published);
		})
	})

	pbtest('expand', async () => {
		const store = createRecordsStore('posts', { expand: 'author' });
		store.subscribe(() => { })
		await vi.waitUntil(() => get(store).records !== undefined)

		const records = get(store).records;
		expect(records.length).toBe(POSTS.length);
		records.forEach((record, i) => {
			expect(record.id).toBe(POSTS[i].id);
			expect(record.title).toBe(POSTS[i].title);
			expect(record.published).toBe(POSTS[i].published);
			expect(record.expand.author.name).not.toBe(undefined);
		})
	})

	pbtest('filter', async () => {
		const store = createRecordsStore('posts', { filter: 'published = false' });
		store.subscribe(() => { })
		await vi.waitUntil(() => get(store).records !== undefined)

		const privatePosts = POSTS.filter(post => !post.published);

		const records = get(store).records;
		expect(records.length).toBe(privatePosts.length);
		records.forEach((record, i) => {
			expect(record.id).toBe(privatePosts[i].id);
			expect(record.title).toBe(privatePosts[i].title);
			expect(record.published).toBe(privatePosts[i].published);
		})
	})
});

describe.sequential('auth', () => {
	pbtest('superuser', async () => {
		auth.subscribe(() => { });

		// we already should be authenticated as a superuser
		expect(get(auth).isAuthenticated).toBe(true);
		expect(get(auth).isSuperuser).toBe(true);
	});

	pbtest('login', async ({ pb }) => {
		auth.subscribe(() => { });

		pb.authStore.clear();
		expect(get(auth).isAuthenticated).toBe(false);

		await pb.collection('users').authWithPassword(USERS[0].email, USERS[0].password);

		vi.waitUntil(() => get(auth).isAuthenticated);
		expect(get(auth).isSuperuser).toBe(false);
		expect(get(auth).user.email).toBe(USERS[0].email);
	});

	pbtest('logout', async ({ pb }) => {
		auth.subscribe(() => { });

		expect(get(auth).isAuthenticated).toBe(true);
		pb.authStore.clear();
		expect(get(auth).isAuthenticated).toBe(false);
	});
});