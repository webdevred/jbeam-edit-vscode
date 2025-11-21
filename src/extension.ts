import * as vscode from 'vscode';
import {
  platform,
} from 'os';
import {
  execSync,
} from 'child_process';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isExeInPath(exeName: string): boolean {
  const cmd = platform() === 'win32' ? `where ${exeName}` : `which ${exeName}`;
  try {
    const result = execSync(cmd, {
      stdio: 'pipe',
    }).toString().trim();
    return result.length > 0;
  } catch {
    return false;
  }
}

export function activate(context: vscode.ExtensionContext) {
  let serverPath = process.env.JBEAM_LSP_PATH || 'jbeam-lsp-server';
  console.log('[jbeam] activate: serverPath =', serverPath);

  if (!isExeInPath(serverPath) && platform() === 'win32') {
    console.log(`[jbeam] could not find ${serverPath}, checking inside Program Files (x86)`);
    serverPath = "C:\\Program Files (x86)\\jbeam-edit\\jbeam-lsp-server.exe";
  }

  const serverOptions: ServerOptions = {
    run: {
      command: serverPath,
      args: [],
    },
    debug: {
      command: serverPath,
      args: [],
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{
      scheme: 'file',
      language: 'jbeam',
    }],
  };

  client = new LanguageClient('jbeamLsp', 'JBeam Language Server', serverOptions, clientOptions);

  console.log('[jbeam] starting language client...');
  try {
    client.start();
  } catch (err) {
    console.error('[jbeam] client.start() threw:', err);
  }

  const anyClient = client as unknown as {
    onReady ? : () => Promise < void >
  };

  (async () => {
    if (typeof anyClient.onReady === 'function') {
      try {
        console.log('[jbeam] waiting for client.onReady()...');
        await anyClient.onReady!();
        console.log('[jbeam] client.onReady resolved');
      } catch (err) {
        console.error('[jbeam] client.onReady rejected:', err);
      }
    } else {
      console.log('[jbeam] client.onReady not available, waiting fallback 1500ms...');
      await sleep(1500);
      console.log('[jbeam] fallback wait complete');
    }

    const formatCommand = vscode.commands.registerCommand('jbeam.formatDocument', async () => {
      console.log('[jbeam] command invoked: jbeam.formatDocument');

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        console.log('[jbeam] no active editor');
        return;
      }

      const document = editor.document;
      if (!client) {
        console.log('[jbeam] language client is not initialized');
        return;
      }

      try {
        const edits = await client.sendRequest < LSPTextEdit[] > ('textDocument/formatting', {
          textDocument: {
            uri: document.uri.toString(),
          },
          options: {
            tabSize: editor.options.tabSize || 2,
            insertSpaces: true,
          },
        });

        if (edits && edits.length > 0) {
          const workspaceEdit = new vscode.WorkspaceEdit();
          for (const edit of edits) {
            workspaceEdit.replace(
              document.uri,
              new vscode.Range(
                new vscode.Position(edit.range.start.line, edit.range.start.character),
                new vscode.Position(edit.range.end.line, edit.range.end.character),
              ),
              edit.newText,
            );
          }
          const applied = await vscode.workspace.applyEdit(workspaceEdit);
          console.log('[jbeam] applied edits:', applied);
        } else {
          console.log('[jbeam] no edits returned from server');
        }
      } catch (err) {
        console.error('[jbeam] JBeam format failed:', err);
        vscode.window.showErrorMessage('JBeam format failed: ' + err);
      }
    });

    context.subscriptions.push(formatCommand);
    console.log('[jbeam] command registered');
  })();

  context.subscriptions.push({
    dispose: () => {
      console.log('[jbeam] disposing language client');
      return client ? client.stop() : undefined;
    },
  });
}

export function deactivate(): Thenable < void > | undefined {
  console.log('[jbeam] deactivate called');
  return client ? client.stop() : undefined;
}
