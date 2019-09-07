import fs, { PathLike } from 'fs';
import path from 'path';
import url from 'url';

export type ResolveApp = (relativePath: string) => string;

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp: ResolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(inputPath: string, needsSlash: boolean) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}

const getPublicUrl = (appPackageJson: PathLike) => envPublicUrl || require(appPackageJson as string).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson: PathLike): string {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl = envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}

const moduleFileExtensions: string[] = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];


// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn: ResolveApp, filePath: string) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }
  return resolveFn(`${filePath}.js`);
};

const dotenv = resolveApp('.env');
const appPath = resolveApp('.');
const appBuild = resolveApp('build');
const appPublic = resolveApp('public');
const appHtml = resolveApp('public/index.html');
const appIndexJs = resolveModule(resolveApp, 'src/index');
const appPackageJson = resolveApp('package.json');
const appSrc = resolveApp('src');
const appKKTRC = resolveApp('.kktrc.js');
const appTsConfig = resolveApp('tsconfig.json');
const appJsConfig = resolveApp('jsconfig.json');
const yarnLockFile = resolveApp('yarn.lock');
const testsSetup = resolveModule(resolveApp, 'src/setupTests');
const proxySetup = resolveApp('src/setupProxy.js');
const appNodeModules = resolveApp('node_modules');
const publicUrl = getPublicUrl(resolveApp('package.json'));
const servedPath = getServedPath(resolveApp('package.json'));

// export type Des = { [key: string]: string }
// config after eject: we're in ./config/
export {
  dotenv,
  appPath,
  appBuild,
  appPublic,
  appHtml,
  appIndexJs,
  appPackageJson,
  appSrc,
  appKKTRC,
  appTsConfig,
  appJsConfig,
  yarnLockFile,
  testsSetup,
  proxySetup,
  appNodeModules,
  publicUrl,
  servedPath,
  // --->
  moduleFileExtensions,
};
