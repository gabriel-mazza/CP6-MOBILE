import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ConnectionStatus from '../components/ConnectionStatus';
import SensorCard from '../components/SensorCard';
import { useApp } from '../context/AppContext';
import { LampState } from '../types/mqtt';
import { formatTime } from '../utils/format';

export default function DashboardScreen() {
  const { ready, colors, temperature, humidity, lamp, pendingCommand, sendLampCommand } = useApp();

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Carregando preferências...</Text>
      </View>
    );
  }

  const handleCommand = (action: LampState) => {
    const result = sendLampCommand(action);
    if (!result.ok) Alert.alert('Comando não enviado', result.reason);
  };

  const lampLabel = lamp === null ? 'Desconhecido' : lamp.state === 'ON' ? 'Ligada' : 'Desligada';
  const lampColor = lamp === null ? colors.textSecondary : lamp.state === 'ON' ? colors.success : colors.danger;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <ConnectionStatus />

      <View style={styles.row}>
        <SensorCard title="Temperatura" value={temperature?.value ?? null} unit="°C" timestamp={temperature?.timestamp ?? null} />
        <SensorCard title="Umidade" value={humidity?.value ?? null} unit="%" timestamp={humidity?.timestamp ?? null} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Lâmpada</Text>
        <Text style={[styles.lampState, { color: lampColor }]}>{lampLabel}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {pendingCommand
            ? `Aguardando confirmação do dispositivo (${pendingCommand === 'ON' ? 'ligar' : 'desligar'})...`
            : lamp
              ? `Estado recebido às ${formatTime(lamp.timestamp)}`
              : 'Nenhum estado recebido ainda'}
        </Text>

        <View style={styles.row}>
          <Pressable style={[styles.button, { backgroundColor: colors.success }]} onPress={() => handleCommand('ON')}>
            <Text style={styles.buttonText}>Ligar</Text>
          </Pressable>
          <Pressable style={[styles.button, { backgroundColor: colors.danger }]} onPress={() => handleCommand('OFF')}>
            <Text style={styles.buttonText}>Desligar</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 },
  cardTitle: { fontSize: 14 },
  lampState: { fontSize: 28, fontWeight: '700' },
  hint: { fontSize: 12, marginBottom: 6 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
