import { useEffect, useRef } from "react";
import { mountJirai } from "./mount.ts";
import type { JiraiProps } from "./react.types.ts";

/** Renders the DOM player inside a React-owned host. Options are read on mount; use a new key to load a new board.
 *
 * @param options - Initial field/progress, presentation, DOM host properties and native callbacks.
 * @returns The React element owning a host for the native Minesweeper player.
 * @example
 * ```ts no-run
 * import type { Settings } from "@johnmorrisdotca/jirai";
 * import { JiraiBoard } from "@johnmorrisdotca/jirai/react";
 *
 * const settings: Settings={width:3,height:3,mines:1,grid:"square",noGuess:false,opening:"clear",seed:42};
 * import { createElement } from "react";
 * console.log(createElement(JiraiBoard,{settings,language:"ja"}).type);
 * ```
 */
export function JiraiBoard({ settings, progress, material, pieces, language, controls, onChange, onFinish, onError, ...element }: JiraiProps) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef({ onChange, onFinish, onError });
  useEffect(() => { latest.current = { onChange, onFinish, onError }; });
  useEffect(() => {
    if (host.current === null) return;
    const board = mountJirai(host.current, { settings, progress, material, pieces, language, controls,
      onChange: (game) => latest.current.onChange?.(game), onFinish: (game) => latest.current.onFinish?.(game), onError: (error) => latest.current.onError?.(error) });
    return () => board.destroy();
  }, []);
  return <div ref={host} {...element} />;
}
