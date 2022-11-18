import { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { actionCreators } from '../state';
import { useActions } from '../hooks/useActions';
import { useTypedSelector } from '../hooks/useTypeSelector';

const RepositoriesList: React.FC = () => {
  const [term, setTerm] = useState('');
  const { searchRepositories } = useActions();

  // By using the TypedSelector that is setup with some weird react-redux boilerplate
  // code lets the TS compiler know what the shape of `state` is.
  const { data, error, loading } = useTypedSelector(
    (state) => state.repositories
  ); // Extract what we want from the store

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Original code we wrote to dispatch an action to dispatch. Can be refactored.
    // dispatch(actionCreators.searchRepositories(term) as any);

    // The above code, along with the process for doing that for other actions
    // has been abstracted to `useActions`, greatly simplifying what we need to write
    // for each action that's invoked.
    searchRepositories(term);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={term} onChange={(e) => setTerm(e.target.value)} />
        <button>Search</button>
      </form>

      {error && <h3>{error}</h3>}
      {loading && <h3>Loading...</h3>}
      {!error && !loading && data.map((name) => <div key={name}>{name}</div>)}
    </div>
  );
};

export default RepositoriesList;
