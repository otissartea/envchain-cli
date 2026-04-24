import { listChains } from './list';
import * as store from '../store';

jest.mock('../store');

const mockReadStore = store.readStore as jest.MockedFunction<typeof store.readStore>;

describe('listChains', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('prints a message when no chains exist', () => {
    mockReadStore.mockReturnValue({ chains: {}, active: null });
    listChains();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No chains found'));
  });

  it('lists chain names with variable counts', () => {
    mockReadStore.mockReturnValue({
      chains: {
        dev: { vars: { NODE_ENV: 'development', PORT: '3000' } },
        prod: { vars: { NODE_ENV: 'production' } },
      },
      active: 'dev',
    });
    listChains();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('2 chain(s)'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('dev'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('(active)'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('prod'));
  });

  it('outputs JSON when json option is true', () => {
    mockReadStore.mockReturnValue({
      chains: { staging: { vars: { API_URL: 'https://staging.example.com' } } },
      active: null,
    });
    listChains({ json: true });
    const output = consoleSpy.mock.calls[0][0];
    expect(() => JSON.parse(output)).not.toThrow();
    expect(JSON.parse(output)).toContain('staging');
  });

  it('outputs verbose JSON with vars when json and verbose are true', () => {
    mockReadStore.mockReturnValue({
      chains: { local: { vars: { DB_HOST: 'localhost' } } },
      active: 'local',
    });
    listChains({ json: true, verbose: true });
    const output = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.local.vars.DB_HOST).toBe('localhost');
  });
});
