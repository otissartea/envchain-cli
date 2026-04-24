import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const STORE_DIR = path.join(os.homedir(), '.envchain');
const STORE_FILE = path.join(STORE_DIR, 'store.json');

describe('chainStore', () => {
  beforeEach(() => {
    if (fs.existsSync(STORE_FILE)) fs.unlinkSync(STORE_FILE);
  });

  afterEach(() => {
    if (fs.existsSync(STORE_FILE)) fs.unlinkSync(STORE_FILE);
  });

  it('readStore returns empty store when file does not exist', async () => {
    const { readStore } = await import('./chainStore');
    const store = readStore();
    expect(store.chains).toEqual({});
    expect(store.activeChain).toBeNull();
  });

  it('saveChain persists a chain and getChain retrieves it', async () => {
    const { saveChain, getChain } = await import('./chainStore');
    const chain = { name: 'dev', vars: { API_KEY: 'abc123' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveChain(chain);
    const retrieved = getChain('dev');
    expect(retrieved).toEqual(chain);
  });

  it('deleteChain removes a chain and returns true', async () => {
    const { saveChain, deleteChain, getChain } = await import('./chainStore');
    const chain = { name: 'staging', vars: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveChain(chain);
    const result = deleteChain('staging');
    expect(result).toBe(true);
    expect(getChain('staging')).toBeUndefined();
  });

  it('deleteChain returns false for non-existent chain', async () => {
    const { deleteChain } = await import('./chainStore');
    expect(deleteChain('nonexistent')).toBe(false);
  });

  it('setActiveChain and getActiveChain work correctly', async () => {
    const { saveChain, setActiveChain, getActiveChain } = await import('./chainStore');
    const chain = { name: 'prod', vars: { DB_URL: 'postgres://...' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveChain(chain);
    setActiveChain('prod');
    const active = getActiveChain();
    expect(active?.name).toBe('prod');
  });

  it('deleting active chain clears activeChain', async () => {
    const { saveChain, setActiveChain, deleteChain, readStore } = await import('./chainStore');
    const chain = { name: 'temp', vars: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveChain(chain);
    setActiveChain('temp');
    deleteChain('temp');
    const store = readStore();
    expect(store.activeChain).toBeNull();
  });

  it('listChains returns all saved chains', async () => {
    const { saveChain, listChains } = await import('./chainStore');
    saveChain({ name: 'a', vars: {}, createdAt: '', updatedAt: '' });
    saveChain({ name: 'b', vars: {}, createdAt: '', updatedAt: '' });
    const chains = listChains();
    expect(chains.map(c => c.name)).toContain('a');
    expect(chains.map(c => c.name)).toContain('b');
  });
});
