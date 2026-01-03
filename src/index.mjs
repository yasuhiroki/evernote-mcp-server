#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Client from './client.mjs';

const client = new Client();

const server = new McpServer({
  name: "Evernote",
  version: "0.0.1"
});

server.registerTool(
  "list_evernote_notebooks",
  {
    description:"List evernote notebooks title and guid",
    inputSchema: {}
  },
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

server.registerTool(
  "list_evernote_notes",
  {
    description: "List evernote notes title and guid."
      + "You can filter notes by following parameters:"
      + "order: The NoteSortOrder value indicating what criterion should be used to sort the results of the filter."
      + "ascending: If true, the results will be ascending in the requested sort order. If false, the results will be descending."
      + "words: A search query string that will filter the set of notes to be returned. Accepts the full search grammar documented in the Evernote API Overview."
      + "notebookGuid: The Guid of the notebook that must contain the notes."
      + "tagGuids: The list of tags (by GUID) that must be present on the notes."
      + "timeZone: The zone ID for the user, which will be used to interpret any dates or times in the queries that do not include their desired zone information."
      + "inactive: If true, then only notes that are not active (i.e. notes in the Trash) will be returned. Otherwise, only active notes will be returned. There is no way to find both active and inactive notes in a single query."
      + "emphasized: A search query string that may or may not influence the notes to be returned, both in terms of coverage as well as of order. Think of it as a wish list, not a requirement. Accepts the full search grammar documented in the Evernote API Overview."
      + "includeAllReadableNotebooks: If true, then the search will include all business notebooks that are readable by the user. A business authentication token must be supplied for this option to take effect when calling search APIs."
      + "offset: The offset of the first note to return. This is useful for paging through results."
      + "maxNotes: The maximum number of notes to return. This is useful for limiting the number of results returned.",
    inputSchema: {
      notebookGuid: z.string().optional(),
      order: z.number().optional(),
      ascending: z.boolean().optional(),
      words: z.string().optional(),
      tagGuids: z.array(z.string()).optional(),
      timeZone: z.string().optional(),
      inactive: z.boolean().optional(),
      emphasized: z.string().optional(),
      includeAllReadableNotebooks: z.boolean().optional(),
      offset: z.number().optional(),
      maxNotes: z.number().optional(),
      resultSpec: z.object({
        includeTitle: z.boolean().optional(),
        includeContentLength: z.boolean().optional(),
        includeCreated: z.boolean().optional(),
        includeUpdated: z.boolean().optional(),
        includeDeleted: z.boolean().optional(),
        includeNotebookGuid: z.boolean().optional(),
      }).optional()
    }
  },
  async (input) => {
    const notes = await client.listNotes(input);
    return {
      content: notes.map(note => ({
        type: "text",
        text: `title: ${note.title}, guid: ${note.guid}`,
      }))
    };
  }
);

server.registerTool(
  "count_evernote_notes",
  {
    description: "Count notes matching a filter.",
    inputSchema: {
      notebookGuid: z.string().optional(),
      order: z.number().optional(),
      words: z.string().optional(),
      tagGuids: z.array(z.string()).optional(),
      timeZone: z.string().optional(),
      inactive: z.boolean().optional(),
      emphasized: z.string().optional(),
      includeAllReadableNotebooks: z.boolean().optional(),
      withTrash: z.boolean().optional(),
    },
  },
  async (input) => {
    const counts = await client.countNotes(input);
    const lines = [];
    let total = 0;
    if (Object.keys(counts.notebookCounts).length > 0) {
      lines.push('notebookCounts:');
      for (const [k,v] of Object.entries(counts.notebookCounts)) {
        lines.push(`- ${k}: ${v}`);
        total += v;
      }
    }
    if (Object.keys(counts.tagCounts).length > 0) {
      lines.push('tagCounts:');
      for (const [k,v] of Object.entries(counts.tagCounts)) {
        lines.push(`- ${k}: ${v}`);
        total += v;
      }
    }
    if (counts.trashCount > 0) {
      lines.push(`trashCount: ${counts.trashCount}`);
      total += counts.trashCount;
    }
    lines.push(`totalNotes: ${total}`);
    return {
      content: lines.map(line => ({ type: 'text', text: line }))
    };
  }
);

server.registerTool(
  "read_evernote_note",
  {
    description: "Read evernote note content",
    inputSchema: {
      guid: z.string(),
    },
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

server.registerTool(
  "read_evernote_notes",
  {
    description: "Read multiple evernote notes content by an array of guids.",
    inputSchema: {
      guids: z.array(z.string()),
    },
  },
  async ({ guids }) => {
    const results = await client.readNoteContents(guids);
    return {
      content: results.map(result => ({
        type: "text",
        text: result.error ? `guid: ${result.guid}, error: ${result.error}` : `guid: ${result.guid}, content: ${result.content}`,
      }))
    };
  }
);

server.registerTool(
  "create_evernote_note",
  {
    description: "Create a new evernote note."
      + "The content is in ENML (Evernote Markup Language)."
      + "ENML is formally defined in http://xml.evernote.com/pub/enml2.dtd.",
    inputSchema: {
      title: z.string(),
      content: z.string(),
      notebookGuid: z.string().optional(),
    },
  },
  async ({ title, content, notebookGuid }) => {
    const note = await client.createNote({ title, content, notebookGuid });
    return {
      content: [{
        type: "text",
        text: `Created note: title: ${note.title}, guid: ${note.guid}`,
      }]
    };
  }
);

server.registerTool(
  "update_evernote_note",
  {
    description: "Update an existing evernote note."
      + "The content is in ENML (Evernote Markup Language)."
      + "ENML is formally defined in http://xml.evernote.com/pub/enml2.dtd.",
    inputSchema: {
      guid: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      notebookGuid: z.string().optional(),
    },
  },
  async ({ guid, title, content, notebookGuid }) => {
    const note = await client.updateNote({ guid, title, content, notebookGuid });
    return {
      content: [{
        type: "text",
        text: `Updated note: title: ${note.title}, guid: ${note.guid}`,
      }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
