import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  COMMAND_CONFIRM_TIMEOUT_MS,
  DEFAULT_BROKER_URL,
  HISTORY_LIMIT,
  TOPICS,
} from '../config';
import * as mqttService from '../services/mqttService';
import * as storage from '../services/storageService';
import { darkColors, lightColors, Palette } from '../themes/colors';
import {
  ConnectionState,
  Direction,
  LampReading,
  LampState,
  MqttMessageLog,
  PublishResult,
  SensorReading,
  ThemeMode,
} from '../types/mqtt';
import { parseLampState, parseSensorValue } from '../utils/parsers';

interface AppContextValue {
  ready: boolean;
  theme: ThemeMode;
  colors: Palette;
  setTheme: (mode: ThemeMode) => void;
  brokerUrl: string;
  saveBrokerUrl: (url: string) => void;
  status: ConnectionState;
  errorMessage: string | null;
  connect: (url?: string) => void;
  disconnect: () => void;
  temperature: SensorReading | null;
  humidity: SensorReading | null;
  lamp: LampReading | null;
  pendingCommand: LampState | null;
  sendLampCommand: (action: LampState) => PublishResult;
  history: MqttMessageLog[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [brokerUrl, setBrokerUrl] = useState(DEFAULT_BROKER_URL);
  const [status, setStatus] = useState<ConnectionState>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<SensorReading | null>(null);
  const [humidity, setHumidity] = useState<SensorReading | null>(null);
  const [lamp, setLamp] = useState<LampReading | null>(null);
  const [pendingCommand, setPendingCommand] = useState<LampState | null>(null);
  const [history, setHistory] = useState<MqttMessageLog[]>([]);

  const idCounter = useRef(0);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = useCallback((topic: string, payload: string, direction: Direction) => {
    idCounter.current += 1;
    const entry: MqttMessageLog = {
      id: `${Date.now()}-${idCounter.current}`,
      topic,
      payload,
      direction,
      timestamp: Date.now(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  const clearPending = useCallback(() => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    setPendingCommand(null);
  }, []);

  // Listeners do serviço MQTT (registrados uma vez e removidos no cleanup)
  useEffect(() => {
    const offStatus = mqttService.onStatusChange((state, error) => {
      setStatus(state);
      setErrorMessage(error ?? null);
    });

    const offMessage = mqttService.onMessage(({ topic, payload }) => {
      addLog(topic, payload, 'received');
      const now = Date.now();

      if (topic === TOPICS.temperature) {
        const value = parseSensorValue(payload);
        if (value !== null) setTemperature({ value, timestamp: now });
      } else if (topic === TOPICS.humidity) {
        const value = parseSensorValue(payload);
        if (value !== null) setHumidity({ value, timestamp: now });
      } else if (topic === TOPICS.lampState) {
        const state = parseLampState(payload);
        if (state !== null) {
          setLamp({ state, timestamp: now });
          clearPending();
        }
      }
    });

    return () => {
      offStatus();
      offMessage();
    };
  }, [addLog, clearPending]);

  // Carrega preferências e conecta automaticamente
  useEffect(() => {
    let active = true;
    (async () => {
      const [savedUrl, savedTheme] = await Promise.all([
        storage.loadBrokerUrl(),
        storage.loadTheme(),
      ]);
      if (!active) return;
      const url = savedUrl ?? DEFAULT_BROKER_URL;
      if (savedTheme) setThemeState(savedTheme);
      setBrokerUrl(url);
      setReady(true);
      mqttService.connect(url);
    })();
    return () => {
      active = false;
      mqttService.disconnect();
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    void storage.saveTheme(mode);
  }, []);

  const saveBrokerUrl = useCallback((url: string) => {
    setBrokerUrl(url);
    void storage.saveBrokerUrl(url);
  }, []);

  const connect = useCallback(
    (url?: string) => {
      mqttService.connect(url ?? brokerUrl);
    },
    [brokerUrl],
  );

  const disconnect = useCallback(() => {
    mqttService.disconnect();
  }, []);

  const sendLampCommand = useCallback(
    (action: LampState): PublishResult => {
      const payload = JSON.stringify({ action });
      const result = mqttService.publish(TOPICS.lampCommand, payload);
      if (result.ok) {
        addLog(TOPICS.lampCommand, payload, 'sent');
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        setPendingCommand(action);
        pendingTimer.current = setTimeout(() => {
          pendingTimer.current = null;
          setPendingCommand(null);
        }, COMMAND_CONFIRM_TIMEOUT_MS);
      }
      return result;
    },
    [addLog],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      theme,
      colors: theme === 'dark' ? darkColors : lightColors,
      setTheme,
      brokerUrl,
      saveBrokerUrl,
      status,
      errorMessage,
      connect,
      disconnect,
      temperature,
      humidity,
      lamp,
      pendingCommand,
      sendLampCommand,
      history,
    }),
    [
      ready, theme, setTheme, brokerUrl, saveBrokerUrl, status, errorMessage,
      connect, disconnect, temperature, humidity, lamp, pendingCommand,
      sendLampCommand, history,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
