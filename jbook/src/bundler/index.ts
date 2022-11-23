import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

let service: esbuild.Service;

interface BundleResult {
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
      }
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
