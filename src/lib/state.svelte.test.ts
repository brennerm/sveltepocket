import { expect, test } from 'vitest';
import Pocketbase from 'pocketbase';
import { single, multi } from './state.svelte.js';
import { get } from 'svelte/store';

const pbTest = test.extend({
	pb: new Pocketbase('http://localhost:8090')
});

pbTest('single store with non-existing collection', () => {
	const nonExistingCollection = single('non-existing-collection', 'id');
	expect(get(nonExistingCollection).record).toBe(null);
});
