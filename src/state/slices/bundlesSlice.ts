import { createSlice } from "@reduxjs/toolkit";
import { createBundle } from "../thunks/bundleThunks";

export interface BundlesState {
  [key: string]:
    | {
        loading: boolean;
        code: string;
        err: string;
        requestId: string;
      }
    | undefined;
}

// A bundle that settles after a newer one started for the same cell must not overwrite it.
const isSuperseded = (
  state: BundlesState,
  meta: { requestId: string; arg: { cellId: string } }
) => {
  const current = state[meta.arg.cellId];
  return current !== undefined && current.requestId !== meta.requestId;
};

const initialState: BundlesState = {};

const bundlesSlice = createSlice({
  name: "bundles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBundle.pending, (state, action) => {
        state[action.meta.arg.cellId] = {
          loading: true,
          code: "",
          err: "",
          requestId: action.meta.requestId,
        };
      })
      .addCase(createBundle.fulfilled, (state, action) => {
        if (isSuperseded(state, action.meta)) return;
        state[action.meta.arg.cellId] = {
          loading: false,
          code: action.payload.code,
          err: action.payload.err,
          requestId: action.meta.requestId,
        };
      })
      .addCase(createBundle.rejected, (state, action) => {
        if (isSuperseded(state, action.meta)) return;
        state[action.meta.arg.cellId] = {
          loading: false,
          code: "",
          err: action.error.message ?? "Bundling failed",
          requestId: action.meta.requestId,
        };
      });
  },
});

export default bundlesSlice.reducer;
