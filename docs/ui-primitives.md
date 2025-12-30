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
  `CardList`, `TagList`, `Chip`)
- `navigation/` – `SidebarNav`, `TopNavBar`, `Breadcrumbs`
- `feedback/` – `InlineAlert`, `SectionStatus`
- `overlay/` – `ModalDialog`, `SidePanel`
- `constants.ts` – Bootstrap class strings, variants, aria labels, and
  `data-testid` definitions
- `types.ts` – Prop contracts for every primitive
- `utils/` – shared helpers (`composeClassNames`, `VisibilityGate`)

## Usage Notes

- Always import from `src/ui` barrel to keep boundaries clean.
- Pass ability or permission props to hide/disable primitives
  automatically.
- Use the exported constants when adding new primitives; do not hardcode
  Bootstrap classes or data-test ids.
- Tests live in `test/ui/**` and mirror the source structure; when
  adding a primitive, add a focused test that verifies Bootstrap classes,
  variant handling, and gating behaviour.
