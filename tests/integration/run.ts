import * as path from "path";
import {
  runTests
} from "@vscode/test-electron";

async function main() {
  try {
    // Projektroten med package.json
    const extensionDevelopmentPath = path.resolve(__dirname, "../../../");

    // Kompilerad test-suite
    const extensionTestsPath = path.resolve(__dirname, "../suite");

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ["--disable-extensions"]
    });

    console.log("Integration tests completed successfully!");
  } catch (err) {
    console.error("Failed to run integration tests:", err);
    process.exit(1);
  }
}

main();
