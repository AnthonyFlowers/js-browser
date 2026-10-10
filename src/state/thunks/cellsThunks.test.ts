import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import reducers from "../reducers";
import { importCells } from "./cellsThunks";

vi.mock("streamsaver", () => ({}));

const makeStore = () => configureStore({ reducer: reducers });

describe("importCells", () => {
  it("replaces the book from a valid file", async () => {
    const store = makeStore();
    const book = {
      order: ["x"],
      data: { x: { id: "x", type: "code", content: "1" } },
      title: "t",
    };
    await store.dispatch(importCells(JSON.stringify({ ...book, extra: true })));
    expect(store.getState().cells).toMatchObject({
      ...book,
      loading: false,
      error: null,
    });
  });

  it("surfaces an error for a book missing fields", async () => {
    const store = makeStore();
    await store.dispatch(importCells(JSON.stringify({ title: "t" })));
    expect(store.getState().cells.error).toBe("Couldn't load that book");
    expect(store.getState().cells.order).toEqual([]);
  });

  it("surfaces an error for invalid JSON", async () => {
    const store = makeStore();
    await store.dispatch(importCells("not json"));
    expect(store.getState().cells.error).toMatch(/JSON/);
  });
});
