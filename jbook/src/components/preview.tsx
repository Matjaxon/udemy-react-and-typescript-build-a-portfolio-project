import { useEffect, useRef } from 'react';
import './preview.css';

interface PreviewProps {
  code: string;
  error?: string;
}

const html = `
<html>
  <head>
    <style>html { background-color: white; }</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const handleError = (err) => {
        const root = document.querySelector('#root');
        root.innerHTML = '<div style="color: red"><h4>Runtime Error</h4>' + err + '</div>';
        throw err;
      }

      // Handle asynchronous errors by adding an event lister to the window for errors.
      window.addEventListener('error', (event) => {
        event.preventDefault();
        handleError(event.error);
      });

      window.addEventListener('message', (event) => {
        try {
          eval(event.data)
        } catch (err) {
          handleError(err);
        }
      }, false);
    </script>
  </body>
</html>
`;

// Display this HTML inside of the preview window if an error is encountered during the bundling process
const getErrorHtml = (error: string) => {
  const escapedError = error
    .replace(/\n/g, '') // Remove all linebreaks
    .replace(/"/g, '\\"') // Double quotes
    .replace(/'/g, "\\'"); // Single quotes

  return `
    <html>
      <head>
        <style>html { background-color: white; }</style>
      </head>
      <body>
        <div id="root"/></div>
        <script>
          const root = document.querySelector('#root');
          root.innerHTML = '<div style="color: red"><h4>Compile Error</h4>${escapedError}</div>';
          throw '${escapedError}';
        </script>
      </body>
    </html>
  `;
};

const Preview: React.FC<PreviewProps> = ({ code, error }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    // Reset the HTML of the iFrame before we transpile and execute the user code.
    // This addresses edge cases where the user may have deleted the #root <div> that
    // we added for them to inject React code into.
    iframe.current.srcdoc = error ? getErrorHtml(error) : html;

    // This minor delay allows the browser to properly replace the html before trying to post a message.
    setTimeout(() => {
      iframe.current.contentWindow.postMessage(code, '*');
    }, 50);
  }, [code, error]);

  return (
    <div className="preview-wrapper">
      <iframe srcDoc={html} ref={iframe} sandbox="allow-scripts" />
    </div>
  );
};

export default Preview;
