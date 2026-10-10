import { describe, expect, it } from "vitest";
import reducer from "./bundlesSlice";
import { createBundle } from "../thunks/bundleThunks";

const arg = (cellId: string) => ({ cellId, input: "" });
const pending = (cellId: string) => createBundle.pending("req", arg(cellId));
const fulfilled = (cellId: string, code: string, err: string) =>
  createBundle.fulfilled({ code, err }, "req", arg(cellId));
const rejected = (cellId: string, message: string) =>
  createBundle.rejected(new Error(message), "req", arg(cellId));

describe("bundlesSlice", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({});
  });

  it("createBundle.pending marks a cell as loading with empty output", () => {
    const next = reducer(undefined, pending("a"));
    expect(next).toEqual({ a: { loading: true, code: "", err: "" } });
  });

  it("createBundle.fulfilled stores code and error and clears loading", () => {
    const started = reducer(undefined, pending("a"));
    const next = reducer(started, fulfilled("a", "x()", ""));
    expect(next.a).toEqual({ loading: false, code: "x()", err: "" });

    const failed = reducer(next, fulfilled("a", "", "bad"));
    expect(failed.a).toEqual({ loading: false, code: "", err: "bad" });
  });

  it("createBundle.rejected stores the error and clears loading", () => {
    const started = reducer(undefined, pending("a"));
    const next = reducer(started, rejected("a", "boom"));
    expect(next.a).toEqual({ loading: false, code: "", err: "boom" });
  });

  it("keeps bundles of other cells independent and does not mutate", () => {
    const first = reducer(undefined, fulfilled("a", "A", ""));
    const snapshot = structuredClone(first);
    const second = reducer(first, pending("b"));
    expect(second.a).toEqual(first.a);
    expect(second.b?.loading).toBe(true);
    expect(first).toEqual(snapshot);
  });
});
