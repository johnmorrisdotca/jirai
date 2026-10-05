import type { HTMLAttributes } from "react";
import type { MountOptions } from "./ui.types.ts";
/** Mount options plus standard div attributes for the React wrapper. */
export type JiraiProps = MountOptions & Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onError">;
