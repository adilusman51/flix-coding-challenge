import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useReducer, useRef } from 'react';

const DEFAULT_TIMEOUT = 1000 * 60 * 60 * 1;

interface State<T> {
	loading: boolean;
	data?: T;
	error?: Error;
	timestamp?: number;
}
type CacheData<T> = { data: T; timestamp?: number };
type Cache<T> = { [cacheKey: string]: CacheData<T> };

type Action<T> =
	| { type: 'loading' }
	| { type: 'success'; payload: T; timestamp: number }
	| { type: 'cache'; payload: T; timestamp: number }
	| { type: 'error'; payload: Error };

type FetchOptions = {
	cacheKey: string;
	cacheTimeOut?: number;
	disableAutoFetch?: boolean;
	debug?: boolean;
};

function useFetch<T = unknown>(
	method: Promise<T>,
	options: FetchOptions
): State<T> & {
	refetch: () => Promise<void>;
	fetch: () => Promise<void>;
} {
	const cache = useRef<Cache<T>>({});

	// Used to prevent state update if the component is unmounted
	const cancelRequest = useRef<boolean>(false);

	const initialState: State<T> = {
		error: undefined,
		data: undefined,
		loading: false,
		timestamp: undefined,
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
				console.log(`[useFetch]${message}`, ...optionalParams);
		},
		[options.debug]
	);

	const refetch = useCallback(async () => {
		log(`[refetch][loading]`);
		dispatch({ type: 'loading' });
		try {
			const { cacheKey } = options;
			const data = await method;
			const timestamp = Date.now();
			cache.current[cacheKey] = { data, timestamp };
			try {
				const jsonValue = JSON.stringify(cache.current[cacheKey]);
				await AsyncStorage.setItem(cacheKey, jsonValue);
			} catch (e) {
				log('[Error][Cache][Save]', e);
			}

			log(`[refetch][success]:`, data, timestamp);
			if (cancelRequest.current) return;
			dispatch({ type: 'success', payload: data, timestamp: timestamp });
		} catch (error) {
			log(`[refetch][error]:`, error);
			if (cancelRequest.current) return;
			dispatch({ type: 'error', payload: error as Error });
		}
	}, [options.cacheKey, options.cacheTimeOut]);

	const fetchCachedData = useCallback(async () => {
		log(`[fetch][loading]`);
		dispatch({ type: 'loading' });

		try {
			const { cacheKey, cacheTimeOut = DEFAULT_TIMEOUT } = options;

			const jsonValue = await AsyncStorage.getItem(cacheKey);
			if (jsonValue != null) {
				const cacheData: CacheData<T> = JSON.parse(jsonValue);
				if (cacheData) {
					const { timestamp, data } = cacheData;
					if (timestamp) {
						const delta = Date.now() - timestamp;
						if (delta < cacheTimeOut) {
							cache.current[cacheKey] = cacheData;
							log(`[fetch][cache]:`, cache.current[cacheKey]);

							if (cancelRequest.current) return;
							dispatch({
								type: 'cache',
								payload: cache.current[cacheKey].data,
								timestamp: timestamp,
							});
							return true;
						}
					}
				}
			}
			return false;
		} catch (e) {
			// error reading value
			log('[Error][Cache][Read]', e);
			return false;
		}
	}, [options.cacheKey, options.cacheTimeOut]);

	const fetch = useCallback(async () => {
		const cached = await fetchCachedData();
		if (!cached) {
			await refetch();
		}
	}, []);

	useEffect(() => {
		cancelRequest.current = false;
		if (!options.disableAutoFetch) {
			fetch();
		}

		// Use the cleanup function for avoiding a possibly...
		// ...state update after the component was unmounted
		return () => {
			cancelRequest.current = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [options.cacheKey, options.cacheTimeOut, options.disableAutoFetch]);

	return { ...state, refetch, fetch };
}

export default useFetch;
