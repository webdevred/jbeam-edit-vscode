import * as fs from "fs";
import * as vscode from "vscode";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export async function run(): Promise < void > {
  const inputPath = requiredEnv("JBEAM_TEST_INPUT");
  const outputPath = requiredEnv("JBEAM_TEST_OUTPUT");

  const ext = vscode.extensions.getExtension("webdevred.jbeam-lsp");
  if (!ext) {
    throw new Error("Extension not found");
  }
  await ext.activate();

  const document = await vscode.workspace.openTextDocument(inputPath);
  const editor = await vscode.window.showTextDocument(document);

  await vscode.commands.executeCommand("jbeam.formatDocument");

  fs.writeFileSync(outputPath, editor.document.getText());
}
