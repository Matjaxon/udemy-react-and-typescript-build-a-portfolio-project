import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

let service: esbuild.Service;

export interface BundleResult {
  code: string;
  error?: string;
}

const bundle = async (rawCode: string): Promise<BundleResult> => {
  // Only need to start the service once.
  if (!service) {
    service = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    });
  }

  try {
    const result = await service.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [
        unpkgPathPlugin(), // Figure out how to resolve items from unpkg
        fetchPlugin(rawCode) // Then fetch them from unpkg
      ],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window'
      },
      /**
       * Instructing esbuild to use this method when it transpiles JSX. Rather than transpiling <h1>Foo</h1>
       * to React.createElement("h1", ...) it will instead use _React.createElement("h1", ...). We've imported
       * react and react-dom as _React and _ReactDOM in our bunding process to make it always available for users
       * and to avoid naming collisions if they also import it themselves in their code. esbuild won't bundle duplicate
       * versions of these libraries.
       */
      jsxFactory: '_React.createElement',
      jsxFragment: '_React.Fragment'
    });

    const bundlerResult: BundleResult = {
      error: undefined,
      code: result.outputFiles[0].text
    };

    return bundlerResult;
  } catch (err) {
    if (err instanceof Error) {
      const result: BundleResult = {
        code: '',
        error: err.message
      };
      return result;
    } else {
      throw err;
    }
  }
};

export default bundle;
