import { getChain, saveChain, deleteChain } from '../store';

export interface RemoveOptions {
  chain: string;
  key?: string;
}

export async function removeEnvVar(options: RemoveOptions): Promise<void> {
  const { chain, key } = options;

  const existing = await getChain(chain);
  if (!existing) {
    throw new Error(`Chain "${chain}" does not exist.`);
  }

  if (!key) {
    await deleteChain(chain);
    return;
  }

  if (!(key in existing.vars)) {
    throw new Error(`Key "${key}" not found in chain "${chain}".`);
  }

  const updatedVars = { ...existing.vars };
  delete updatedVars[key];

  await saveChain({ name: chain, vars: updatedVars });
}
