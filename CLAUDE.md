# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the test locally

```bash
git submodule update --init
scripts/test-local.sh <path to a jbeam-lsp-server binary>
```

The script sets `JBEAM_LSP_PATH` to the binary and runs `npm run test`. With `xvfb-run` installed the script runs VS Code on a virtual display, and without it a VS Code window opens while the test runs. The first run downloads VS Code into `.vscode-test/`. The expected output comes from `external/jbeam-edit`, so check that submodule out at the core commit the server was built from. Do not run it without a server binary to point at: ask for the path instead.

## Commands

```bash
npm run lint        # TypeScript type-check + ESLint
npm run build       # lint + bundle with esbuild → dist/src/extension.js
npm run format      # format all .ts files in-place recursively with js-beautify
npm run test        # build + tsc -p . (compiles the host script) + vitest, which starts VS Code via @vscode/test-electron
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

- The test runner is vitest, but vitest cannot run inside VS Code and the `vscode` module exists nowhere else, so the test is split in two
- `tests/format.test.ts` — the vitest test, run outside VS Code: starts VS Code with the extension through `@vscode/test-electron`, then compares the file the host script wrote against `external/jbeam-edit/examples/formatted_jbeam/fender-minimal-jbfl.jbeam`, converted to the line endings of the input file
- `tests/host/formatDocument.ts` — runs inside VS Code, has no assertions and must export `run`: opens the file named in `JBEAM_TEST_INPUT`, executes `jbeam.formatDocument`, and writes the document text to `JBEAM_TEST_OUTPUT`
- `vitest run --dir tests` keeps vitest away from the compiled copy of the test under `dist/`
- Tests require a `jbeam-lsp-server` binary and the `external/jbeam-edit` git submodule to be checked out

**CI:**

- `.github/workflows/format.yml` — runs on every push/PR; checks that `npm run format` produces no diff
- `.github/workflows/test.yaml` — runs on every push/PR:
  1. `get-jbeam-edit-versions` job (Ubuntu): runs `scripts/Get-Releases.ps1` to build the test matrix
  2. `integration-test` job (Windows, matrix): checks out submodules, installs deps, checks formatting, checks out the matching `external/jbeam-edit` tag, runs `scripts/setup_jbeam_server.ps1` to install the server, then runs `npm run test`
- `.github/workflows/build-and-release.yaml` — runs on every push/PR and tag pushes; builds and packages the extension; publishes to the VS Marketplace via `vsce publish` on tag pushes
- `scripts/Get-Releases.ps1` — queries `webdevred/jbeam_edit` GitHub releases and builds a CI matrix JSON (jbeam versions cross VS Code versions); the matrix includes the minimum required version and the latest compatible release
- `scripts/setup_jbeam_server.ps1` — downloads and silently installs the `jbeam-lsp-server` Windows release from `webdevred/jbeam_edit` GitHub releases; the install path is `C:\Program Files (x86)\jbeam-edit\jbeam-lsp-server.exe`

**External dependency:**

The `external/jbeam-edit` directory is a git submodule pointing to the companion server repository. The submodule must be initialized for tests to run.
