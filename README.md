# aws-sdk-js-v3-all

This package serves as a monolithic bundling for all AWS SDK JS v3 packages.

It used to be a simple dependency aggregator, but NPM chokes when trying to install all packages and Yarn isn't too happy either, so now we bundle them all into a single entry point.

## Usage

```bash
npm install aws-sdk-js-v3-all
```

And use as follows:

```js
// ESM
import { dynamodb } from 'aws-sdk-js-v3-all';

// CommonJS
const { dynamodb } = require('aws-sdk-js-v3-all');

const client = new dynamodb.DynamoDB(...);
```

## How it works

This package:

1. Contains a script that scans the official [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3) repository
2. Extracts all client package names and versions
3. Adds the packages as dependencies, installs them using yarn, and uses esbuild to make a bundled version of the SDK.
4. Runs automatically every week via GitHub Actions to stay up-to-date
5. Publishes a new version whenever there are changes

## License

MIT
