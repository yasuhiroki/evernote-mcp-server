# evernote-mcp-server

MCP Server for [Evernote](https://evernote.com) (unofficial)

# Feature

Provides the following MCP tools features:

- `list_evernote_notebooks`: List all notebooks
- `list_evernote_notes`: List all notes in a notebook
- `count_evernote_notes`: Count notes
- `read_evernote_note`: Read a note content
- `read_evernote_notes`: Read multiple note contents
- `create_evernote_note`: Create a note
- `update_evernote_note`: Update content of a note

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
        "-y",
        "github:yasuhiroki/evernote-mcp-server"
    ],
    "env": {
      "EVERNOTE_API_TOKEN": "YOUR EVERNOTE API TOKEN"
    }
  }
}
```
