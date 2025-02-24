import { render, screen } from '@testing-library/svelte';
import { describe, expect } from 'vitest';
import Single from './Single.svelte';
import { AUTHORS, pbtest, POSTS } from '../../../tests/vitest-pocketbase-setup.js';
import { createRawSnippet } from 'svelte';

describe.sequential('Single.svelte', () => {
    pbtest('loading', async () => {
        const { baseElement } = render(Single, {
            collection: 'posts', id: '000000000000000',
            loading: createRawSnippet(() => ({
                render: () => '<span>Loading...</span>'
            }))
        });
        expect(baseElement).toHaveTextContent('Loading...');
    });

    pbtest('notFound', async () => {
        const { baseElement } = render(Single, {
            collection: 'posts', id: 'nonexistent',
            notFound: createRawSnippet(() => ({
                render: () => '<span>Not Found</span>'
            }))
        });

        await screen.findByText('Not Found');
        expect(baseElement).toHaveTextContent('Not Found');
    });

    pbtest('error', async ({ pb }) => {
        pb.authStore.clear();

        const { baseElement } = render(Single, {
            collection: 'posts', id: '000000000000000',
            error: createRawSnippet((error) => ({
                render: () => `<span>Error ${error().response.status}</span>`
            }))
        });

        await screen.findByText('Error 403');
        expect(baseElement).toHaveTextContent('Error 403');
    });

    pbtest('id', async () => {
        const { baseElement } = render(Single, {
            collection: 'posts', id: '000000000000000',
            render: createRawSnippet((record) => ({
                render: () => `<h1>${record().title}</h1>`
            })),
            loading: createRawSnippet(() => ({
                render: () => '<span>Loading...</span>'
            }))
        });

        await screen.findByRole('heading');
        expect(baseElement).toHaveTextContent(POSTS[0].title);
        expect(baseElement).not.toHaveTextContent('Loading...');
    });

    pbtest('filter', async () => {
        const { baseElement } = render(Single, {
            collection: 'posts', filter: 'published = false',
            render: createRawSnippet((record) => ({
                render: () => `<h1>${record().title}</h1>`
            })),
        });

        await screen.findByRole('heading');
        expect(baseElement).toHaveTextContent(POSTS[1].title);
    });

    pbtest('expand', async () => {
        const { baseElement } = render(Single, {
            collection: 'posts', id: '000000000000000', expand: 'author',
            render: createRawSnippet((record) => ({
                render: () => `<h1>${record().expand.author.name}</h1>`
            })),
        });

        await screen.findByRole('heading');
        expect(baseElement).toHaveTextContent(AUTHORS[0].name);
    });
});