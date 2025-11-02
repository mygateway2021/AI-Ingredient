import React, {useCallback, useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import TextRecognition, {
  TextRecognitionScript,
} from '@react-native-ml-kit/text-recognition';
import {launchCamera, CameraOptions} from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export default function ScanScreen({navigation}: Props) {
  const [busy, setBusy] = useState(false);

  const takeAndRecognize = useCallback(async () => {
    if (busy) {
      return;
    }
    try {
      setBusy(true);
      const options: CameraOptions = {
        mediaType: 'photo',
        cameraType: 'back',
        includeBase64: false,
        saveToPhotos: false,
      };
      const resp = await launchCamera(options);
      if (resp.didCancel) {
        setBusy(false);
        return;
      }
      const asset = resp.assets && resp.assets[0];
      const path = asset?.uri;
      if (!path) {
        throw new Error('No image captured');
      }
      const result = await TextRecognition.recognize(
        path,
        TextRecognitionScript.LATIN,
      );
      const text = result?.text ?? '';
      navigation.navigate('Result', {text});
    } catch (e: any) {
      Alert.alert('Scan failed', e?.message ?? 'Unknown error');
    } finally {
      setBusy(false);
    }
  }, [navigation, busy]);

  const goHistory = useCallback(
    () => navigation.navigate('History'),
    [navigation],
  );
  const goProfile = useCallback(
    () => navigation.navigate('Profile'),
    [navigation],
  );

  const content = useMemo(() => {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goHistory} style={styles.topButton}>
            <Text style={styles.btnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goProfile} style={styles.topButton}>
            <Text style={styles.btnText}>Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.header}>Scan ingredient label</Text>
          <TouchableOpacity
            onPress={takeAndRecognize}
            disabled={busy}
            style={[styles.shutter, busy && styles.shutterDisabled]}>
            <Text style={styles.shutterText}>
              {busy ? 'Scanning…' : 'Open Camera'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [busy, goHistory, goProfile, takeAndRecognize]);

  return content;
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {color: '#fff', fontSize: 18, marginBottom: 16},
  topBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: {color: '#fff', fontWeight: '600'},
  shutter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00C853',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterDisabled: {backgroundColor: '#7cb342'},
  shutterText: {color: 'white', fontSize: 18, fontWeight: '700'},
});
