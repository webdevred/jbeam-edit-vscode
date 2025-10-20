import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient;

interface LSPPosition {
  line: number;
  character: number;
}

interface LSPRange {
  start: LSPPosition;
  end: LSPPosition;
}

interface LSPTextEdit {
  range: LSPRange;
  newText: string;
}

export function activate(context: vscode.ExtensionContext) {
  const serverOptions: ServerOptions = {
    run: { command: 'jbeam-lsp-server', args: ['--stdio'] },
    debug: { command: 'jbeam-lsp-server', args: ['--stdio'] }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'jbeam' }]
  };

  client = new LanguageClient(
    'jbeamLsp',
    'JBeam Language Server',
    serverOptions,
    clientOptions
  );

  client.start();

  context.subscriptions.push({ dispose: () => client.stop() });

  const formatCommand = vscode.commands.registerCommand(
    'jbeam.formatDocument',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const document = editor.document;

      if (!client) return;

      try {
        const edits = await client.sendRequest<LSPTextEdit[]>(
          'textDocument/formatting',
          {
            textDocument: { uri: document.uri.toString() },
            options: { tabSize: editor.options.tabSize || 2, insertSpaces: true }
          }
        );

        if (edits && edits.length > 0) {
          const workspaceEdit = new vscode.WorkspaceEdit();
          for (const edit of edits) {
            workspaceEdit.replace(
              document.uri,
              new vscode.Range(
                new vscode.Position(edit.range.start.line, edit.range.start.character),
                new vscode.Position(edit.range.end.line, edit.range.end.character)
              ),
              edit.newText
            );
          }
          await vscode.workspace.applyEdit(workspaceEdit);
        }
      } catch (err) {
        vscode.window.showErrorMessage('JBeam format failed: ' + err);
      }
    }
  );

  context.subscriptions.push(formatCommand);
}

export function deactivate(): Thenable<void> | undefined {
  return client ? client.stop() : undefined;
}
