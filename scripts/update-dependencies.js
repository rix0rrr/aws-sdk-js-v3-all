#!/usr/bin/env node

/**
 * This script:
 * 1. Clones the aws-sdk-js-v3 repository to a temporary directory
 * 2. Scans all clients package.json files to find all AWS SDK JS v3 packages
 * 3. Updates the package.json file with the latest versions as peer dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const semver = require('semver');

// Create a temporary directory
const tempDir = path.join(os.tmpdir(), `aws-sdk-js-v3-clone-${Date.now()}`);
console.log(`Creating temporary directory: ${tempDir}`);
fs.mkdirSync(tempDir, { recursive: true });

try {
  // Clone the repository
  console.log('Cloning aws-sdk-js-v3 repository...');
  execSync(`git clone --depth 1 https://github.com/aws/aws-sdk-js-v3.git ${tempDir}`, { stdio: 'inherit' });

  // Find all client package.json files
  console.log('Scanning for client packages...');
  const clientsDir = path.join(tempDir, 'clients');
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

  // Also check for core packages in the root packages directory
  const packagesDir = path.join(tempDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    packageDirs.forEach(packageDir => {
      const packageJsonPath = path.join(packagesDir, packageDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name && packageJson.name.startsWith('@aws-sdk/')) {
          dependencies[packageJson.name] = packageJson.version;
        }
      }
    });
  }

  // Update our package.json
  console.log(`Found ${Object.keys(dependencies).length} AWS SDK JS v3 packages`);
  const ourPackageJsonPath = path.join(__dirname, '..', 'package.json');
  const ourPackageJson = JSON.parse(fs.readFileSync(ourPackageJsonPath, 'utf8'));

  ourPackageJson.peerDependencies = dependencies;

  // Our version will become the highest version we've seen
  const versions = Array.from(new Set(Object.values(dependencies)));
  versions.sort(semver.rcompare);

  ourPackageJson.version = versions[0];

  // Write the updated package.json
  fs.writeFileSync(ourPackageJsonPath, JSON.stringify(ourPackageJson, null, 2) + '\n');
  console.log('Updated package.json with all AWS SDK JS v3 packages as peer dependencies');

} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} finally {
  // Clean up
  console.log(`Cleaning up temporary directory: ${tempDir}`);
  fs.rmSync(tempDir, { recursive: true, force: true });
}
