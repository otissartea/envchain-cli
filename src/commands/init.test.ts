import { deriveChainName, parseCurrentEnv, initChain } from './init';
import * as store from '../store';

jest.mock('../store');

const mockReadStore = store.readStore as jest.MockedFunction<typeof store.readStore>;
const mockWriteStore = store.writeStore as jest.MockedFunction<typeof store.writeStore>;

describe('deriveChainName', () => {
  it('returns provided name if given', () => {
    expect(deriveChainName('my-chain')).toBe('my-chain');
  });

  it('derives name from cwd basename if no name provided', () => {
    const result = deriveChainName();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('sanitizes special characters from derived name', () => {
    jest.spyOn(process, 'cwd').mockReturnValueOnce('/home/user/My Project!');
    const result = deriveChainName();
    expect(result).toBe('my-project-');
  });
});

describe('parseCurrentEnv', () => {
  it('excludes system variables like PATH and HOME', () => {
    const original = process.env;
    process.env = { PATH: '/usr/bin', HOME: '/home/user', MY_VAR: 'hello' };
    const result = parseCurrentEnv();
    expect(result).not.toHaveProperty('PATH');
    expect(result).not.toHaveProperty('HOME');
    expect(result).toHaveProperty('MY_VAR', 'hello');
    process.env = original;
  });

  it('excludes variables starting with underscore', () => {
    const original = process.env;
    process.env = { _INTERNAL: 'secret', VISIBLE: 'yes' };
    const result = parseCurrentEnv();
    expect(result).not.toHaveProperty('_INTERNAL');
    expect(result).toHaveProperty('VISIBLE', 'yes');
    process.env = original;
  });
});

describe('initChain', () => {
  beforeEach(() => {
    mockReadStore.mockResolvedValue({});
    mockWriteStore.mockResolvedValue(undefined);
  });

  it('creates an empty chain with derived name', async () => {
    const log = jest.fn();
    await initChain({}, log, jest.fn());
    expect(mockWriteStore).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Initialized empty chain'));
  });

  it('warns if chain already exists without --force', async () => {
    mockReadStore.mockResolvedValue({ 'my-chain': { FOO: 'bar' } });
    const warn = jest.fn();
    await initChain({ name: 'my-chain' }, jest.fn(), warn);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    expect(mockWriteStore).not.toHaveBeenCalled();
  });

  it('overwrites existing chain with --force', async () => {
    mockReadStore.mockResolvedValue({ 'my-chain': { FOO: 'bar' } });
    const log = jest.fn();
    await initChain({ name: 'my-chain', force: true }, log, jest.fn());
    expect(mockWriteStore).toHaveBeenCalled();
  });
});
