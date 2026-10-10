import {
  createListenerMiddleware,
  isAnyOf,
  ThunkDispatch,
  UnknownAction,
} from "@reduxjs/toolkit";
import {
  deleteCell,
  insertCellAfter,
  moveCell,
  updateCell,
  updateTitle,
} from "./slices/cellsSlice";
import type { RootState } from "./reducers";
import { saveCells } from "./thunks/cellsThunks";

export const persistListener = createListenerMiddleware();

const startListening = persistListener.startListening.withTypes<
  RootState,
  ThunkDispatch<RootState, unknown, UnknownAction>
>();

startListening({
  matcher: isAnyOf(
    moveCell,
    updateCell,
    insertCellAfter,
    deleteCell,
    updateTitle
  ),
  effect: async (_, { cancelActiveListeners, delay, dispatch }) => {
    cancelActiveListeners();
    await delay(250);
    dispatch(saveCells());
  },
});
