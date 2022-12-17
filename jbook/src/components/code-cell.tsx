import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks';
import { useTypedSelector } from '../hooks/use-typed-selector';
import './code-cell.css';

interface CodeCellProps {
  cell: Cell;
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  const { updateCell, createBundle } = useActions();
  const bundle = useTypedSelector((state) => state.bundles[cell.id]);
  const cummulativeCode = useTypedSelector((state) => {
    const { data, order } = state.cells;
    const orderedCells = order.map((id) => data[id]);
    const cummulativeCode = [
      `
        const show = (value) => {
          const root = document.querySelector('#root');
          
          if (typeof value === 'object') {
            if (value.$$typeof && value.props) {
              ReactDOM.render(value, root);
            } else {
              root.innerHTML = JSON.stringify(value);
            }
          } else {
            root.innerHTML = value;
          }
        };
      `
    ];
    for (let c of orderedCells) {
      if (c.type === 'code') {
        cummulativeCode.push(c.content);
      }

      // Only take the code up to the cell we are currently in. If we're at the current cell, we want to stop.
      // Otherwise we'll pick up code and variables from cells after the current one.
      if (c.id === cell.id) {
        break;
      }
    }
    return cummulativeCode;
  });

  useEffect(() => {
    // When the cell is initially loaded there is no bundle so we don't want to wait for the delay to kick off that
    // bundling process.
    if (!bundle) {
      createBundle(cell.id, cummulativeCode.join('\n'));
    }

    const timer = setTimeout(async () => {
      createBundle(cell.id, cummulativeCode.join('\n'));
    }, 750);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cummulativeCode.join('\n'), cell.id, createBundle]);

  return (
    <Resizable direction="vertical">
      <div
        style={{
          height: 'calc(100% - 10px)',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <Resizable direction="horizontal">
          <CodeEditor
            initialValue={cell.content}
            onChange={(value) => updateCell(cell.id, value)}
          />
        </Resizable>
        <div className="progress-wrapper">
          {!bundle || bundle.loading ? (
            <div className="progress-cover">
              <progress className="progress is-small is-primary" max="100">
                Loading
              </progress>
            </div>
          ) : (
            <Preview code={bundle.code} error={bundle.error} />
          )}
        </div>
      </div>
    </Resizable>
  );
};

export default CodeCell;
