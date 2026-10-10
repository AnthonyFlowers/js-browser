import { describe, expect, it } from "vitest";
import reducer from "./bundlesReducer";
import { ActionType } from "../action-types";

describe("bundlesReducer", () => {
  it("starts empty", () => {
    expect(
      reducer(undefined, { type: ActionType.EXPORT_BOOK_SUCCESS })
    ).toEqual({});
  });

  it("BUNDLE_START marks a cell as loading with empty output", () => {
    const next = reducer(undefined, {
      type: ActionType.BUNDLE_START,
      payload: { cellId: "a" },
    });
    expect(next).toEqual({ a: { loading: true, code: "", err: "" } });
  });

  it("BUNDLE_COMPLETE stores code and error and clears loading", () => {
    const started = reducer(undefined, {
      type: ActionType.BUNDLE_START,
      payload: { cellId: "a" },
    });
    const next = reducer(started, {
      type: ActionType.BUNDLE_COMPLETE,
      payload: { cellId: "a", bundle: { code: "x()", err: "" } },
    });
    expect(next.a).toEqual({ loading: false, code: "x()", err: "" });

    const failed = reducer(next, {
      type: ActionType.BUNDLE_COMPLETE,
      payload: { cellId: "a", bundle: { code: "", err: "bad" } },
    });
    expect(failed.a).toEqual({ loading: false, code: "", err: "bad" });
  });

  it("keeps bundles of other cells independent and does not mutate", () => {
    const first = reducer(undefined, {
      type: ActionType.BUNDLE_COMPLETE,
      payload: { cellId: "a", bundle: { code: "A", err: "" } },
    });
    const snapshot = structuredClone(first);
    const second = reducer(first, {
      type: ActionType.BUNDLE_START,
      payload: { cellId: "b" },
    });
    expect(second.a).toEqual(first.a);
    expect(second.b?.loading).toBe(true);
    expect(first).toEqual(snapshot);
  });
});
