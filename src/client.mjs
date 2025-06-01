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

  async listNotes(notebookGuid) {
    try {
      const filter = notebookGuid ? { notebookGuid } : {};
      const notesMetadata = await this.noteStore.findNotesMetadata(filter, 0, 100, { includeTitle: true });
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
}

export default Client;
