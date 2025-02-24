import Pocketbase from 'pocketbase';
import { readable } from 'svelte/store';
import type {
	RecordModel,
	RecordListOptions,
	RecordSubscribeOptions,
	ClientResponseError,
	AuthRecord
} from 'pocketbase';

export const PB = () => {
	return _pb;
};

let _pb = $state<Pocketbase | null>(null);

export const setPB = (value: Pocketbase) => {
	_pb = value;
};

export const auth = readable<{
	isAuthenticated: boolean | undefined;
	isSuperuser: boolean | undefined;
	user: AuthRecord | undefined;
}>({ isAuthenticated: undefined, isSuperuser: undefined, user: undefined }, (set) => {
	const unsubscribe = _pb?.authStore.onChange((_, record) => {
		set({
			isAuthenticated: _pb?.authStore.isValid,
			isSuperuser: _pb?.authStore.isSuperuser,
			user: record
		});
	}, true);

	return unsubscribe;
});

export const single = <T extends { id: string } = RecordModel>(
	collection: string,
	id?: string,
	filter?: string,
	expand?: string,
	realtime?: boolean
) => {
	return readable<{
		record: T | undefined | null;
		isLoading: boolean;
		error: ClientResponseError | null;
	}>(
		{
			record: undefined,
			isLoading: false,
			error: null
		},
		(_, update) => {
			let unsubscribe = () => { };

			const subscribe = (recordId: string) => {
				if (!realtime) return;

				_pb
					?.collection(collection)
					.subscribe(recordId, ({ action, record }) => {
						switch (action) {
							case 'update':
								update((data) => ({ ...data, record: record as unknown as T }));
								break;
							case 'delete':
								update((data) => ({ ...data, record: null }));
								break;
						}
					})
					.then((value) => {
						unsubscribe = value;
					});
			};

			const promise = id
				? _pb?.collection(collection).getOne<T>(id, { expand })
				: filter
					? _pb?.collection(collection).getFirstListItem<T>(filter, { expand })
					: null;

			if (promise) {
				update((data) => ({ ...data, isLoading: true }));
				promise
					.then((value) => {
						update((data) => ({ ...data, record: value as T }));
						subscribe(value.id);
					})
					.catch((reason) => {
						if (reason.response.status === 404) {
							update((data) => ({ ...data, record: null }));
						} else {
							update((data) => ({ ...data, error: reason }));
						}
					})
					.finally(() => {
						update((data) => ({ ...data, isLoading: false }));
					});
			}

			return () => {
				unsubscribe();
				unsubscribe = () => { };
			};
		}
	);
};

export const multi = <T extends { id: string } = RecordModel>(
	collection: string,
	sort: string = 'updated',
	expand?: string,
	filter?: string,
	realtime?: boolean,
	listOptions?: RecordListOptions,
	subscribeOptions?: RecordSubscribeOptions
) => {
	return readable<{
		records: T[] | undefined | null;
		totalPages: number;
		totalItems: number;
		isLoading: boolean;
		error: ClientResponseError | null;
	}>(
		{
			records: undefined,
			totalPages: 0,
			totalItems: 0,
			isLoading: false,
			error: null
		},
		(_, update) => {
			let unsubscribe = () => { };

			const subscribe = () => {
				if (!realtime) return;

				_pb
					?.collection(collection)
					.subscribe<T>(
						'*',
						({ action, record }) => {
							update((data) => {
								if (!data.records) return data;

								switch (action) {
									case 'create':
										return {
											...data,
											records: [record as T, ...data.records]
										};
									case 'update':
										return {
											...data,
											records: data.records.map(
												(item) => (item.id === record.id ? record : item) as T
											)
										};
									case 'delete':
										return {
											...data,
											records: data.records.filter((item) => item.id !== record.id)
										};
									default:
										return data;
								}
							});
						},
						subscribeOptions
					)
					.then((value) => {
						unsubscribe = value;
					});
			};

			update((data) => ({ ...data, isLoading: true }));
			_pb
				?.collection(collection)
				.getList<T>(undefined, undefined, { ...listOptions, sort, expand, filter })
				.then((value) => {
					update((data) => ({
						...data,
						records: value.items as T[],
						totalPages: value.totalPages,
						totalItems: value.totalItems
					}));
					subscribe();
				})
				.catch((reason: ClientResponseError) => {
					if (reason.response.status === 404) {
						update((data) => ({ ...data, records: null }));
					} else {
						update((data) => ({ ...data, error: reason }));
					}
				})
				.finally(() => {
					update((data) => ({ ...data, isLoading: false }));
				});

			return () => {
				unsubscribe();
				unsubscribe = () => { };
			};
		}
	);
};
