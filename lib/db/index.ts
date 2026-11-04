// DB layer entry point.
// Screen components import from here — never from stubs or db/queries directly.
// When real drizzle+sqlite implementations are ready, replace stub re-exports
// with adapters that call db/queries/* and normalize to the types below.
// No screen imports need to change.

export * from './stubs';
export type * from './types';
