const NOTES_STORAGE_KEY = 'noteease_notes';

// PUBLIC_INTERFACE
/**
 * Retrieves all notes from local storage.
 * @returns {Array<Object>} An array of note objects.
 */
export function getAllNotes() {
  const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
  return notesJson ? JSON.parse(notesJson) : [];
}

// PUBLIC_INTERFACE
/**
 * Saves a note to local storage. If the note has an ID, it updates; otherwise, it adds.
 * @param {Object} noteToSave - The note object to save. It must have an id, title, content, and categories.
 * @returns {Array<Object>} The updated array of all notes.
 */
export function saveNote(noteToSave) {
  if (!noteToSave || typeof noteToSave.id === 'undefined' || !noteToSave.title || typeof noteToSave.content === 'undefined' || !Array.isArray(noteToSave.categories)) {
    console.error('Invalid note object provided to saveNote:', noteToSave);
    return getAllNotes(); // Return current notes without modification
  }

  const notes = getAllNotes();
  const existingNoteIndex = notes.findIndex(note => note.id === noteToSave.id);

  if (existingNoteIndex > -1) {
    notes[existingNoteIndex] = noteToSave; // Update existing note
  } else {
    notes.push(noteToSave); // Add new note
  }

  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  return notes;
}

// PUBLIC_INTERFACE
/**
 * Deletes a note from local storage by its ID.
 * @param {string} noteId - The ID of the note to delete.
 * @returns {Array<Object>} The updated array of all notes after deletion.
 */
export function deleteNoteById(noteId) {
  let notes = getAllNotes();
  notes = notes.filter(note => note.id !== noteId);
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  return notes;
}

// PUBLIC_INTERFACE
/**
 * Retrieves a specific note by its ID from local storage.
 * @param {string} noteId - The ID of the note to retrieve.
 * @returns {Object|null} The note object if found, otherwise null.
 */
export function getNoteById(noteId) {
  const notes = getAllNotes();
  return notes.find(note => note.id === noteId) || null;
}

// PUBLIC_INTERFACE
/**
 * Retrieves all unique categories from the notes in local storage.
 * @returns {Array<string>} An array of unique category strings.
 */
export function getAllCategories() {
    const notes = getAllNotes();
    const allCategories = new Set();
    notes.forEach(note => {
        if (note.categories && Array.isArray(note.categories)) {
            note.categories.forEach(category => {
                if (category && category.trim() !== '') {
                    allCategories.add(category.trim());
                }
            });
        }
    });
    return Array.from(allCategories).sort();
}
