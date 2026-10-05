import { DEFAULT_SETTINGS, PRESETS, dailySeed, gameProgress, activeCells } from "./dist/index.js";
import { mountJirai } from "./dist/play-entry.js";
import { PAGE_WORDS } from "./words.js";
const form = document.querySelector("#settings");
const notice = document.querySelector("#notice");
const params = new URLSearchParams(location.search);
for (const name of ["width","height","mines","seed","grid","shape","opening","material","pieces"]) if (params.has(name)) form.elements[name].value = params.get(name);
if (params.has("noGuess")) form.elements.noGuess.checked = params.get("noGuess") === "1";
let language = params.get("language") === "ja" ? "ja" : "en";
const read = () => ({ ...DEFAULT_SETTINGS, width: Number(form.elements.width.value), height: Number(form.elements.height.value), mines: Number(form.elements.mines.value), seed: Number(form.elements.seed.value), grid: form.elements.grid.value, shape: form.elements.shape.value, opening: form.elements.opening.value, noGuess: form.elements.noGuess.checked });
const appearance = () => ({ material: form.elements.material.value, pieces: form.elements.pieces.value, language });
let saved;
try { if (!location.search) saved = localStorage.getItem("jirai:progress:1") ?? undefined; } catch { /* Storage can be disabled; play still works. */ }
let table;
const options = { settings: read(), progress: saved, ...appearance(), onChange(game) {
  try { localStorage.setItem("jirai:progress:1", gameProgress(game)); } catch { /* A host may deny storage. */ }
  document.querySelector("#board-subtitle").textContent = `${game.settings.width} × ${game.settings.height} · ${game.settings.mines} ${language === "ja" ? "地雷" : "mines"}`;
}, onError(error) { notice.textContent = error.message; } };
try { table = mountJirai(document.querySelector("#game"), options); }
catch { table = mountJirai(document.querySelector("#game"), { ...options, settings: DEFAULT_SETTINGS, progress: undefined }); }
const restored = table.game().settings;
for (const name of ["width","height","mines","seed","grid","shape","opening"]) form.elements[name].value = restored[name] ?? "rectangle";
form.elements.noGuess.checked = restored.noGuess;
function heading() { document.querySelector("#board-title").textContent = (language === "ja" ? { square: "正方形の盤", hex: "六角形の盤", wrap: "つながる盤" } : { square: "Square field", hex: "Hexagonal field", wrap: "Wraparound field" })[table.game().settings.grid]; }
heading();
function begin() { notice.textContent = ""; try { table.load(read()); table.set(appearance()); heading(); } catch (error) { notice.textContent = error.message; } }
form.addEventListener("submit", (event) => { event.preventDefault(); begin(); });
form.elements.preset.addEventListener("change", () => { const preset = PRESETS[form.elements.preset.value]; if (preset) { form.elements.shape.value = "rectangle"; shapeLimits(); for (const name of ["width","height","mines"]) form.elements[name].value = preset[name]; } });
for (const name of ["material","pieces"]) form.elements[name].addEventListener("change", () => table.set(appearance()));
document.querySelector("#random").addEventListener("click", () => { form.elements.seed.value = crypto.getRandomValues(new Uint32Array(1))[0]; begin(); });
document.querySelector("#daily").addEventListener("click", () => {
  form.elements.shape.value = "rectangle"; shapeLimits();
  for (const name of ["width","height","mines"]) form.elements[name].value = PRESETS.beginner[name];
  form.elements.noGuess.checked = true; form.elements.opening.value = "clear";
  form.elements.seed.value = dailySeed(new Date().toISOString().slice(0,10), form.elements.grid.value); begin();
  table.play(Math.floor(table.game().settings.height / 2) * table.game().settings.width + Math.floor(table.game().settings.width / 2));
});
document.querySelector("#share").addEventListener("click", async () => {
  const game = table.game(); const url = new URL(location.href); url.search = "";
  for (const [key, value] of Object.entries({ ...game.settings, ...appearance() })) url.searchParams.set(key, typeof value === "boolean" ? value ? "1" : "0" : String(value));
  if (game.board) url.searchParams.set("first", String(game.board.first));
  url.searchParams.set("lang", language);
  try { await navigator.clipboard.writeText(url.href); notice.textContent = "Link copied. It includes the seed and the opening cell."; } catch { notice.textContent = url.href; }
});

if (params.has("first")) table.play(Number(params.get("first")));

function translate() {
  document.documentElement.lang = language;
  document.querySelector(".field-kanji").hidden = language === "ja";
  document.querySelectorAll("[data-say]").forEach(el => { const words = PAGE_WORDS[el.dataset.say]; if (words) el.textContent = words[language]; });

  const settings = table.game().settings;
  document.querySelector("#board-subtitle").textContent = `${settings.width} × ${settings.height} · ${settings.mines} ${language === "ja" ? "地雷" : "mines"}`;
  heading();
}
translate();

const pageWords = Object.fromEntries(["en", "ja"].map(lang => [lang, {
  ...Object.fromEntries(Object.entries(PAGE_WORDS).map(([key, value]) => [key, value[lang]])),
  pitch: lang === "ja" ? "正方形、六角形、端がつながる盤の地雷パズル。盤の大きさ、地雷の数、素材と印を選び、数字を手がかりに安全なマスを開けましょう。" : "Minesweeper on squares, hexagons and a board whose edges join. Choose the size, mine count, material and markers; read the numbers and open every safe cell.",
  name: lang === "ja" ? "Jirai（地雷）は、地面に埋められた爆弾のこと。" : "Jirai (地雷) is Japanese for a land mine.",
  foot: lang === "ja" ? "数字を手がかりに、地雷を避けます。" : "Read the clues and leave the mines alone.",
}]));
const pageLanguage = familyLanguage({ id: "jirai", words: pageWords, onChange: lang => { language = lang; translate(); table.set(appearance()); } });
if (params.has("language")) pageLanguage.set(language);
else { language = pageLanguage.lang; translate(); table.set(appearance()); }

function shapeLimits() {
  const shaped = form.elements.shape.value !== "rectangle";
  form.elements.grid.querySelector('[value="wrap"]').disabled = shaped;
  if (shaped && form.elements.grid.value === "wrap") form.elements.grid.value = "square";
  form.elements.width.min = form.elements.height.min = shaped ? "9" : "3";
}
form.elements.shape.addEventListener("change", () => {
  if (form.elements.shape.value !== "rectangle") {
    form.elements.width.value = Math.max(17, Number(form.elements.width.value));
    form.elements.height.value = Math.max(17, Number(form.elements.height.value));
    form.elements.mines.value = Math.max(1, Math.floor(activeCells(read()).length * .12));
    form.elements.preset.value = "custom";
  }
  shapeLimits();
});
shapeLimits();
