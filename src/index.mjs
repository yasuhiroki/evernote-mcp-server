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
  "List evernote notes title and guid."
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
  {
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

server.tool(
  "create_evernote_note",
  "Create a new evernote note."
    + "The content is in ENML (Evernote Markup Language)."
    + "ENML is formally defined in http://xml.evernote.com/pub/enml2.dtd.",
  {
    title: z.string(),
    content: z.string(),
    notebookGuid: z.string().optional(),
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

server.tool(
  "update_evernote_note",
  "Update an existing evernote note."
    + "The content is in ENML (Evernote Markup Language)."
    + "ENML is formally defined in http://xml.evernote.com/pub/enml2.dtd.",
  {
    guid: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    notebookGuid: z.string().optional(),
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
