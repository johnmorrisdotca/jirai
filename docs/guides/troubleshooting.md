---
title: Troubleshooting and FAQ
section: troubleshooting
order: 9
description: Interpret generation errors, null progress, inactive cells and empty deductions.
---

## Interpret the result

| Result | Meaning |
| --- | --- |
| GenerationError `settings` | Invalid field settings or work limits. |
| GenerationError `opening` | This protected opening cannot support the requested field. |
| GenerationError `exhausted` | The bounded attempts/repairs did not produce a proved field. |
| `gameFromProgress` / `decodeOrthogonalGame` → null | Record validation/replay or variant validation failed. |
| `levelNamed` → null | No current level or compatible alias matches. |
| Visible clue → null | Hidden information, even when a player placed a flag. |
| Deduction `reason:none` | No certain move was found by the enabled proof methods. |

## Check the active cells and opening

A shaped field omits cells; a rectangular index can therefore be inactive. Use `activeCell`/`activeCells`. Wrap requires a rectangle. A clear opening can protect every neighbour and leave insufficient room for mines. Do not hide a generation failure by disabling no-guess silently. A restored field must keep its topology, seed, opening and versioned record.

## Browser cleanup

Wait for element load/error events and use the native host methods after initialization. Browser mounts need a real HTMLElement and `destroy()` on removal. React initial options require a new key for a different setup. Existing [README examples](../../README.md#examples) and [embed details](../embeds.md) remain preserved.
