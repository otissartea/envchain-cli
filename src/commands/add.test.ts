import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addEnvVar, isValidKey } from './add';
import * as store from '../store';

vi.mock('../store', () => ({
  getChain: vi.fn(),
  saveChain: vi.fn(),
}));

const mockGetChain = vi.mocked(store.getChain);
const mockSaveChain = vi.mocked(store.saveChain);

beforeEach(() => {
  vi.clearAllMocks();
  mockSaveChain.mockResolvedValue(undefined);
});

describe('isValidKey', () => {
  it('accepts valid env var names', () => {
    expect(isValidKey('MY_VAR')).toBe(true);
    expect(isValidKey('_PRIVATE')).toBe(true);
    expect(isValidKey('var123')).toBe(true);
  });

  it('rejects invalid env var names', () => {
    expect(isValidKey('123VAR')).toBe(false);
    expect(isValidKey('MY-VAR')).toBe(false);
    expect(isValidKey('')).toBe(false);
  });
});

describe('addEnvVar', () => {
  it('adds a new key to an existing chain', async () => {
    mockGetChain.mockResolvedValue({ name: 'dev', vars: { EXISTING: 'val' } });
    await addEnvVar({ chain: 'dev', key: 'NEW_KEY', value: 'new_val' });
    expect(mockSaveChain).toHaveBeenCalledWith({
      name: 'dev',
      vars: { EXISTING: 'val', NEW_KEY: 'new_val' },
    });
  });

  it('creates a new chain if it does not exist', async () => {
    mockGetChain.mockResolvedValue(null);
    await addEnvVar({ chain: 'prod', key: 'API_KEY', value: 'secret' });
    expect(mockSaveChain).toHaveBeenCalledWith({
      name: 'prod',
      vars: { API_KEY: 'secret' },
    });
  });

  it('throws if key already exists without --force', async () => {
    mockGetChain.mockResolvedValue({ name: 'dev', vars: { EXISTING: 'val' } });
    await expect(
      addEnvVar({ chain: 'dev', key: 'EXISTING', value: 'new' })
    ).rejects.toThrow('already exists');
  });

  it('overwrites key when --force is set', async () => {
    mockGetChain.mockResolvedValue({ name: 'dev', vars: { EXISTING: 'old' } });
    await addEnvVar({ chain: 'dev', key: 'EXISTING', value: 'new', force: true });
    expect(mockSaveChain).toHaveBeenCalledWith({
      name: 'dev',
      vars: { EXISTING: 'new' },
    });
  });

  it('throws on invalid key name', async () => {
    mockGetChain.mockResolvedValue(null);
    await expect(
      addEnvVar({ chain: 'dev', key: '123BAD', value: 'val' })
    ).rejects.toThrow('Invalid environment variable name');
  });
});
