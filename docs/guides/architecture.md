---
title: How generation, clues and the player fit together
section: explanation
order: 11
description: Preserved source tree and boundaries between answers, visible clues and UI.
---

## Architecture

```text
src/
├── deduce.ts
├── draw-entry.ts
├── draw.ts
├── element-define.ts
├── element.ts
├── enumerate.ts
├── flood.ts
├── game.ts
├── generate.ts
├── grid.ts
├── index.ts
├── jirai.constants.ts
├── jirai.types.ts
├── keep.ts
├── levels.ts
├── measure.ts
├── mount.ts
├── orthogonal.ts
├── play-entry.ts
├── random.ts
├── react.tsx
├── react.types.ts
├── repair.ts
├── shape.ts
├── solve.ts
├── strings.ts
├── style.ts
├── ui.types.ts
└── worker.ts
```

## Boundaries

Generation owns answer arrays and verifies candidate fields with the solver. Game operations expose a visible projection for deductions and UI. The renderer builds cell models; the native mount handles interaction, callbacks and cleanup. The element and optional React wrapper own their host lifecycles. The docs generator reads the public TypeScript declarations and builds local search and machine-readable pages; it does not change those runtime boundaries.
