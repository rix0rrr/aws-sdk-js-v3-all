# aws-sdk-js-v3-all

This package serves as a dependency aggregator for all AWS SDK JS v3 packages. It doesn't provide any functionality itself but ensures that all AWS SDK JS v3 packages are listed as peer dependencies.

## Purpose

The main purpose of this package is to:

1. Provide a single dependency that includes all AWS SDK JS v3 packages as peer dependencies
2. Automatically stay up-to-date with the latest AWS SDK JS v3 packages through weekly updates
3. Simplify dependency management for projects that need access to multiple AWS services

## Usage

```bash
npm install aws-sdk-js-v3-all
```

Then, you can install only the AWS SDK packages you need, and they will be compatible with the versions specified in this package.

## How it works

This package:

1. Contains a script that scans the official [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3) repository
2. Extracts all client package names and versions
3. Updates the package.json with these packages as peer dependencies
4. Runs automatically every week via GitHub Actions to stay up-to-date
5. Publishes a new version whenever there are changes

## License

MIT
