# Minesweeper embeds

The builder writes code using the installed package's major version. Every observed attribute is represented or has an explicit coverage reason. It offers cols, rows, mines, seed, grid, shape, no-guess, opening, daily, material, pieces, controls, size, width, theme, lang and label. Settings are validated before a preview; copied URLs retain all choices, including disabled defaults.

## Compatibility and host code

The old width (3–60) and height attributes still count cells. Use cols and rows for new code, leaving width for pixels (above 60). Grid remains the square/orthogonal/hex/wrap topology. Symbolic sizes select 320/480/640px and fit within the parent. Theme is auto/light/dark; the default follows the device. Label supplies a screen-reader group name and restores the previous role/name when removed. Boolean attributes accept false, off, no and 0.

Attributes have reflected properties (noGuess reflects no-guess); native lang already reflects its attribute. Game operations remain game(), progress(), play(cell, mark), hint(), restart(), load(settings, progress) and set(appearance). Assigning progress restores saved play while progress() remains callable. options accepts settings, progress, hint and lifecycle callbacks. Updating callbacks or appearance preserves play. defineBoard(tagName?, registry?) is server-safe and registers a subclass under a custom tag; defineJirai(registry?) remains compatible.

## Daily play and events

Daily accepts today, YYYY-MM-DD, an empty enabled attribute, or off aliases. Dates are UTC; invalid calendar dates produce a visible status and jirai-error. It selects a seed from the date and complete rules. The first opened cell still affects the deal: two players need the same first cell to get the same field. No rollover timer or storage is used. A restored progress code takes precedence over daily settings.

jirai-load carries settings and day. Existing jirai-change and jirai-finish carry the unchanged structured game, including its answer; keep those within trusted host code. jirai-error carries a plain message object. All events bubble, cross shadow roots and have JSON-safe detail. Host callbacks preserve their original signatures. Frames forward the same detail in { type, detail } messages; receivers should check the sender's origin and frame.

## Frame route

embed/ validates enum choices, bounded integers, real UTC dates and saved progress. Invalid fields are ignored; invalid combined dimensions/rules fall back to the default field. It has noindex, transparent margins, a device colour-scheme and no document scrolling. Large boards keep their native board panning. Only local package files are loaded; copied package imports use jsDelivr. Saved play and callbacks are kept out of the public builder setup.
