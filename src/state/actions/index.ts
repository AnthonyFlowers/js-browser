import { ActionType } from "../action-types";
import { Cell, CellTypes } from "../cell";

export type Direction = "up" | "down";

export interface MoveCellAction {
  type: ActionType.MOVE_CELL;
  payload: {
    id: string;
    direction: Direction;
  };
}

export interface DeleteCellAction {
  type: ActionType.DELETE_CELL;
  payload: string;
}

export interface InsertCellAfterAction {
  type: ActionType.INSERT_CELL_AFTER;
  payload: {
    id: string | null;
    type: CellTypes;
  };
}

export interface UpdateCellAction {
  type: ActionType.UPDATE_CELL;
  payload: {
    id: string;
    content: string;
  };
}

export interface BundleStartAction {
  type: ActionType.BUNDLE_START;
  payload: {
    cellId: string;
  };
}

export interface BundleCompleteAction {
  type: ActionType.BUNDLE_COMPLETE;
  payload: {
    cellId: string;
    bundle: {
      code: string;
      err: string;
    };
  };
}

export interface FetchCellsAction {
  type: ActionType.FETCH_CELLS;
}

export interface FetchCellsCompleteAction {
  type: ActionType.FETCH_CELLS_COMPLETE;
  payload: { order: string[]; data: { [key: string]: Cell }; title: string };
}

export interface FetchCellsErrorAction {
  type: ActionType.FETCH_CELLS_ERROR;
  payload: string;
}

export interface SaveCellsErrorAction {
  type: ActionType.SAVE_CELLS_ERROR;
  payload: string;
}

export interface ExportBookSuccess {
  type: ActionType.EXPORT_BOOK_SUCCESS;
}

export interface ExportBookError {
  type: ActionType.EXPORT_BOOK_ERROR;
  payload: string;
}

export interface UpdateTitleAction {
  type: ActionType.UPDATE_CELLS_TITLE;
  payload: string;
}

export interface ImportBookAction {
  type: ActionType.IMPORT_BOOK;
}

export interface ImportBookCompleteAction {
  type: ActionType.IMPORT_BOOK_COMPLETE;
  payload: { order: string[]; data: { [key: string]: Cell }; title: string };
}

export interface ImportBookErrorAction {
  type: ActionType.IMPORT_BOOK_ERROR;
  payload: string;
}

export type Action =
  | MoveCellAction
  | DeleteCellAction
  | InsertCellAfterAction
  | UpdateCellAction
  | BundleStartAction
  | BundleCompleteAction
  | FetchCellsAction
  | FetchCellsCompleteAction
  | FetchCellsErrorAction
  | SaveCellsErrorAction
  | ExportBookSuccess
  | ExportBookError
  | UpdateTitleAction
  | ImportBookAction
  | ImportBookCompleteAction
  | ImportBookErrorAction;
