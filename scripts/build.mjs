import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: {
    cli: 'bin/cli.ts',
    index: 'src/index.ts',
  },
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: 'esnext',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  sourcemap: true,
  packages: 'external',
  logLevel: 'info',
});
