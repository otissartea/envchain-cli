import * as path from 'path';
import * as fs from 'fs';
import { readStore, writeStore } from '../store';

export interface InitOptions {
  name?: string;
  fromEnv?: boolean;
  force?: boolean;
}

export function parseCurrentEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (
      value !== undefined &&
      !key.startsWith('_') &&
      !['PATH', 'HOME', 'USER', 'SHELL', 'TERM', 'PWD', 'OLDPWD', 'SHLVL', 'LOGNAME'].includes(key)
    ) {
      env[key] = value;
    }
  }
  return env;
}

export function deriveChainName(name?: string): string {
  if (name) return name;
  const cwd = process.cwd();
  return path.basename(cwd).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

export async function initChain(
  options: InitOptions = {},
  log = console.log,
  warn = console.warn
): Promise<void> {
  const chainName = deriveChainName(options.name);
  const store = await readStore();

  if (store[chainName] && !options.force) {
    warn(`Chain "${chainName}" already exists. Use --force to overwrite.`);
    return;
  }

  let vars: Record<string, string> = {};

  if (options.fromEnv) {
    vars = parseCurrentEnv();
    log(`Captured ${Object.keys(vars).length} variable(s) from current environment.`);
  }

  store[chainName] = vars;
  await writeStore(store);

  if (options.fromEnv && Object.keys(vars).length > 0) {
    log(`Initialized chain "${chainName}" with ${Object.keys(vars).length} variable(s).`);
  } else {
    log(`Initialized empty chain "${chainName}".`);
  }
}
