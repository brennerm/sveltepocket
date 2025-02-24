import type { ClientResponseError } from 'pocketbase';
import type { Snippet } from 'svelte';

export type CommonParams = {
	/** the collection to fetch records from */
	collection: string;
	/** the filter to apply, e.g. "status = 'published'" */
	filter?: string;
	/** fields to expand, e.g "author,comments" */
	expand?: string;
	/** sort expression, e.g. "-created" */
	sort?: string;
	/** whether to subscribe to realtime updates */
	realtime?: boolean;
	/** the snippet to show while loading the data from Pocketbase */
	loading: Snippet;
	/** the snippet to show when an error occurs */
	error?: Snippet<[error: ClientResponseError]>;
	/** the snippet to show when no record is found or the collection does not exist */
	notFound?: Snippet;
};
