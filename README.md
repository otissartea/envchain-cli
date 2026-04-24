# envchain-cli

> A CLI tool for managing and switching between named environment variable sets across projects.

## Installation

```bash
npm install -g envchain-cli
```

## Usage

Create and manage named environment variable sets called **chains**, then activate them for any project.

```bash
# Create a new env chain
envchain create myapp-dev --set API_URL=https://dev.api.example.com --set DEBUG=true

# List all saved chains
envchain list

# Activate a chain (exports vars into your current shell session)
envchain use myapp-dev

# Run a command with a specific chain
envchain run myapp-prod -- node server.js

# Remove a chain
envchain remove myapp-dev
```

Chains are stored locally in `~/.envchain/` and can be scoped per project using a `.envchain` config file at your project root.

```bash
# Initialize project-level chain config
envchain init
```

## Why envchain-cli?

- Switch between dev, staging, and prod environments instantly
- No more overwriting `.env` files manually
- Keep secrets out of version control
- Works with any language or framework

## Requirements

- Node.js >= 16
- npm or yarn

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

## License

[MIT](LICENSE)