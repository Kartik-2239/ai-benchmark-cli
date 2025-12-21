# benchmark-cli

Tiny Bun CLI to benchmark multiple LLMs on a question set and show a live table in the terminal.
(currently only for nebius, will add openrouter)

## Installation

```bash
bun install
export NEBIUS_API_KEY="..."
```

## Usage

```bash
bun run start [command]
```

### Commands

- **`--run`** - Run benchmark tests on the existing question set
- **`--create`** - Interactive question creator to generate a new question set

### Examples

```bash
# Run benchmarks with existing question set
bun run start --run

# Create a new question set interactively
bun run start --create
```

## Configure

- **Models**: edit `constants.ts` (`models`)
- **Questions**: edit/add `questions/test.json`
- **Logs**: written to `logs/<model-name>.log`

