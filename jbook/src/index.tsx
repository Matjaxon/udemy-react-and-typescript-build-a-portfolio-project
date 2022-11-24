import ReactDOM from 'react-dom/client';
import CodeCell from './components/code-cell';
import 'bulmaswatch/superhero/bulmaswatch.min.css';
import { Provider } from 'react-redux';
import { store } from './state';
import TextEditor from './components/text-editor';

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <TextEditor />
      </div>
    </Provider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);
