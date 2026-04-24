export type ShellType = 'bash' | 'zsh' | 'fish';

export function applyChainToShell(
  vars: Record<string, string>,
  shell: string,
  shouldExport: boolean
): string {
  const entries = Object.entries(vars);

  if (entries.length === 0) {
    return '';
  }

  switch (shell) {
    case 'fish':
      return formatFishExports(entries, shouldExport);
    case 'bash':
    case 'zsh':
    default:
      return formatPosixExports(entries, shouldExport);
  }
}

function formatPosixExports(
  entries: [string, string][],
  shouldExport: boolean
): string {
  return entries
    .map(([key, value]) => {
      const escaped = escapePosixValue(value);
      return shouldExport
        ? `export ${key}="${escaped}"`
        : `${key}="${escaped}"`;
    })
    .join('\n') + '\n';
}

function formatFishExports(
  entries: [string, string][],
  shouldExport: boolean
): string {
  return entries
    .map(([key, value]) => {
      const escaped = value.replace(/'/g, "'\\''");
      return shouldExport
        ? `set -x ${key} '${escaped}'`
        : `set ${key} '${escaped}'`;
    })
    .join('\n') + '\n';
}

function escapePosixValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`');
}
