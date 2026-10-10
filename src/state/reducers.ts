import { combineReducers } from "@reduxjs/toolkit";
import cellsReducer from "./slices/cellsSlice";
import bundlesReducer from "./slices/bundlesSlice";

const reducers = combineReducers({
  cells: cellsReducer,
  bundles: bundlesReducer,
});

export default reducers;

export type RootState = ReturnType<typeof reducers>;
