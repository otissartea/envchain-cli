import { getChain, saveChain } from '../store';

export interface AddOptions {
  chain: string;
  key: string;
  value: string;
  force?: boolean;
}

export async function addEnvVar(options: AddOptions): Promise<void> {
  const { chain, key, value, force } = options;

  if (!isValidKey(key)) {
    throw new Error(
      `Invalid environment variable name: "${key}". Must match [A-Z_][A-Z0-9_]* (case-insensitive).`
    );
  }

  const existing = await getChain(chain);
  const vars = existing?.vars ?? {};

  if (vars[key] !== undefined && !force) {
    throw new Error(
      `Key "${key}" already exists in chain "${chain}". Use --force to overwrite.`
    );
  }

  const updated = {
    name: chain,
    vars: { ...vars, [key]: value },
  };

  await saveChain(updated);
}

export function isValidKey(key: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
}
