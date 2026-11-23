let listener: (() => void) | null = null;

export function setOnExpenseSaved(fn: (() => void) | null): void {
  listener = fn;
}

export function notifyExpenseSaved(): void {
  listener?.();
}
