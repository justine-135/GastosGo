export let callback: ((id: string, name: string) => void) | null = null;

export function setCallback(fn: ((id: string, name: string) => void) | null): void {
  callback = fn;
}
