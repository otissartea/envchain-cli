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
