import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.note}>
        User preferences (diet, allergies) and privacy settings will live here
        in Phase 2–3.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 8},
  note: {color: '#555'},
});
