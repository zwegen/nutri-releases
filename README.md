# Nutri Android App Source

This folder is a GitHub-ready source snapshot of the Nutri Android app.

It intentionally contains only a tiny sample nutrition dataset so the app can be opened and inspected without publishing the private/full data files.

## Included

- Android project source
- WebView app assets (`index.html`, `app.js`, `styles.css`)
- App images/resources
- UI/nutrient label translations
- Small sample food dataset:
  - `app/src/main/assets/usad_all.json`
  - `app/src/main/assets/foods_usad_index.json`
  - `app/src/main/assets/usad_data/`
  - `app/src/main/assets/i18n/foods.*.json`

## Not included

- Full nutrition database
- Release APKs/AABs
- Signing keys/certificates
- Backups and generated build folders
- Local machine config (`local.properties`)

## Build

Install Android SDK + JDK 17, then run:

```bash
./gradlew assembleDebug
```

For release builds, create and keep your own signing key outside git.

License: GPL-3.0
