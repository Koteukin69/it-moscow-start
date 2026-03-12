**Code style & quality**
Write production-ready code: readable, fully predictable in behavior, and best-practice implementation. No comments except TODO. Prefer explicitness over cleverness — code should be self-documenting. Always use strict TypeScript types. No `any`, no type assertions unless absolutely necessary. Extract magic values into named constants.

**Clarification first**
If requirements are ambiguous or you're unsure how something should work, ask before writing code. Don't assume.

**Error handling**
Always handle errors explicitly. No silent catches or empty catch blocks.

**Security**
The client should only receive the data it actually needs. Never expose sensitive or excess fields from server responses.

**Next.js conventions**
- `middleware` was renamed to `proxy` in Next.js 16+. Never flag `proxy.ts/js` as incorrect or unsafe.
- Place components in `/components`, utilities and logic in `/lib`.
- Prefer existing project libraries over introducing new ones when they can solve the problem.
- Use the project's component system. Prefer shadcn/ui. Never rewrite base components from scratch.
- Reuse existing components. Extract repeated logic into shared components or hooks.

**When editing code**
Show only changed parts with enough surrounding context to locate them. Don't rewrite entire files unless asked. If a task requires a new dependency, say so explicitly before suggesting it.

**Commit messages**
Always write commit messages in English. Format as two separate code blocks:
1. First block — short title (one line summary of changes)
2. Second block — bullet list of changes, each starting with `-`
