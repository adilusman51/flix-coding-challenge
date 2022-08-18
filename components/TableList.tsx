import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
	StyleProp,
	StyleSheet,
	TextStyle,
	TouchableOpacity,
	ViewStyle,
} from 'react-native';

import { Text, View } from './Themed';

export type Data<T = any> = Array<T>;

type SortDirection = 'Asc' | 'Desc' | 'None';

const sortData = (
	data: Data,
	sortKey: string,
	sortDirection: SortDirection
) => {
	return data.sort((a, b) => {
		const first = a?.[sortKey];
		const second = b?.[sortKey];
		if (typeof first === 'number') {
			if (sortDirection === 'Asc') {
				return first - second;
			} else if (sortDirection === 'Desc') {
				return second - first;
			} else {
				return 0;
			}
		} else if (typeof first === 'string') {
			if (sortDirection === 'Asc') {
				if (first > second) {
					return 1;
				} else if (first < second) {
					return -1;
				} else {
					return 0;
				}
			} else if (sortDirection === 'Desc') {
				if (first < second) {
					return 1;
				} else if (first > second) {
					return -1;
				} else {
					return 0;
				}
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	});
};

interface TableListProps {
	headers: Array<{ label: string; key: string }>;
	data?: Data;
	defaultSortKey?: string;
	defaultSortDirection?: SortDirection;
	headerItemStyle?: StyleProp<ViewStyle>;
	headerTextStyle?: StyleProp<TextStyle>;
	itemStyle?: StyleProp<ViewStyle>;
	itemTextStyle?: StyleProp<TextStyle>;
	contentContainerStyle?: StyleProp<ViewStyle>;
	headerItemContainerStyle?: StyleProp<ViewStyle>;
}

export default function TableList({
	headers,
	data,
	defaultSortKey,
	defaultSortDirection,
	headerItemStyle,
	headerTextStyle,
	itemStyle,
	itemTextStyle,
	contentContainerStyle,
	headerItemContainerStyle,
}: TableListProps) {
	const [sortDirection, setSortDirection] = useState<SortDirection>(
		defaultSortDirection || 'None'
	);
	const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);

	const [sortedData, setSortedData] = useState<Data>(data || []);

	useEffect(() => {
		if (!data || data.length === 0) {
			setSortedData([]);
			return;
		}
		if (!sortKey) {
			setSortedData([...data]);
			return;
		}

		if (sortDirection === 'None') {
			setSortedData([...data]);
			return;
		}

		const _sortedData = sortData([...data], sortKey, sortDirection);

		setSortedData(_sortedData);

		return () => {};
	}, [data, sortDirection, sortKey]);

	const toggleSortDirection = () => {
		if (sortDirection === 'None') {
			setSortDirection('Asc');
		} else if (sortDirection === 'Asc') {
			setSortDirection('Desc');
		} else if (sortDirection === 'Desc') {
			setSortDirection('None');
			setSortKey(defaultSortKey);
		}
	};

	return (
		<View>
			<View style={[styles.contentContainer, contentContainerStyle]}>
				{headers?.map((header, index) => (
					<View
						key={index?.toString()}
						style={[
							styles.headerItemContainer,
							headerItemContainerStyle,
						]}
					>
						<TouchableOpacity
							style={[styles.headerItem, headerItemStyle]}
							onPress={() => {
								if (sortKey === header?.key) {
									toggleSortDirection();
								} else {
									setSortDirection('Asc');
									setSortKey(header?.key);
								}
							}}
						>
							<Text
								style={[
									styles.headerTextStyle,
									headerTextStyle,
								]}
								lightColor='rgba(0,0,0,0.8)'
								darkColor='rgba(255,255,255,0.8)'
							>
								{`${header?.label || ''}`}
							</Text>
							<MaterialIcons
								name={
									sortKey === header?.key
										? sortDirection === 'Asc'
											? 'arrow-upward'
											: sortDirection === 'Desc'
											? 'arrow-downward'
											: 'import-export'
										: 'import-export'
								}
								size={24}
								color={
									sortKey === header?.key
										? 'grey'
										: 'rgba(0,0,0,0.2)'
								}
							/>
						</TouchableOpacity>
						{sortedData?.map((row, index) => {
							let value = null;
							if (typeof row === 'string') {
								value = row;
							} else if (typeof row === 'number') {
								value = row;
							} else if (typeof row === 'object') {
								if (header?.key || header?.label) {
									value = row?.[header?.key || header?.label];
								}
							}
							return (
								<View
									key={index?.toString()}
									style={[styles.item, itemStyle]}
								>
									<Text
										style={[
											styles.itemTextStyle,
											itemTextStyle,
										]}
										lightColor='rgba(0,0,0,0.8)'
										darkColor='rgba(255,255,255,0.8)'
									>
										{`${value || ''}`}
									</Text>
								</View>
							);
						})}
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		width: '100%',
		flexDirection: 'row',
	},
	headerItemContainer: {
		flex: 1,
	},
	headerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 8,
		borderWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		backgroundColor: 'rgba(0,0,0,0.025)',
	},
	headerTextStyle: {
		fontSize: 18,
		lineHeight: 24,
		fontWeight: '500',
		textAlign: 'left',
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 8,
		borderWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	itemTextStyle: {
		fontSize: 18,
		lineHeight: 24,
		textAlign: 'left',
	},
});
