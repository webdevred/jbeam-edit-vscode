import * as path from "path";
import * as vscode from "vscode";
import {
  expect
} from "chai";

const workspacePath = path.resolve(__dirname, "../../../external/jbeam-edit/examples/jbeam");
const testFile = path.join(workspacePath, "fender.jbeam");

suite("JBeam LSP integration test", function() {
  this.timeout(20000);

  test("Formats document via LSP", async () => {
    const ext = vscode.extensions.getExtension("webdevred.jbeam-lsp");
    if (!ext) throw new Error("Extension not found");
    await ext.activate();

    await new Promise(r => setTimeout(r, 1500));

    const document = await vscode.workspace.openTextDocument(testFile);
    const editor = await vscode.window.showTextDocument(document);

    const before = document.getText();

    await vscode.commands.executeCommand("jbeam.formatDocument");

    await new Promise(r => setTimeout(r, 800));

    const after = editor.document.getText();

    expect(after.length).to.be.greaterThan(0);
    expect(after).to.not.equal(before);

    const formattedPath = path.resolve(__dirname, "../../../external/jbeam-edit/examples/formatted_jbeam/fender-minimal-jbfl.jbeam");
    const formattedDoc = await vscode.workspace.openTextDocument(formattedPath);
    expect(after).to.equal(formattedDoc.getText());
  });
});
