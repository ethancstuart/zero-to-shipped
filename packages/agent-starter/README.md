# @prototype-studio/agent-starter

Scaffold an agent-first project with AI coding tools.

## Installation

```bash
npm install -g @prototype-studio/agent-starter
```

## Usage

```bash
prototype-studio init --tool claude-code --type web-app --name my-project
```

## Options

| Option | Description | Values |
|--------|-------------|--------|
| `--tool` | AI coding tool | `claude-code`, `cursor`, `gemini-cli` |
| `--type` | Project type | `web-app`, `api`, `cli`, `data-product` |
| `--name` | Project name | any string |

## Programmatic Usage

```typescript
import { scaffoldProject } from '@prototype-studio/agent-starter'

scaffoldProject({
  tool: 'claude-code',
  projectType: 'web-app',
  projectName: 'my-project',
  outputDir: process.cwd(),
})
```

## License

MIT
