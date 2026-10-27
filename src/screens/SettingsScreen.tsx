import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import ConnectionStatus from '../components/ConnectionStatus';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { colors, theme, setTheme, brokerUrl, saveBrokerUrl, connect, disconnect, status } = useApp();
  const [draft, setDraft] = useState(brokerUrl);

  useEffect(() => {
    setDraft(brokerUrl);
  }, [brokerUrl]);

  const handleSaveAndConnect = () => {
    const url = draft.trim();
    if (!/^wss?:\/\/.+/i.test(url)) {
      Alert.alert('URL inválida', 'Use uma URL WebSocket, ex.: wss://broker.hivemq.com:8884/mqtt');
      return;
    }
    saveBrokerUrl(url);
    connect(url);
  };

  const isActive = status === 'connected' || status === 'connecting';

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <ConnectionStatus />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>URL WebSocket do broker</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="wss://broker.hivemq.com:8884/mqtt"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSaveAndConnect}>
          <Text style={styles.buttonText}>Salvar e conectar</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: isActive ? colors.danger : colors.border }]}
          onPress={disconnect}
          disabled={!isActive}
        >
          <Text style={[styles.buttonText, !isActive && { color: colors.textSecondary }]}>Desconectar</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.themeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.themeText, { color: colors.text }]}>Tema escuro</Text>
        <Switch value={theme === 'dark'} onValueChange={(on) => setTheme(on ? 'dark' : 'light')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  label: { fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  button: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeText: { fontSize: 16 },
});
