# Tree / DirectoryTree controlled expansion reproduction

This minimal example uses `antdv-next@1.8.3`, Vue `3.5.45`, and an override fixing `@v-c/tree` at `1.2.6` so that the published-package reproduction remains reproducible after a new core release.

## Run

Use Node.js 22.18+ or 24+.

```bash
npm ci
npm run dev
```

Open the Vite URL shown in the terminal.

1. Both trees receive `expandedKeys=[]` and `defaultExpandAll=true` on mount. They should both be collapsed, but the published version expands both folders.
2. Click **全部收起** (collapse all). This assigns a fresh empty array, and both trees collapse even though the controlled value is logically unchanged.
3. Click **重新挂载** (remount). The published version expands both trees again while the parent value remains `[]`.
4. Add `?open=a` to check partial controlled expansion. Only the first folder should be expanded.
5. Add `?defaults=none` as a control case with `defaultExpandAll=false`.

`main.js` is the runnable reproduction source. The buttons are Antdv Next `Button` components.

## Browser snapshots

The `snapshots/` folder contains standalone builds. After cloning this branch, each `index.html` can be opened directly without installing dependencies.

| Folder | Antdv Next | `@v-c/tree` | Expected scope |
| --- | --- | --- | --- |
| `published` | npm 1.8.3 | npm 1.2.6 | Both initializers reproduce the bug |
| `directory` | local DirectoryTree patch | npm 1.2.6 | Only DirectoryTree is fixed |
| `core` | npm 1.8.3 | local core patch | Only ordinary Tree is fixed |
| `combined` | local DirectoryTree patch | local core patch | Both components are fixed |

The UI patch is based on `antdv-next/antdv-next@a8d67935a54f5957d59e358eef6681bd3f0ee670`; the core patch is based on `antdv-next/vue-components@019246a6801b41af1ace4e6ec0d938f9bf485caf`.

The screenshots in `screenshots/` show initial mount with `expandedKeys=[]`, at viewport widths 1200 and 390. The same four variants were checked in Chrome 158.0.8127.37, covering empty/partial keys, default expansion on/off, controlled updates, and remounts: 32 browser cases passed.

The DirectoryTree patch works with the released core package. The ordinary Tree fix needs the separate core change to be merged, released, and installed by consumers.
