import { LampState } from '../types/mqtt';

function parseObject(payload: string): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(payload);
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
  } catch {
    // payload inválido
  }
  return null;
}

export function parseSensorValue(payload: string): number | null {
  const obj = parseObject(payload);
  if (!obj) return null;
  const value = obj.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function parseLampState(payload: string): LampState | null {
  const obj = parseObject(payload);
  if (!obj) return null;
  return obj.state === 'ON' || obj.state === 'OFF' ? obj.state : null;
}
