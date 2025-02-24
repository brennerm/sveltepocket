import { afterAll, beforeAll, beforeEach, test } from 'vitest';
import Pocketbase from 'pocketbase';
import schema from './pb_schema.json'
import { init } from '$lib/stores.svelte.js';
import { randomBytes } from 'crypto';

export const AUTHORS = [
  { id: '000000000000000', name: 'John Doe' },
  { id: '000000000000001', name: 'Jane Doe' },
  { id: '000000000000002', name: 'Alice' },
  { id: '000000000000003', name: 'Bob' },
]

export const POSTS = [
  { id: '000000000000000', title: 'Post 1', author: '000000000000000', published: true },
  { id: '000000000000001', title: 'Post 2', author: '000000000000000', published: false },
  { id: '000000000000002', title: 'Post 3', author: '000000000000000', published: true },
  { id: '000000000000003', title: 'Post 4', author: '000000000000001', published: false },
  { id: '000000000000004', title: 'Post 5', author: '000000000000001', published: true },
  { id: '000000000000005', title: 'Post 6', author: '000000000000002', published: false },
  { id: '000000000000006', title: 'Post 7', author: '000000000000003', published: true },
  { id: '000000000000007', title: 'Post 8', author: '000000000000003', published: false },
  { id: '000000000000008', title: 'Post 9', author: '000000000000003', published: true },
  { id: '000000000000009', title: 'Post 10', author: '000000000000003', published: false },
]

export const USERS = [
  { id: randomBytes(20).toString('hex').substring(0, 15), email: `${randomBytes(5).toString('hex')}@bar.com`, password: 'password', passwordConfirm: 'password' },
]

interface PbTestFixtures {
  pb: Pocketbase
}

const pb = new Pocketbase('http://localhost:8090');

export const pbtest = test.extend<PbTestFixtures>({
  pb: pb
})

beforeAll(async ({ id }) => {
  await pb.collection('_superusers').authWithPassword('pocketbase@svelte.com', 'pocketbase');
  await pb.collections.import(schema)

  for (const user of USERS) {
    await pb.collection('users').create(user)
  }

  init(pb);
});

beforeEach(async () => {
  await pb.collection('_superusers').authWithPassword('pocketbase@svelte.com', 'pocketbase');
  await pb.collections.truncate('posts')
  await pb.collections.truncate('authors')

  for (const author of AUTHORS) {
    await pb.collection('authors').create(author)
  }

  for (const post of POSTS) {
    await pb.collection('posts').create(post)
  }
});

afterAll(async () => {
  await pb.collection('_superusers').authWithPassword('pocketbase@svelte.com', 'pocketbase');
  await pb.collection('users').delete(USERS[0].id)
});