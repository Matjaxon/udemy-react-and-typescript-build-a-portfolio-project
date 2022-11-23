import { useEffect, useRef } from 'react';

interface PreviewProps {
  code: string;
}

const html = `
<html>
  <head></head>
  <body>
    <div id="root"></div>
    <script>
      window.addEventListener('message', (event) => {
        try {
          eval(event.data)
        } catch (err) {
          const root = document.querySelector('#root');
          root.innerHTML = '<div style="color: red"><h4>Runtime Error</h4>' + err + '</div>';
          throw err;
        }
      }, false);
    </script>
  </body>
</html>
`;

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    // Reset the HTML of the iFrame before we transpile and execute the user code.
    // This addresses edge cases where the user may have deleted the #root <div> that
    // we added for them to inject React code into.
    iframe.current.srcdoc = html;

    iframe.current.contentWindow.postMessage(code, '*');
  }, [code]);

  return <iframe srcDoc={html} ref={iframe} sandbox="allow-scripts" />;
};

export default Preview;
