// A tiny event bus that records every API call so the UI can show the
// Express/MongoDB round-trip live during a demo. Deliberately dependency-free.

const MAX_ENTRIES = 60;

let entries = [];
let nextId = 1;
const listeners = new Set();

const emit = () => {
  listeners.forEach((fn) => fn(entries));
};

export const addLog = (entry) => {
  entries = [{ id: nextId++, ...entry }, ...entries].slice(0, MAX_ENTRIES);
  emit();
};

export const clearLogs = () => {
  entries = [];
  emit();
};

export const subscribe = (fn) => {
  listeners.add(fn);
  fn(entries);
  return () => listeners.delete(fn);
};
