#!/usr/bin/env node

/**
 * This script:
 * 1. Clones the aws-sdk-js-v3 repository to a temporary directory
 * 2. Scans all clients package.json files to find all AWS SDK JS v3 packages
 * 3. Updates the package.json file with the latest versions as peer dependencies
 */

function main() {
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');
  const os = require('os');
  const semver = require('semver');

  let sdkV3directory = process.argv[2];

  // Create a temporary directory
  let tempDir;
  if (!sdkV3directory) {
    tempDir = path.join(os.tmpdir(), `aws-sdk-js-v3-clone-${Date.now()}`);
    sdkV3directory = tempDir;
    console.log(`Creating temporary directory: ${tempDir}`);
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Clone the repository
    if (tempDir) {
      console.log('Cloning aws-sdk-js-v3 repository...');
      execSync(`git clone --depth 1 https://github.com/aws/aws-sdk-js-v3.git ${tempDir}`, { stdio: 'inherit' });
    }

    // Find all client package.json files
    console.log('Scanning for client packages...');
    const clientsDir = path.join(sdkV3directory, 'clients');
    const clientDirs = fs.readdirSync(clientsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Collect all package names and versions
    const dependencies = {};

    clientDirs.forEach(clientDir => {
      const packageJsonPath = path.join(clientsDir, clientDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name && packageJson.name.startsWith('@aws-sdk/')) {
          dependencies[packageJson.name] = packageJson.version;
        }
      }
    });

    // Update our package.json
    console.log(`Found ${Object.keys(dependencies).length} AWS SDK JS v3 packages`);
    const ourPackageJsonPath = path.join(__dirname, '..', 'package.json');
    const ourPackageJson = JSON.parse(fs.readFileSync(ourPackageJsonPath, 'utf8'));

    ourPackageJson.dependencies = dependencies;

    // Our version will become the highest version we've seen
    const versions = Array.from(new Set(Object.values(dependencies)));
    versions.sort(semver.rcompare);

    ourPackageJson.version = versions[0];

    // Write the updated package.json
    fs.writeFileSync(ourPackageJsonPath, JSON.stringify(ourPackageJson, null, 2) + '\n');
    console.log('Updated package.json and index.js');

    fs.writeFileSync('index.js', [
      'module.exports = {',
      ...Object.keys(dependencies).map(pkg => `  "${svc(pkg)}": require('${pkg}'),`),
      '};',
    ].join('\n'), 'utf-8');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (tempDir) {
      // Clean up
      console.log(`Cleaning up temporary directory: ${tempDir}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

function svc(pkg) {
  return pkg.replace(/^@aws-sdk\/client-/, '');
}

main();
