import { useCommand } from './use';
import * as chainStore from '../store/chainStore';
import * as shellExporter from '../shell/shellExporter';

jest.mock('../store/chainStore');
jest.mock('../shell/shellExporter');

const mockGetChain = chainStore.getChain as jest.MockedFunction<typeof chainStore.getChain>;
const mockApply = shellExporter.applyChainToShell as jest.MockedFunction<typeof shellExporter.applyChainToShell>;

describe('useCommand', () => {
  let writeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  it('throws if chain name is empty', async () => {
    await expect(useCommand('')).rejects.toThrow('Chain name is required.');
  });

  it('throws if chain is not found', async () => {
    mockGetChain.mockResolvedValue(null);
    await expect(useCommand('missing')).rejects.toThrow('Chain "missing" not found');
  });

  it('writes shell output to stdout', async () => {
    const fakeChain = { name: 'dev', vars: { NODE_ENV: 'development' } };
    mockGetChain.mockResolvedValue(fakeChain as any);
    mockApply.mockReturnValue('export NODE_ENV="development"\n');

    await useCommand('dev', { shell: 'bash' });

    expect(mockApply).toHaveBeenCalledWith({ NODE_ENV: 'development' }, 'bash', true);
    expect(writeSpy).toHaveBeenCalledWith('export NODE_ENV="development"\n');
  });

  it('passes export=false option to applyChainToShell', async () => {
    const fakeChain = { name: 'dev', vars: { NODE_ENV: 'development' } };
    mockGetChain.mockResolvedValue(fakeChain as any);
    mockApply.mockReturnValue('NODE_ENV="development"\n');

    await useCommand('dev', { shell: 'bash', export: false });

    expect(mockApply).toHaveBeenCalledWith({ NODE_ENV: 'development' }, 'bash', false);
  });
});
