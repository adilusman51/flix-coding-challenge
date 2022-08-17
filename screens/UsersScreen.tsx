import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import TableList, { Data } from '../components/TableList';
import { Text, View } from '../components/Themed';
import { ApiClient, User } from '../services/ApiClient';
import { AppStackScreenProps } from '../types';

export default function UsersScreen({
	navigation,
}: AppStackScreenProps<'Users'>) {
	const [data, setData] = useState<Data<User>>([]);

	useEffect(() => {
		const fetchData = async () => {
			setData(await ApiClient.fetchUsers());
		};
		fetchData();
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
