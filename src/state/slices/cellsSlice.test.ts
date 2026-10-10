import { UnknownAction } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import reducer, {
  deleteCell,
  insertCellAfter,
  moveCell,
  updateCell,
  updateTitle,
} from "./cellsSlice";
import {
  exportCells,
  fetchCells,
  importCells,
  saveCells,
} from "../thunks/cellsThunks";
import { Cell } from "../cell";

vi.mock("streamsaver", () => ({}));

type CellsState = ReturnType<typeof reducer>;

const cell = (id: string, content = ""): Cell => ({
  id,
  type: "code",
  content,
});

const stateWith = (ids: string[]): CellsState => ({
  loading: false,
  error: null,
  order: ids,
  data: Object.fromEntries(ids.map((id) => [id, cell(id, `content ${id}`)])),
  title: "default",
});

const run = (state: CellsState | undefined, action: UnknownAction) =>
  reducer(state, action);

describe("cellsReducer", () => {
  it("returns the initial state", () => {
    const initial = reducer(undefined, { type: "unknown" });
    expect(initial).toEqual({
      loading: false,
      error: null,
      order: [],
      data: {},
      title: "default",
    });
  });

  describe("insertCellAfter", () => {
    it("inserts at the start when id is null", () => {
      const next = run(
        stateWith(["a", "b"]),
        insertCellAfter({ id: null, type: "text" })
      );
      expect(next.order).toHaveLength(3);
      expect(next.order.slice(1)).toEqual(["a", "b"]);
      const created = next.data[next.order[0]];
      expect(created).toMatchObject({ type: "text", content: "" });
      expect(created.id).toBe(next.order[0]);
      expect(created.id).toHaveLength(3);
    });

    it("inserts after the given cell", () => {
      const next = run(
        stateWith(["a", "b"]),
        insertCellAfter({ id: "a", type: "code" })
      );
      expect(next.order[0]).toBe("a");
      expect(next.order[2]).toBe("b");
      expect(next.data[next.order[1]].type).toBe("code");
    });

    it("inserts at the end when given the last cell", () => {
      const next = run(
        stateWith(["a", "b"]),
        insertCellAfter({ id: "b", type: "code" })
      );
      expect(next.order.slice(0, 2)).toEqual(["a", "b"]);
      expect(next.order).toHaveLength(3);
    });
  });

  it("updateCell replaces content", () => {
    const next = run(stateWith(["a"]), updateCell({ id: "a", content: "new" }));
    expect(next.data.a.content).toBe("new");
  });

  it("deleteCell removes the cell from data and order", () => {
    const next = run(stateWith(["a", "b", "c"]), deleteCell("b"));
    expect(next.order).toEqual(["a", "c"]);
    expect(next.data.b).toBeUndefined();
    expect(Object.keys(next.data)).toEqual(["a", "c"]);
  });

  describe("moveCell", () => {
    it("moves a cell up", () => {
      const next = run(
        stateWith(["a", "b", "c"]),
        moveCell({ id: "b", direction: "up" })
      );
      expect(next.order).toEqual(["b", "a", "c"]);
    });

    it("moves a cell down", () => {
      const next = run(
        stateWith(["a", "b", "c"]),
        moveCell({ id: "b", direction: "down" })
      );
      expect(next.order).toEqual(["a", "c", "b"]);
    });

    it("does nothing when moving the first cell up", () => {
      const state = stateWith(["a", "b"]);
      const next = run(state, moveCell({ id: "a", direction: "up" }));
      expect(next.order).toEqual(["a", "b"]);
    });

    it("does nothing when moving the last cell down", () => {
      const next = run(
        stateWith(["a", "b"]),
        moveCell({ id: "b", direction: "down" })
      );
      expect(next.order).toEqual(["a", "b"]);
    });
  });

  it("updateTitle sets the title", () => {
    const next = run(stateWith([]), updateTitle("my book"));
    expect(next.title).toBe("my book");
  });

  it("fetchCells.fulfilled replaces order, data and title", () => {
    const payload = {
      order: ["x"],
      data: { x: cell("x", "hi") },
      title: "loaded",
    };
    const next = run(
      stateWith(["a"]),
      fetchCells.fulfilled(payload, "req", "default")
    );
    expect(next).toMatchObject(payload);
  });

  it("fetchCells.pending sets loading and clears the error; fetchCells.rejected records it", () => {
    const failed = run(
      stateWith([]),
      fetchCells.rejected(new Error("boom"), "req", "default")
    );
    expect(failed.error).toBe("boom");
    const loading = run(failed, fetchCells.pending("req", "default"));
    expect(loading).toMatchObject({ loading: true, error: null });
  });

  it("importCells.fulfilled replaces the book and clears loading", () => {
    const loading = run(stateWith(["a"]), importCells.pending("req", "{}"));
    expect(loading.loading).toBe(true);
    const payload = {
      order: ["x", "y"],
      data: { x: cell("x"), y: cell("y") },
      title: "imported",
    };
    const next = run(loading, importCells.fulfilled(payload, "req", "{}"));
    expect(next).toMatchObject({ ...payload, loading: false });
  });

  it("importCells.rejected records the error", () => {
    const next = run(
      stateWith([]),
      importCells.rejected(new Error("Couldn't load that book"), "req", "{}")
    );
    expect(next.error).toBe("Couldn't load that book");
  });

  it("saveCells.rejected records the error", () => {
    const next = run(
      stateWith([]),
      saveCells.rejected(new Error("disk full"), "req")
    );
    expect(next.error).toBe("disk full");
  });

  it("exportCells.rejected records the error", () => {
    const next = run(
      stateWith([]),
      exportCells.rejected(new Error("nope"), "req")
    );
    expect(next.error).toBe("nope");
  });

  it("does not mutate the previous state", () => {
    const state = stateWith(["a", "b"]);
    const snapshot = structuredClone(state);
    run(state, moveCell({ id: "a", direction: "down" }));
    expect(state).toEqual(snapshot);
  });
});
