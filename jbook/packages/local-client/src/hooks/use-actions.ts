import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../state';

export const useActions = () => {
  const dispatch = useDispatch();

  /**
   * If we simply return the bindActionCreators result and then
   * include an action from it in useEffect, it will repeatedly
   * retrigger the timer we use to debounce the user input and then bundling
   * process because these get rebound and when that happens and
   * the function will be a new instance of the same function but it won't
   * evaluate at the same. By using useMemo, we only do this process
   * once.
   */

  // Original code before using useMemo:
  // return bindActionCreators(actionCreators, dispatch);

  return useMemo(() => {
    return bindActionCreators(actionCreators, dispatch);
  }, [dispatch]);
};
