import React, {useCallback} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {RootStackParamList} from '../../App';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useStore} from '../store/useStore';

type ResultRoute = RouteProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const route = useRoute<ResultRoute>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const addScan = useStore(s => s.addScan);
  const text = route.params?.text ?? '';

  const save = useCallback(() => {
    if (!text.trim()) {
      Alert.alert('Nothing to save', 'No text was recognized.');
      return;
    }
    addScan(text);
    Alert.alert('Saved', 'Scan saved to history.', [
      {text: 'OK', onPress: () => navigation.navigate('History')},
    ]);
  }, [addScan, navigation, text]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text selectable style={styles.text}>
          {text || 'No text recognized.'}
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={save}>
          <Text style={styles.primaryText}>Save to History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {padding: 16},
  text: {fontSize: 16, lineHeight: 22},
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  primaryBtn: {
    backgroundColor: '#2962FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryText: {color: '#fff', fontWeight: '700'},
});
