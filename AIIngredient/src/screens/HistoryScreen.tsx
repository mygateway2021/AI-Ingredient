import React, {useCallback} from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useStore} from '../store/useStore';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({navigation}: Props) {
  const scans = useStore(s => s.scans);
  const clearScans = useStore(s => s.clearScans);

  const renderItem: ListRenderItem<(typeof scans)[number]> = ({item}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Result', {text: item.text})}>
      <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
      <Text numberOfLines={2} style={styles.preview}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  const keyExtractor = useCallback(
    (item: (typeof scans)[number]) => item.id,
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={scans}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={scans.length === 0 && styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.empty}>No scans yet.</Text>}
      />
      <View style={styles.footer}>
        <TouchableOpacity onPress={clearScans} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  item: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  date: {fontSize: 12, color: '#666', marginBottom: 6},
  preview: {fontSize: 14, color: '#111'},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  empty: {color: '#666'},
  footer: {padding: 16},
  clearBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#eeeeee',
  },
  clearText: {color: '#333', fontWeight: '600'},
});
