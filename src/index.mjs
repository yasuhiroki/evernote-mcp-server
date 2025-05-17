import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Client from './client.mjs';

const client = new Client();

const server = new McpServer({
  name: "Evernote",
  version: "0.0.1"
});

server.tool(
  "list_evernote_notebooks",
  "List evernote notebooks title and guid",
  {},
  async () => {
    const notebooks = await client.listNotebooks();
    return {
      content: notebooks.map(notebook => ({
        type: "text",
        text: `title: ${notebook.name}, guid: ${notebook.guid}`,
      }))
    };
  }
);

server.tool(
  "list_evernote_notes",
  "List evernote notes title and guid",
  {
    notebookGuid: z.string().optional(),
  },
  async ({ notebookGuid }) => {
    const notes = await client.listNotes(notebookGuid);
    return {
      content: notes.map(note => ({
        type: "text",
        text: `title: ${note.title}, guid: ${note.guid}`,
      }))
    };
  },
  {
    inputSchema: z.object({ notebookGuid: z.string().optional() })
  }
);

server.tool(
  "read_evernote_note",
  "Read evernote note content",
  {
    guid: z.string(),
  },
  async ({ guid }) => {
    const content = await client.getNoteContent(guid);
    return {
      content: [{
        type: "text",
        text: content,
      }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);