# ai-benchmark-cli

CLI to benchmark multiple LLMs on a question set and show a live table in the terminal.

## Installation

```bash
bun install
export NEBIUS_API_KEY="..."
#or
export OPENROUTER_API_KEY="..."
```

## Images

### Generated table
![cli-table](/assets/cli-table.png)
### Generated web graph
![web-graph](/assets/web-graph.png)


## Usage

```bash
bun run start [command]
```

### Commands

- **`--run`** - Run benchmark tests on the existing question set
- **`--create`** - Interactive question creator to generate a new question set

### Run web ui

```bash
cd webui

# Start the react webui
bun run dev
# web ui at http://localhost:3000/app
```

### Examples

```bash
# Run benchmarks with existing question set
bun run start --run

# Create a new question set with ai
bun run start --create
```

## Configure

- **Models**: edit `constants/index.ts` (`models`)
- **Provider**: configure `.env` and `constants/index.ts` (`BASE_URL`) according to your provider.
- **Questions**: edit/add `questions/test.json`
- **Logs**: written to `logs/<model-name>.log`



## TO-DOs
 - [ ] Better caching
 - [ ] Image gen benchmarks (can't test it)