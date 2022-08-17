import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput as DefaultTextInput } from 'react-native';
import { TextInput, View } from './Themed';

export type SearchBarProps = DefaultTextInput['props'] & {
	onClearText?: () => void;
};

const SearchBar = ({ onClearText, ...textProps }: SearchBarProps) => {
	return (
		<View style={styles.container}>
			<MaterialIcons name='search' size={24} />
			<TextInput style={styles.textInputStyle} {...textProps} />
			<MaterialIcons name='clear' size={24} onPress={onClearText} />
		</View>
	);
};

export default SearchBar;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
	},
	textInputStyle: {
		flex: 1,
		marginHorizontal: 16,
		fontSize: 18,
	},
});
