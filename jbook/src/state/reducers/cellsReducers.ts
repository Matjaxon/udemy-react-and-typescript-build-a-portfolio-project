import produce from 'immer';
import { ActionType } from '../action-types';
import { Action } from '../actions';
import { Cell } from '../cell';

interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {}
};

/** By using `produce` here we don't need to return a new state from each action. `state` also seems
 * to be created and passed in by produce so it's OK to update it directly rather than rebuiding the
 * state when handling the action.
 *
 * While we don't have to explicitly return state because we're using immer, simply returning, rather than
 * returning state will leave TS thinking that state can be undefined and will create to issues with expecting
 * values from state to potentially be undefined. Returning state solves this problem.
 */
const reducer = produce(
  (state: CellsState = initialState, action: Action): CellsState => {
    switch (action.type) {
      case ActionType.UPDATE_CELL:
        const { id, content } = action.payload;
        state.data[id].content = content;
        return state; // Ensure we don't fall through.

      case ActionType.DELETE_CELL:
        // Payload for Delete action simply contains the ID of the cell to delete.
        delete state.data[action.payload];
        state.order = state.order.filter((id) => id !== action.payload);
        return state;

      case ActionType.MOVE_CELL:
        const { direction } = action.payload;
        const index = state.order.findIndex((id) => id === action.payload.id);
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // If already in last spot, it can't be moved down. If already in the first spot, it can't be moved up.
        if (targetIndex < 0 || targetIndex > state.order.length - 1) {
          // If illegal spot, return early.
          return state;
        }

        state.order[index] = state.order[targetIndex];
        state.order[targetIndex] = action.payload.id;
        return state;

      case ActionType.INSERT_CELL_AFTER:
        const cell: Cell = {
          content: '',
          type: action.payload.type,
          id: randomId()
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
        return state;

      default:
        return state;
    }
  },
  initialState
);

const randomId = () => {
  return Math.random().toString(36).substring(2, 7);
};

export default reducer;
