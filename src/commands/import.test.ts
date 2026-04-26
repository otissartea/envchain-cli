import { parseDotenv, parseJsonEnv, importChain } from './import';
import { saveChain, getChain } from '../store';

jest.mock('../store');

const mockSaveChain = saveChain as jest.MockedFunction<typeof saveChain>;
const mockGetChain = getChain as jest.MockedFunction<typeof getChain>;

describe('parseDotenv', () => {
  it('parses simple key=value pairs', () => {
    const result = parseDotenv('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('strips surrounding quotes from values', () => {
    const result = parseDotenv('FOO="hello world"\nBAR=\'test\'');
    expect(result).toEqual({ FOO: 'hello world', BAR: 'test' });
  });

  it('ignores comment lines', () => {
    const result = parseDotenv('# comment\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('ignores empty lines', () => {
    const result = parseDotenv('FOO=bar\n\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});

describe('parseJsonEnv', () => {
  it('parses valid JSON object', () => {
    const result = parseJsonEnv('{"FOO":"bar","BAZ":"qux"}');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJsonEnv('not json')).toThrow();
  });

  it('throws if JSON is not an object', () => {
    expect(() => parseJsonEnv('["array"]')).toThrow();
  });
});

describe('importChain', () => {
  beforeEach(() => jest.clearAllMocks());

  it('imports dotenv format and saves chain', async () => {
    mockGetChain.mockResolvedValue(null);
    await importChain('mychain', 'FOO=bar\nBAZ=qux', 'dotenv');
    expect(mockSaveChain).toHaveBeenCalledWith('mychain', { FOO: 'bar', BAZ: 'qux' });
  });

  it('merges with existing chain when merge=true', async () => {
    mockGetChain.mockResolvedValue({ EXISTING: 'value' });
    await importChain('mychain', 'FOO=bar', 'dotenv', true);
    expect(mockSaveChain).toHaveBeenCalledWith('mychain', { EXISTING: 'value', FOO: 'bar' });
  });

  it('overwrites existing chain when merge=false', async () => {
    mockGetChain.mockResolvedValue({ EXISTING: 'value' });
    await importChain('mychain', 'FOO=bar', 'dotenv', false);
    expect(mockSaveChain).toHaveBeenCalledWith('mychain', { FOO: 'bar' });
  });
});
