import * as ExpoCrypto from "expo-crypto";

export function generateId(): string {
  return ExpoCrypto.randomUUID();
}
