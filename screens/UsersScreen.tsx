import { MaterialIcons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
} from 'react-native';
import ErrorMessage from '../components/ErrorMessage';
import Searchbar from '../components/SearchBar';

import TableList from '../components/TableList';
import { View } from '../components/Themed';
import useDebounce from '../hooks/useDebounce';
import useSearch from '../hooks/useSearch';
import { UsersContext } from '../providers/UsersProvider';
import { ApiClient } from '../services/ApiClient';
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
	} = useContext(UsersContext);
	const {
		data: searchData,
		loading: loadingSearch,
		error: errorSearch,
	} = useSearch(searchQuery, ApiClient.fetchUsers());
	useEffect(() => {
		navigation?.setOptions({
			headerRight: ({ tintColor }) => (
				<View style={{ flexDirection: 'row' }}>
					{(loadingList || loadingSearch) && (
						<ActivityIndicator style={{ marginRight: 8 }} />
					)}
					<MaterialIcons
						name='refresh'
						color={tintColor}
						size={24}
						onPress={refetch}
					/>
				</View>
			),
		});

		return () => {};
	}, [loadingList, loadingSearch]);

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
					<ErrorMessage
						message={
							errorList?.message ||
							errorSearch?.message ||
							undefined
						}
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
