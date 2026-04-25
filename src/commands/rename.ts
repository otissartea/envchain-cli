import { getChain, saveChain, deleteChain, listChainNames } from '../store';

/**
 * Renames an existing chain from `oldName` to `newName`.
 * Throws if either name is missing, names are identical, the new name is invalid,
 * the old chain does not exist, or a chain with the new name already exists.
 */
export async function renameChain(
  oldName: string,
  newName: string
): Promise<void> {
  if (!oldName || !newName) {
    throw new Error('Both old and new chain names are required.');
  }

  if (oldName === newName) {
    throw new Error('Old and new chain names must be different.');
  }

  if (!isValidChainName(newName)) {
    throw new Error(
      `Invalid chain name "${newName}". Use only letters, numbers, hyphens, and underscores.`
    );
  }

  const existingChain = await getChain(oldName);
  if (!existingChain) {
    throw new Error(`Chain "${oldName}" does not exist.`);
  }

  const conflictChain = await getChain(newName);
  if (conflictChain) {
    throw new Error(`Chain "${newName}" already exists. Choose a different name.`);
  }

  await saveChain(newName, existingChain);
  await deleteChain(oldName);
}

/**
 * Returns true if the given name contains only letters, numbers,
 * hyphens, and underscores, and is non-empty.
 */
export function isValidChainName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}
