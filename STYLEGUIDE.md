# Style Guide & Conventions

## CSS Class Naming

Use **component-prefixed** class names to avoid naming collisions.

- Prefix with component/page abbreviation: `kp-page`, `kp-header`, `q-item`, `q-title`, `nav-bar`, `quiz-option`
- Use kebab-case for multi-word classes: `question-title`, `mastery-bar-fill`
- Keep modifier classes simple: `.cat-card.expanded`, `.tag.diff.easy`

**Skip** generic names like `.hints`, `.item`, `.card`, `.header` without a prefix.

## Testing: `data-testid` Over CSS Selectors

E2E tests must use `data-testid` attributes, not CSS class names.

```html
<!-- ✅ Good -->
<button data-testid="submit-btn">提交</button>

<!-- ❌ Bad — test will break on style changes -->
<button class="submit-btn">提交</button>
```

### Naming conventions for data-testid

- Component-level: `page-{name}`, `card-{type}`, `item-{type}`
- Interactive elements: `btn-{action}`, `input-{field}`, `select-{filter}`
- Containers: `list-{items}`, `section-{name}`, `grid-{type}`

### Current testid values used in this project

| testid | Component | Purpose |
|---|---|---|
| `question-item` | Browse | question card in list |
| `question-title` | Quiz | current question title |
| `option-button` | Quiz | choice/true-false option |
| `hints-list` | Quiz | hint list container |
| `page-title` | various | page heading |
| `stats-overview` | Stats | stats dashboard container |
| `category-card` | KnowledgePoints | expandable category |
| `category-header` | KnowledgePoints | category expand trigger |
| `knowledge-item` | KnowledgePoints | single knowledge point |
| `kp-header` | KnowledgePointDetail | detail page header |

## Component Structure

Each Svelte component should follow this order:

1. `<script>` — logic, props, state
2. HTML template
3. `<style>` — scoped component styles (component-prefixed)

Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) consistently.

## Commits

- One logical change per commit. Don't mix formatting with feature work.
- Format (`prettier`) and type-check (`svelte-check`) before committing.
- Pre-commit hook runs prettier on staged files automatically.
