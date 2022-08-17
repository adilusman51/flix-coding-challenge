import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import TableList from '../components/TableList';
import { Text, View } from '../components/Themed';
import useFetch from '../hooks/useFetch';
import { ApiClient, User } from '../services/ApiClient';
import { AppStackScreenProps } from '../types';

export default function UsersScreen({
	navigation,
}: AppStackScreenProps<'Users'>) {
	const { data, loading, error, refetch } = useFetch<User[]>(
		ApiClient.fetchUsers(),
		{
			cacheKey: 'Users',
			cacheTimeOut: 1000 * 60 * 60 * 1,
		}
	);
	useEffect(() => {
		navigation?.setOptions({
			headerRight: ({ tintColor }) => (
				<MaterialIcons
					name='refresh'
					color={tintColor}
					size={24}
					onPress={refetch}
				/>
			),
		});

		return () => {};
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Users</Text>
			<View
				style={styles.separator}
				lightColor='#eee'
				darkColor='rgba(255,255,255,0.1)'
			/>
			<TableList
				headers={[
					{ label: 'name', key: 'name' },
					{ label: 'age', key: 'age' },
				]}
				data={data}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		alignSelf: 'center',
	},
	separator: {
		marginVertical: 16,
		height: 1,
		width: '100%',
	},
});
