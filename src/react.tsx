import { useEffect, useRef } from "react";
import { mountJirai } from "./mount.ts";
import type { JiraiProps } from "./react.types.ts";

/** Renders the DOM player inside a React-owned host. Options are read on mount; use a new key to load a new board. */
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
