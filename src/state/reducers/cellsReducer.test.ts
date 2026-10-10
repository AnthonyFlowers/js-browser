import { describe, expect, it } from "vitest";
import reducer from "./cellsReducer";
import { ActionType } from "../action-types";
import { Action } from "../actions";
import { Cell } from "../cell";

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

const run = (state: CellsState | undefined, action: Action) =>
  reducer(state, action);

describe("cellsReducer", () => {
  it("returns the initial state", () => {
    const initial = reducer(undefined, {
      type: ActionType.EXPORT_BOOK_SUCCESS,
    });
    expect(initial).toEqual({
      loading: false,
      error: null,
      order: [],
      data: {},
      title: "default",
    });
  });

  describe("INSERT_CELL_AFTER", () => {
    it("inserts at the start when id is null", () => {
      const next = run(stateWith(["a", "b"]), {
        type: ActionType.INSERT_CELL_AFTER,
        payload: { id: null, type: "text" },
      });
      expect(next.order).toHaveLength(3);
      expect(next.order.slice(1)).toEqual(["a", "b"]);
      const created = next.data[next.order[0]];
      expect(created).toMatchObject({ type: "text", content: "" });
      expect(created.id).toBe(next.order[0]);
      expect(created.id).toHaveLength(3);
    });

    it("inserts after the given cell", () => {
      const next = run(stateWith(["a", "b"]), {
        type: ActionType.INSERT_CELL_AFTER,
        payload: { id: "a", type: "code" },
      });
      expect(next.order[0]).toBe("a");
      expect(next.order[2]).toBe("b");
      expect(next.data[next.order[1]].type).toBe("code");
    });

    it("inserts at the end when given the last cell", () => {
      const next = run(stateWith(["a", "b"]), {
        type: ActionType.INSERT_CELL_AFTER,
        payload: { id: "b", type: "code" },
      });
      expect(next.order.slice(0, 2)).toEqual(["a", "b"]);
      expect(next.order).toHaveLength(3);
    });
  });

  it("UPDATE_CELL replaces content", () => {
    const next = run(stateWith(["a"]), {
      type: ActionType.UPDATE_CELL,
      payload: { id: "a", content: "new" },
    });
    expect(next.data.a.content).toBe("new");
  });

  it("DELETE_CELL removes the cell from data and order", () => {
    const next = run(stateWith(["a", "b", "c"]), {
      type: ActionType.DELETE_CELL,
      payload: "b",
    });
    expect(next.order).toEqual(["a", "c"]);
    expect(next.data.b).toBeUndefined();
    expect(Object.keys(next.data)).toEqual(["a", "c"]);
  });

  describe("MOVE_CELL", () => {
    it("moves a cell up", () => {
      const next = run(stateWith(["a", "b", "c"]), {
        type: ActionType.MOVE_CELL,
        payload: { id: "b", direction: "up" },
      });
      expect(next.order).toEqual(["b", "a", "c"]);
    });

    it("moves a cell down", () => {
      const next = run(stateWith(["a", "b", "c"]), {
        type: ActionType.MOVE_CELL,
        payload: { id: "b", direction: "down" },
      });
      expect(next.order).toEqual(["a", "c", "b"]);
    });

    it("does nothing when moving the first cell up", () => {
      const state = stateWith(["a", "b"]);
      const next = run(state, {
        type: ActionType.MOVE_CELL,
        payload: { id: "a", direction: "up" },
      });
      expect(next.order).toEqual(["a", "b"]);
    });

    it("does nothing when moving the last cell down", () => {
      const next = run(stateWith(["a", "b"]), {
        type: ActionType.MOVE_CELL,
        payload: { id: "b", direction: "down" },
      });
      expect(next.order).toEqual(["a", "b"]);
    });
  });

  it("UPDATE_CELLS_TITLE sets the title", () => {
    const next = run(stateWith([]), {
      type: ActionType.UPDATE_CELLS_TITLE,
      payload: "my book",
    });
    expect(next.title).toBe("my book");
  });

  it("FETCH_CELLS_COMPLETE replaces order, data and title", () => {
    const payload = {
      order: ["x"],
      data: { x: cell("x", "hi") },
      title: "loaded",
    };
    const next = run(stateWith(["a"]), {
      type: ActionType.FETCH_CELLS_COMPLETE,
      payload,
    });
    expect(next).toMatchObject(payload);
  });

  it("FETCH_CELLS sets loading and clears the error; FETCH_CELLS_ERROR records it", () => {
    const failed = run(stateWith([]), {
      type: ActionType.FETCH_CELLS_ERROR,
      payload: "boom",
    });
    expect(failed.error).toBe("boom");
    const loading = run(failed, { type: ActionType.FETCH_CELLS });
    expect(loading).toMatchObject({ loading: true, error: null });
  });

  it("IMPORT_BOOK_COMPLETE replaces the book and clears loading", () => {
    const loading = run(stateWith(["a"]), { type: ActionType.IMPORT_BOOK });
    expect(loading.loading).toBe(true);
    const payload = {
      order: ["x", "y"],
      data: { x: cell("x"), y: cell("y") },
      title: "imported",
    };
    const next = run(loading, {
      type: ActionType.IMPORT_BOOK_COMPLETE,
      payload,
    });
    expect(next).toMatchObject({ ...payload, loading: false });
  });

  it("IMPORT_BOOK_ERROR records the error", () => {
    const next = run(stateWith([]), {
      type: ActionType.IMPORT_BOOK_ERROR,
      payload: "Couldn't load that book",
    });
    expect(next.error).toBe("Couldn't load that book");
  });

  it("SAVE_CELLS_ERROR records the error", () => {
    const next = run(stateWith([]), {
      type: ActionType.SAVE_CELLS_ERROR,
      payload: "disk full",
    });
    expect(next.error).toBe("disk full");
  });

  it("does not mutate the previous state", () => {
    const state = stateWith(["a", "b"]);
    const snapshot = structuredClone(state);
    run(state, {
      type: ActionType.MOVE_CELL,
      payload: { id: "a", direction: "down" },
    });
    expect(state).toEqual(snapshot);
  });
});
