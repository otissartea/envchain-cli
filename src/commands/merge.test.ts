import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mergeChains, isValidMergeStrategy } from './merge';
import * as store from '../store';

vi.mock('../store');

const mockGetChain = vi.mocked(store.getChain);
const mockSaveChain = vi.mocked(store.saveChain);

beforeEach(() => {
  vi.clearAllMocks();
  mockSaveChain.mockResolvedValue(undefined);
});

describe('isValidMergeStrategy', () => {
  it('accepts valid strategies', () => {
    expect(isValidMergeStrategy('overwrite')).toBe(true);
    expect(isValidMergeStrategy('keep')).toBe(true);
    expect(isValidMergeStrategy('error')).toBe(true);
  });

  it('rejects invalid strategies', () => {
    expect(isValidMergeStrategy('replace')).toBe(false);
    expect(isValidMergeStrategy('')).toBe(false);
  });
});

describe('mergeChains', () => {
  it('throws if fewer than 2 sources', async () => {
    await expect(mergeChains(['only-one'], 'target')).rejects.toThrow(
      'At least two source chains'
    );
  });

  it('throws if a source chain is not found', async () => {
    mockGetChain.mockResolvedValueOnce(null);
    await expect(mergeChains(['a', 'b'], 'target')).rejects.toThrow(
      'Chain "a" not found'
    );
  });

  it('merges vars from multiple chains (overwrite strategy)', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: { FOO: '1', SHARED: 'from-a' } })
      .mockResolvedValueOnce({ name: 'b', vars: { BAR: '2', SHARED: 'from-b' } });

    const result = await mergeChains(['a', 'b'], 'merged', 'overwrite');

    expect(result.merged).toBe(3);
    expect(result.conflicts).toContain('SHARED');
    expect(mockSaveChain).toHaveBeenCalledWith('merged', {
      name: 'merged',
      vars: { FOO: '1', BAR: '2', SHARED: 'from-b' },
    });
  });

  it('skips conflicting keys with keep strategy', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: { FOO: '1', SHARED: 'from-a' } })
      .mockResolvedValueOnce({ name: 'b', vars: { BAR: '2', SHARED: 'from-b' } });

    const result = await mergeChains(['a', 'b'], 'merged', 'keep');

    expect(result.skipped).toContain('SHARED');
    expect(mockSaveChain).toHaveBeenCalledWith('merged', {
      name: 'merged',
      vars: { FOO: '1', BAR: '2', SHARED: 'from-a' },
    });
  });

  it('throws on conflict with error strategy', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: { SHARED: 'from-a' } })
      .mockResolvedValueOnce({ name: 'b', vars: { SHARED: 'from-b' } });

    await expect(mergeChains(['a', 'b'], 'merged', 'error')).rejects.toThrow(
      'Conflict: key "SHARED"'
    );
  });
});
