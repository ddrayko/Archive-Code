# Special Themes Admin Guide

This page describes the admin workflow for configuring seasonal themes.

## Access

Use `/admin/special-themes` from the dashboard.

## What You Can Do

- View available themes
- Configure start and end dates
- Edit year, month, day, hour, minute, second
- Save configuration to Firebase
- Reset to defaults

## Current Themes

1. New Year
- Description: festive gold theme
- Default window: December 20 to January 2

2. Christmas
- Description: red/green snow theme
- Default window: December 1 to December 26

## Typical Flow

1. Select a theme.
2. Edit start/end dates.
3. Review the preview block.
4. Save changes.
5. Reload and verify activation.

## Storage Format

Data is stored under Firestore `special-themes/config`.

## Notes

- Date validation is applied automatically.
- Config is shared across devices through Firebase.
- The runtime handler checks schedules periodically.
