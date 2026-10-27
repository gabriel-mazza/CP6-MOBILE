import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { ConnectionState } from '../types/mqtt';

const LABELS: Record<ConnectionState, string> = {
  connecting: 'Conectando...',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro de conexão',
};

export default function ConnectionStatus() {
  const { status, errorMessage, colors, connect } = useApp();

  const dotColor =
    status === 'connected' ? colors.success
    : status === 'connecting' ? colors.warning
    : status === 'error' ? colors.danger
    : colors.textSecondary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        {status === 'connecting' ? (
          <ActivityIndicator size="small" color={dotColor} />
        ) : (
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        )}
        <Text style={[styles.label, { color: colors.text }]}>{LABELS[status]}</Text>
        {(status === 'error' || status === 'disconnected') && (
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => connect()}
          >
            <Text style={styles.buttonText}>Reconectar</Text>
          </Pressable>
        )}
      </View>
      {errorMessage ? (
        <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  label: { flex: 1, fontSize: 16, fontWeight: '600' },
  button: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
  error: { marginTop: 8, fontSize: 13 },
});
