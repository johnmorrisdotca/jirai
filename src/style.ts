/** Scoped to one mounted board. Its host supplies the font and may override every colour. */
export const JIRAI_STYLE = `
.jr-root{--jr-ground:#a98954;--jr-cover:#fbf8f1;--jr-open:#efe8d8;--jr-line:#cfc6b2;--jr-ink:#1f2320;--jr-accent:#2f7a4f;color:var(--jr-ui-ink,var(--jr-ink));font:inherit;position:relative}
.jr-root[data-material=wood]{--jr-ground:#ae804a;--jr-cover:#e0bb7e;--jr-open:#c69d63;--jr-line:#936e40;--jr-ink:#352c20;background-image:repeating-linear-gradient(4deg,transparent 0 8px,#4b2b0c08 9px 10px)}
.jr-root[data-material=slate]{--jr-ground:#252e32;--jr-cover:#455359;--jr-open:#303c41;--jr-line:#62747a;--jr-ink:#f3f0e5;--jr-accent:#b7d298}
.jr-scroll{overflow:auto;padding:12px;border:1px solid var(--jr-line);border-radius:14px;background:var(--jr-ground);overscroll-behavior:contain}
.jr-board{position:relative;width:100%;min-width:240px;margin:auto;isolation:isolate}
.jr-cell{position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border:1px solid var(--jr-line);border-radius:4px;background:var(--jr-cover);color:var(--jr-ink);font:700 clamp(12px,2vw,22px)/1 ui-monospace,monospace;box-shadow:inset 0 2px 1px #fff7,inset 0 -2px 1px #0001;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;padding:0}
.jr-root[data-grid=hex] .jr-cell{clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);border-radius:0}
.jr-cell[data-kind=open]{background:var(--jr-open);box-shadow:none}
.jr-cell[data-number="1"]{color:#326ca0}.jr-cell[data-number="2"]{color:#3d763c}.jr-cell[data-number="3"]{color:#a34438}.jr-cell[data-number="4"]{color:#704b97}.jr-cell[data-number="5"]{color:#8c542f}.jr-cell[data-number="6"]{color:#1c777b}
.jr-root[data-material=slate] .jr-cell[data-kind=open]{color:#e8e6bd}
.jr-cell[data-kind=flag]{color:var(--jr-accent)}.jr-cell[data-kind=question]{color:#8a702d}
.jr-cell[data-kind=mine],.jr-cell[data-kind=wrong]{background:#ead4c5;color:#873e32}.jr-cell[data-kind=exploded]{background:#a34d3c;color:white}
.jr-cell[data-hint=true]{background:#d4e5bc!important;color:#243d24!important;box-shadow:inset 0 0 0 3px #577b3f}
.jr-cell:focus-visible{outline:none;box-shadow:inset 0 0 0 3px #c0802e;z-index:2}.jr-cell:hover{filter:brightness(.97)}
.jr-stats{display:flex;gap:18px;flex-wrap:wrap;font-variant-numeric:tabular-nums;margin:0 0 14px}.jr-stat{display:flex;gap:7px;align-items:baseline}.jr-stat small{opacity:.7;font-size:12px}.jr-stat strong{font-size:20px;font-weight:500}
.jr-status{font-size:14px;line-height:1.5;min-height:1.5em;margin:12px 0}.jr-help{font-size:12px;line-height:1.65;opacity:.7}
.jr-controls{display:flex;flex-wrap:wrap;gap:8px}.jr-button{font:inherit;font-size:13px;border:1px solid var(--jr-line);border-radius:999px;min-height:44px;padding:0 14px;background:var(--jr-ui-surface,var(--jr-cover));color:var(--jr-ui-ink,var(--jr-ink));border-color:var(--jr-ui-line,var(--jr-line));cursor:pointer}.jr-button:disabled{opacity:.5;cursor:wait}.jr-button[aria-pressed=true]{background:var(--jr-accent);color:white}.jr-button:focus-visible{outline:2px solid var(--jr-accent);outline-offset:3px}
.jr-dialog{border:0;border-radius:20px;padding:24px;max-width:min(96vw,1000px);width:850px;background:var(--surface,#fbf8f1);color:var(--ink,#1f2320);--jr-ui-ink:var(--ink,#1f2320);--jr-ui-surface:var(--surface,#fbf8f1);--jr-ui-line:var(--rule,#ddd6c6);box-sizing:border-box}.jr-dialog::backdrop{background:#172019bb}.jr-dialog .jr-board{max-height:75vh}.jr-close{float:right;margin-bottom:10px}
@media(prefers-reduced-motion:no-preference){.jr-cell{transition:background .12s}}
`;
