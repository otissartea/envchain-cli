import { editChain, unsetKey, isValidValue } from './edit';
import { getChain, saveChain } from '../store';

jest.mock('../store');

const mockGetChain = getChain as jest.MockedFunction<typeof getChain>;
const mockSaveChain = saveChain as jest.MockedFunction<typeof saveChain>;

const makeChain = (vars: Record<string, string> = {}) => ({
  name: 'mychain',
  vars,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveChain.mockResolvedValue(undefined);
});

describe('isValidValue', () => {
  it('returns true for a normal string', () => {
    expect(isValidValue('hello')).toBe(true);
  });

  it('returns true for an empty string', () => {
    expect(isValidValue('')).toBe(true);
  });
});

describe('editChain', () => {
  it('updates an existing key in the chain', async () => {
    const chain = makeChain({ API_KEY: 'old_value' });
    mockGetChain.mockResolvedValue(chain);

    await editChain('mychain', 'API_KEY', 'new_value');

    expect(mockSaveChain).toHaveBeenCalledWith(
      expect.objectContaining({ vars: { API_KEY: 'new_value' } })
    );
  });

  it('throws if the chain does not exist', async () => {
    mockGetChain.mockResolvedValue(null);

    await expect(editChain('missing', 'KEY', 'val')).rejects.toThrow(
      'Chain "missing" does not exist.'
    );
  });

  it('throws if the key does not exist in the chain', async () => {
    mockGetChain.mockResolvedValue(makeChain({ OTHER: 'x' }));

    await expect(editChain('mychain', 'MISSING_KEY', 'val')).rejects.toThrow(
      'Key "MISSING_KEY" does not exist in chain "mychain"'
    );
  });

  it('updates the updatedAt timestamp', async () => {
    const chain = makeChain({ TOKEN: 'abc' });
    mockGetChain.mockResolvedValue(chain);

    await editChain('mychain', 'TOKEN', 'xyz');

    const saved = mockSaveChain.mock.calls[0][0];
    expect(saved.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
  });
});

describe('unsetKey', () => {
  it('removes an existing key from the chain', async () => {
    const chain = makeChain({ API_KEY: 'secret', KEEP: 'me' });
    mockGetChain.mockResolvedValue(chain);

    await unsetKey('mychain', 'API_KEY');

    expect(mockSaveChain).toHaveBeenCalledWith(
      expect.objectContaining({ vars: { KEEP: 'me' } })
    );
  });

  it('throws if the chain does not exist', async () => {
    mockGetChain.mockResolvedValue(null);

    await expect(unsetKey('missing', 'KEY')).rejects.toThrow(
      'Chain "missing" does not exist.'
    );
  });

  it('throws if the key does not exist', async () => {
    mockGetChain.mockResolvedValue(makeChain({ OTHER: 'x' }));

    await expect(unsetKey('mychain', 'NOPE')).rejects.toThrow(
      'Key "NOPE" does not exist in chain "mychain".'
    );
  });
});
