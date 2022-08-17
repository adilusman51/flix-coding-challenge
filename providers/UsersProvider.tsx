import { createContext, FC, PropsWithChildren } from 'react';
import useFetch from '../hooks/useFetch';
import { ApiClient, User } from '../services/ApiClient';

type UsersContextType = {
	loading: boolean;
	data?: Array<User>;
	error?: Error;
	timestamp?: number;
	refetch?: () => Promise<void>;
	fetch?: () => Promise<void>;
};

export const UsersContext = createContext<UsersContextType>({
	data: undefined,
	loading: false,
	error: undefined,
	timestamp: undefined,
});

interface UsersProviderProps extends PropsWithChildren {}

export const UsersProvider: FC<UsersProviderProps> = ({ children }) => {
	const { data, loading, error, refetch, fetch } = useFetch<User[]>(
		ApiClient.fetchUsers(),
		{
			cacheKey: 'Users',
			cacheTimeOut: 1000 * 60 * 60 * 1,
		}
	);
	return (
		<UsersContext.Provider value={{ data, loading, error, refetch, fetch }}>
			{children}
		</UsersContext.Provider>
	);
};
