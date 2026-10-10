import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setItem = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const getItem = vi.hoisted(() => vi.fn().mockResolvedValue(null));

vi.mock("localforage", () => ({
  default: { createInstance: () => ({ setItem, getItem, keys: vi.fn() }) },
}));
vi.mock("streamsaver", () => ({}));

import { store } from "./store";
import { fetchCells } from "./thunks/cellsThunks";
import { insertCellAfter, updateCell, updateTitle } from "./slices/cellsSlice";

describe("persist listener", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setItem.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces saves of the whole cells slice by 250 ms", async () => {
    store.dispatch(insertCellAfter({ id: null, type: "code" }));
    const id = store.getState().cells.order[0];
    store.dispatch(updateCell({ id, content: "a" }));
    store.dispatch(updateTitle("book"));
    await vi.advanceTimersByTimeAsync(249);
    expect(setItem).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("book", store.getState().cells);
  });

  it("does not save after fetch", async () => {
    await store.dispatch(fetchCells("default"));
    await vi.advanceTimersByTimeAsync(1000);
    expect(setItem).not.toHaveBeenCalled();
  });
});
