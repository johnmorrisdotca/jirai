import { DEFAULT_SETTINGS } from "./jirai.constants.ts";
import { mountJirai } from "./mount.ts";
import { embedDay } from "./embed-day.ts";
import { dailySeed } from "./keep.ts";
import type { Game, Grid, Language, Material, Pieces, Settings } from "./jirai.types.ts";
import type { JiraiMount, MountOptions } from "./ui.types.ts";
const ElementBase = typeof HTMLElement === "undefined" ? class {} as typeof HTMLElement : HTMLElement;
const isOn = (value: string | null, fallback = true): boolean => value === null ? fallback : !["off", "false", "no", "0"].includes(value.trim().toLowerCase());
/** The real mounted options, checked by TypeScript and the builder.
 * @example
 * ```ts
 * import { JIRAI_EMBED_OPTION_KEYS } from "@johnmorrisdotca/jirai/element";
 * console.log(typeof JIRAI_EMBED_OPTION_KEYS); // object
 * ```
 */
export const JIRAI_EMBED_OPTION_KEYS = Object.keys({ settings: true, progress: true, controls: true, material: true, pieces: true, language: true, hint: true, onChange: true, onFinish: true, onError: true } satisfies Record<keyof MountOptions, boolean>);
/** Host settings, saved play and callbacks; visual attributes override settings.
 * @example
 * ```ts
 * import type { JiraiElementOptions } from "@johnmorrisdotca/jirai/element";
 * const options: JiraiElementOptions = {};
 * console.log(Object.keys(options).length); // 0
 * ```
 */
export type JiraiElementOptions = Pick<MountOptions, "settings" | "progress" | "hint" | "onChange" | "onFinish" | "onError">;
/** A Minesweeper board with reflected settings, UTC daily play and native events.
 * @example
 * ```ts
 * import { JiraiElement } from "@johnmorrisdotca/jirai/element";
 * console.log(JiraiElement.observedAttributes.includes("lang")); // true
 * ```
 */
export class JiraiElement extends ElementBase {
  #mounted: JiraiMount | null = null;
  #key = "";
  #options: JiraiElementOptions = {};
  #widthBefore: string | null = null;
  #widthOwned = false;
  #labelBefore: { role: string | null; label: string | null } | null = null;
  static observedAttributes = ["cols", "rows", "width", "height", "mines", "seed", "grid", "shape", "no-guess", "opening", "material", "pieces", "lang", "controls", "size", "theme", "daily", "label", "progress"];
  #write(name: string, value: unknown): void { if (value === null || value === undefined) this.removeAttribute(name); else this.setAttribute(name, String(value)); }
  /** Host settings and callbacks. Callback changes preserve the current game. */
  get options(): JiraiElementOptions { return this.#options; }
  set options(value: JiraiElementOptions) { this.#options = value ?? {}; if (this.isConnected) this.#refresh(); }
  connectedCallback(): void { this.#refresh(); }
  disconnectedCallback(): void { this.#mounted?.destroy(); this.#mounted = null; this.#key = ""; }
  attributeChangedCallback(): void { if (this.isConnected) this.#refresh(); }
  /** The `cols` attribute, reflected. */
  get cols(): string | null { return this.getAttribute("cols"); }
  set cols(value: string | number | boolean | null | undefined) { this.#write("cols", value); }
  /** The `rows` attribute, reflected. */
  get rows(): string | null { return this.getAttribute("rows"); }
  set rows(value: string | number | boolean | null | undefined) { this.#write("rows", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { this.#write("width", value); }
  /** The `height` attribute, reflected. */
  get height(): string | null { return this.getAttribute("height"); }
  set height(value: string | number | boolean | null | undefined) { this.#write("height", value); }
  /** The `mines` attribute, reflected. */
  get mines(): string | null { return this.getAttribute("mines"); }
  set mines(value: string | number | boolean | null | undefined) { this.#write("mines", value); }
  /** The `seed` attribute, reflected. */
  get seed(): string | null { return this.getAttribute("seed"); }
  set seed(value: string | number | boolean | null | undefined) { this.#write("seed", value); }
  /** The `grid` attribute, reflected. */
  get grid(): string | null { return this.getAttribute("grid"); }
  set grid(value: string | number | boolean | null | undefined) { this.#write("grid", value); }
  /** The `shape` attribute, reflected. */
  get shape(): string | null { return this.getAttribute("shape"); }
  set shape(value: string | number | boolean | null | undefined) { this.#write("shape", value); }
  /** The `no-guess` attribute, reflected. */
  get noGuess(): string | null { return this.getAttribute("no-guess"); }
  set noGuess(value: string | number | boolean | null | undefined) { this.#write("no-guess", value); }
  /** The `opening` attribute, reflected. */
  get opening(): string | null { return this.getAttribute("opening"); }
  set opening(value: string | number | boolean | null | undefined) { this.#write("opening", value); }
  /** The `material` attribute, reflected. */
  get material(): string | null { return this.getAttribute("material"); }
  set material(value: string | number | boolean | null | undefined) { this.#write("material", value); }
  /** The `pieces` attribute, reflected. */
  get pieces(): string | null { return this.getAttribute("pieces"); }
  set pieces(value: string | number | boolean | null | undefined) { this.#write("pieces", value); }
  /** The `controls` attribute, reflected. */
  get controls(): string | null { return this.getAttribute("controls"); }
  set controls(value: string | number | boolean | null | undefined) { this.#write("controls", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { this.#write("size", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { this.#write("theme", value); }
  /** The `daily` attribute, reflected. */
  get daily(): string | null { return this.getAttribute("daily"); }
  set daily(value: string | number | boolean | null | undefined) { this.#write("daily", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { this.#write("label", value); }
  /** Reads the current game, including its answer; keep it within trusted host code. */
  game(): Game | null { return this.#mounted?.game() ?? null; }
  /** Reads the saved play. Assignment restores the `progress` attribute, while calls remain compatible. */
  get progress(): () => string { return () => this.#mounted?.progress() ?? ""; }
  set progress(value: string | (() => string)) { if (typeof value === "string") this.#write("progress", value); }
  /** Reveals or marks a cell, following the native engine's safe-opening rule. */
  play(cell: number, mark = false): void { this.#mounted?.play(cell, mark); }
  /** Shows a proved hint. */
  hint(): void { this.#mounted?.hint(); }
  /** Starts the same board again. */
  restart(): void { this.#mounted?.restart(); }
  /** Loads host settings and an optional saved play. */
  load(settings: Settings, progress?: string): void { this.options = { ...this.#options, settings, progress }; }
  /** Changes appearance using the existing mount API. */
  set(options: Parameters<JiraiMount["set"]>[0]): void { this.#mounted?.set(options); }
  #frame(): void {
    this.style.display = "block"; this.style.maxWidth = "100%";
    const width = Number(this.getAttribute("width")), size = this.getAttribute("size");
    // Old widths are cell counts (3–60). Pixel widths begin above that domain.
    const pixels = this.hasAttribute("width") && width > 60 && Number.isFinite(width) ? Math.min(width, 2000) : size === "small" ? 320 : size === "medium" ? 480 : size === "large" ? 640 : null;
    if (pixels !== null) { if (!this.#widthOwned) this.#widthBefore = this.style.width; this.#widthOwned = true; this.style.width = `${pixels}px`; }
    else if (this.#widthOwned) { this.style.width = this.#widthBefore ?? ""; this.#widthOwned = false; }
    const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
    this.setAttribute("data-jirai-embed", "");
    const root = this.getRootNode(), target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : this.ownerDocument.head;
    if (target.querySelector("style[data-jirai-embed-style]") === null) {
      const style = this.ownerDocument.createElement("style"); style.setAttribute("data-jirai-embed-style", "");
      const dark = '[data-jirai-embed] .jr-root{--jr-ui-ink:#f3f0e5;--jr-ground:#252e32;--jr-cover:#455359;--jr-open:#303c41;--jr-line:#62747a;--jr-ink:#f3f0e5;--jr-accent:#b7d298}[data-jirai-embed] .jr-cell[data-kind=open]{color:#e8e6bd}';
      style.textContent = dark.replaceAll('[data-jirai-embed]', '[data-jirai-embed][theme="dark"]') + '@media(prefers-color-scheme:dark){' + dark.replaceAll('[data-jirai-embed]', '[data-jirai-embed]:not([theme="light"]):not([theme="dark"])') + '}'; target.append(style);
    }
    if (this.hasAttribute("label")) { this.#labelBefore ??= { role: this.getAttribute("role"), label: this.getAttribute("aria-label") }; this.setAttribute("role", "group"); this.setAttribute("aria-label", this.getAttribute("label")!); }
    else if (this.#labelBefore !== null) { for (const [name, value] of [["role", this.#labelBefore.role], ["aria-label", this.#labelBefore.label]]) { if (value === null) this.removeAttribute(name!); else this.setAttribute(name!, value!); } this.#labelBefore = null; }
  }
  #refresh(): void {
    this.#frame();
    try {
      const base = this.#options.settings ?? DEFAULT_SETTINGS;
      const n = (name: string, fallback: number): number => this.hasAttribute(name) ? Number(this.getAttribute(name)) : fallback;
      const legacyWidth = this.hasAttribute("width") && Number(this.getAttribute("width")) <= 60 ? Number(this.getAttribute("width")) : base.width;
      const settings: Settings = { ...base, width: n("cols", legacyWidth), height: n("rows", n("height", base.height)), mines: n("mines", base.mines), seed: n("seed", base.seed), grid: (this.getAttribute("grid") ?? base.grid) as Grid, shape: (this.getAttribute("shape") ?? base.shape) as Settings["shape"], noGuess: isOn(this.getAttribute("no-guess"), base.noGuess), opening: (this.getAttribute("opening") ?? base.opening) as Settings["opening"] };
      const day = embedDay(this.getAttribute("daily"));
      if (day !== null) settings.seed = dailySeed(day, `${settings.grid}/${settings.width}x${settings.height}/${settings.mines}/${settings.shape ?? "rectangle"}/${settings.noGuess}/${settings.opening}`);
      const saved = this.getAttribute("progress") ?? this.#options.progress;
      const key = JSON.stringify([settings, day, saved, isOn(this.getAttribute("controls"))]);
      const look = { material: (this.getAttribute("material") ?? "ivory") as Material, pieces: (this.getAttribute("pieces") ?? "flags") as Pieces, language: (this.getAttribute("lang") ?? (this.ownerDocument.documentElement.lang === "ja" ? "ja" : "en")) as Language, hint: this.#options.hint };
      if (key === this.#key && this.#mounted !== null) { this.#mounted.set(look); return; }
      this.#mounted?.destroy(); this.#mounted = null; this.#key = "";
      this.replaceChildren();
      this.#mounted = mountJirai(this, { ...look, settings, progress: saved, controls: isOn(this.getAttribute("controls")), onChange: game => this.#options.onChange?.(game), onFinish: game => this.#options.onFinish?.(game), onError: error => this.#options.onError?.(error) }); this.#key = key;
      this.dispatchEvent(new CustomEvent("jirai-load", { bubbles: true, composed: true, detail: { settings: this.#mounted.game().settings, day } }));
    } catch (error) {
      this.#mounted?.destroy(); this.#mounted = null; this.#key = "";
      const message = error instanceof Error ? error.message : String(error), status = this.ownerDocument.createElement("p"); status.setAttribute("role", "status"); status.textContent = message; this.replaceChildren(status);
      this.dispatchEvent(new CustomEvent("jirai-error", { bubbles: true, composed: true, detail: { message } }));
    }
  }
}
/** Registers the default board, or a subclass under a host's custom tag. Server-safe and idempotent.
 * @param tagName - The custom tag name; omitted to use the package default.
 * @param registry - The custom-element registry; omitted outside a browser.
 * @returns Nothing; existing definitions and server imports remain safe.
 * @example
 * ```ts
 * import { defineBoard } from "@johnmorrisdotca/jirai/element";
 * defineBoard();
 * console.log(typeof defineBoard); // function
 * ```
 */
export function defineBoard(tagName = "jirai-board", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void {
  if (registry === undefined || registry.get(tagName) !== undefined) return;
  registry.define(tagName, tagName === "jirai-board" ? JiraiElement : class extends JiraiElement {});
}
/** Registers the compatible default tag in a registry.
 * @param registry - The custom-element registry; omitted outside a browser.
 * @returns Nothing; existing definitions and server imports remain safe.
 * @example
 * ```ts
 * import { defineJirai } from "@johnmorrisdotca/jirai/element";
 * defineJirai();
 * console.log(typeof defineJirai); // function
 * ```
 */
export function defineJirai(registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void { defineBoard("jirai-board", registry); }
