import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  runTests,
} from "@vscode/test-electron";
import {
  expect,
  onTestFinished,
  test,
} from "vitest";

const repoRoot = path.resolve(__dirname, "..");
const examplesPath = path.join(repoRoot, "external/jbeam-edit/examples");

function lineEndingOf(text: string): string {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function withLineEnding(text: string, lineEnding: string): string {
  return text.replace(/\r?\n/g, lineEnding);
}

test("formats a document through the language server", async () => {
  const inputPath = path.join(examplesPath, "jbeam/fender.jbeam");
  const expectedPath = path.join(examplesPath, "formatted_jbeam/fender-minimal-jbfl.jbeam");
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "jbeam-lsp-test-"));
  onTestFinished(() => fs.rmSync(outputDir, {
    recursive: true,
  }));
  const outputPath = path.join(outputDir, "formatted.jbeam");

  await runTests({
    extensionDevelopmentPath: repoRoot,
    extensionTestsPath: path.join(repoRoot, "dist/tests/host/formatDocument.js"),
    version: process.env.VSCODE_VERSION || "stable",
    launchArgs: ["--disable-extensions"],
    extensionTestsEnv: {
      JBEAM_TEST_INPUT: inputPath,
      JBEAM_TEST_OUTPUT: outputPath,
    },
  });

  const input = fs.readFileSync(inputPath, "utf8");
  const expected = fs.readFileSync(expectedPath, "utf8");
  const formatted = fs.readFileSync(outputPath, "utf8");
  expect(formatted).toBe(withLineEnding(expected, lineEndingOf(input)));
}, 300_000);
