import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps, View } from './Themed';

export type SearchBarProps = TextInputProps & {
	iconSize?: number;
	iconColor?: string;
	onClearText?: () => void;
};

const SearchBar = ({
	iconSize = 24,
	iconColor = 'black',
	onClearText,
	...textProps
}: SearchBarProps) => {
	return (
		<View style={styles.container}>
			<MaterialIcons name='search' size={iconSize} color={iconColor} />
			<TextInput style={styles.textInputStyle} {...textProps} />
			<MaterialIcons
				name='clear'
				size={iconSize}
				color={iconColor}
				onPress={onClearText}
			/>
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
