import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as vscode from 'vscode';
import { expect } from 'chai';

function normalize(s: string): string {
    return s.replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.replace(/\s+$/u, ''))
        .join('\n')
        .replace(/\s+$/u, ''); // trim final trailing whitespace/newline
}

suite('JBeam Extension Integration - examples', () => {
    test('fender.jbeam formats to fender-minimal-jbfl.jbeam', async () => {
        const examplesBase = process.env.JBEAM_EXAMPLES_PATH
            ? process.env.JBEAM_EXAMPLES_PATH
            : path.resolve(__dirname, '../../examples');

        const srcRelative = path.join('jbeam', 'fender.jbeam');
        const expectedRelative = path.join('formatted_jbeam', 'fender-minimal-jbfl.jbeam');

        const srcPath = path.join(examplesBase, srcRelative);
        const expectedPath = path.join(examplesBase, expectedRelative);

        if (!fs.existsSync(srcPath)) {
            throw new Error(`Source example not found: ${srcPath}`);
        }
        if (!fs.existsSync(expectedPath)) {
            throw new Error(`Expected formatted example not found: ${expectedPath}`);
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jbeam-example-'));
        const targetPath = path.join(tmpDir, 'fender.jbeam');
        fs.copyFileSync(srcPath, targetPath);

        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(targetPath));
        const editor = await vscode.window.showTextDocument(doc);

        await new Promise((r) => setTimeout(r, 2000));

        await vscode.commands.executeCommand('jbeam.formatDocument');

        await new Promise((r) => setTimeout(r, 600));

        const actualText = normalize(editor.document.getText());
        const expectedText = normalize(fs.readFileSync(expectedPath, 'utf8'));

        expect(actualText).to.equal(expectedText, 'Formatted output did not match expected file');

        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        try { fs.unlinkSync(targetPath); fs.rmdirSync(tmpDir); } catch (_) { /* ignore */ }
    }).timeout(20000); // allow more time in CI if needed
});
