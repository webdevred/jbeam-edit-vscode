# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important notes for Claude

**Do not run `npm run test` in your environment.** Tests require a real VS Code instance, a running `jbeam-lsp-server` binary, and the `external/jbeam-edit` git submodule — none of which are available here. Ask the user to run tests locally instead.

## Commands

```bash
npm run lint        # TypeScript type-check + ESLint
npm run build       # lint + bundle with esbuild → dist/src/extension.js
npm run format      # format all .ts files in-place recursively with js-beautify
npm run test        # build + tsc -p . (compiles tests) + run integration tests via @vscode/test-electron
npm run package     # vsce package → .vsix
```

**Lint only:**
```bash
tsc --noEmit                  # type-check only
eslint src tests              # lint only
```

**Build only (skip lint):**
```bash
esbuild src/extension.ts --bundle --platform=node --external:vscode --external:vscode-languageclient/node --minify --outfile=dist/src/extension.js
```

## Architecture

This is a minimal VS Code/Codium extension that acts as an LSP client for the external `jbeam-lsp-server` binary. It does not implement any language intelligence itself.

**Key design points:**

- `src/extension.ts` — the entire extension logic. On activation it:
  1. Locates `jbeam-lsp-server` (via `$JBEAM_LSP_PATH` env var, PATH lookup, or Windows fallback path)
  2. Starts a `LanguageClient` connecting to that binary over stdio
  3. Registers the `jbeam.formatDocument` command (bound to `Ctrl+Alt+F` for `.jbeam` files), which sends `textDocument/formatting` LSP requests to the server and applies the returned text edits

- `src/jbfl.tmLanguage.json` — TextMate grammar for syntax highlighting `.jbfl` files
- `src/language-jbfl-config.json` — language configuration (brackets, comments) for `.jbfl`
- Extension activates on `onLanguage:jbeam` and `onLanguage:jbfl`

**Test setup:**

- Integration tests run inside a real VS Code instance via `@vscode/test-electron`
- `tests/integration/run.ts` — launches VS Code with the extension under test
- `tests/suite/index.ts` — Mocha TDD runner entry point
- `tests/suite/extension.test.ts` — single test: opens `external/jbeam-edit/examples/jbeam/fender.jbeam`, executes `jbeam.formatDocument`, and compares output against `external/jbeam-edit/examples/formatted_jbeam/fender-minimal-jbfl.jbeam`
- Tests require a running `jbeam-lsp-server` and the `external/jbeam-edit` git submodule to be checked out

**CI:**

- `.github/workflows/format.yml` — runs on every push/PR; checks that `npm run format` produces no diff
- `.github/workflows/test.yaml` — runs on every push/PR:
  1. `get-jbeam-edit-versions` job (Ubuntu): runs `scripts/Get-Releases.ps1` to build the test matrix
  2. `integration-test` job (Windows, matrix): checks out submodules, installs deps, checks formatting, checks out the matching `external/jbeam-edit` tag, runs `scripts/setup_jbeam_server.ps1` to install the server, converts line endings in example files, then runs `npm run test`
- `.github/workflows/build-and-release.yaml` — runs on every push/PR and tag pushes; builds and packages the extension; publishes to the VS Marketplace via `vsce publish` on tag pushes
- `scripts/Get-Releases.ps1` — queries `webdevred/jbeam_edit` GitHub releases and builds a CI matrix JSON (jbeam versions cross VS Code versions); the matrix includes the minimum required version and the latest compatible release
- `scripts/setup_jbeam_server.ps1` — downloads and silently installs the `jbeam-lsp-server` Windows release from `webdevred/jbeam_edit` GitHub releases; the install path is `C:\Program Files (x86)\jbeam-edit\jbeam-lsp-server.exe`

**External dependency:**

The `external/jbeam-edit` directory is a git submodule pointing to the companion server repository. The submodule must be initialized for tests to run.
