import { getChain } from '../store';

export type DiffEntry = {
  key: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  valueA?: string;
  valueB?: string;
};

export type DiffResult = {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: DiffEntry[];
  unchanged: DiffEntry[];
};

export async function diffChains(
  nameA: string,
  nameB: string,
  showUnchanged = false
): Promise<DiffResult> {
  const chainA = await getChain(nameA);
  if (!chainA) throw new Error(`Chain "${nameA}" not found.`);

  const chainB = await getChain(nameB);
  if (!chainB) throw new Error(`Chain "${nameB}" not found.`);

  const allKeys = new Set([
    ...Object.keys(chainA.vars),
    ...Object.keys(chainB.vars),
  ]);

  const result: DiffResult = { added: [], removed: [], changed: [], unchanged: [] };

  for (const key of allKeys) {
    const inA = key in chainA.vars;
    const inB = key in chainB.vars;

    if (inA && !inB) {
      result.removed.push({ key, status: 'removed', valueA: chainA.vars[key] });
    } else if (!inA && inB) {
      result.added.push({ key, status: 'added', valueB: chainB.vars[key] });
    } else if (chainA.vars[key] !== chainB.vars[key]) {
      result.changed.push({
        key,
        status: 'changed',
        valueA: chainA.vars[key],
        valueB: chainB.vars[key],
      });
    } else if (showUnchanged) {
      result.unchanged.push({
        key,
        status: 'unchanged',
        valueA: chainA.vars[key],
        valueB: chainB.vars[key],
      });
    }
  }

  return result;
}

export function formatDiff(result: DiffResult, maskValues = false): string {
  const mask = (v?: string) => (maskValues ? '***' : v ?? '');
  const lines: string[] = [];

  for (const e of result.removed) lines.push(`- ${e.key}=${mask(e.valueA)}`);
  for (const e of result.added) lines.push(`+ ${e.key}=${mask(e.valueB)}`);
  for (const e of result.changed)
    lines.push(`~ ${e.key}: ${mask(e.valueA)} → ${mask(e.valueB)}`);
  for (const e of result.unchanged) lines.push(`  ${e.key}=${mask(e.valueA)}`);

  return lines.length > 0 ? lines.join('\n') : '(no differences)';
}
