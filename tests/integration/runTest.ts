import * as path from 'path';
import {
  runTests
} from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../'); // root of extension
    const extensionTestsPath = path.resolve(__dirname, 'extension.test.ts'); // fix here

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      version: 'stable'
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
