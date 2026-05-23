# Table batch bus

Shared batch-selection and batch-action layer for admin `DataTable` panels.

## Usage

```tsx
import { TABLE_BATCH_TABLE_LICENSES, useTableBatchBus } from '../data/tableBatchBus'

const { selection, batchBar } = useTableBatchBus({
  tableId: TABLE_BATCH_TABLE_LICENSES,
  enabled: canDelete,
  visibleRows: rows,
  rowKey: (row) => row.id,
  context: { client, currentUser, onRefresh },
})

<TableControls batch={batchBar} /* search, filters, actions */ />
<DataTable selection={selection} /* ... */ />
```

## Registered tables

| `tableId` | Panel | Batch actions |
|-----------|--------|----------------|
| `licenses` | License management | Soft delete |
| `releases` | Releases | Delete (non-promoted) |
| `products` | Product management | Deactivate, suspend, resume |
| `users` | User management | Delete |
| `tenants` | Tenant management | Suspend, resume |
| `product-tiers` | Product tiers | Delete |
| `entitlements` | Product entitlements | Delete |
| `agent-credentials` | Agent credential history modal | Revoke |
| `protection-build-tokens` | Product protection build tokens modal | Revoke |

Add a new table by extending `types.ts`, action builders in
`buildTableBatchActions.tsx`, API hooks in `useAdminBatch.ts`, and wiring the
panel with `useTableBatchBus`.
