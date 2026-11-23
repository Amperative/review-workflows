# Amperative review workflows

Public copy of the hardened reusable Claude reviewer audited in Amperative/.github PR #5, source commit `f02f22f6f5e07554572b72bbdd04d2f8f3a9c652`. Public source-copy commit `45a5be608b0e41359196ea1fb98cea838b7a29e3` is byte-identical. No credentials or private application code are published.

Create PRs in draft. Mark a completed PR ready to request one Claude review of the combined proposed diff. Ordinary pushes do not request reviews. Another review is deliberate: return to draft and mark ready again. Address substantive findings through human review; do not rerun just to obtain no comments.

`review-ready-prs.yml` is the sole paid trigger in this repository. The organization compatibility wrapper never invokes Claude. There is no mandatory current-commit review gate or completion-refresh machinery. Normal build/test checks remain separate.

Callers pin the exact source commit authorized in Anthropic. Never trust a branch, tag or path prefix. Preserve owner/event/runner restrictions, service account, scope and 600-second token lifetime. Only bounded diagnostics are logged; JWTs and exchanged tokens remain private.

Merge this bootstrap PR with a merge commit so the explicitly reviewed source-copy commit remains an ancestor of main. Verify ancestry afterward. Repository-wide merge settings remain unchanged.
