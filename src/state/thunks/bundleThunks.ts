import { createAsyncThunk } from "@reduxjs/toolkit";
import bundle from "../../bundler";

export const createBundle = createAsyncThunk(
  "bundles/create",
  async ({ input }: { cellId: string; input: string }) => bundle(input)
);
