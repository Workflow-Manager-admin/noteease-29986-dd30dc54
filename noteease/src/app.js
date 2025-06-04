import { getAllNotes, saveNote, deleteNoteById, getNoteById, getAllCategories } from './store.js';
import { generateUniqueId } from './utils.js';

// DOM Elements
const notesListContainer = document.getElementById('notes-list-container');
const addNoteFab = document.getElementById('add-note-fab');
const noteModal = document.getElementById('note-modal');
const modalTitle = document.getElementById('modal-title');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentInput = document.getElementById('note-content-input');
const noteCategoryInput = document.getElementById('note-category-input');
const saveNoteButton = document.getElementById('save-note-button');
const closeModalButton = noteModal.querySelector('.close-button');
const searchBar = document.getElementById('search-bar');
const categoryFiltersContainer = document.getElementById('category-filters');


// Application State
let notes = [];
let currentEditingNoteId = null;
let currentFilterCategory = null;

// PUBLIC_INTERFACE
/**
 * Initializes the application: loads notes, renders them, and sets up event listeners.
 */
function init() {
  loadNotes();
  renderNotes();
  renderCategoryFilters();
  setupEventListeners();
  console.log('NoteEase App Initialized');
}

/**
 * Loads notes from local storage into the application state.
 */
function loadNotes() {
  notes = getAllNotes();
}

/**
 * Renders the notes list in the DOM based on current search and filter.
 */
function renderNotes() {
  notesListContainer.innerHTML = ''; // Clear existing notes

  const searchTerm = searchBar.value.toLowerCase();
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm) || 
                          note.content.toLowerCase().includes(searchTerm);
    const matchesCategory = !currentFilterCategory || (note.categories && note.categories.includes(currentFilterCategory));
    return matchesSearch && matchesCategory;
  });


  if (filteredNotes.length === 0) {
    notesListContainer.innerHTML = '<p>No notes found. Try adding one or adjusting your filters!</p>';
    return;
  }

  filteredNotes.forEach(note => {
    const noteElement = createNoteElement(note);
    notesListContainer.appendChild(noteElement);
  });
}

/**
 * Creates a DOM element for a single note.
 * @param {Object} note - The note object.
 * @returns {HTMLElement} The note element.
 */
function createNoteElement(note) {
  const div = document.createElement('div');
  div.classList.add('note-item');
  div.dataset.noteId = note.id;

  const title = document.createElement('h3');
  title.textContent = note.title;

  const content = document.createElement('p');
  // Show a snippet of the content
  content.textContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
  
  const categoriesDiv = document.createElement('div');
  categoriesDiv.classList.add('note-categories');
  if (note.categories && note.categories.length > 0) {
    note.categories.forEach(cat => {
        const span = document.createElement('span');
        span.textContent = cat;
        categoriesDiv.appendChild(span);
    });
  } else {
    categoriesDiv.textContent = 'No categories';
  }


  const actionsDiv = document.createElement('div');
  actionsDiv.classList.add('note-item-actions');

  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent note click when clicking button
    openModalForEdit(note.id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent note click when clicking button
    handleDeleteNote(note.id);
  });

  actionsDiv.appendChild(editButton);
  actionsDiv.appendChild(deleteButton);

  div.appendChild(title);
  div.appendChild(content);
  div.appendChild(categoriesDiv);
  div.appendChild(actionsDiv);

  // Open full note view/edit modal on click (excluding buttons)
  div.addEventListener('click', () => {
    openModalForEdit(note.id, true); // true for read-only initially
  });


  return div;
}


/**
 * Renders the category filter buttons.
 */
function renderCategoryFilters() {
    categoryFiltersContainer.innerHTML = ''; // Clear existing filters
    const categories = getAllCategories();

    const allButton = document.createElement('button');
    allButton.textContent = 'All Notes';
    allButton.addEventListener('click', () => {
        currentFilterCategory = null;
        setActiveFilterButton(allButton);
        renderNotes();
    });
    if (!currentFilterCategory) {
        allButton.classList.add('active');
    }
    categoryFiltersContainer.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.dataset.category = category;
        button.addEventListener('click', () => {
            currentFilterCategory = category;
            setActiveFilterButton(button);
            renderNotes();
        });
        if (currentFilterCategory === category) {
            button.classList.add('active');
        }
        categoryFiltersContainer.appendChild(button);
    });
}

/**
 * Sets the active state for a filter button.
 * @param {HTMLElement} activeButton - The button to set as active.
 */
function setActiveFilterButton(activeButton) {
    const buttons = categoryFiltersContainer.querySelectorAll('button');
    buttons.forEach(button => button.classList.remove('active'));
    if (activeButton) {
        activeButton.classList.add('active');
    }
}


/**
 * Opens the modal, optionally populating it for editing a note.
 * @param {string|null} noteId - The ID of the note to edit, or null for a new note.
 * @param {boolean} readOnly - If true, opens the modal in a read-only like state (viewing).
 */
function openModalForEdit(noteId = null, readOnly = false) {
  currentEditingNoteId = noteId;
  if (noteId) {
    const note = getNoteById(noteId);
    if (note) {
      modalTitle.textContent = readOnly ? 'View Note' : 'Edit Note';
      noteTitleInput.value = note.title;
      noteContentInput.value = note.content;
      noteCategoryInput.value = note.categories ? note.categories.join(', ') : '';
      saveNoteButton.textContent = readOnly ? 'Edit Note' : 'Save Changes';

      // For read-only, disable inputs initially
      noteTitleInput.disabled = readOnly;
      noteContentInput.disabled = readOnly;
      noteCategoryInput.disabled = readOnly;
      if(readOnly) {
         saveNoteButton.onclick = () => { // Change button behavior to enable editing
            modalTitle.textContent = 'Edit Note';
            noteTitleInput.disabled = false;
            noteContentInput.disabled = false;
            noteCategoryInput.disabled = false;
            saveNoteButton.textContent = 'Save Changes';
            saveNoteButton.onclick = handleSaveNote; // Revert to normal save
         };
      } else {
        saveNoteButton.onclick = handleSaveNote; // Normal save
      }

    } else {
      console.error("Note not found for editing:", noteId);
      currentEditingNoteId = null; // Reset if note not found
      modalTitle.textContent = 'Add Note';
      noteTitleInput.value = '';
      noteContentInput.value = '';
      noteCategoryInput.value = '';
      saveNoteButton.textContent = 'Save Note';
      noteTitleInput.disabled = false;
      noteContentInput.disabled = false;
      noteCategoryInput.disabled = false;
      saveNoteButton.onclick = handleSaveNote;
    }
  } else {
    // New Note
    modalTitle.textContent = 'Add Note';
    noteTitleInput.value = '';
    noteContentInput.value = '';
    noteCategoryInput.value = '';
    saveNoteButton.textContent = 'Save Note';
    currentEditingNoteId = null;
    noteTitleInput.disabled = false;
    noteContentInput.disabled = false;
    noteCategoryInput.disabled = false;
    saveNoteButton.onclick = handleSaveNote;
  }
  noteModal.style.display = 'block';
}

/**
 * Closes the note editing/creation modal and resets its form.
 */
function closeModal() {
  noteModal.style.display = 'none';
  noteTitleInput.value = '';
  noteContentInput.value = '';
  noteCategoryInput.value = '';
  currentEditingNoteId = null;
  // Reset read-only states if any
  noteTitleInput.disabled = false;
  noteContentInput.disabled = false;
  noteCategoryInput.disabled = false;
  saveNoteButton.textContent = 'Save Note';
  saveNoteButton.onclick = handleSaveNote; // Ensure default save behavior
}

/**
 * Handles saving a new note or updating an existing one.
 */
function handleSaveNote() {
  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();
  const categoriesString = noteCategoryInput.value.trim();
  const categories = categoriesString ? categoriesString.split(',').map(cat => cat.trim()).filter(cat => cat) : [];


  if (!title || !content) {
    alert('Title and content cannot be empty!');
    return;
  }

  const noteData = {
    id: currentEditingNoteId || generateUniqueId(),
    title,
    content,
    categories,
  };

  saveNote(noteData);
  loadNotes(); // Reload notes from store
  renderNotes();
  renderCategoryFilters(); // Update categories in case new ones were added
  closeModal();
}

/**
 * Handles deleting a note.
 * @param {string} noteId - The ID of the note to delete.
 */
function handleDeleteNote(noteId) {
  if (confirm('Are you sure you want to delete this note?')) {
    deleteNoteById(noteId);
    loadNotes();
    renderNotes();
    renderCategoryFilters(); // Categories might change if the deleted note was the only one with a certain category
  }
}

/**
 * Sets up all necessary event listeners for the application.
 */
function setupEventListeners() {
  addNoteFab.addEventListener('click', () => openModalForEdit());
  closeModalButton.addEventListener('click', closeModal);
  saveNoteButton.addEventListener('click', handleSaveNote);
  
  searchBar.addEventListener('input', renderNotes);

  // Close modal if backdrop is clicked
  window.addEventListener('click', (event) => {
    if (event.target === noteModal) {
      closeModal();
    }
  });
}

// Initialize the app when the script is loaded
document.addEventListener('DOMContentLoaded', init);
