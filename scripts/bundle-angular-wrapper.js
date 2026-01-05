const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Configuration ---
const projectRoot = path.resolve(__dirname, '..');
const wrapperLibPath = path.join(projectRoot, 'libs/angular-wrapper');
const coreLibPath = path.join(projectRoot, 'libs/core');

// Destination for the copied core code
const coreInternalPath = path.join(wrapperLibPath, 'src/core-internal');
const srcPath = path.join(wrapperLibPath, 'src');

// Backup storage to restore files after build
const originalFileContents = new Map();

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

function normalizePath(p) {
  return p.split(path.sep).join('/');
}

async function run() {
  console.log('🚀 Starting "Vendor" Build for @foisit/angular-wrapper...');

  try {
    // 1. Copy Core Source
    console.log(`📦 Copying core source...`);
    if (fs.existsSync(coreInternalPath)) {
      fs.rmSync(coreInternalPath, { recursive: true, force: true });
    }
    fs.cpSync(path.join(coreLibPath, 'src'), coreInternalPath, {
      recursive: true,
    });

    // 2. Rewrite Imports in Wrapper Source
    console.log('🔄 Rewriting imports to relative paths...');
    const allWrapperFiles = getAllFiles(srcPath).filter((f) =>
      f.endsWith('.ts')
    );

    allWrapperFiles.forEach((filePath) => {
      // Skip files inside the core-internal folder itself
      if (filePath.startsWith(coreInternalPath)) return;

      const content = fs.readFileSync(filePath, 'utf-8');

      // Check if file imports from @foisit/core
      if (content.includes('@foisit/core')) {
        // Back up original content
        originalFileContents.set(filePath, content);

        // Calculate relative path to core-internal
        // e.g. from src/lib/service/file.ts to src/core-internal
        const dirOfFile = path.dirname(filePath);
        let relativePath = path.relative(dirOfFile, coreInternalPath);

        // Ensure path starts with ./ or ../
        relativePath = normalizePath(relativePath);
        if (!relativePath.startsWith('.')) {
          relativePath = './' + relativePath;
        }

        // Replace the import
        // Regex handles single or double quotes: from '@foisit/core'
        const regex = /from\s+['"]@foisit\/core['"]/g;
        const newContent = content.replace(regex, `from '${relativePath}'`);

        fs.writeFileSync(filePath, newContent);
        console.log(
          `   - Rewrote ${path.basename(filePath)} -> ${relativePath}`
        );
      }
    });

    // 3. Run Build
    console.log('🔨 Building...');
    execSync('npx nx build angular-wrapper', {
      stdio: 'inherit',
      cwd: projectRoot,
    });

    console.log('✅ Build successful!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    // Don't exit yet, ensure cleanup happens!
  } finally {
    // 4. Cleanup & Restore
    console.log('broom: Restoring source files...');

    // Restore modified files
    originalFileContents.forEach((content, filePath) => {
      fs.writeFileSync(filePath, content);
    });

    // Remove the core-internal folder
    if (fs.existsSync(coreInternalPath)) {
      fs.rmSync(coreInternalPath, { recursive: true, force: true });
    }

    console.log('✨ Repository restored.');
  }
}

run();
