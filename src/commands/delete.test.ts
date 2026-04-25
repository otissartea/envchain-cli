import { deleteChain, deleteKey } from './delete';
import { readStore, writeStore } from '../store';

jest.mock('../store');

const mockReadStore = readStore as jest.MockedFunction<typeof readStore>;
const mockWriteStore = writeStore as jest.MockedFunction<typeof writeStore>;

const makeStore = () => ({
  chains: {
    dev: { API_URL: 'http://localhost', DEBUG: 'true' },
    prod: { API_URL: 'https://example.com' },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockWriteStore.mockResolvedValue(undefined);
});

describe('deleteChain', () => {
  it('deletes an existing chain', async () => {
    mockReadStore.mockResolvedValue(makeStore());
    await deleteChain('dev');
    const written = mockWriteStore.mock.calls[0][0];
    expect(written.chains['dev']).toBeUndefined();
    expect(written.chains['prod']).toBeDefined();
  });

  it('throws when chain does not exist', async () => {
    mockReadStore.mockResolvedValue(makeStore());
    await expect(deleteChain('staging')).rejects.toThrow(
      'Chain "staging" does not exist.'
    );
    expect(mockWriteStore).not.toHaveBeenCalled();
  });
});

describe('deleteKey', () => {
  it('removes an existing key from a chain', async () => {
    mockReadStore.mockResolvedValue(makeStore());
    await deleteKey('dev', 'DEBUG');
    const written = mockWriteStore.mock.calls[0][0];
    expect(written.chains['dev']['DEBUG']).toBeUndefined();
    expect(written.chains['dev']['API_URL']).toBe('http://localhost');
  });

  it('throws when chain does not exist', async () => {
    mockReadStore.mockResolvedValue(makeStore());
    await expect(deleteKey('staging', 'API_URL')).rejects.toThrow(
      'Chain "staging" does not exist.'
    );
    expect(mockWriteStore).not.toHaveBeenCalled();
  });

  it('throws when key does not exist in chain', async () => {
    mockReadStore.mockResolvedValue(makeStore());
    await expect(deleteKey('dev', 'MISSING_KEY')).rejects.toThrow(
      'Key "MISSING_KEY" does not exist in chain "dev".'
    );
    expect(mockWriteStore).not.toHaveBeenCalled();
  });
});
