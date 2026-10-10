import { createAsyncThunk } from "@reduxjs/toolkit";
import localforage from "localforage";
import { Book } from "../cell";
import type { RootState } from "../reducers";
import { downloadBook } from "./download-book";

const cellsCache = localforage.createInstance({
  name: "cellcache",
});

export const fetchCells = createAsyncThunk(
  "cells/fetch",
  async (bookTitle: string): Promise<Book> => {
    const item = await cellsCache.getItem<Book>(bookTitle);
    return item ?? { data: {}, order: [], title: "default" };
  }
);

export const getCachedBooks = () => cellsCache.keys();

export const saveCells = createAsyncThunk<void, void, { state: RootState }>(
  "cells/save",
  async (_, { getState }) => {
    const { cells } = getState();
    await cellsCache.setItem(cells.title, cells);
  }
);

export const exportCells = createAsyncThunk<void, void, { state: RootState }>(
  "cells/export",
  async (_, { getState }) => {
    const { cells } = getState();
    const stringifiedBook = JSON.stringify(cells, null, 2);
    await downloadBook(`${cells.title}.book`, stringifiedBook);
  }
);

export const importCells = createAsyncThunk(
  "cells/import",
  async (contents: string): Promise<Book> => {
    const { data, order, title } = JSON.parse(contents);
    if (!data || !order || !title) {
      throw new Error("Couldn't load that book");
    }
    return { data, order, title };
  }
);
