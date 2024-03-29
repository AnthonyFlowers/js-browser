export enum ActionType {
  MOVE_CELL = "move_cell",
  DELETE_CELL = "delete_cell",
  INSERT_CELL_AFTER = "insert_cell_after",
  UPDATE_CELL = "update_cell",
  UPDATE_CELLS_TITLE = "update_cells_title",
  BUNDLE_START = "bundle_start",
  BUNDLE_COMPLETE = "bundle_complete",
  FETCH_CELLS = "fetch_cells",
  FETCH_CELLS_COMPLETE = "fetch_cells_complete",
  FETCH_CELLS_ERROR = "fetch_cells_error",
  SAVE_CELLS_ERROR = "save_cells_error",
  SAVE_CELLS_COMPLETE = "save_cells_complete",
  EXPORT_BOOK = "export_book",
  EXPORT_BOOK_SUCCESS = "export_book_success",
  EXPORT_BOOK_ERROR = "export_book_error",
  IMPORT_BOOK = "import_book",
  IMPORT_BOOK_COMPLETE = "import_book_complete",
  IMPORT_BOOK_ERROR = "import_book_error",
}
