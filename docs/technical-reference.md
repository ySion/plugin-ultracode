# Ultracode Technical Reference

This document keeps operational details out of the user-facing README. It is
for maintainers, advanced workflow authors, and anyone running Ultracode
directly from the plugin checkout.

For the complete flag and API surface, see
[skills/ultracode/references/cli.md](../skills/ultracode/references/cli.md).

## Local Execution

From this checkout, the local entrypoint is:

```bash
node scripts/ultracode-cli.js <input> [flags]
```

The execution command has no leading verb. The input shape selects the run type:

| Input | Use it for | Example |
| --- | --- | --- |
| Task sentence | Fixed-role fan-out | `node scripts/ultracode-cli.js "review the auth refactor" --workers 5` |
| `steps[]` JSON | Barrier-free staged workflows | `node scripts/ultracode-cli.js --steps '[{"id":"scan","prompt":"Find bugs. Cite file:line."}]'` |
| `workers_spec[]` JSON | Custom one-shot worker panels | `node scripts/ultracode-cli.js --workers-spec '[{"label":"sec","prompt":"Review security risks."}]'` |
| Workflow script | Dynamic loops, reductions, branching | `node scripts/ultracode-cli.js examples/deep-research.workflow.js --args '{"topic":"budgeting","mode":"code"}'` |
| `@name` | Saved `.claude/workflows` definitions | `node scripts/ultracode-cli.js @deep-research --args '{"topic":"Codex"}'` |

Lifecycle commands do use verbs:

```bash
node scripts/ultracode-cli.js status --workflow-id ultra-...
node scripts/ultracode-cli.js resume --workflow-id ultra-...
node scripts/ultracode-cli.js workflow list
node scripts/ultracode-cli.js workflow show deep-research
```

## Common Local Runs

Fixed-role review:

```bash
node scripts/ultracode-cli.js "review the pending diff for bugs and missing tests" --workers 4 --progress
```

Minimal `steps[]` workflow:

```bash
node scripts/ultracode-cli.js --steps '[
  {
    "id": "scan",
    "prompt": "Find correctness risks in this repo. Cite file:line and return findings."
  },
  {
    "id": "verify",
    "kind": "verify",
    "depends_on": ["scan"],
    "findings_from": "scan",
    "skeptics": 3,
    "prompt": "verify"
  }
]' --progress
```

Workflow script:

```bash
node scripts/ultracode-cli.js examples/deep-research.workflow.js --progress \
  --args '{"topic":"How does Ultracode resume work?","mode":"code"}'
```

## Updates

Plugin installs are snapshot-based. The blunt install path for this fork is to
add the plugin repository itself as a marketplace, then install the plugin from
that marketplace:

```bash
codex plugin marketplace add https://github.com/ySion/plugin-ultracode --ref main
codex plugin add ultracode@plugin-ultracode
```

For local development, clone the repository and add the checkout:

```bash
git clone https://github.com/ySion/plugin-ultracode.git
codex plugin marketplace add ./plugin-ultracode
codex plugin add ultracode@plugin-ultracode
```

The upstream marketplace install remains:

```bash
codex plugin marketplace add just-every/plugins
codex plugin add ultracode@just-every
```

Current Codex versions accept marketplace sources as local paths,
`owner/repo[@ref]`, HTTPS Git URLs, or SSH Git URLs. For a local checkout or fork
branch, point Codex at a marketplace source that contains the Ultracode plugin
entry and pin the ref when needed. A plugin repo can be used directly only when
it also contains the marketplace manifest:

```bash
codex plugin marketplace add ./path/to/marketplace
codex plugin marketplace add owner/repo --ref your-branch
codex plugin add ultracode@<marketplace>
```

If the source repository contains multiple plugins or marketplace entries, pass
`--sparse <path>` to limit the checkout to the relevant subtree. Check
`codex plugin marketplace add --help` and `codex plugin add --help` for the
exact syntax supported by your installed Codex build.

Ultracode auto-refreshes the configured marketplace snapshot before commands, at
most once every 24 hours, then reinstalls the plugin for future Codex sessions.

The current Codex thread keeps the version it already loaded. Start a new thread
after an update if you need the refreshed plugin code immediately.

Opt out of the automatic refresh with either:

```bash
ULTRACODE_NO_AUTO_UPDATE=1 node scripts/ultracode-cli.js "review this change"
node scripts/ultracode-cli.js "review this change" --no-auto-update
```

## Dashboard

Execution runs and `resume` start a local dashboard automatically. With
`--progress`, the URL appears as a `ui.ready` event:

```bash
[ultracode] ui.ready UI ready at http://127.0.0.1:<port>/workflow/ultra-...
```

The dashboard reads the same journal files as `status`. It shows run state,
worker outputs, prompts, errors, phases, dependency lines, and run-level plus
worker-level model and reasoning settings.

Starting the dashboard does not automatically open or update the Codex in-app
browser. The engine emits the URL through `ui.ready` and stores it on
`record.ui.url`; a parent Codex agent should navigate the current in-app browser
tab to that URL when browser control is available, or show the URL to the user
when it is not.

Disable it when you only want JSON:

```bash
ULTRACODE_UI=0 node scripts/ultracode-cli.js "review this change"
node scripts/ultracode-cli.js "review this change" --no-ui
```

## Model Guidance

Choose worker model and reasoning by task complexity:

| Work type | Model | Reasoning |
| --- | --- | --- |
| Straightforward or narrow | `gpt-5.4-mini` | `high` |
| Standard research or search | `gpt-5.5` | `medium` |
| Standard coding | `gpt-5.5` | `high` |
| Hard problem solving | `gpt-5.5` | `xhigh` |

Set defaults with `--model` and `--reasoning-effort`, or override individual
workers and steps in `workers_spec[]`, `steps[]`, or workflow scripts.

## Important Runtime Rules

Workers are independent Codex subprocesses. They do not share parent-thread
memory or each other's memory, so prompts must include the context and evidence
requirements they need.

Default workers are read-only. For parallel edits, use isolated worktrees so
each worker's diff is collected separately and can be reviewed before
integration.

Failed, timed-out, or refuted workers are real failures. Do not replace them
with guessed output; inspect the run record and fix the prompt, schema, inputs,
or workflow shape.

## Repository Map

| Path | What lives there |
| --- | --- |
| [scripts/ultracode-cli.js](../scripts/ultracode-cli.js) | CLI routing, lifecycle commands, auto-update, dashboard launch wiring |
| [scripts/ultracode-engine.js](../scripts/ultracode-engine.js) | Worker spawning, schemas, concurrency, budgets, journaled state, resume |
| [scripts/ultracode-script-runner.js](../scripts/ultracode-script-runner.js) | Imperative Workflow-script runtime |
| [scripts/app-server-client.js](../scripts/app-server-client.js) | Optional `codex app-server` transport client |
| [scripts/workflow-definitions.js](../scripts/workflow-definitions.js) | Saved workflow discovery and library operations |
| [skills/ultracode/SKILL.md](../skills/ultracode/SKILL.md) | Codex-facing guidance for when and how to use Ultracode |
| [skills/ultracode/references/quality-patterns.md](../skills/ultracode/references/quality-patterns.md) | Verification and discovery patterns |
| [skills/ultracode/references/cookbook.md](../skills/ultracode/references/cookbook.md) | Runnable workflow skeletons |
| [skills/ultracode/references/cli.md](../skills/ultracode/references/cli.md) | Full CLI and API reference |
| [examples/](../examples/) | Workflow scripts you can run or adapt |
| [test/](../test/) | Offline Node tests and mock Codex fixtures |

## Development

The test suite is offline and must use the mock Codex binary, not the real paid
CLI:

```bash
npm test
node --test test/plugin-updater.test.js
```

Run examples against the mock when you want to check orchestration without
spawning real workers:

```bash
CODEX_HOME=$(mktemp -d) \
CODEX_CLI_PATH=test/fixtures/mock-codex.js \
ULTRACODE_UI=0 \
node scripts/ultracode-cli.js examples/parallel-reduce.workflow.js \
  --args '{"files":["a.js","b.js","c.js"]}' \
  --no-auto-update
```

Generated run state lives under `$CODEX_HOME/ultracode/runs/`. Temporary
schemas, last-message files, and isolated worktrees are created under the OS
temp directory and should not become tracked files.
