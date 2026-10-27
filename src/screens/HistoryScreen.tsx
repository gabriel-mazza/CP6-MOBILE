import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MessageItem from '../components/MessageItem';
import { useApp } from '../context/AppContext';

export default function HistoryScreen() {
  const { history, colors } = useApp();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            Nenhuma mensagem ainda. Aguarde dados do simulador ou envie um comando.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: { textAlign: 'center', marginTop: 40 },
});
