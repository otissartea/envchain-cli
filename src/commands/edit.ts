import { getChain, saveChain } from '../store';

export function isValidValue(value: string): boolean {
  return typeof value === 'string';
}

export async function editChain(
  chainName: string,
  key: string,
  value: string
): Promise<void> {
  const chain = await getChain(chainName);

  if (!chain) {
    throw new Error(`Chain "${chainName}" does not exist.`);
  }

  if (!(key in chain.vars)) {
    throw new Error(
      `Key "${key}" does not exist in chain "${chainName}". Use 'add' to create new keys.`
    );
  }

  if (!isValidValue(value)) {
    throw new Error(`Invalid value provided for key "${key}".`);
  }

  chain.vars[key] = value;
  chain.updatedAt = new Date().toISOString();

  await saveChain(chain);
}

export async function unsetKey(
  chainName: string,
  key: string
): Promise<void> {
  const chain = await getChain(chainName);

  if (!chain) {
    throw new Error(`Chain "${chainName}" does not exist.`);
  }

  if (!(key in chain.vars)) {
    throw new Error(
      `Key "${key}" does not exist in chain "${chainName}".`
    );
  }

  delete chain.vars[key];
  chain.updatedAt = new Date().toISOString();

  await saveChain(chain);
}

/**
 * Renames an existing key within a chain, preserving its value.
 * Throws if the chain does not exist, the old key is missing,
 * or the new key already exists.
 */
export async function renameKey(
  chainName: string,
  oldKey: string,
  newKey: string
): Promise<void> {
  const chain = await getChain(chainName);

  if (!chain) {
    throw new Error(`Chain "${chainName}" does not exist.`);
  }

  if (!(oldKey in chain.vars)) {
    throw new Error(
      `Key "${oldKey}" does not exist in chain "${chainName}".`
    );
  }

  if (newKey in chain.vars) {
    throw new Error(
      `Key "${newKey}" already exists in chain "${chainName}". Remove it first.`
    );
  }

  chain.vars[newKey] = chain.vars[oldKey];
  delete chain.vars[oldKey];
  chain.updatedAt = new Date().toISOString();

  await saveChain(chain);
}
