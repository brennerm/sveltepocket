import { render, screen } from '@testing-library/svelte';
import { describe, expect } from 'vitest';
import Multi from './Multi.svelte';
import { AUTHORS, pbtest, POSTS } from '../../../tests/vitest-pocketbase-setup.js';
import { createRawSnippet } from 'svelte';

describe.sequential('Multi.svelte', () => {
    pbtest('loading', async () => {
        const { baseElement } = render(Multi, {
            collection: 'posts',
            loading: createRawSnippet(() => ({
                render: () => '<span>Loading...</span>'
            }))
        });
        expect(baseElement).toHaveTextContent('Loading...');
    });

    pbtest('notFound', async () => {
        const { baseElement } = render(Multi, {
            collection: 'nonexistent',
            notFound: createRawSnippet(() => ({
                render: () => '<span>Not Found</span>'
            }))
        });

        await screen.findByText('Not Found');
        expect(baseElement).toHaveTextContent('Not Found');
    });

    pbtest('error', async ({ pb }) => {
        pb.authStore.clear();

        const { baseElement } = render(Multi, {
            collection: 'posts',
            error: createRawSnippet((error) => ({
                render: () => `<span>Error ${error().response.status}</span>`
            }))
        });

        await screen.findByText('Error 403');
        expect(baseElement).toHaveTextContent('Error 403');
    });

    pbtest('render', async () => {
        const { baseElement } = render(Multi, {
            collection: 'posts',
            render: createRawSnippet((records) => ({
                render: () => `<h1>${records().map((r) => r.title).join(',')}</h1>`
            })),
            loading: createRawSnippet(() => ({
                render: () => '<span>Loading...</span>'
            }))
        });

        await screen.findByRole('heading');
        expect(baseElement).toHaveTextContent(POSTS.map((r) => r.title).join(','));
        expect(baseElement).not.toHaveTextContent('Loading...');
    });

    pbtest('sort', async () => {
        const { baseElement } = render(Multi, {
            collection: 'posts', sort: '-id',
            render: createRawSnippet((records) => ({
                render: () => `<h1>${records().map((r) => r.title).join(',')}</h1>`
            })),
        });

        await screen.findByRole('heading');
        expect(baseElement).toHaveTextContent(POSTS.sort((a, b) => b.id - a.id).map((r) => r.title).join(','));
    });

    pbtest('filter', async () => {
        const { baseElement } = render(Multi, {
            collection: 'posts', filter: 'published = false',
            render: createRawSnippet((records) => ({
                render: () => `<h1>${records().map((r) => r.title).join(',')}</h1>`
            })),
        });

        await screen.findByRole('heading');
        expect(baseElement).toHaveTextContent(POSTS.filter((r) => !r.published).map((r) => r.title).join(','));
    });

    pbtest('expand', async () => {
        const { baseElement } = render(Multi, {
            collection: 'posts', id: '000000000000000', expand: 'author',
            render: createRawSnippet((records) => ({
                render: () => `<h1>${records().map((r) => r.expand.author.name).join(',')}</h1>`
            })),
        });

        await screen.findByRole('heading');
        expect(baseElement).toHaveTextContent(POSTS.map((p) => AUTHORS.find((a) => a.id === p.author).name).join(','));
    });
});