import { describe, expect, it } from "vitest";
import { dailySeed, embedDay } from "./embed-day.ts";
describe("daily embed dates", () => {
  it("uses UTC at the day boundary and supports explicit off aliases", () => {
    expect(embedDay("today", new Date("2026-10-09T23:59:59-07:00"))).toBe("2026-10-10");
    for (const value of [null, undefined, "off", "false", "no", "0"]) expect(embedDay(value)).toBeNull();
  });
  it("rejects nonexistent calendar days and invalid moments", () => {
    for (const value of ["2026-02-30", "2025-02-29", "2026-13-01", "<script>"]) expect(() => embedDay(value)).toThrow(RangeError);
    expect(embedDay("2024-02-29")).toBe("2024-02-29");
    expect(() => embedDay("today", new Date("invalid"))).toThrow(RangeError);
  });
  it("keeps a seed stable while separating days and puzzle namespaces", () => {
    expect(dailySeed("2026-10-09", "kazu/9/medium")).toBe(dailySeed("2026-10-09", "kazu/9/medium"));
    expect(dailySeed("2026-10-09", "kazu/9/medium")).not.toBe(dailySeed("2026-10-10", "kazu/9/medium"));
    expect(dailySeed("2026-10-09", "kazu/9/medium")).not.toBe(dailySeed("2026-10-09", "jirai/9/medium"));
  });
});
