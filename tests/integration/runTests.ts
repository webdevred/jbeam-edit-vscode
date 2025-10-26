import * as path from 'path';
import {
  runTests
} from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './integration/extension.test.ts');

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
