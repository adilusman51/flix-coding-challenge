import { useCallback, useEffect, useReducer, useRef } from 'react';

const DEFAULT_TIMEOUT = 1000 * 60 * 60 * 1;

interface State<T> {
	loading: boolean;
	data?: T;
	error?: Error;
	timestamp?: number;
}

type Action<T> =
	| { type: 'loading' }
	| { type: 'success'; payload: T; timestamp: number }
	| { type: 'cache'; payload: T; timestamp: number }
	| { type: 'error'; payload: Error };

type SearchOptions = {
	debug?: boolean;
	disableAutoFetch?: boolean;
};

function useSearch<T = unknown>(
	searchQuery: string,
	method: Promise<T>,
	options: SearchOptions = { debug: false }
): State<T> & { fetch: () => Promise<void> } {
	// Used to prevent state update if the component is unmounted
	const cancelRequest = useRef<boolean>(false);

	const initialState: State<T> = {
		error: undefined,
		data: undefined,
		loading: false,
	};

	// Keep state logic separated
	const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
		switch (action.type) {
			case 'loading':
				return { ...initialState, loading: true };
			case 'success':
				return {
					...initialState,
					data: action.payload,
					loading: false,
					timestamp: action.timestamp,
				};
			case 'cache':
				return {
					...initialState,
					data: action.payload,
					loading: false,
					timestamp: action.timestamp,
				};
			case 'error':
				return {
					...initialState,
					error: action.payload,
					loading: false,
				};
			default:
				return state;
		}
	};

	const [state, dispatch] = useReducer(fetchReducer, initialState);

	const log = useCallback(
		(message?: any, ...optionalParams: any[]) => {
			if (options.debug)
				console.log(`[useSearch]${message}`, ...optionalParams);
		},
		[options.debug]
	);

	const filter = (data: T, searchQuery: string) => {
		let filteredData: any[] = [];
		if (!searchQuery) return filteredData;
		if (data instanceof Array) {
			filteredData =
				data?.filter((item, index) => {
					let found = false;
					if (item instanceof Object) {
						const values = Object.values(item);
						values.forEach((element) => {
							if (typeof element === 'string') {
								if (
									element
										.toLowerCase()
										.includes(searchQuery.toLowerCase())
								) {
									found = true;
								}
							} else if (typeof element === 'number') {
								if (element.toString()?.includes(searchQuery)) {
									found = true;
								}
							}
						});
					}
					if (found) {
						return true;
					} else {
						return false;
					}
				}) || [];
		}
		return filteredData;
	};

	const fetch = useCallback(async () => {
		if (!searchQuery) {
			const timestamp = Date.now();
			log(`[fetch][clear]:`, [], timestamp);
			if (cancelRequest.current) return;
			dispatch({
				type: 'success',
				payload: [] as unknown as T,
				timestamp: timestamp,
			});
			return;
		}
		try {
			const data = await method;

			const timestamp = Date.now();
			const filteredData = filter(data, searchQuery);
			log(`[fetch][success]:`, filteredData, timestamp);
			if (cancelRequest.current) return;
			dispatch({
				type: 'success',
				payload: filteredData as unknown as T,
				timestamp: timestamp,
			});
		} catch (error) {
			log(`[fetch][error]:`, error);
			if (cancelRequest.current) return;
			dispatch({ type: 'error', payload: error as Error });
		}
	}, [searchQuery]);

	useEffect(() => {
		cancelRequest.current = false;
		if (options?.disableAutoFetch) return;

		const searchData = async () => {
			fetch();
		};

		searchData();

		// Use the cleanup function for avoiding a possibly...
		// ...state update after the component was unmounted
		return () => {
			cancelRequest.current = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, options.disableAutoFetch]);

	return { ...state, fetch };
}

export default useSearch;
