import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextProps, View } from './Themed';

export type ErrorMessageProps = TextProps & {
	message?: string;
	iconSize?: number;
	iconColor?: string;
	onClearText?: () => void;
};

const ErrorMessage = ({
	message,
	iconSize = 24,
	iconColor = 'red',
	onClearText,
	...textProps
}: ErrorMessageProps) => {
	if (!message) return null;
	return (
		<View style={styles.container}>
			<MaterialIcons
				name='error-outline'
				size={iconSize}
				color={iconColor}
			/>
			<Text style={styles.textStyle} {...textProps}>{`${message}`}</Text>
		</View>
	);
};

export default ErrorMessage;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginBottom: 16,
		alignItems: 'center',
	},
	textStyle: {
		flex: 1,
		marginHorizontal: 16,
		fontSize: 18,
		color: 'red',
	},
});
