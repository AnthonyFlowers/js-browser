import { createSlice } from "@reduxjs/toolkit";
import { createBundle } from "../thunks/bundleThunks";

export interface BundlesState {
  [key: string]:
    | {
        loading: boolean;
        code: string;
        err: string;
      }
    | undefined;
}

const initialState: BundlesState = {};

const bundlesSlice = createSlice({
  name: "bundles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBundle.pending, (state, action) => {
        state[action.meta.arg.cellId] = { loading: true, code: "", err: "" };
      })
      .addCase(createBundle.fulfilled, (state, action) => {
        state[action.meta.arg.cellId] = {
          loading: false,
          code: action.payload.code,
          err: action.payload.err,
        };
      })
      .addCase(createBundle.rejected, (state, action) => {
        state[action.meta.arg.cellId] = {
          loading: false,
          code: "",
          err: action.error.message ?? "Bundling failed",
        };
      });
  },
});

export default bundlesSlice.reducer;
