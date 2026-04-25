import { copyChain } from './copy';
import { getChain, saveChain } from '../store';

jest.mock('../store', () => ({
  getChain: jest.fn(),
  saveChain: jest.fn(),
}));

const mockGetChain = getChain as jest.MockedFunction<typeof getChain>;
const mockSaveChain = saveChain as jest.MockedFunction<typeof saveChain>;

describe('copyChain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('copies an existing chain to a new name', async () => {
    const vars = { API_KEY: 'abc123', DEBUG: 'true' };
    mockGetChain.mockResolvedValueOnce(vars).mockResolvedValueOnce(null);
    mockSaveChain.mockResolvedValue(undefined);

    await copyChain('prod', 'prod-backup');

    expect(mockSaveChain).toHaveBeenCalledWith('prod-backup', vars);
  });

  it('throws if source chain does not exist', async () => {
    mockGetChain.mockResolvedValueOnce(null);

    await expect(copyChain('ghost', 'ghost-copy')).rejects.toThrow(
      'Chain "ghost" does not exist.'
    );
  });

  it('throws if destination chain already exists', async () => {
    mockGetChain
      .mockResolvedValueOnce({ KEY: 'val' })
      .mockResolvedValueOnce({ OTHER: 'val2' });

    await expect(copyChain('prod', 'staging')).rejects.toThrow(
      'Chain "staging" already exists.'
    );
  });

  it('throws if destination name is invalid', async () => {
    await expect(copyChain('prod', 'bad name!')).rejects.toThrow(
      'Invalid destination chain name'
    );
  });

  it('throws if source name is empty', async () => {
    await expect(copyChain('', 'dest')).rejects.toThrow(
      'Source chain name cannot be empty.'
    );
  });

  it('copies variables as a shallow clone', async () => {
    const vars = { TOKEN: 'secret' };
    mockGetChain.mockResolvedValueOnce(vars).mockResolvedValueOnce(null);
    mockSaveChain.mockResolvedValue(undefined);

    await copyChain('dev', 'dev-clone');

    const savedVars = mockSaveChain.mock.calls[0][1];
    expect(savedVars).toEqual(vars);
    expect(savedVars).not.toBe(vars);
  });
});
