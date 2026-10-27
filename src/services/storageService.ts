import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../types/mqtt';

const KEYS = {
  brokerUrl: '@iotcontrol:brokerUrl',
  theme: '@iotcontrol:theme',
} as const;

export async function loadBrokerUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.brokerUrl);
  } catch {
    return null;
  }
}

export async function saveBrokerUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.brokerUrl, url);
  } catch {
    // falha de persistência não deve derrubar o app
  }
}

export async function loadTheme(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(KEYS.theme);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export async function saveTheme(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.theme, mode);
  } catch {
    // ignora
  }
}
