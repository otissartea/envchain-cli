import { isValidInspectFormat, renderTable, renderDotenv, renderJson, inspectChain } from './inspect';
import { getChain } from '../store';

jest.mock('../store');

const mockGetChain = getChain as jest.MockedFunction<typeof getChain>;

describe('isValidInspectFormat', () => {
  it('accepts valid formats', () => {
    expect(isValidInspectFormat('table')).toBe(true);
    expect(isValidInspectFormat('dotenv')).toBe(true);
    expect(isValidInspectFormat('json')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidInspectFormat('xml')).toBe(false);
    expect(isValidInspectFormat('')).toBe(false);
  });
});

describe('renderTable', () => {
  it('renders a table with headers', () => {
    const output = renderTable({ FOO: 'bar', BAZ: 'qux' });
    expect(output).toContain('KEY');
    expect(output).toContain('VALUE');
    expect(output).toContain('FOO');
    expect(output).toContain('bar');
  });

  it('returns placeholder for empty vars', () => {
    expect(renderTable({})).toBe('(no variables)');
  });
});

describe('renderDotenv', () => {
  it('renders key=value pairs', () => {
    const output = renderDotenv({ FOO: 'bar' });
    expect(output).toBe('FOO=bar');
  });

  it('quotes values with spaces', () => {
    const output = renderDotenv({ MSG: 'hello world' });
    expect(output).toBe('MSG="hello world"');
  });
});

describe('renderJson', () => {
  it('renders valid JSON', () => {
    const output = renderJson({ FOO: 'bar' });
    const parsed = JSON.parse(output);
    expect(parsed).toEqual({ FOO: 'bar' });
  });
});

describe('inspectChain', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws if chain not found', async () => {
    mockGetChain.mockResolvedValue(null);
    await expect(inspectChain('missing')).rejects.toThrow('not found');
  });

  it('returns table output by default', async () => {
    mockGetChain.mockResolvedValue({ FOO: 'bar' });
    const output = await inspectChain('mychain');
    expect(output).toContain('FOO');
    expect(output).toContain('bar');
  });

  it('returns dotenv output when requested', async () => {
    mockGetChain.mockResolvedValue({ FOO: 'bar' });
    const output = await inspectChain('mychain', 'dotenv');
    expect(output).toBe('FOO=bar');
  });
});
