# Desktop build

The desktop package wraps the existing Web build with Electron and stores data
in `mind-map-store.json` under Electron's per-user application data directory.

## Local commands

```sh
npm install
npm run smoke
npm run package:win
npm run package:mac
```

Windows builds produce an x64 NSIS `.exe`. macOS builds produce x64 and arm64
`.dmg` files plus `.zip` archives containing the `.app` bundles. Build each
target on its native operating system. Code signing and Apple notarization are
intentionally not configured.
