/** Prefixo amigável das matrículas SeniorEase (ex.: SE12345). */
const PREFIX = "SE";
const DIGITS = 5;
const MAX = 10 ** DIGITS - 1;
const PATTERN = new RegExp(`^${PREFIX}\\d{${String(DIGITS)}}$`, "i");

function isFriendlyRegistrationId(value: string): boolean {
  return PATTERN.test(value.trim());
}

function registrationIdFromUid(uid: string): string {
  const normalized = uid.trim();
  if (!normalized) {
    throw new Error("UID inválido para gerar matrícula");
  }

  let hashA = 0x811c9dc5;
  let hashB = 0x811c9dc5 ^ 0x9e3779b9;

  for (let index = 0; index < normalized.length; index++) {
    const code = normalized.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 0x01000193);
    hashB ^= code;
    hashB = Math.imul(hashB, 0x01000193);
  }

  const combined = BigInt(hashA >>> 0) * 1_000_000_003n + BigInt(hashB >>> 0);
  const sequence = Number(combined % BigInt(MAX + 1));

  return `${PREFIX}${String(sequence).padStart(DIGITS, "0")}`;
}

/**
 * Única API pública da matrícula.
 * Mantém SE***** válido ou deriva um estável a partir do UID (cadastro, migração e leitura).
 */
export function normalizeRegistrationId(value: unknown, uid: string): string {
  if (typeof value === "string" && isFriendlyRegistrationId(value)) {
    return value.trim().toUpperCase();
  }
  return registrationIdFromUid(uid);
}
