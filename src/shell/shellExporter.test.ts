import { applyChainToShell } from './shellExporter';

describe('applyChainToShell', () => {
  const sampleVars = {
    NODE_ENV: 'production',
    API_KEY: 'abc123',
  };

  it('returns empty string for empty vars', () => {
    expect(applyChainToShell({}, 'bash', true)).toBe('');
  });

  it('formats bash export statements', () => {
    const result = applyChainToShell(sampleVars, 'bash', true);
    expect(result).toContain('export NODE_ENV="production"');
    expect(result).toContain('export API_KEY="abc123"');
  });

  it('formats bash without export keyword when shouldExport is false', () => {
    const result = applyChainToShell(sampleVars, 'bash', false);
    expect(result).toContain('NODE_ENV="production"');
    expect(result).not.toContain('export NODE_ENV');
  });

  it('formats zsh the same as bash', () => {
    const bash = applyChainToShell(sampleVars, 'bash', true);
    const zsh = applyChainToShell(sampleVars, 'zsh', true);
    expect(bash).toBe(zsh);
  });

  it('formats fish set -x statements', () => {
    const result = applyChainToShell(sampleVars, 'fish', true);
    expect(result).toContain("set -x NODE_ENV 'production'");
    expect(result).toContain("set -x API_KEY 'abc123'");
  });

  it('formats fish set without -x when shouldExport is false', () => {
    const result = applyChainToShell(sampleVars, 'fish', false);
    expect(result).toContain("set NODE_ENV 'production'");
    expect(result).not.toContain('set -x');
  });

  it('escapes double quotes in bash values', () => {
    const result = applyChainToShell({ MSG: 'say "hello"' }, 'bash', true);
    expect(result).toContain('export MSG="say \\"hello\\""');
  });

  it('escapes single quotes in fish values', () => {
    const result = applyChainToShell({ MSG: "it's alive" }, 'fish', true);
    expect(result).toContain("set -x MSG 'it'\\''s alive'");
  });

  it('falls back to bash formatting for unknown shell', () => {
    const result = applyChainToShell(sampleVars, 'unknown', true);
    expect(result).toContain('export NODE_ENV="production"');
  });
});
