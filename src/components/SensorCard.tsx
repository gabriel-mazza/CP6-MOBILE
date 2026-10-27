import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/format';

interface Props {
  title: string;
  value: number | null;
  unit: string;
  timestamp: number | null;
}

export default function SensorCard({ title, value, unit, timestamp }: Props) {
  const { colors } = useApp();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {value === null ? '--' : `${value}${unit}`}
      </Text>
      <Text style={[styles.time, { color: colors.textSecondary }]}>
        {timestamp === null ? 'Aguardando dados...' : `Atualizado às ${formatTime(timestamp)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14 },
  title: { fontSize: 14, marginBottom: 6 },
  value: { fontSize: 32, fontWeight: '700' },
  time: { fontSize: 12, marginTop: 6 },
});
