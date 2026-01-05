const esbuild = require('esbuild');
const path = require('path');

(async () => {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const entry = path.join(projectRoot, 'dist/libs/angular-wrapper/fesm2022/foisit-angular-wrapper.mjs');
    const coreEntry = path.join(projectRoot, 'dist/libs/core/src/index.js');
    const outFile = entry; // overwrite the existing bundle

    if (!require('fs').existsSync(entry)) {
      console.error('Entry file not found:', entry);
      process.exit(1);
    }

    console.log('Bundling Angular wrapper and inlining @foisit/core into:', outFile);

    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      format: 'esm',
      outfile: outFile,
      sourcemap: true,
      platform: 'neutral',
      external: [
        '@angular/core',
        '@angular/common',
        'tslib'
      ],
      plugins: [
        {
          name: 'alias-core',
          setup(build) {
            build.onResolve({ filter: /^@foisit\/core$/ }, (args) => {
              return { path: coreEntry };
            });
          },
        },
      ],
    });

    console.log('Bundling complete.');
  } catch (err) {
    console.error('Bundling failed:', err);
    process.exit(1);
  }
})();