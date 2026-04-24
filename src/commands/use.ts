import { getChain } from '../store/chainStore';
import { applyChainToShell } from '../shell/shellExporter';

export interface UseCommandOptions {
  shell?: string;
  export?: boolean;
}

export async function useCommand(
  chainName: string,
  options: UseCommandOptions = {}
): Promise<void> {
  if (!chainName || chainName.trim() === '') {
    throw new Error('Chain name is required.');
  }

  const chain = await getChain(chainName);

  if (!chain) {
    throw new Error(`Chain "${chainName}" not found. Use \`envchain list\` to see available chains.`);
  }

  const shellType = options.shell ?? detectShell();
  const output = applyChainToShell(chain.vars, shellType, options.export ?? true);

  process.stdout.write(output);
}

function detectShell(): string {
  const shell = process.env.SHELL ?? '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('fish')) return 'fish';
  return 'bash';
}
