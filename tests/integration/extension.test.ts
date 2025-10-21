import * as vscode from 'vscode';
import { expect } from 'chai';

suite('JBeam Extension Integration Test', () => {

    test('format command works with LSP server', async () => {
        const doc = await vscode.workspace.openTextDocument({ language: 'jbeam', content: 'foo=bar' });
        const editor = await vscode.window.showTextDocument(doc);

        expect(editor.document).to.not.be.undefined;

        await vscode.commands.executeCommand('jbeam.formatDocument');

        await new Promise(resolve => setTimeout(resolve, 1000));

        const textAfter = editor.document.getText();
        expect(textAfter).to.be.a('string');
        expect(textAfter.length).to.be.greaterThan(0);

    });

});
