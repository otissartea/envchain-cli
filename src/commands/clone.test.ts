import { cloneChain, listCloneableChains } from './clone';
import { getChain, saveChain, listChainNames } from '../store';

jest.mock('../store');

const mockGetChain = getChain as jest.MockedFunction<typeof getChain>;
const mockSaveChain = saveChain as jest.MockedFunction<typeof saveChain>;
const mockListChainNames = listChainNames as jest.MockedFunction<typeof listChainNames>;

const sampleChain = {
  name: 'dev',
  vars: { API_KEY: 'abc123', DEBUG: 'true' },
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cloneChain', () => {
  it('clones an existing chain to a new name', async () => {
    mockGetChain.mockResolvedValueOnce(sampleChain).mockResolvedValueOnce(null);
    mockSaveChain.mockResolvedValue(undefined);

    await cloneChain('dev', 'dev-backup');

    expect(mockSaveChain).toHaveBeenCalledWith(
      'dev-backup',
      expect.objectContaining({
        name: 'dev-backup',
        vars: sampleChain.vars,
        clonedFrom: 'dev',
      })
    );
  });

  it('throws if source chain does not exist', async () => {
    mockGetChain.mockResolvedValueOnce(null);

    await expect(cloneChain('nonexistent', 'copy')).rejects.toThrow(
      'Chain "nonexistent" not found.'
    );
  });

  it('throws if target already exists without overwrite', async () => {
    mockGetChain.mockResolvedValueOnce(sampleChain).mockResolvedValueOnce(sampleChain);

    await expect(cloneChain('dev', 'dev-backup')).rejects.toThrow(
      'Chain "dev-backup" already exists.'
    );
  });

  it('allows overwrite when option is set', async () => {
    mockGetChain.mockResolvedValueOnce(sampleChain);
    mockSaveChain.mockResolvedValue(undefined);

    await expect(cloneChain('dev', 'dev-backup', { overwrite: true })).resolves.not.toThrow();
    expect(mockSaveChain).toHaveBeenCalled();
  });

  it('throws on invalid target chain name', async () => {
    await expect(cloneChain('dev', 'invalid name!')).rejects.toThrow('Invalid chain name');
  });
});

describe('listCloneableChains', () => {
  it('returns all chain names when no exclusion', async () => {
    mockListChainNames.mockResolvedValue(['dev', 'staging', 'prod']);
    const result = await listCloneableChains();
    expect(result).toEqual(['dev', 'staging', 'prod']);
  });

  it('excludes the specified chain name', async () => {
    mockListChainNames.mockResolvedValue(['dev', 'staging', 'prod']);
    const result = await listCloneableChains('dev');
    expect(result).toEqual(['staging', 'prod']);
  });
});
