import Paho from 'paho-mqtt';
import { RECONNECT_DELAY_MS, TOPICS } from '../config';
import { ConnectionState, IncomingMessage, PublishResult } from '../types/mqtt';

type StatusListener = (state: ConnectionState, error?: string) => void;
type MessageListener = (message: IncomingMessage) => void;

const statusListeners = new Set<StatusListener>();
const messageListeners = new Set<MessageListener>();

let client: Paho.Client | null = null;
let currentStatus: ConnectionState = 'disconnected';
let lastUrl = '';
let autoRetry = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function emitStatus(state: ConnectionState, error?: string): void {
  currentStatus = state;
  statusListeners.forEach((listener) => listener(state, error));
}

function clearReconnectTimer(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function teardown(): void {
  if (!client) return;
  const old = client;
  client = null;
  old.onConnectionLost = () => {};
  old.onMessageArrived = () => {};
  try {
    if (old.isConnected()) old.disconnect();
  } catch {
    // já desconectado
  }
}

function scheduleReconnect(): void {
  if (!autoRetry) return;
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => connect(lastUrl), RECONNECT_DELAY_MS);
}

export function getStatus(): ConnectionState {
  return currentStatus;
}

export function onStatusChange(listener: StatusListener): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

export function onMessage(listener: MessageListener): () => void {
  messageListeners.add(listener);
  return () => {
    messageListeners.delete(listener);
  };
}

export function connect(url: string): void {
  clearReconnectTimer();
  teardown();
  lastUrl = url;
  emitStatus('connecting');

  let c: Paho.Client;
  try {
    const clientId = `iotcontrol-${Math.random().toString(16).slice(2, 10)}`;
    c = new Paho.Client(url, clientId);
  } catch {
    emitStatus('error', 'URL inválida. Use o formato wss://host:porta/caminho (ex.: wss://broker.hivemq.com:8884/mqtt).');
    return;
  }

  c.onConnectionLost = (response) => {
    if (client !== c) return;
    client = null;
    emitStatus('error', response.errorMessage || 'Conexão perdida com o broker.');
    scheduleReconnect();
  };

  c.onMessageArrived = (message) => {
    messageListeners.forEach((listener) =>
      listener({ topic: message.destinationName, payload: message.payloadString }),
    );
  };

  client = c;
  c.connect({
    timeout: 8,
    keepAliveInterval: 30,
    cleanSession: true,
    onSuccess: () => {
      if (client !== c) return;
      autoRetry = true;
      c.subscribe(TOPICS.temperature, { qos: 0 });
      c.subscribe(TOPICS.humidity, { qos: 0 });
      c.subscribe(TOPICS.lampState, { qos: 0 });
      emitStatus('connected');
    },
    onFailure: (error) => {
      if (client !== c) return;
      client = null;
      emitStatus('error', error.errorMessage || 'Não foi possível conectar ao broker.');
      scheduleReconnect();
    },
  });
}

export function disconnect(): void {
  autoRetry = false;
  clearReconnectTimer();
  teardown();
  emitStatus('disconnected');
}

export function publish(topic: string, payload: string): PublishResult {
  if (!client || !client.isConnected()) {
    return { ok: false, reason: 'Sem conexão com o broker. Conecte-se antes de enviar comandos.' };
  }
  try {
    const message = new Paho.Message(payload);
    message.destinationName = topic;
    message.qos = 0;
    client.send(message);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Falha ao publicar a mensagem.' };
  }
}
