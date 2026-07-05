# Ultracode Plugin for Codex

Part of the [Just Every Codex plugin marketplace](https://github.com/just-every/plugins).

Ultracode helps Codex take on work that is too broad, risky, or multi-step for
one thread to handle alone. It lets Codex break a task into focused parallel
lanes, compare the evidence, verify claims, and bring back a clearer answer or
implementation plan.

Use it when you want Codex to act less like one reviewer skimming a problem and
more like a coordinated team working through it from several angles.

![Codex running an Ultracode PR sweep with the live dashboard open](assets/screenshots/ultracode-pr-sweep-codex.jpg)

## What It Is

Ultracode is a Codex plugin for orchestrating many focused Codex workers on one
larger goal.

Those workers can inspect different parts of a codebase, review the same change
from different perspectives, verify each other's findings, explore multiple
solutions, or produce competing plans that Codex can synthesize into one clear
next step.

The result is not just "more output." The point is better coverage, better
verification, and less hidden single-thread tunnel vision.

## When To Use It

Reach for Ultracode when the task benefits from breadth, independent checks, or
parallel exploration:

- Reviewing a large or risky change.
- Auditing a subsystem for bugs, security issues, or missing tests.
- Finding every place a pattern, API, or behavior appears.
- Comparing multiple implementation strategies before committing to one.
- Investigating a confusing failure with several plausible causes.
- Asking for a final sign-off where false confidence would be expensive.
- Running a research pass that needs planning, gathering, verification, and
  synthesis.

For tiny, obvious edits, normal Codex is enough. Ultracode earns its keep when
you want coverage and confidence, not just a quick answer.

## What It Is Good At

**Parallel investigation.** Different workers can scan different files,
features, call sites, risks, or hypotheses at the same time.

**Independent review.** Workers can approach the same change through separate
lenses such as correctness, security, performance, tests, product behavior, or
maintainability.

**Adversarial verification.** Findings can be checked by skeptical reviewers
before they are treated as real.

**Complex workflows.** Larger tasks can be shaped as stages: plan, gather,
verify, synthesize, implement, then review.

**Visible progress.** Ultracode has a dashboard so you can see the work unfold:
which lanes are running, what they found, what failed, and what survived review.

## How To Ask For It

You do not need to know the internals. Ask Codex for the outcome and mention
Ultracode when the task deserves a wider pass:

```text
Use Ultracode to review this refactor for correctness, security, and missing tests.
```

Good prompts name the goal, the scope, and the kind of confidence you want.
Codex can choose the worker layout and verification pattern from there.

## What To Expect

Ultracode work usually has three visible parts:

- Codex shapes the workflow: what to split up, what to verify, and how results
  should come back.
- Workers run in parallel and return evidence-backed findings or plans.
- Codex synthesizes the useful results, applies or recommends changes, and runs
  the final verification.

The dashboard is there for transparency, not because you need to manage it by
hand. Failed or refuted lanes remain visible so Codex can treat them as real
signals instead of quietly smoothing them over.

## Install

Fastest path for this fork: add the plugin repository as a Codex marketplace,
then install Ultracode from it:

```bash
codex plugin marketplace add https://github.com/ySion/plugin-ultracode --ref main
codex plugin add ultracode@plugin-ultracode
```

If you want to hack on the plugin locally, clone it first and add the local
checkout instead:

```bash
git clone https://github.com/ySion/plugin-ultracode.git
codex plugin marketplace add ./plugin-ultracode
codex plugin add ultracode@plugin-ultracode
```

Upstream install path: install Ultracode from the Just Every plugin marketplace,
then start a new Codex thread so the newly installed skill is loaded:

```bash
codex plugin marketplace add just-every/plugins
codex plugin add ultracode@just-every
```

The current Codex CLI accepts marketplace sources as local paths,
`owner/repo[@ref]`, HTTPS Git URLs, or SSH Git URLs. The important bit is that
the repository or path must contain a Codex marketplace manifest, not only a
`.codex-plugin/plugin.json` file:

```bash
codex plugin marketplace add ./path/to/marketplace-or-plugin-repo
codex plugin marketplace add owner/repo --ref your-branch
codex plugin add ultracode@<marketplace>
```

If the marketplace lives inside a larger repository, add the source with
`--sparse <path>` so Codex only checks out the relevant subtree. Use
`codex plugin marketplace add --help` and `codex plugin add --help` to confirm
the exact flags supported by your installed Codex version.

After installation, start a new Codex thread and ask Codex to use Ultracode on a
task that deserves parallel investigation.

## More Detail

Most users can stop here. The deeper docs are for maintainers, advanced
workflow authors, and plugin development:

- [docs/technical-reference.md](docs/technical-reference.md) for operational details, local commands,
  updates, and development notes.
- [skills/ultracode/SKILL.md](skills/ultracode/SKILL.md) for the Codex-facing orchestration guidance.
- [skills/ultracode/references/quality-patterns.md](skills/ultracode/references/quality-patterns.md) for verification patterns.
- [skills/ultracode/references/cookbook.md](skills/ultracode/references/cookbook.md) for workflow recipes.
- [skills/ultracode/references/cli.md](skills/ultracode/references/cli.md) for the complete technical reference.
