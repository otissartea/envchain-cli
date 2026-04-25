import { getChain, saveChain } from '../store';
import { isValidChainName } from './rename';

export async function copyChain(
  sourceName: string,
  destName: string
): Promise<void> {
  if (!sourceName || sourceName.trim() === '') {
    throw new Error('Source chain name cannot be empty.');
  }

  if (!isValidChainName(destName)) {
    throw new Error(
      `Invalid destination chain name "${destName}". Use only letters, numbers, hyphens, and underscores.`
    );
  }

  const source = await getChain(sourceName);
  if (!source) {
    throw new Error(`Chain "${sourceName}" does not exist.`);
  }

  const existing = await getChain(destName);
  if (existing) {
    throw new Error(
      `Chain "${destName}" already exists. Remove it first or choose a different name.`
    );
  }

  const copied = { ...source };
  await saveChain(destName, copied);

  console.log(
    `Chain "${sourceName}" copied to "${destName}" (${Object.keys(copied).length} variable(s)).`
  );
}
