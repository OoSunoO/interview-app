# Interview App — Project Conventions

## Stack

- Frontend: Svelte 5 (runes), Vite, GitHub Pages
- Backend: Python FastAPI, SQLite
- Testing: Vitest (unit), Playwright (E2E)
- Formatting: Prettier (via pre-commit)

## Dev Workflow Checklist

Before making changes:

1. **Grep first** — Search for CSS classes, component props, and API types before renaming them
2. **Check E2E selectors** — If you change a component's structure, verify test selectors still work
3. **Run CI checks locally** — `npm run format:check && npm run check && npm test` before committing
4. **One change per batch** — Don't mix formatting/refactoring with feature work in the same commit
5. **Verify environment** — Check existing config (pre-commit, .gitignore, CI) before adding new tooling

## CSS Conventions

See `STYLEGUIDE.md` for:
- Component-prefixed CSS class names (NOT generic like `.hints`, `.item`)
- Use `data-testid` attributes for E2E test selectors
- Scoped `<style>` per component

## Commit Style

- `feat:` — new feature
- `fix:` — bug fix
- `style:` — formatting, CSS changes only
- `chore:` — tooling, CI, config
- `refactor:` — restructuring code without behavior change
- `docs:` — documentation only

## Handoff Protocol

When suspending work mid-task:
1. Write a HANDOFF.md at project root
2. Commit or stash all current work
3. List next steps and known risks in the handoff

## Plan Lifecycle

- Each plan has an owner and a status (Active / Stalled / Done / Cancelled)
- Stalled plans get reviewed monthly
- No implementation without a review gate
