import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import Searchbar from '../components/SearchBar';

import TableList from '../components/TableList';
import { View } from '../components/Themed';
import useDebounce from '../hooks/useDebounce';
import useFetch from '../hooks/useFetch';
import useSearch from '../hooks/useSearch';
import { ApiClient, User } from '../services/ApiClient';
import { AppStackScreenProps } from '../types';

export default function UsersScreen({
	navigation,
}: AppStackScreenProps<'Users'>) {
	const [searchString, setSearchString] = useState<string>('');
	const searchQuery = useDebounce(searchString, 500);
	const {
		data: listData,
		loading: loadingList,
		error: errorList,
		refetch,
	} = useFetch<User[]>(ApiClient.fetchUsers(), {
		cacheKey: 'Users',
		cacheTimeOut: 1000 * 60 * 60 * 1,
	});
	const { data: searchData } = useSearch(searchQuery, ApiClient.fetchUsers());
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

	const onChangeText = (text: string) => {
		setSearchString(text);
	};
	const onClearText = () => {
		setSearchString('');
	};

	return (
		<KeyboardAvoidingView style={{ flex: 1 }}>
			<ScrollView
				contentContainerStyle={{ flex: 1 }}
				keyboardDismissMode='interactive'
			>
				<View style={styles.container}>
					<Searchbar
						placeholder='Search Users'
						value={searchString}
						onChangeText={onChangeText}
						onClearText={onClearText}
					/>
					<View
						style={styles.separator}
						lightColor='#eee'
						darkColor='rgba(255,255,255,0.1)'
					/>
					<TableList
						headers={[
							{ label: 'Name', key: 'name' },
							{ label: 'Age', key: 'age' },
						]}
						data={searchQuery ? searchData : listData}
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
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
