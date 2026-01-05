const fs = require('fs');
const path = require('path');

// List of wrapper libraries
const wrappers = [
  'libs/angular-wrapper/package.json',
  'libs/react-wrapper/package.json',
  'libs/vue-wrapper/package.json',
  'libs/core/package.json',
];

function bumpVersion(version, bump = 'patch') {
  const parts = version.split('.').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    throw new Error(`Invalid semver version: ${version}`);
  }

  const [major, minor, patch] = parts;
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

// Update versions
const bump = (process.argv[2] || 'patch').toLowerCase();

wrappers.forEach((pkgPath) => {
  const fullPath = path.join(__dirname, pkgPath);
  if (fs.existsSync(fullPath)) {
    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const oldVersion = pkg.version;
    const newVersion = bumpVersion(oldVersion, bump);
    pkg.version = newVersion;
    fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${pkgPath}: ${oldVersion} -> ${newVersion}`);
  } else {
    console.log(`File not found: ${pkgPath}`);
  }
});

console.log('Version update complete.');
