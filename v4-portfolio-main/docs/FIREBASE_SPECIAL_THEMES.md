# Firebase Migration for Special Themes

Date: December 21, 2025

## Summary

Special theme configuration was moved from local browser storage to Firestore.

## What Changed

- Admin save/load now reads and writes `special-themes/config` in Firestore.
- Runtime handler consumes the same shared config.
- Defaults are applied when no remote config exists.

## Benefits

- Cross-device sync
- Central source of truth
- Better operational control
- No local-only drift

## Suggested Firestore Rules

Allow public read if needed, and restrict write to authenticated admins only.

## Operational Notes

- The handler polls configuration periodically.
- Save actions should trigger immediate UI confirmation.
- Keep fallback defaults for resilience.
