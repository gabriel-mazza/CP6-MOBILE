// Simulador do dispositivo IoT.
// Uso: node scripts/simulator.js
// Variáveis opcionais: BROKER_URL (padrão mqtt://broker.hivemq.com:1883) e GROUP_ID.
const mqtt = require('mqtt');

const GROUP_ID = process.env.GROUP_ID || 'fiap/turma/grupo01';
const BROKER_URL = process.env.BROKER_URL || 'mqtt://broker.hivemq.com:1883';

const TOPICS = {
  temperature: `${GROUP_ID}/sensor/temperatura`,
  humidity: `${GROUP_ID}/sensor/umidade`,
  lampCommand: `${GROUP_ID}/lampada/comando`,
  lampState: `${GROUP_ID}/lampada/estado`,
};

let lampState = 'OFF';

const client = mqtt.connect(BROKER_URL, {
  clientId: `iot-simulator-${Math.random().toString(16).slice(2, 10)}`,
});

function publish(topic, obj) {
  const payload = JSON.stringify(obj);
  client.publish(topic, payload);
  console.log(`[PUB] ${topic} ${payload}`);
}

client.on('connect', () => {
  console.log(`Simulador conectado em ${BROKER_URL}`);
  client.subscribe(TOPICS.lampCommand, (err) => {
    if (err) console.error('Erro ao assinar comando:', err.message);
  });
  publish(TOPICS.lampState, { state: lampState });
});

client.on('message', (topic, buffer) => {
  const raw = buffer.toString();
  console.log(`[SUB] ${topic} ${raw}`);
  if (topic !== TOPICS.lampCommand) return;
  try {
    const data = JSON.parse(raw);
    if (data.action === 'ON' || data.action === 'OFF') {
      lampState = data.action;
      publish(TOPICS.lampState, { state: lampState });
    } else {
      console.warn('Comando inválido ignorado:', raw);
    }
  } catch {
    console.warn('Payload não é JSON válido, ignorado:', raw);
  }
});

client.on('error', (err) => console.error('Erro MQTT:', err.message));

setInterval(() => {
  const temp = Number((20 + Math.random() * 10).toFixed(1));
  publish(TOPICS.temperature, { value: temp });
}, 3000);

setInterval(() => {
  const hum = Math.round(40 + Math.random() * 40);
  publish(TOPICS.humidity, { value: hum });
}, 4000);
