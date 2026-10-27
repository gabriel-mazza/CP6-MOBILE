import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { MqttMessageLog } from '../types/mqtt';
import { formatTime } from '../utils/format';

export default function MessageItem({ item }: { item: MqttMessageLog }) {
  const { colors } = useApp();
  const sent = item.direction === 'sent';
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.badge, { color: sent ? colors.primary : colors.success }]}>
          {sent ? '↑ Enviada' : '↓ Recebida'}
        </Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      <Text style={[styles.topic, { color: colors.text }]}>{item.topic}</Text>
      <Text style={[styles.payload, { color: colors.textSecondary }]}>{item.payload}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  badge: { fontWeight: '700', fontSize: 13 },
  time: { fontSize: 12 },
  topic: { fontSize: 13, fontWeight: '600' },
  payload: { fontSize: 13, marginTop: 2, fontFamily: 'monospace' },
});
