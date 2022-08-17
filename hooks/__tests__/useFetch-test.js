import { act, renderHook } from '@testing-library/react-native';
import { ApiClient } from '../../services/ApiClient';
import useFetch from '../useFetch';

const TestCacheTimeOut = 1000 * 3;

async function sleep(timeout) {
	await new Promise((r) => setTimeout(r, timeout));
}

describe('useFetch test', () => {
	it('Should render ok', async () => {
		const randomTestKey = Math.round(Math.random() * 10000);
		const { result } = renderHook(() =>
			useFetch(ApiClient.fetchUsers(), {
				cacheKey: `Users-${randomTestKey}`,
				cacheTimeOut: TestCacheTimeOut,
				disableAutoFetch: true,
				debug: false,
			})
		);
		expect(result.current).toBeDefined();
		expect(result.current.timestamp).toBeUndefined();

		await act(async () => {
			await result.current.refetch();
		});

		expect(result.current).toBeDefined();
		expect(result.current.timestamp).toBeDefined();

		const firstTimestamp = Date.now();

		await act(async () => {
			await result.current.fetch();
		});

		expect(result.current).toBeDefined();
		expect(result.current.timestamp).toBeLessThan(firstTimestamp);

		await sleep(TestCacheTimeOut);

		await act(async () => {
			await result.current.fetch();
		});

		expect(result.current).toBeDefined();
		expect(result.current.timestamp).toBeGreaterThan(firstTimestamp);

		const secondTimestamp = Date.now();

		await act(async () => {
			await result.current.fetch();
		});

		expect(result.current).toBeDefined();
		expect(result.current.timestamp).toBeLessThan(secondTimestamp);
	});
});
