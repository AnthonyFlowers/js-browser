import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Book, Cell, CellTypes } from "../cell";
import {
  exportCells,
  fetchCells,
  importCells,
  saveCells,
} from "../thunks/cellsThunks";

export type Direction = "up" | "down";

export interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
  title: string;
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {},
  title: "default",
};

const randomId = () => {
  return Math.random().toString(36).substring(2, 5);
};

const replaceBook = (state: CellsState, book: Book) => {
  state.order = book.order;
  state.data = book.data;
  state.title = book.title;
};

const cellsSlice = createSlice({
  name: "cells",
  initialState,
  reducers: {
    updateCell(state, action: PayloadAction<{ id: string; content: string }>) {
      const { id, content } = action.payload;
      state.data[id].content = content;
    },
    deleteCell(state, action: PayloadAction<string>) {
      delete state.data[action.payload];
      state.order = state.order.filter((id) => id !== action.payload);
    },
    moveCell(
      state,
      action: PayloadAction<{ id: string; direction: Direction }>
    ) {
      const { id, direction } = action.payload;
      const index = state.order.findIndex((orderId) => orderId === id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex > state.order.length - 1) {
        return;
      }
      state.order[index] = state.order[targetIndex];
      state.order[targetIndex] = id;
    },
    insertCellAfter(
      state,
      action: PayloadAction<{ id: string | null; type: CellTypes }>
    ) {
      const cell: Cell = {
        content: "",
        type: action.payload.type,
        id: randomId(),
      };
      state.data[cell.id] = cell;
      const foundIndex = state.order.findIndex(
        (id) => id === action.payload.id
      );
      if (foundIndex < 0) {
        state.order.unshift(cell.id);
      } else {
        state.order.splice(foundIndex + 1, 0, cell.id);
      }
    },
    updateTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCells.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCells.fulfilled, (state, action) => {
        replaceBook(state, action.payload);
      })
      .addCase(fetchCells.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Couldn't load the book";
      })
      .addCase(importCells.pending, (state) => {
        state.loading = true;
      })
      .addCase(importCells.fulfilled, (state, action) => {
        replaceBook(state, action.payload);
        state.loading = false;
      })
      .addCase(importCells.rejected, (state, action) => {
        state.error = action.error.message ?? "Couldn't load that book";
      })
      .addCase(saveCells.rejected, (state, action) => {
        state.error = action.error.message ?? "Couldn't save the book";
      })
      .addCase(exportCells.rejected, (state, action) => {
        state.error = action.error.message ?? "Couldn't export the book";
      });
  },
});

export const {
  updateCell,
  deleteCell,
  moveCell,
  insertCellAfter,
  updateTitle,
} = cellsSlice.actions;

export default cellsSlice.reducer;
