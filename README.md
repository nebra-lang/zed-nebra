# Nebra for Zed

Language support for [Nebra](https://nebra-lang.github.io), the typed superset of Lua, in [Zed](https://zed.dev).

- Syntax highlighting, brackets, indentation, outline and text objects from a tree-sitter grammar
- The Nebra language server: diagnostics, hover, completion, signature help, go to definition,
  references, rename, inlay hints and code actions in `.neb` and `.d.neb` files
- Run buttons next to `test(...)`, `it(...)` and `describe(...)` of `nebra:test`
- Tasks for `nebra build`, `run`, `test`, `watch`, `install`, `compile` and `docs`

## Installation

Open the extensions with `zed: extensions`, search for **Nebra** and install it. Until the extension is
listed there, install it from a checkout of this repository with `zed: install dev extension`.

The extension starts `nebra lps`. It uses, in this order:

1. the path set in `lsp.nebra.binary.path`, started with `lsp.nebra.binary.arguments`, which must then be `["lps"]`
2. `nebra` on your `PATH`
3. the latest release of [nebra-lang/nebra](https://github.com/nebra-lang/nebra/releases), downloaded for Linux (x64, arm64), macOS (arm64) and Windows (x64, arm64)

## Settings

The settings of the language server go under `lsp.nebra` in your Zed settings, with the same names
as in the VS Code extension:

```json
{
  "lsp": {
    "nebra": {
      "binary": {
        "path": "/opt/nebra/bin/nebra",
        "arguments": ["lps"]
      },
      "settings": {
        "inlayHints": {
          "types": true,
          "parameterNames": true
        },
        "sideMarkers": "hover",
        "diagnostics": {
          "delay": 120
        }
      }
    }
  },
  "inlay_hints": {
    "enabled": true
  }
}
```

| Setting | Default | What it does |
|---------|---------|--------------|
| `inlayHints.types` | `true` | Show the inferred type of locals declared without an annotation. |
| `inlayHints.parameterNames` | `true` | Show parameter names before the arguments of a call. |
| `sideMarkers` | `"hover"` | `"off"` leaves the side code runs on out of the hover. |
| `diagnostics.delay` | `120` | Milliseconds the server waits after typing stops before it updates diagnostics. |

Zed shows inlay hints only with `inlay_hints.enabled` set.

## Tasks

`task: spawn` offers the `nebra` commands, run in the root of the worktree. The run buttons in the
gutter run a single test or suite with `nebra test <file> <name>`.

## Development

Install the extension from a checkout with `zed: install dev extension` and pick this directory.
Zed needs Rust installed through `rustup` to build it.

The grammar lives in `grammar/`:

```bash
cd grammar
npm install
npm run generate
npm test
```

After changing the grammar, commit it first and point `rev` in `extension.toml` at that commit.

## License

MIT
