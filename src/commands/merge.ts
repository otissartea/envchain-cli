import { getChain, saveChain } from '../store';
import type { EnvChain } from '../store/chainStore';

export type MergeStrategy = 'overwrite' | 'keep' | 'error';

export function isValidMergeStrategy(value: string): value is MergeStrategy {
  return ['overwrite', 'keep', 'error'].includes(value);
}

export async function mergeChains(
  sourceNames: string[],
  targetName: string,
  strategy: MergeStrategy = 'overwrite'
): Promise<{ merged: number; skipped: string[]; conflicts: string[] }> {
  if (sourceNames.length < 2) {
    throw new Error('At least two source chains are required to merge.');
  }

  const chains: EnvChain[] = [];
  for (const name of sourceNames) {
    const chain = await getChain(name);
    if (!chain) {
      throw new Error(`Chain "${name}" not found.`);
    }
    chains.push(chain);
  }

  const mergedVars: Record<string, string> = {};
  const conflicts: string[] = [];
  const skipped: string[] = [];

  for (const chain of chains) {
    for (const [key, value] of Object.entries(chain.vars)) {
      if (key in mergedVars) {
        if (strategy === 'error') {
          throw new Error(
            `Conflict: key "${key}" exists in multiple source chains.`
          );
        } else if (strategy === 'keep') {
          skipped.push(key);
          continue;
        } else {
          // overwrite
          if (!conflicts.includes(key)) conflicts.push(key);
        }
      }
      mergedVars[key] = value;
    }
  }

  await saveChain(targetName, { name: targetName, vars: mergedVars });

  return {
    merged: Object.keys(mergedVars).length,
    skipped: [...new Set(skipped)],
    conflicts,
  };
}
