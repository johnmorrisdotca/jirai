import { makeBoard } from "./generate.ts";
import type { Settings } from "./jirai.types.ts";
// A separate entry: importing the engine or renderer never creates a worker.
self.addEventListener("message", (event: MessageEvent<{ settings: Settings; first: number }>) => {
  try { self.postMessage({ board: makeBoard(event.data.settings, event.data.first) }); }
  catch (error) { self.postMessage({ error: error instanceof Error ? error.message : String(error) }); }
});
