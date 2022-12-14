import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks';
import { useTypedSelector } from '../hooks/use-typed-selector';
import './code-cell.css';
import { useCummulativeCode } from '../hooks/use-cummulative-code';

interface CodeCellProps {
  cell: Cell;
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  const { updateCell, createBundle } = useActions();
  const bundle = useTypedSelector((state) => state.bundles[cell.id]);
  const cummulativeCode = useCummulativeCode(cell.id);

  useEffect(() => {
    // When the cell is initially loaded there is no bundle so we don't want to wait for the delay to kick off that
    // bundling process.
    if (!bundle) {
      createBundle(cell.id, cummulativeCode);
    }

    const timer = setTimeout(async () => {
      createBundle(cell.id, cummulativeCode);
    }, 750);

    return () => {
      clearTimeout(timer);
    };
    // Need to disable the linting below because of the reference to bundle. If you add
    // bundle it will trigger an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cummulativeCode, cell.id, createBundle]);

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
