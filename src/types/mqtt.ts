export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';
export type Direction = 'sent' | 'received';
export type LampState = 'ON' | 'OFF';
export type ThemeMode = 'light' | 'dark';

export interface IncomingMessage {
  topic: string;
  payload: string;
}

export interface MqttMessageLog {
  id: string;
  topic: string;
  payload: string;
  direction: Direction;
  timestamp: number;
}

export interface SensorReading {
  value: number;
  timestamp: number;
}

export interface LampReading {
  state: LampState;
  timestamp: number;
}

export type PublishResult = { ok: true } | { ok: false; reason: string };
