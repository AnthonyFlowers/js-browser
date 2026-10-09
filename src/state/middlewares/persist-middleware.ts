import { Dispatch, Middleware } from "redux";
import { saveCells } from "../action-creators";
import { ActionType } from "../action-types";
import { Action } from "../actions";
import { RootState } from "../reducers";

export const persistMiddleware: Middleware<object, RootState> = ({
  dispatch,
  getState,
}) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (next) => {
    return (action) => {
      next(action);
      if (
        [
          ActionType.MOVE_CELL,
          ActionType.UPDATE_CELL,
          ActionType.INSERT_CELL_AFTER,
          ActionType.DELETE_CELL,
          ActionType.UPDATE_CELLS_TITLE,
        ].includes((action as Action).type)
      ) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          saveCells()(dispatch as Dispatch<Action>, getState);
        }, 250);
      }
    };
  };
};
