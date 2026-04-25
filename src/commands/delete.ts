import { readStore, writeStore } from '../store';

export async function deleteChain(chainName: string): Promise<void> {
  const store = await readStore();

  if (!store.chains[chainName]) {
    throw new Error(`Chain "${chainName}" does not exist.`);
  }

  delete store.chains[chainName];
  await writeStore(store);

  console.log(`Chain "${chainName}" deleted successfully.`);
}

export async function deleteKey(
  chainName: string,
  key: string
): Promise<void> {
  const store = await readStore();

  if (!store.chains[chainName]) {
    throw new Error(`Chain "${chainName}" does not exist.`);
  }

  if (!(key in store.chains[chainName])) {
    throw new Error(
      `Key "${key}" does not exist in chain "${chainName}".`
    );
  }

  delete store.chains[chainName][key];
  await writeStore(store);

  console.log(
    `Key "${key}" removed from chain "${chainName}" successfully.`
  );
}
