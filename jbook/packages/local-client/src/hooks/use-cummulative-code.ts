import { useTypedSelector } from './use-typed-selector';

export const useCummulativeCode = (cellId: string) => {
  return useTypedSelector((state) => {
    const { data, order } = state.cells;
    const orderedCells = order.map((id) => data[id]);
    const showFunc = `
      import _React from 'react';
      import _ReactDOM from 'react-dom';
  
      var show = (value) => {
        const root = document.querySelector('#root');
        
        if (typeof value === 'object') {
          if (value.$$typeof && value.props) {
            _ReactDOM.render(value, root);
          } else {
            root.innerHTML = JSON.stringify(value);
          }
        } else {
          root.innerHTML = value;
        }
      };
    `;
    const showFuncNoOp = 'var show = () => {};';

    const cummulativeCode = [];
    for (let c of orderedCells) {
      if (c.type === 'code') {
        /**
         * If 'show' is called in a previous code cell but is not called in the current code cell, the previous
         * content will be displayed again. To prevent this, when we are building up the cummulative code, when we
         * are adding code from the previous cells we will define 'show' as the no-op function so nothing will be
         * displayed. If we're adding the content from the current cell, then we will define show as the function
         * that will show the results in the preview screen.
         */
        if (c.id === cellId) {
          cummulativeCode.push(showFunc);
        } else {
          cummulativeCode.push(showFuncNoOp);
        }
        cummulativeCode.push(c.content);
      }

      // Only take the code up to the cell we are currently in. If we're at the current cell, we want to stop.
      // Otherwise we'll pick up code and variables from cells after the current one.
      if (c.id === cellId) {
        break;
      }
    }
    return cummulativeCode;
  }).join('\n');
};
