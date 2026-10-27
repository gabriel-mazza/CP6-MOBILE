# IoT Control — Painel de Monitoramento e Controle IoT (MQTT)

Checkpoint 3 — Mobile Development & IoT (FIAP)

## Integrantes

> ⚠️ OBRIGATÓRIO: sem nome completo e RM de todos, a nota é zero.

| Nome completo | RM |
|---|---|
| _Preencher_ | _Preencher_ |
| _Preencher_ | _Preencher_ |

## Descrição e objetivo

App mobile (React Native + Expo + TypeScript) que monitora temperatura e umidade e controla uma lâmpada virtual via MQTT (publish/subscribe) sobre WebSocket. Um simulador em Node.js faz o papel do dispositivo.

## Tecnologias e versões

Preencher com as versões do `package.json` (Expo, React Native, TypeScript, paho-mqtt, React Navigation, AsyncStorage) e do Node.js.

## Instalação e execução

```powershell
npm install
npx expo start
```

Abra no Expo Go (Android/iOS) ou emulador.

## Broker

- URL padrão usada: `wss://broker.hivemq.com:8884/mqtt` (broker público HiveMQ, porta **WebSocket seguro**)
- Alternativa sem TLS: `ws://broker.hivemq.com:8000/mqtt`
- A porta TCP 1883 **não** funciona no app; ela é usada apenas pelo simulador (`mqtt://broker.hivemq.com:1883`).
- A URL pode ser alterada na tela Configurações e fica salva com AsyncStorage.
- Nenhuma credencial é usada/armazenada no repositório.

## Tópicos

Prefixo do grupo: `fiap/turma/grupo01` (alterar em `src/config.ts` e no simulador via `GROUP_ID`).

| Tópico | Direção no app | Payload |
|---|---|---|
| `fiap/turma/grupo01/sensor/temperatura` | Subscribe | `{"value":24.5}` |
| `fiap/turma/grupo01/sensor/umidade` | Subscribe | `{"value":58}` |
| `fiap/turma/grupo01/lampada/comando` | Publish | `{"action":"ON"}` ou `{"action":"OFF"}` |
| `fiap/turma/grupo01/lampada/estado` | Subscribe | `{"state":"ON"}` ou `{"state":"OFF"}` |

## Simulador

```powershell
npm install
npm run simulator
```

Ele publica temperatura (a cada 3 s) e umidade (a cada 4 s), recebe comandos da lâmpada e publica o novo estado. Para outro grupo/broker:

```powershell
$env:GROUP_ID="fiap/turma/grupoXX"; npm run simulator
```

Alternativa: cliente web da HiveMQ (https://www.hivemq.com/demos/websocket-client/) assinando `.../lampada/comando` e publicando manualmente em `.../sensor/temperatura`, `.../sensor/umidade` e `.../lampada/estado`.

### Roteiro de teste

1. Simulador publica temperatura → card atualiza.
2. Simulador publica umidade → card atualiza.
3. Toque em **Ligar** → simulador recebe o comando e publica `{"state":"ON"}` → app mostra **Ligada**.
4. Mesmo fluxo com **Desligar**.

## Funcionalidades

Preencher com prints das telas (Dashboard, Histórico, Configurações em Light e Dark) e uma explicação curta de cada uma.

## Limitações e observações

- Broker público: qualquer pessoa pode publicar nos tópicos; use um GROUP_ID exclusivo.
- Reconexão automática a cada 5 s após perda de conexão e botão **Reconectar**.
- O estado da lâmpada só muda quando o app recebe a mensagem de estado.
