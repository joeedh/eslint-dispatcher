import { run } from '../src/eslint.ts';

const startTime = performance.now();
await run(process.argv[2] ?? '.', process.argv.slice(3)).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
process.stdout.write(`Total time: ${((performance.now() - startTime) / 1000.0).toFixed(2)}s\n`);
