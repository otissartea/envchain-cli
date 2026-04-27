import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diffChains, formatDiff } from './diff';
import * as store from '../store';

vi.mock('../store');

const mockGetChain = vi.mocked(store.getChain);

beforeEach(() => vi.clearAllMocks());

describe('diffChains', () => {
  it('throws if chain A not found', async () => {
    mockGetChain.mockResolvedValueOnce(null);
    await expect(diffChains('missing', 'b')).rejects.toThrow('Chain "missing" not found');
  });

  it('throws if chain B not found', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: { FOO: '1' } })
      .mockResolvedValueOnce(null);
    await expect(diffChains('a', 'missing')).rejects.toThrow('Chain "missing" not found');
  });

  it('detects added keys', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: {} })
      .mockResolvedValueOnce({ name: 'b', vars: { NEW: 'val' } });

    const result = await diffChains('a', 'b');
    expect(result.added).toHaveLength(1);
    expect(result.added[0]).toMatchObject({ key: 'NEW', status: 'added' });
  });

  it('detects removed keys', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: { OLD: 'val' } })
      .mockResolvedValueOnce({ name: 'b', vars: {} });

    const result = await diffChains('a', 'b');
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0]).toMatchObject({ key: 'OLD', status: 'removed' });
  });

  it('detects changed keys', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: { FOO: 'old' } })
      .mockResolvedValueOnce({ name: 'b', vars: { FOO: 'new' } });

    const result = await diffChains('a', 'b');
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0]).toMatchObject({ key: 'FOO', valueA: 'old', valueB: 'new' });
  });

  it('includes unchanged when flag is set', async () => {
    mockGetChain
      .mockResolvedValueOnce({ name: 'a', vars: { SAME: 'val' } })
      .mockResolvedValueOnce({ name: 'b', vars: { SAME: 'val' } });

    const result = await diffChains('a', 'b', true);
    expect(result.unchanged).toHaveLength(1);
  });
});

describe('formatDiff', () => {
  it('returns no differences message when empty', () => {
    const result = formatDiff({ added: [], removed: [], changed: [], unchanged: [] });
    expect(result).toBe('(no differences)');
  });

  it('formats diff lines correctly', () => {
    const result = formatDiff({
      added: [{ key: 'A', status: 'added', valueB: 'v1' }],
      removed: [{ key: 'B', status: 'removed', valueA: 'v2' }],
      changed: [{ key: 'C', status: 'changed', valueA: 'old', valueB: 'new' }],
      unchanged: [],
    });
    expect(result).toContain('- B=v2');
    expect(result).toContain('+ A=v1');
    expect(result).toContain('~ C: old → new');
  });

  it('masks values when requested', () => {
    const result = formatDiff(
      { added: [{ key: 'A', status: 'added', valueB: 'secret' }], removed: [], changed: [], unchanged: [] },
      true
    );
    expect(result).toContain('***');
    expect(result).not.toContain('secret');
  });
});
