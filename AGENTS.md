# Ultracode Repository Guide

- NEVER write mock code or fallbacks to solve product issues. Mock data is allowed in test suites only.
- Prefer removing deprecated code over hiding it behind flags or leaving unused code paths around.
- Avoid large monolithic files. Put new code into logically separated modules when the behavior is substantial.
- Treat LLM failures as instruction, schema, normalization, or edge-case handling failures. Fix those directly instead of adding fallbacks.
- Keep worker execution parallel by default. Add throttling only after measuring real limits.

Ultracode is a Codex CLI plugin that gives Codex a parallel worker orchestration layer. It fans out real `codex exec` subprocesses for deep code investigation, planning, and review, then returns structured results to the parent Codex thread where the final synthesis and edits happen.

## Main Components

- `.codex-plugin/plugin.json` declares the plugin metadata, skills, and interface.
- `scripts/ultracode-engine.js` owns worker spawning, schema validation, concurrency, usage accounting, persisted workflow state, resume, and exported scripted primitives.
- `scripts/ultracode-script-runner.js` is the opt-in imperative Workflow-script runner. It runs arbitrary Node.js in-process with full host privileges; it is NOT a sandbox.
- `scripts/app-server-client.js` is the dependency-free `codex app-server` JSON-RPC client for the opt-in `transport: 'app-server'` path.
- `scripts/ultracode-cli.js` is the CLI wrapper over the same engine.
- `hooks/` contains the prompt hook that injects Ultracode guidance when a prompt mentions Ultracode.
- `skills/ultracode/SKILL.md` is the model-facing usage guide.
- `test/` holds the Node test suite and mock Codex fixtures.
- `examples/` holds runnable Workflow scripts.

## Runtime Behavior

Ultracode workers are real Codex subprocesses, not mocked agents. Worker output is schema-validated when a schema is provided, usage is aggregated from Codex JSON events, and workflow state is written under `$CODEX_HOME/ultracode/runs/`.

Temporary schemas, last-message files, and isolated worktrees are created under the OS temp directory. They should not create tracked files in this repository.

The Workflow-script runner executes arbitrary Node.js in-process with full host privileges. Treat `scripts/ultracode-cli.js script` as equivalent to running `node <trusted-file>`; never auto-dump `process.env`.

## Testing

The suite runs entirely offline against a mock Codex binary. Tests must never call the real, paid `codex` CLI.

- Run everything with `npm test` or directly with `node --test "test/**/*.test.js"`.
- Run a single file with `node --test test/<file>.test.js`.
- `test/fixtures/mock-codex.js` is the env-driven stand-in for `codex`.
- Always set `CODEX_HOME` to a temp dir and point `CODEX_CLI_PATH` or `codex_bin` at the mock when running examples or tests.

## Development Notes

- Keep the engine dependency-free unless there is a strong reason to change that.
- Preserve the existing CLI and engine contracts when adding orchestration features.
- Prefer explicit failures and logged events over silent fallbacks.
- The script runner top-level-`require`s the engine; the engine must NOT top-level-`require` the runner.
- Do not commit local `.claude/` files, `.DS_Store`, or generated run state.
