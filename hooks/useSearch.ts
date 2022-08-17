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

type SearchOptions = {};

function useSearch<T = unknown>(
	searchQuery: string,
	method: Promise<T>,
	options?: SearchOptions
): State<T> & { refetch: () => Promise<void> } {
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

	const filter = (data: T, searchQuery: string) => {
		let filteredData = [];
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

	const refetch = useCallback(async () => {
		try {
			const data = await method;

			const timestamp = Date.now();
			const filteredData = filter(data, searchQuery);
			console.log(`[success]:`, filteredData, timestamp);
			if (cancelRequest.current) return;
			dispatch({
				type: 'success',
				payload: filteredData as unknown as T,
				timestamp: timestamp,
			});
		} catch (error) {
			console.log(`[error]:`, error);
			if (cancelRequest.current) return;
			dispatch({ type: 'error', payload: error as Error });
		}
	}, [searchQuery]);

	useEffect(() => {
		cancelRequest.current = false;

		const searchData = async () => {
			refetch();
		};

		searchData();

		// Use the cleanup function for avoiding a possibly...
		// ...state update after the component was unmounted
		return () => {
			cancelRequest.current = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery]);

	return { ...state, refetch };
}

export default useSearch;
