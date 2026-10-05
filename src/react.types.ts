import type { HTMLAttributes } from "react";
import type { MountOptions } from "./ui.types.ts";
export type JiraiProps = MountOptions & Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onError">;
