# ADR-0001: CMS platform and starting point

| | |
|---|---|
| **Status** | **Accepted** |
| **Approved by** | Project owner, 2026-10-19 (recorded in the [m0-004 prompt](../../engineering/prompts/2026/10/2026-10-19-m0-004-safe-git-initialization.prompt.md)) |
| **Date** | 2026-10-19 (recorded from the Milestone 0 audit of the same date) |
| **Task** | `m0-001` · evidence: [`docs/milestones/m0-architecture-and-license-audit.md`](../../milestones/m0-architecture-and-license-audit.md) |

This ADR records, in ADR form, a decision already analysed and documented in Milestone 0. It
introduces no new analysis.

## Context

Assurer World needs a self-hosted, editor-friendly CMS with in-page editing, a draft/publish
workflow and no paid-license dependency.

## Decision

- **ApostropheCMS Community Edition** (`apostrophe` 4.x, MIT). No `@apostrophecms-pro/*` or
  Assembly modules.
- Start from the official **Essentials starter kit** (`starter-kit-essentials@adbcab7`), not the
  Public Demo. The Demo is built on Essentials, adds content models Assurer hasn't asked for,
  and includes `@apostrophecms/import-export`, which carried 8 advisories in October 2026.
- Minimum versions are set by security advisories: `apostrophe ^4.34.0`, `@apostrophecms/form
  ^1.5.6`.
- Server-side JSX templates, as the starter provides; project modules use the `assurer-` prefix.

## Consequences

- All Milestone 0 editing requirements are met without paid modules (see
  `docs/milestones/m0-feature-verification.md`).
- Features that exist only in Pro (for example, fine-grained per-group permissions or automated
  translation) are out of scope unless a future ADR approves them.
- Three transitive advisories have no compatible fix yet (see `m0-security-review.md`). The team
  must track them.
