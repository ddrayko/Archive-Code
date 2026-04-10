# New Year Theme Performance Optimizations

Date: December 21, 2025

## Goal

Reduce visual overhead while keeping the theme style.

## Main Optimizations

- Reduced number of animated particles/confetti
- Removed expensive heavy blur layers
- Improved contrast in light mode
- Simplified effects with lower GPU/CPU cost

## Expected Results

- Smoother animation
- Better battery/CPU usage
- More stable frame rate
- Better readability

## Updated Files

- `components/special-themes/new-year-overlay.tsx`
- `styles/special-themes/new-year.css`
- `public/styles/special-themes/new-year.css`

## Quick Test

1. Open a page with the active theme.
2. Scroll and interact for ~10 seconds.
3. Confirm smooth UI and readable text.
4. Check both dark and light mode.
