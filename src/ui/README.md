# UI Primitives

This directory provides the admin panel's reusable presentation
components. The primitives wrap Bootstrap elements, respect app-wide
ability and permission gates, and expose stable `data-testid` hooks for
tests.

## Structure

- `layout/` – containers such as `AppShell`, `Page`, `Stack`,
  `SidebarLayout`
- `typography/` – text helpers (`Heading`, `BodyText`, `KeyValueList`,
  `EmptyState`)
- `forms/` – layout wrappers plus React Hook Form fields (`FormField`,
  `CheckboxField`, `DateField`)
- `data/` – tabular and summary widgets (`DataTable`, `TableToolbar`,
  `CardList`, `TagList`, `Chip`, `CopyableValue`)
- `actions/` – action affordances (`RefreshActionButton`, `CopyButton`,
  `useCopyToClipboard`)
- `navigation/` – `SidebarNav`, `TopNavBar`, `Breadcrumbs`, `EntityLink`
- `feedback/` – `InlineAlert`, `SectionStatus`
- `overlay/` – `ModalDialog`, `SidePanel`
- `constants.ts` – Bootstrap class strings, variants, aria labels, and
  `data-testid` definitions
- `types.ts` – Prop contracts for every primitive
- `utils/` – shared helpers (`composeClassNames`, `VisibilityGate`)

## Cross-cutting legos

- **Click-to-copy.** `CopyableValue` renders any important value (license
  keys, emails, domains, IDs, one-time tokens) with an inline `CopyButton`.
  Both are constants-driven and require no per-call wiring — prefer them over
  bespoke copy buttons. The underlying `useCopyToClipboard` hook handles the
  async Clipboard API with an `execCommand` fallback and transient feedback.
- **Entity cross-links.** `EntityLink` is the presentational link primitive.
  The connected `EntityCrossLink` (in `app/navigation`) resolves an entity
  `kind` + value against the entity-link registry (`app/navigation/entityLinks`)
  and, on activation, seeds the destination table's search and raises a
  navigation intent so related data opens pre-filtered — no manual tab-switch
  and re-filtering. Add a new relationship by extending the registry, never by
  hand-rolling a one-off link.

## Usage Notes

- Always import from `src/ui` barrel to keep boundaries clean.
- Pass ability or permission props to hide/disable primitives
  automatically.
- Use the exported constants when adding new primitives; do not hardcode
  Bootstrap classes or data-test ids.
- Tests live in `test/ui/**` and mirror the source structure; when
  adding a primitive, add a focused test that verifies Bootstrap classes,
  variant handling, and gating behaviour.
