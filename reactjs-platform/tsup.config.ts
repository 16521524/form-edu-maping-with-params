import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'tsup';
import { prependDirective } from 'tsup-plugin-prepend-directive';
import packageJson from './package.json';

const sourceRoot = process.cwd();
const ignoredDirs = new Set(['dist', 'node_modules', 'ui/core-table']);
const sourceExtensions = new Set(['.ts', '.tsx']);

const walkSourceFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(path.join(sourceRoot, dir), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(relativePath)) {
        files.push(...(await walkSourceFiles(relativePath)));
      }

      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name)) && !entry.name.endsWith('.d.ts')) {
      files.push(relativePath);
    }
  }

  return files;
};

const toEntryName = (filePath: string): string => {
  const parsedPath = path.parse(filePath);
  const pathWithoutExtension = path.join(parsedPath.dir, parsedPath.name);

  if (parsedPath.name === 'index') {
    return parsedPath.dir || 'index';
  }

  return pathWithoutExtension;
};

const createEntries = async () => {
  const files = ['index.ts', ...(await walkSourceFiles('ui')), ...(await walkSourceFiles('utilities'))];
  const entries: Record<string, string> = {};

  for (const filePath of files) {
    const normalizedFilePath = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
    const entryName = toEntryName(normalizedFilePath).replace(/\\/g, '/').replace(/^\.\//, '');

    if (!entries[entryName]) {
      entries[entryName] = normalizedFilePath;
    }
  }

  return entries;
};

const external = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
];

export default defineConfig(async () => ({
  entry: await createEntries(),
  outDir: 'dist',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  splitting: false,
  clean: true,
  silent: true,
  treeshake: true,
  target: 'es2022',
  platform: 'browser',
  external,
  plugins: [prependDirective('"use client"', ['dist'])],
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
  async onSuccess() {
    if (!existsSync(path.join(sourceRoot, 'dist/index.js'))) {
      throw new Error('reactjs-platform build did not emit dist/index.js');
    }
  },
}));
