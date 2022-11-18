import { Action } from '../actions/index';
import { ActionType } from '../action-types/ActionType';

interface RepositoriesState {
  loading: boolean;
  error: string | null;
  data: string[];
}

const initialState = {
  loading: false,
  error: null,
  data: []
};

const reducer = (
  state: RepositoriesState = initialState,
  action: Action
): RepositoriesState => {
  switch (action.type) {
    case ActionType.SEARCH_REPOSITORIES: // Uses the explicit string as a 'type guard'
      return { loading: true, error: null, data: [] };
    case ActionType.SEARCH_REPOSITORIES_SUCCESS:
      // 100% certain that 'action' is a SearchRepositoriesSuccessAction
      return { loading: false, error: null, data: action.payload };
    case ActionType.SEARCH_REPOSITORIES_ERROR:
      return { loading: false, error: action.payload, data: [] };
    default:
      return state;
  }
};

// Original reducer before taking advantage of types.
// const reducer = (state: RepositoriesState, action: any) => {
//   switch (action.type) {
//     case 'search_repositories':
//       return { loading: true, error: null, data: [] };
//     case 'search_repositories_success':
//       return { loading: false, error: null, data: action.payload };
//     case 'search_repositories_error':
//       return { loading: false, error: action.payload, data: [] };
//     default:
//       return state;
//   }
// };

export default reducer;
