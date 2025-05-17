# evernote-mcp-server

MCP Server for [Evernote](https://evernote.com) (unofficial)

# Feature

Provides the following MCP tools features:

- `list_evernote_notebooks`: List all notebooks
- `list_evernote_notes`: List all notes in a notebook
- `read_evernote_note`: Read a note content
- `create_evernote_note`: Create a note _(not implemented yet)_
- `update_evernote_note`: Update content of a note _(not implemented yet)_

# Installation

```bash
git clone https://github.com/yasuhiroki/evernote-mcp-server.git
cd evernote-mcp-server
npm install
```

# Configuration

## Prerequisite

Evernote API token is required. You can get it from [Evernote Developer Tokens](https://dev.evernote.com/doc/articles/dev_tokens.php).

## Setup mcp settings

for example, create `mcp.json` in the root directory of this repository.

```json
{
  "evernote": {
    "command": "npx",
    "args": [
        "node",
        "/path/to/evernote-mcp/src/index.mjs",
    ],
    "env": {
      "EVERNOTE_API_TOKEN": "YOUR EVERNOTE API TOKEN"
    }
  }
}
