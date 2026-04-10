# Special Themes System

This system enables temporary seasonal themes without modifying the base UI styles.

## Architecture

- `components/special-theme-handler.tsx`: runtime detection and CSS loading
- `components/special-themes/*`: optional visual overlays
- `styles/special-themes/*`: source CSS
- `public/styles/special-themes/*`: public CSS served at runtime

## Current Theme Windows

- New Year: Dec 20 -> Jan 2
- Christmas: Dec 1 -> Dec 26

## Runtime Behavior

1. Check current date against configured windows.
2. Add/remove theme class on `<html>`.
3. Dynamically attach/detach corresponding CSS file.
4. Render optional overlay components.

## Add a New Theme

1. Create CSS in `styles/special-themes/`.
2. Copy CSS to `public/styles/special-themes/`.
3. Add detection logic in `special-theme-handler.tsx`.
4. Optionally add a dedicated overlay component.

## Best Practices

- Keep theme styles isolated with prefixed classes.
- Avoid editing global base styles for seasonal effects.
- Always test both activation and deactivation.
