import { DEFAULT_SETTINGS } from "./jirai.constants.ts";
import { mountJirai } from "./mount.ts";
import type { Grid, Language, Material, Pieces, Settings } from "./jirai.types.ts";
import type { JiraiMount } from "./ui.types.ts";

// Importing this file on a server is harmless; only defineJirai registers the tag.
const ElementBase = typeof HTMLElement === "undefined" ? class {} as typeof HTMLElement : HTMLElement;
/** Configurable `<jirai-board>` element that owns its mounted game. */
export class JiraiElement extends ElementBase {
  private mounted: JiraiMount | null = null;
  static observedAttributes = ["width", "height", "mines", "seed", "grid", "shape", "no-guess", "material", "pieces", "lang"];
  connectedCallback(): void { this.mount(); }
  disconnectedCallback(): void { this.mounted?.destroy(); this.mounted = null; }
  attributeChangedCallback(): void { if (this.isConnected) this.mount(); }
  private mount(): void {
    this.mounted?.destroy(); this.mounted = null;
    try {
      this.mounted = mountJirai(this, {
        settings: { ...DEFAULT_SETTINGS, width: Number(this.getAttribute("width") ?? DEFAULT_SETTINGS.width), height: Number(this.getAttribute("height") ?? DEFAULT_SETTINGS.height), mines: Number(this.getAttribute("mines") ?? DEFAULT_SETTINGS.mines), seed: Number(this.getAttribute("seed") ?? DEFAULT_SETTINGS.seed), shape: (this.getAttribute("shape") ?? "rectangle") as Settings["shape"], grid: (this.getAttribute("grid") ?? "square") as Grid, noGuess: this.getAttribute("no-guess") !== "false" },
        material: (this.getAttribute("material") ?? "ivory") as Material, pieces: (this.getAttribute("pieces") ?? "flags") as Pieces, language: (this.getAttribute("lang") ?? "en") as Language,
      });
    } catch (error) { this.dispatchEvent(new CustomEvent("jirai-error", { detail: error })); }
  }
}
/** Registers the `<jirai-board>` custom element once in a registry. */
export function defineJirai(registry: CustomElementRegistry = customElements): void { if (!registry.get("jirai-board")) registry.define("jirai-board", JiraiElement); }
