import { getChain } from '../store';

export type InspectFormat = 'table' | 'dotenv' | 'json';

export function isValidInspectFormat(format: string): format is InspectFormat {
  return ['table', 'dotenv', 'json'].includes(format);
}

export function renderTable(vars: Record<string, string>): string {
  const entries = Object.entries(vars);
  if (entries.length === 0) return '(no variables)';
  const keyWidth = Math.max(...entries.map(([k]) => k.length), 3);
  const header = `${'KEY'.padEnd(keyWidth)}  VALUE`;
  const divider = '-'.repeat(keyWidth) + '  ' + '-'.repeat(20);
  const rows = entries.map(([k, v]) => `${k.padEnd(keyWidth)}  ${v}`);
  return [header, divider, ...rows].join('\n');
}

export function renderDotenv(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}=${v.includes(' ') ? `"${v}"` : v}`)
    .join('\n');
}

export function renderJson(vars: Record<string, string>): string {
  return JSON.stringify(vars, null, 2);
}

export async function inspectChain(
  chainName: string,
  format: InspectFormat = 'table'
): Promise<string> {
  const vars = await getChain(chainName);
  if (!vars) {
    throw new Error(`Chain "${chainName}" not found.`);
  }
  switch (format) {
    case 'dotenv':
      return renderDotenv(vars);
    case 'json':
      return renderJson(vars);
    case 'table':
    default:
      return renderTable(vars);
  }
}
