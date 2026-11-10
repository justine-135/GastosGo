import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const PIN_SALT_KEY = 'gastosgo-pin-salt';

// shortcut: existing PIN hashes invalidated on upgrade, prompt re-setup
export async function generateSalt(): Promise<string> {
  const existing = await SecureStore.getItemAsync(PIN_SALT_KEY);
  if (existing) return existing;
  const salt = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    String(Date.now()) + Math.random(),
  );
  await SecureStore.setItemAsync(PIN_SALT_KEY, salt);
  return salt;
}

export async function hashPin(pin: string): Promise<string> {
  const salt = await generateSalt();
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + pin);
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hashed = await hashPin(pin);
  return hashed === storedHash;
}
