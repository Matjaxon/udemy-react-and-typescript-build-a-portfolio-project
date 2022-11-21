import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
  name: 'filecache'
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: inputCode
        };
      });

      /**
       * If esbuild doesn't get an object returned to it, it will continue to go
       * through onLoad calls. This can allow you to introduce side effects or utility
       * functions, such as checking the cache that may be applicable to both JS and CSS
       * files fetching.
       */
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // // Check if we have already fetched a file and if its in the cache
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        // // if it is, return it immediately
        if (cachedResult) {
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        // Because we can't output the css file to a filesystem if we set
        // the loader to css, we are going to instead always use a jsx loader
        // and write the contents of the CSS file as Javascript.
        // Has limitations because it can't use all of the advanced CSS features

        // Escaping newline and quotes will prevent us from having something like a single quote
        // accidently terminate a string in our code prematurely.
        const escaped = data
          .replace(/\n/g, '') // Remove all linebreaks
          .replace(/"/g, '\\"') // Double quotes
          .replace(/'/g, "\\'"); // Single quotes
        const contents = `
            const style = document.createElement('style');
            style.innerText = '${escaped}';
            document.head.appendChild(style);
          `;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx', // Always using the JSX loader.
          contents,
          resolveDir: new URL('./', request.responseURL).pathname // Use './' to get the path of the directory the file lives in rather than the filename.
        };

        // store response in cache
        await fileCache.setItem(args.path, result);
        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: 'jsx', // Always using the JSX loader.
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname // Use './' to get the path of the directory the file lives in rather than the filename.
        };

        // store response in cache
        await fileCache.setItem(args.path, result);
        return result;
      });
    }
  };
};
