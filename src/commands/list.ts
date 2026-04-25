import { readStore } from '../store';

export interface ListOptions {
  json?: boolean;
  verbose?: boolean;
}

export function listChains(options: ListOptions = {}): void {
  const store = readStore();
  const chainNames = Object.keys(store.chains);

  if (chainNames.length === 0) {
    console.log('No chains found. Use `envchain set <name>` to create one.');
    return;
  }

  if (options.json) {
    if (options.verbose) {
      console.log(JSON.stringify(store.chains, null, 2));
    } else {
      console.log(JSON.stringify(chainNames, null, 2));
    }
    return;
  }

  console.log(`Found ${chainNames.length} chain(s):\n`);

  for (const name of chainNames) {
    const chain = store.chains[name];
    const varCount = Object.keys(chain.vars).length;
    const activeMarker = store.active === name ? ' ✓ (active)' : '';

    if (options.verbose) {
      console.log(`  ${name}${activeMarker}`);
      for (const [key, value] of Object.entries(chain.vars)) {
        const masked = maskValue(value);
        console.log(`    ${key}=${masked}`);
      }
    } else {
      console.log(`  ${name} — ${varCount} variable(s)${activeMarker}`);
    }
  }
}

/**
 * Masks a secret value for display, revealing only the first 2 and last 2
 * characters. Short values (4 chars or fewer) are fully masked.
 *
 * @example
 * maskValue('mysecretkey') // => 'my******ey'
 * maskValue('abc')         // => '****'
 */
function maskValue(value: string): string {
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 4, 6)) + value.slice(-2);
}
