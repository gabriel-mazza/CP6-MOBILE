// Troque o GROUP_ID por um identificador exclusivo do seu grupo.
export const GROUP_ID = 'fiap/turma/grupo01';

export const TOPICS = {
  temperature: `${GROUP_ID}/sensor/temperatura`,
  humidity: `${GROUP_ID}/sensor/umidade`,
  lampCommand: `${GROUP_ID}/lampada/comando`,
  lampState: `${GROUP_ID}/lampada/estado`,
} as const;

// WebSocket seguro do broker público da HiveMQ (porta WS, NÃO a TCP 1883).
export const DEFAULT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

export const HISTORY_LIMIT = 10;
export const COMMAND_CONFIRM_TIMEOUT_MS = 5000;
export const RECONNECT_DELAY_MS = 5000;
