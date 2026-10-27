# IoT Control — Painel de Monitoramento e Controle IoT (MQTT)

Checkpoint 3 — Mobile Development & IoT (FIAP)

## Integrantes

| Nome completo | RM |
|---|---|
| Jefferson Junior Alvarez Urbina | 558497 |
| Gabriel Barros Mazzariol | 555410 |

## Descrição e objetivo

App mobile (React Native + Expo + TypeScript) que monitora temperatura e umidade e controla uma lâmpada virtual via MQTT (publish/subscribe) sobre WebSocket. Um simulador em Node.js faz o papel do dispositivo IoT.

O objetivo é demonstrar o modelo publish/subscribe, o uso de tópicos MQTT e o gerenciamento de conexão e mensagens em uma aplicação mobile.

## Tecnologias e versões

| Tecnologia | Versão |
|---|---|
| Node.js | 24.15.0 |
| Expo | ~58.0.19 |
| React Native | 0.88.0 |
| React | 19.3.0 |
| TypeScript | ~6.0.3 |
| paho-mqtt (cliente MQTT do app) | ^1.1.0 |
| @react-navigation/native | ^7.5.1 |
| @react-navigation/bottom-tabs | ^7.21.0 |
| @react-native-async-storage/async-storage | 2.2.0 |
| mqtt (somente no simulador, Node.js) | ^5.16.1 |

## Instalação e execução

```powershell
npm install
npx expo start
```

Abra no Expo Go (Android/iOS, com o celular na mesma rede Wi-Fi do computador) ou no emulador Android.

## Broker

- URL padrão usada no app: `wss://broker.hivemq.com:8884/mqtt` (broker público HiveMQ, porta **WebSocket seguro**)
- Alternativa sem TLS: `ws://broker.hivemq.com:8000/mqtt`
- A porta TCP 1883 **não** funciona no app; ela é usada apenas pelo simulador (`mqtt://broker.hivemq.com:1883`).
- A URL pode ser alterada na tela Configurações e fica salva com AsyncStorage.
- Nenhuma credencial é usada ou armazenada no repositório.

## Tópicos

Prefixo do grupo: `fiap/turma/grupo01` (alterar em `src/config.ts` e, no simulador, pela variável `GROUP_ID`).

| Tópico | Direção no app | Payload |
|---|---|---|
| `fiap/turma/grupo01/sensor/temperatura` | Subscribe | `{"value":24.5}` |
| `fiap/turma/grupo01/sensor/umidade` | Subscribe | `{"value":58}` |
| `fiap/turma/grupo01/lampada/comando` | Publish | `{"action":"ON"}` ou `{"action":"OFF"}` |
| `fiap/turma/grupo01/lampada/estado` | Subscribe | `{"state":"ON"}` ou `{"state":"OFF"}` |

## Simulador

Em um segundo terminal, na pasta do projeto:

```powershell
npm run simulator
```

Ele publica temperatura (a cada 3 s) e umidade (a cada 4 s), recebe comandos da lâmpada e publica o novo estado. Para usar outro grupo:

```powershell
$env:GROUP_ID="fiap/turma/grupoXX"; npm run simulator
```

Alternativa: cliente web da HiveMQ (https://www.hivemq.com/demos/websocket-client/) assinando `.../lampada/comando` e publicando manualmente em `.../sensor/temperatura`, `.../sensor/umidade` e `.../lampada/estado`.

### Roteiro de teste

1. O simulador publica uma temperatura e o card atualiza.
2. O simulador publica uma umidade e o card atualiza.
3. Toque em **Ligar**: o simulador recebe o comando e publica `{"state":"ON"}`, e o app mostra **Ligada**.
4. O mesmo fluxo vale para **Desligar**, que termina em **Desligada**.

## Telas e funcionalidades

### Dashboard

<img width="345" height="755" alt="image" src="https://github.com/user-attachments/assets/a7460d71-2616-42d4-9e7b-21a4bab9b6ef" />


Mostra o status da conexão (conectando, conectado, desconectado ou erro), a temperatura e a umidade com o horário da última atualização, o estado da lâmpada e os botões Ligar e Desligar. O estado da lâmpada só muda quando o app recebe a mensagem de estado do dispositivo. Sem conexão, o toque nos botões exibe um alerta e nada é publicado.

### Histórico

<img width="343" height="750" alt="image" src="https://github.com/user-attachments/assets/f88d65f4-d4f5-497a-9a81-6f2ed68c6274" />


Lista as 10 mensagens mais recentes, enviadas ou recebidas, com tópico, payload, horário e direção.

### Configurações

<img width="339" height="745" alt="image" src="https://github.com/user-attachments/assets/ec8277ef-e559-4889-a22f-8950f225cd4d" />


Permite alterar a URL WebSocket do broker, conectar e desconectar, e alternar entre os temas Light e Dark. A URL e o tema ficam salvos com AsyncStorage e são recuperados ao reiniciar o app.

## Limitações e observações

- O broker é público: qualquer pessoa pode publicar nos tópicos, por isso o prefixo do grupo deve ser exclusivo.
- Reconexão automática a cada 5 s após perda de conexão, além do botão **Reconectar**.
- Mensagens com payload inválido são ignoradas e não alteram os valores exibidos, mas aparecem no histórico.
