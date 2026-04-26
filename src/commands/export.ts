import * as fs from 'fs';
import * as path from 'path';
import { getChain } from '../store';

export type ExportFormat = 'dotenv' | 'json' | 'shell';

export function isValidFormat(format: string): format is ExportFormat {
  return ['dotenv', 'json', 'shell'].includes(format);
}

export function formatDotenv(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => {
      const escaped = value.includes('\n') ? `"${value.replace(/"/g, '\\"')}"` : value;
      return `${key}=${escaped}`;
    })
    .join('\n') + '\n';
}

export function formatJson(vars: Record<string, string>): string {
  return JSON.stringify(vars, null, 2) + '\n';
}

export function formatShell(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => {
      const escaped = value.replace(/'/g, `'\''`);
      return `export ${key}='${escaped}'`;
    })
    .join('\n') + '\n';
}

export function exportChain(
  chainName: string,
  format: ExportFormat,
  outputFile?: string
): void {
  const chain = getChain(chainName);
  if (!chain) {
    console.error(`Error: chain "${chainName}" not found.`);
    process.exit(1);
  }

  let output: string;
  switch (format) {
    case 'dotenv':
      output = formatDotenv(chain.vars);
      break;
    case 'json':
      output = formatJson(chain.vars);
      break;
    case 'shell':
      output = formatShell(chain.vars);
      break;
  }

  if (outputFile) {
    const resolved = path.resolve(outputFile);
    fs.writeFileSync(resolved, output, 'utf-8');
    console.log(`Exported chain "${chainName}" to ${resolved} (${format})`);
  } else {
    process.stdout.write(output);
  }
}
