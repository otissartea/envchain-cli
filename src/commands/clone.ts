import { getChain, saveChain, listChainNames } from '../store';
import { isValidChainName } from './rename';

export interface CloneOptions {
  overwrite?: boolean;
}

export async function cloneChain(
  sourceName: string,
  targetName: string,
  options: CloneOptions = {}
): Promise<void> {
  if (!isValidChainName(targetName)) {
    throw new Error(
      `Invalid chain name "${targetName}". Use only letters, numbers, hyphens, and underscores.`
    );
  }

  const source = await getChain(sourceName);
  if (!source) {
    throw new Error(`Chain "${sourceName}" not found.`);
  }

  if (!options.overwrite) {
    const existing = await getChain(targetName);
    if (existing) {
      throw new Error(
        `Chain "${targetName}" already exists. Use --overwrite to replace it.`
      );
    }
  }

  const cloned = {
    ...source,
    name: targetName,
    createdAt: new Date().toISOString(),
    clonedFrom: sourceName,
  };

  await saveChain(targetName, cloned);
}

export async function listCloneableChains(excludeName?: string): Promise<string[]> {
  const names = await listChainNames();
  return excludeName ? names.filter((n) => n !== excludeName) : names;
}
