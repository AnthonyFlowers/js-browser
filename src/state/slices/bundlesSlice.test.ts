import { describe, expect, it } from "vitest";
import reducer from "./bundlesSlice";
import { createBundle } from "../thunks/bundleThunks";

const arg = (cellId: string) => ({ cellId, input: "" });
const pending = (cellId: string, requestId = "req") =>
  createBundle.pending(requestId, arg(cellId));
const fulfilled = (
  cellId: string,
  code: string,
  err: string,
  requestId = "req"
) => createBundle.fulfilled({ code, err }, requestId, arg(cellId));
const rejected = (cellId: string, message: string, requestId = "req") =>
  createBundle.rejected(new Error(message), requestId, arg(cellId));

describe("bundlesSlice", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({});
  });

  it("createBundle.pending marks a cell as loading with empty output", () => {
    const next = reducer(undefined, pending("a"));
    expect(next).toEqual({
      a: { loading: true, code: "", err: "", requestId: "req" },
    });
  });

  it("createBundle.fulfilled stores code and error and clears loading", () => {
    const started = reducer(undefined, pending("a"));
    const next = reducer(started, fulfilled("a", "x()", ""));
    expect(next.a).toEqual({
      loading: false,
      code: "x()",
      err: "",
      requestId: "req",
    });

    const failed = reducer(next, fulfilled("a", "", "bad"));
    expect(failed.a).toEqual({
      loading: false,
      code: "",
      err: "bad",
      requestId: "req",
    });
  });

  it("createBundle.rejected stores the error and clears loading", () => {
    const started = reducer(undefined, pending("a"));
    const next = reducer(started, rejected("a", "boom"));
    expect(next.a).toEqual({
      loading: false,
      code: "",
      err: "boom",
      requestId: "req",
    });
  });

  it("keeps bundles of other cells independent and does not mutate", () => {
    const first = reducer(undefined, fulfilled("a", "A", ""));
    const snapshot = structuredClone(first);
    const second = reducer(first, pending("b"));
    expect(second.a).toEqual(first.a);
    expect(second.b?.loading).toBe(true);
    expect(first).toEqual(snapshot);
  });

  describe("when bundles for one cell overlap", () => {
    it("ignores an older bundle that settles after a newer one started", () => {
      let state = reducer(undefined, pending("a", "old"));
      state = reducer(state, pending("a", "new"));
      state = reducer(state, fulfilled("a", "OLD", "", "old"));
      expect(state.a).toMatchObject({ loading: true, requestId: "new" });
      state = reducer(state, fulfilled("a", "NEW", "", "new"));
      expect(state.a).toMatchObject({ loading: false, code: "NEW" });
    });

    it("ignores an older bundle that settles after a newer one finished", () => {
      let state = reducer(undefined, pending("a", "old"));
      state = reducer(state, pending("a", "new"));
      state = reducer(state, fulfilled("a", "NEW", "", "new"));
      state = reducer(state, fulfilled("a", "OLD", "", "old"));
      state = reducer(state, rejected("a", "late failure", "old"));
      expect(state.a).toMatchObject({ loading: false, code: "NEW", err: "" });
    });

    it("clears loading when the newest bundle fails after an older one hung", () => {
      let state = reducer(undefined, pending("a", "hung"));
      state = reducer(state, pending("a", "new"));
      state = reducer(state, rejected("a", "boom", "new"));
      expect(state.a).toMatchObject({ loading: false, err: "boom" });
    });
  });
});
