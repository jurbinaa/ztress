# Vendored deepmerge

Copy of `deepmerge@4.3.1` (MIT, TehShrike) with one change: `mergeObject` skips the
`__proto__` key in both the target and source loops (see `dist/cjs.js` and `dist/umd.js`).
This addresses GHSA-gcqx-w48m-w2h4 (prototype poisoning), for which npm has no patched
release. Version is set to 4.3.2, the first version the advisory lists as patched.

Only used at build time (vite-plugin-pwa → workbox-build → @rollup/plugin-node-resolve).
Remove this folder and the `deepmerge@<=4.3.1` override in `pnpm-workspace.yaml` once
upstream publishes a fixed release.
