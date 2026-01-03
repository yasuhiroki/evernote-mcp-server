import Evernote from 'evernote';

const EVERNOTE_API_TOKEN = process.env.EVERNOTE_API_TOKEN;

class Client {
  constructor(token = EVERNOTE_API_TOKEN) {
    this.client = new Evernote.Client({ token: token, sandbox: false });
    this.noteStore = this.client.getNoteStore();
  }

  async listNotebooks() {
    try {
      return await this.noteStore.listNotebooks();
    } catch (error) {
      console.error("Error listing notebooks: ", error);
      throw error;
    }
  }

  async listNotes(filter = {}) {
    try {
      const offset = filter.offset || 0;
      const maxNotes = filter.maxNotes || 100;
      const notesMetadata = await this.noteStore.findNotesMetadata(filter, offset, maxNotes, { includeTitle: true });
      return notesMetadata.notes.map(note => ({ guid: note.guid, title: note.title }));
    } catch (error) {
      console.error("Error listing notes:", error);
      throw error;
    }
  }

  async getNoteContent(guid) {
    try {
      const note = await this.noteStore.getNote(guid, true, false, false, false);
      return note.content;
    } catch (error) {
      console.error("Error getting note content: ", error);
      throw error;
    }
  }

  async readNoteContents(guids) {
    const results = [];
    for (const guid of guids) {
      try {
        const content = await this.getNoteContent(guid);
        results.push({ guid, content });
      } catch (error) {
        results.push({ guid, error: error.message });
      }
    }
    return results;
  }

  async createNote({ title, content, notebookGuid }) {
    try {
      const note = {
        title,
        content,
      };
      if (notebookGuid) {
        note.notebookGuid = notebookGuid;
      }
      const createdNote = await this.noteStore.createNote(note);
      return { guid: createdNote.guid, title: createdNote.title };
    } catch (error) {
      console.error("Error creating note: ", error);
      throw error;
    }
  }

  async updateNote({ guid, title, content, notebookGuid }) {
    try {
      const note = { guid };
      if (title) note.title = title;
      if (content) note.content = content;
      if (notebookGuid) note.notebookGuid = notebookGuid;
      const updatedNote = await this.noteStore.updateNote(note);
      return { guid: updatedNote.guid, title: updatedNote.title };
    } catch (error) {
      console.error("Error updating note: ", error);
      throw error;
    }
  }

  async countNotes(filter = {}) {
    try {
      const withTrash = filter.withTrash || false;
      const counts = await this.noteStore.findNoteCounts(filter, withTrash);
      return {
        notebookCounts: counts.notebookCounts ?? {},
        tagCounts: counts.tagCounts ?? {},
        trashCount: counts.trashCount ?? 0,
      }
    } catch (error) {
      console.error("Error counting notes:", error);
      throw error;
    }
  }
}

export default Client;
