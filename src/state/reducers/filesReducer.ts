import { produce } from "immer";
import { ActionType } from "../action-types";
import { Action } from "../actions";

interface FileState {
  loading: boolean;
  error: string | null;
  localFiles: string[];
}

const initialFileState: FileState = {
  loading: false,
  error: null,
  localFiles: [],
};

const reducer = produce(
  (state: FileState = initialFileState, action: Action): FileState => {
    switch (action.type) {
      case ActionType.EXPORT_BOOK:
        return state;

      default:
        return state;
    }
  },
  initialFileState
);

export default reducer;
