import * as path from "path";
import * as vscode from "vscode";
import {
  expect,
} from "chai";

const workspacePath = path.resolve(__dirname, "../../../external/jbeam-edit/examples/jbeam");
const testFile = path.join(workspacePath, "fender.jbeam");

suite("JBeam LSP integration test", function() {
  this.timeout(20000);

  test("Formats document via LSP", async () => {
    const ext = vscode.extensions.getExtension("webdevred.jbeam-lsp");
    if (!ext) {
      throw new Error("Extension not found");
    }
    await ext.activate();

    const document = await vscode.workspace.openTextDocument(testFile);
    const editor = await vscode.window.showTextDocument(document);

    await vscode.commands.executeCommand("jbeam.formatDocument");

    const after = editor.document.getText();

    expect(after.length).to.be.greaterThan(0);

    const formattedPath = path.resolve(__dirname, "../../../external/jbeam-edit/examples/formatted_jbeam/fender-minimal-jbfl.jbeam");
    const formattedDoc = await vscode.workspace.openTextDocument(formattedPath);
    expect(after).to.equal(formattedDoc.getText());
  });
});
