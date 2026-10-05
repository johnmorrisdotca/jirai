import { activeCells } from "./shape.ts";
import { hintFor } from "./deduce.ts";
import { boardModel } from "./draw.ts";
import { newGame, play, visibleGame, withBoard } from "./game.ts";
import { MARKS, MOVES, STATUSES } from "./jirai.constants.ts";
import { validCell } from "./grid.ts";
import { gameFromProgress, gameProgress } from "./keep.ts";
import { JIRAI_STYLE } from "./style.ts";
import { words } from "./strings.ts";
import type { Board, Game, Move, Settings } from "./jirai.types.ts";
import type { DrawOptions, JiraiMount, MountOptions } from "./ui.types.ts";

/**
 * One playable board in any element. The engine owns the rules, this module
 * owns presses, focus, the clock and the worker. Destroy removes only its own
 * root, so two mounted boards never take each other's listeners or children.
 */
export function mountJirai(host: HTMLElement, options: MountOptions = {}): JiraiMount {
  const doc = host.ownerDocument;
  let draw: DrawOptions = { material: "ivory", pieces: "flags", language: "en", ...options };
  const game = options.progress === undefined ? newGame(options.settings) : gameFromProgress(options.progress);
  if (game === null) throw new Error("Invalid saved Minesweeper game.");
  let current: Game = game;
  let focus = activeCells(game.settings)[0]!, marking = false, hint: number | null = null;
  let worker: Worker | null = null, pending = false, disposed = false;
  let started: number | null = null, elapsed = 0;
  const root = doc.createElement("div"); root.className = "jr-root";
  const style = doc.createElement("style"); style.textContent = JIRAI_STYLE;
  const stats = doc.createElement("div"); stats.className = "jr-stats";
  const scroll = doc.createElement("div"); scroll.className = "jr-scroll";
  const board = doc.createElement("div"); board.className = "jr-board"; board.setAttribute("role", "group");
  const status = doc.createElement("p"); status.className = "jr-status"; status.setAttribute("role", "status");
  const controls = doc.createElement("div"); controls.className = "jr-controls";
  const help = doc.createElement("p"); help.className = "jr-help";
  const dialog = doc.createElement("dialog"); dialog.className = "jr-dialog";
  const close = doc.createElement("button"); close.className = "jr-button jr-close"; close.type = "button";
  dialog.append(close);
  scroll.append(board); root.append(style, stats, scroll, status, controls, help); host.append(root, dialog);
  let lastOpener: HTMLElement | null = null;
  const leaveDialog = (): void => { root.append(stats, scroll, status, controls, help); lastOpener?.focus(); };
  dialog.addEventListener("close", leaveDialog);
  close.addEventListener("click", () => dialog.close());
  function stopWorker(): void { worker?.terminate(); worker = null; pending = false; }
  function clock(): number { return elapsed + (started === null ? 0 : Math.floor((Date.now() - started) / 1000)); }
  function report(next: Game): void {
    const before = current.status;
    current = next; hint = null;
    if (started === null && current.board !== null && current.status === STATUSES.playing) started = Date.now();
    if (current.status === STATUSES.won || current.status === STATUSES.lost) { elapsed = clock(); started = null; }
    const detail = structuredClone(current);
    host.dispatchEvent(new CustomEvent("jirai-change", { detail })); options.onChange?.(detail);
    if (before !== current.status && (current.status === STATUSES.won || current.status === STATUSES.lost)) {
      host.dispatchEvent(new CustomEvent("jirai-finish", { detail })); options.onFinish?.(detail);
    }
    render();
  }
  function failed(error: Error): void { stopWorker(); render(); status.textContent = words(draw.language).error; options.onError?.(error); }
  function make(move: Move): void {
    if (disposed || pending) return;
    if (move.kind === MOVES.reveal && current.board === null && current.marks[move.cell] !== MARKS.flag && validCell(current.settings, move.cell)) {
      pending = true; render();
      try {
        worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<{ board?: Board; error?: string }>) => {
          if (disposed) return;
          stopWorker();
          if (event.data.board === undefined) { failed(new Error(event.data.error ?? "Generation failed.")); return; }
          try { report(play(withBoard(current, event.data.board), move)); } catch (error) { failed(error as Error); }
        };
        worker.onerror = () => failed(new Error("The board worker could not load. Serve the package over HTTP, and allow workers in your content security policy."));
        worker.postMessage({ settings: current.settings, first: move.cell });
      } catch (error) { failed(error as Error); }
      return;
    }
    try { const next = play(current, move); if (next !== current) report(next); } catch (error) { failed(error as Error); }
  }
  function showHint(): void {
    if (pending || current.status !== STATUSES.playing) return;
    const result = hintFor(visibleGame(current));
    const safe = result.safe.find((cell) => current.marks[cell] !== MARKS.open);
    const mine = result.mines.find((cell) => current.marks[cell] !== MARKS.flag);
    const highlighted = safe ?? mine ?? null;
    if (highlighted !== null && !current.helped) report({ ...current, helped: true });
    hint = highlighted;
    render();
    const say = words(draw.language);
    status.textContent = hint === null ? say.hintNone : `${safe !== undefined ? say.hintSafe : say.hintMine} ${result.reason === "none" ? "" : say[result.reason]}`;
  }
  function renderStats(): void {
    const say = words(draw.language);
    const values = [[say.mines, current.settings.mines - current.marks.filter((m) => m === MARKS.flag).length], [say.time, `${Math.floor(clock() / 60)}:${String(clock() % 60).padStart(2,"0")}`], [say.moves, current.moves.length]];
    stats.replaceChildren(...values.map(([label, value]) => {
      const part = doc.createElement("span"); part.className = "jr-stat";
      const name = doc.createElement("small"); name.textContent = String(label);
      const number = doc.createElement("strong"); number.textContent = String(value);
      part.append(name, number); return part;
    }));
  }
  function render(): void {
    if (disposed) return;
    const say = words(draw.language);
    root.dataset.material = draw.material; root.dataset.grid = current.settings.grid; root.dataset.shape = current.settings.shape ?? "rectangle"; root.lang = draw.language ?? "en";
    board.setAttribute("aria-label", say.board); board.setAttribute("aria-busy", String(pending));
    const model = boardModel(current, { ...draw, hint });
    const active = doc.activeElement instanceof HTMLElement && board.contains(doc.activeElement);
    board.style.aspectRatio = `${model.width} / ${model.height}`;
    board.style.minWidth = `${model.width * 27}px`;
    board.replaceChildren(...model.cells.map((cell) => {
      const button = doc.createElement("button"); button.type = "button"; button.className = "jr-cell";
      button.dataset.cell = String(cell.cell); button.dataset.kind = cell.kind; button.dataset.hint = String(cell.hint);
      button.dataset.number = cell.kind === MARKS.open ? cell.text : "";
      button.setAttribute("aria-label", cell.label); button.tabIndex = cell.cell === focus ? 0 : -1;
      button.disabled = pending; button.textContent = cell.text;
      button.style.left = `${cell.x / model.width * 100}%`; button.style.top = `${cell.y / model.height * 100}%`;
      button.style.width = `${cell.width / model.width * 100}%`; button.style.height = `${cell.height / model.height * 100}%`;
      return button;
    }));
    if (active) board.querySelector<HTMLButtonElement>(`[data-cell="${focus}"]`)?.focus({ preventScroll: true });
    renderStats(); status.textContent = pending ? say.checking : say[current.status]; help.textContent = say.help; close.textContent = say.close;
    controls.replaceChildren();
    if (options.controls === false) { stats.hidden = true; status.hidden = true; help.hidden = true; return; }
    const button = (text: string, action: () => void): HTMLButtonElement => {
      const made = doc.createElement("button"); made.type = "button"; made.className = "jr-button"; made.textContent = text;
      made.addEventListener("click", action); controls.append(made); return made;
    };
    button(say.restart, () => handle.restart());
    const mark = button(marking ? say.mark : say.reveal, () => { marking = !marking; render(); }); mark.setAttribute("aria-pressed", String(marking));
    const hinted = button(say.hint, showHint); hinted.disabled = pending || current.status !== STATUSES.playing;
    if (!dialog.open) button(say.view, () => { lastOpener = doc.activeElement as HTMLElement; dialog.append(stats, scroll, status, controls); dialog.showModal(); render(); });
  }
  function cellOf(event: Event): number | null {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-cell]") : null;
    return target === null ? null : Number(target.dataset.cell);
  }
  let hold: ReturnType<typeof setTimeout> | null = null, held = false, origin = { x: 0, y: 0 };
  const cancelHold = (): void => { if (hold !== null) clearTimeout(hold); hold = null; };
  board.addEventListener("pointerdown", (event) => {
    held = false; cancelHold(); const cell = cellOf(event); if (cell === null) return;
    focus = cell; origin = { x: event.clientX, y: event.clientY };
    if (event.pointerType !== "mouse") hold = setTimeout(() => { held = true; make({ kind: MOVES.mark, cell }); }, 450);
  });
  board.addEventListener("pointermove", (event) => { if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) cancelHold(); });
  board.addEventListener("pointerup", cancelHold); board.addEventListener("pointercancel", cancelHold);
  board.addEventListener("click", (event) => { const cell = cellOf(event); if (cell !== null && !held) { focus = cell; make({ kind: marking ? MOVES.mark : MOVES.reveal, cell }); } held = false; });
  board.addEventListener("contextmenu", (event) => { event.preventDefault(); cancelHold(); const cell = cellOf(event); if (cell !== null && !held) { focus = cell; make({ kind: MOVES.mark, cell }); } held = false; });
  board.addEventListener("keydown", (event) => {
    const cell = cellOf(event); if (cell === null) return;
    const x = cell % current.settings.width, y = Math.floor(cell / current.settings.width);
    const shifts: Record<string, number> = { ArrowLeft: x > 0 ? -1 : 0, ArrowRight: x < current.settings.width - 1 ? 1 : 0, ArrowUp: y > 0 ? -current.settings.width : 0, ArrowDown: y < current.settings.height - 1 ? current.settings.width : 0 };
    if (event.key in shifts) { event.preventDefault(); const step = shifts[event.key]!;
      let next = cell + step;
      while (step !== 0 && next >= 0 && next < current.marks.length && !validCell(current.settings, next)) {
        if (Math.abs(step) === 1 && Math.floor(next / current.settings.width) !== y) break;
        next += step;
      }
      if (validCell(current.settings, next) && (Math.abs(step) !== 1 || Math.floor(next / current.settings.width) === y)) focus = next;
      render(); board.querySelector<HTMLButtonElement>(`[data-cell="${focus}"]`)?.focus(); }
    else if (event.key === " " || event.key.toLowerCase() === "f") { event.preventDefault(); focus = cell; make({ kind: MOVES.mark, cell }); }
    else if (event.key === "Enter") { event.preventDefault(); focus = cell; make({ kind: MOVES.reveal, cell }); }
  });
  const timer = setInterval(() => { if (started !== null && !disposed) renderStats(); }, 1000);
  const handle: JiraiMount = {
    game: () => structuredClone(current), progress: () => gameProgress(current), play: (cell, mark = false) => make({ kind: mark ? MOVES.mark : MOVES.reveal, cell }), hint: showHint,
    restart: () => { if (disposed) return; stopWorker(); elapsed = 0; started = null; report(newGame(current.settings)); },
    load: (settings: Settings, progress?: string) => {
      if (disposed) return;
      const restored = progress === undefined ? newGame(settings) : gameFromProgress(progress);
      if (restored === null) throw new Error("Invalid saved Minesweeper game.");
      stopWorker(); elapsed = 0; started = null; focus = activeCells(restored.settings)[0]!; report(restored);
    },
    set: (changes) => { draw = { ...draw, ...changes }; render(); },
    destroy: () => { disposed = true; stopWorker(); cancelHold(); clearInterval(timer); if (dialog.open) dialog.close(); root.remove(); dialog.remove(); },
  };
  if (current.status === STATUSES.playing) started = Date.now();
  render(); return handle;
}
