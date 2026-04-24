import { renameChain, isValidChainName } from './rename';
import * as store from '../store';

jest.mock('../store');

const mockGetChain = store.getChain as jest.MockedFunction<typeof store.getChain>;
const mockSaveChain = store.saveChain as jest.MockedFunction<typeof store.saveChain>;
const mockDeleteChain = store.deleteChain as jest.MockedFunction<typeof store.deleteChain>;

const sampleEnvVars = { API_KEY: 'abc123', NODE_ENV: 'production' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('renameChain', () => {
  it('renames an existing chain to a new name', async () => {
    mockGetChain.mockImplementation(async (name) =>
      name === 'old-chain' ? sampleEnvVars : null
    );
    mockSaveChain.mockResolvedValue(undefined);
    mockDeleteChain.mockResolvedValue(undefined);

    await renameChain('old-chain', 'new-chain');

    expect(mockSaveChain).toHaveBeenCalledWith('new-chain', sampleEnvVars);
    expect(mockDeleteChain).toHaveBeenCalledWith('old-chain');
  });

  it('throws if old chain does not exist', async () => {
    mockGetChain.mockResolvedValue(null);

    await expect(renameChain('ghost', 'new-chain')).rejects.toThrow(
      'Chain "ghost" does not exist.'
    );
  });

  it('throws if new chain name already exists', async () => {
    mockGetChain.mockResolvedValue(sampleEnvVars);

    await expect(renameChain('old-chain', 'existing-chain')).rejects.toThrow(
      'Chain "existing-chain" already exists.'
    );
  });

  it('throws if old and new names are the same', async () => {
    await expect(renameChain('same', 'same')).rejects.toThrow(
      'Old and new chain names must be different.'
    );
  });

  it('throws if new name is invalid', async () => {
    await expect(renameChain('old-chain', 'bad name!')).rejects.toThrow(
      'Invalid chain name'
    );
  });

  it('throws if names are empty', async () => {
    await expect(renameChain('', 'new')).rejects.toThrow(
      'Both old and new chain names are required.'
    );
  });
});

describe('isValidChainName', () => {
  it('accepts valid names', () => {
    expect(isValidChainName('my-chain')).toBe(true);
    expect(isValidChainName('prod_env')).toBe(true);
    expect(isValidChainName('Chain123')).toBe(true);
  });

  it('rejects names with spaces or special chars', () => {
    expect(isValidChainName('bad name')).toBe(false);
    expect(isValidChainName('chain!')).toBe(false);
    expect(isValidChainName('')).toBe(false);
  });
});
