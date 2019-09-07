import { Configuration } from 'webpack';
import { OptionConf } from '../config/webpack.config';
import * as paths from '../config/paths';

// Process application JS with Babel.
// The preset includes JSX, Flow, TypeScript, and some ESnext features.
module.exports = (conf: Configuration, options: OptionConf) => {
  conf.module.rules = conf.module.rules.map((item) => {
    if (item.oneOf) {
      // Process application JS with Babel.
      // The preset includes JSX, Flow, TypeScript, and some ESnext features.
      item.oneOf.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: paths.appSrc as string,
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            [require.resolve('@tsbb/babel-preset-tsbb'), {
              targets: {
                browsers: ['last 2 versions', 'ie >= 10'],
              },
              presetReact: true,
            }]
          ],
          customize: require.resolve(
            'babel-preset-react-app/webpack-overrides'
          ),
          plugins: [
            [
              require.resolve('babel-plugin-named-asset-import'),
              {
                loaderMap: {
                  svg: {
                    ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                  },
                },
              },
            ],
          ],
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
          cacheCompression: options.isEnvProduction,
          compact: options.isEnvProduction,
        },
      });
      // Process any JS outside of the app with Babel.
      // Unlike the application JS, we only compile the standard ES features.
      item.oneOf.push({
        test: /\.(js|mjs)$/,
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          presets: [
            [
              require.resolve('babel-preset-react-app/dependencies'),
              { helpers: true },
            ],
          ],
          cacheDirectory: true,
          cacheCompression: options.isEnvProduction,

          // If an error happens in a package, it's possible to be
          // because it was compiled. Thus, we don't want the browser
          // debugger to show the original code. Instead, the code
          // being evaluated would be much more helpful.
          sourceMaps: false,
        },
      });
    }
    return item;
  });
  return conf;
};