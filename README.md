# Amperative review workflows

Public copy of the reusable Claude review workflow audited in Amperative/.github PR #5, source commit `f02f22f6f5e07554572b72bbdd04d2f8f3a9c652`. Public Amperative repositories can call the same reviewed workflow. No credentials or private application code are published.

Callers must pin the exact source commit authorized in Anthropic. Workflow changes require review and explicit approval of a new exact-commit trust entry. Never trust a branch, tag or path prefix. JWTs and exchanged tokens remain private; only bounded diagnostic categories may be logged.

## Review requests

Create PRs in draft. Mark a completed revision ready to request a review; return to draft while making fixes, then mark ready again. Pushes still run ordinary build/test checks, but do not invoke Claude.

The organization wrapper only checks review freshness, using a successful exact-source model job plus a posted review for the current commit. The local `review-ready-prs.yml` caller is the sole paid-review trigger, so there are no duplicate model requests. A non-draft PR opened directly or changed after review fails freshness until explicitly reviewed. If GitHub misses the wrapper's ready event, rerun its lightweight failed check after the requested review completes.

The hardened public source is pinned at `45a5be608b0e41359196ea1fb98cea838b7a29e3`; its contents match the upstream audited source exactly. Its bounded exact-commit access grant was explicitly approved and saved on November 22, 2026. Runtime commands after tool isolation use absolute paths and explicit repository API endpoints; they do not depend on the checkout directory.

Merge evidence must come from a caller identical to its base-branch version, with the expected exact reviewer reference supplied by the trusted wrapper. Caller upgrades cannot certify themselves and require the audited owner exception after independent review. Non-draft fork and Dependabot PRs need maintainer review handling; they do not silently pass freshness. The lightweight gate waits up to ten minutes on ready events and never obtains provider credentials.

The freshness gate is enforced through the active organization ruleset's protected-main workflow path, not a check-name match or the PR's own editable copy. Draft freshness reports review-not-requested rather than skipped success. Polling uses bounded recent runs, cached immutable content/job evidence, and a thirty-second interval. Public contract CI verifies audited source bytes, the caller/gate pin agreement, and that only the local ready caller can invoke the model.
