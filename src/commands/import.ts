import * as fs from 'fs';
import * as path from 'path';
import { getChain, saveChain } from '../store';
import { isValidKey } from './add';

export function parseDotenv(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (isValidKey(key)) {
      vars[key] = value;
    }
  }
  return vars;
}

export function parseJsonEnv(content: string): Record<string, string> {
  const parsed = JSON.parse(content);
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === 'string' && isValidKey(key)) {
      vars[key] = value;
    }
  }
  return vars;
}

export function importChain(
  chainName: string,
  filePath: string,
  merge: boolean = false
): void {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: file "${resolved}" not found.`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, 'utf-8');
  let vars: Record<string, string>;

  try {
    vars = resolved.endsWith('.json') ? parseJsonEnv(content) : parseDotenv(content);
  } catch {
    console.error('Error: failed to parse import file.');
    process.exit(1);
  }

  if (Object.keys(vars).length === 0) {
    console.error('Error: no valid environment variables found in file.');
    process.exit(1);
  }

  const existing = merge ? (getChain(chainName)?.vars ?? {}) : {};
  const merged = { ...existing, ...vars };

  saveChain(chainName, merged);
  console.log(
    `${merge ? 'Merged' : 'Imported'} ${Object.keys(vars).length} variable(s) into chain "${chainName}".`
  );
}
