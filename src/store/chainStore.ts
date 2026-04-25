import fs from 'fs';
import path from 'path';
import os from 'os';

export interface EnvChain {
  name: string;
  vars: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ChainStore {
  chains: Record<string, EnvChain>;
  activeChain: string | null;
}

const STORE_DIR = path.join(os.homedir(), '.envchain');
const STORE_FILE = path.join(STORE_DIR, 'store.json');

function ensureStoreDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

export function readStore(): ChainStore {
  ensureStoreDir();
  if (!fs.existsSync(STORE_FILE)) {
    return { chains: {}, activeChain: null };
  }
  const raw = fs.readFileSync(STORE_FILE, 'utf-8');
  try {
    return JSON.parse(raw) as ChainStore;
  } catch {
    throw new Error(`Failed to parse store file at ${STORE_FILE}: file may be corrupted`);
  }
}

export function writeStore(store: ChainStore): void {
  ensureStoreDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function getChain(name: string): EnvChain | undefined {
  const store = readStore();
  return store.chains[name];
}

export function saveChain(chain: EnvChain): void {
  const store = readStore();
  store.chains[chain.name] = chain;
  writeStore(store);
}

export function deleteChain(name: string): boolean {
  const store = readStore();
  if (!store.chains[name]) return false;
  delete store.chains[name];
  if (store.activeChain === name) store.activeChain = null;
  writeStore(store);
  return true;
}

export function listChains(): EnvChain[] {
  const store = readStore();
  return Object.values(store.chains);
}

export function setActiveChain(name: string | null): void {
  const store = readStore();
  if (name !== null && !store.chains[name]) {
    throw new Error(`Chain "${name}" does not exist`);
  }
  store.activeChain = name;
  writeStore(store);
}

export function getActiveChain(): EnvChain | null {
  const store = readStore();
  if (!store.activeChain) return null;
  return store.chains[store.activeChain] ?? null;
}
