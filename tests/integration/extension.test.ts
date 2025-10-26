import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  const serverPath = process.env.JBEAM_LSP_PATH ||
    "C:\\Program Files (x86)\\jbeam-edit\\jbeam-lsp-server.exe";

  const serverOptions: ServerOptions = {
    run: {
      command: serverPath,
      args: ['--stdio']
    },
    debug: {
      command: serverPath,
      args: ['--stdio']
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{
      scheme: 'file',
      language: 'jbeam'
    }]
  };

  client = new LanguageClient(
    'jbeamLsp',
    'JBeam Language Server',
    serverOptions,
    clientOptions
  );

  client.start();

  context.subscriptions.push({
    dispose: () => client.stop()
  });
}
