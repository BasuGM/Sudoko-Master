# Sudoku Master

A client-side Sudoku game. The board is the product: warm paper, one accent, and hints that explain the logic instead of handing over the answer.

## Play

- Four difficulties, rated by the hardest technique a human-style solver needs. Easy stays with singles. Medium uses pairs, pointing, and box/line reduction. Hard uses triples or an X-Wing. Expert uses a swordfish, an XY-Wing, or a longer chain of hard steps.
- Every generated puzzle has one solution, and the logical solver can finish it.
- Keyboard, number pad, notes, undo, redo, pause, check, and a daily puzzle seeded by the UTC date.
- Progress, streaks, and achievements stay in `localStorage`.

## Scripts

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run test:e2e
```

Playwright needs a browser once: `npx playwright install chromium`.

## Layout

- `src/engine` is pure TypeScript. It does not import React. Grids are 81-cell arrays. Candidates are 9-bit masks.
- `src/store` holds the game, the timer, settings, and statistics in Zustand. The timer is not read by the board, so a ticking clock does not repaint 81 cells.
- `src/app` is the Next.js App Router. The game, daily, learn, progress, and settings screens are client views inside a shared shell.

## Generation

Puzzles are carved from a filled grid with a seeded mulberry32 generator. A removal is kept only while the logical solver still reaches the original solution. The daily seed is `sudoku-master-daily-v1:YYYY-MM-DD`.
