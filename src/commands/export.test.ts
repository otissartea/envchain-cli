import { formatDotenv, formatJson, formatShell, isValidFormat } from './export';

describe('isValidFormat', () => {
  it('returns true for valid formats', () => {
    expect(isValidFormat('dotenv')).toBe(true);
    expect(isValidFormat('json')).toBe(true);
    expect(isValidFormat('shell')).toBe(true);
  });

  it('returns false for invalid formats', () => {
    expect(isValidFormat('yaml')).toBe(false);
    expect(isValidFormat('')).toBe(false);
    expect(isValidFormat('XML')).toBe(false);
  });
});

describe('formatDotenv', () => {
  it('formats simple key-value pairs', () => {
    const result = formatDotenv({ FOO: 'bar', BAZ: 'qux' });
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=qux');
  });

  it('wraps values containing newlines in quotes', () => {
    const result = formatDotenv({ MULTILINE: 'line1\nline2' });
    expect(result).toContain('MULTILINE="line1\nline2"');
  });

  it('ends with a newline', () => {
    const result = formatDotenv({ A: '1' });
    expect(result.endsWith('\n')).toBe(true);
  });
});

describe('formatJson', () => {
  it('produces valid JSON output', () => {
    const vars = { API_KEY: 'secret', PORT: '3000' };
    const result = formatJson(vars);
    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toEqual(vars);
  });

  it('ends with a newline', () => {
    const result = formatJson({ A: '1' });
    expect(result.endsWith('\n')).toBe(true);
  });
});

describe('formatShell', () => {
  it('formats as export statements', () => {
    const result = formatShell({ FOO: 'bar' });
    expect(result).toContain("export FOO='bar'");
  });

  it('escapes single quotes in values', () => {
    const result = formatShell({ MSG: "it's alive" });
    expect(result).toContain("export MSG='it'\''s alive'");
  });

  it('ends with a newline', () => {
    const result = formatShell({ A: '1' });
    expect(result.endsWith('\n')).toBe(true);
  });
});
