import React, { useState, useEffect } from "react";
import "./App.css";
import FirebaseDebug from "./components/FirebaseDebug";
import NetworkIndicator from "./components/NetworkIndicator";
import { addNote, deleteNote, updateNote, subscribeToNotes, Note } from "./firebase/notesService";

/**
 * Main App component that provides the Notes Management interface
 * Integrates with Firebase Firestore for cloud data storage
 */
function App() {
  // State management for notes and form inputs
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  // Helper to timeout long-running promises (e.g., network hangs)
  // Increased to 60s while debugging to capture slow responses
  const withTimeout = <T,>(p: Promise<T>, ms = 60000) => {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Request timed out')), ms);
      p.then((res) => { clearTimeout(timer); resolve(res); }).catch((err) => { clearTimeout(timer); reject(err); });
    });
  };

  /**
   * Set up real-time subscription to Firebase Firestore
   * This creates a live connection that updates the UI whenever data changes
   */
  useEffect(() => {
    const unsubscribe = subscribeToNotes((updatedNotes) => {
      setNotes(updatedNotes);
    });

    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, []);

  /**
   * Handles adding a new note to Firebase Firestore
   * Validates input and provides user feedback during the process
   */
  const handleAddNote = async () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Optimistic UI: show the note immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticNote: Note = {
        id: tempId,
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        category: 'general',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes(prev => [optimisticNote, ...prev]);

      try {
        // Add note to Firebase with automatic ID generation (with timeout)
        const added = await withTimeout(addNote({
          title: newNote.title.trim(),
          content: newNote.content.trim(),
          category: 'general'
        }));

        // Replace optimistic note with the saved note (if still present)
        setNotes(prev => prev.map(n => (n.id === tempId ? added : n)));
        setSuccessMessage('Note added successfully');

        // Clear form after successful save
        setNewNote({ title: '', content: '' });
      } catch (err: any) {
        setError(`Failed to add note: ${err.message || err}`);
        console.error('Error adding note:', err);
        // Remove optimistic note on failure
        setNotes(prev => prev.filter(n => !(n.id && n.id.toString().startsWith('temp-'))));
      } finally {
        setLoading(false);
        // clear messages after a short delay
        setTimeout(() => { setError(null); setSuccessMessage(null); }, 5000);
      }
    }
  };

  /**
   * Handles deleting a note from Firebase Firestore
   * @param noteId - The unique Firebase document ID of the note to delete
   */
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
    } catch (err) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', err);
    }
  };

  /**
   * Starts editing mode for a specific note
   * Populates the edit form with current note data
   */
  const handleEditNote = (note: Note) => {
    setEditingNote(note.id || '');
    setEditForm({ title: note.title, content: note.content });
  };

  /**
   * Cancels editing mode and resets the edit form
   */
  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditForm({ title: '', content: '' });
  };

  /**
   * Saves the edited note to Firebase Firestore
   * Updates the note with new title and content
   */
  const handleSaveEdit = async (noteId: string) => {
    if (editForm.title.trim() && editForm.content.trim()) {
      setLoading(true);
      setError(null);
      
      try {
        await updateNote(noteId, {
          title: editForm.title.trim(),
          content: editForm.content.trim()
        });
        setEditingNote(null);
        setEditForm({ title: '', content: '' });
      } catch (err) {
        setError('Failed to update note. Please try again.');
        console.error('Error updating note:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="app-container">
      <NetworkIndicator />
      <FirebaseDebug />
      <div className="note-form">
        <form className="note-form-container" onSubmit={(e) => e.preventDefault()}>
          {error && <div className="error-message">{error}</div>}
          
          <input
            type="text"
            placeholder="Title"
            className="title-input"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            required
            disabled={loading}
          />
          <textarea
            placeholder="Content"
            className="content-textarea"
            rows={10}
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            required
            disabled={loading}
          />
          <button
            type="button"
            className="add-note-btn"
            onClick={handleAddNote}
            disabled={loading || !newNote.title.trim() || !newNote.content.trim()}
          >
            {loading ? 'Adding...' : 'Add Note'}
          </button>
        </form>
      </div>
      
      <div className="notes-grid">
        {notes.length === 0 ? (
          <div className="no-notes">
            <p>No notes yet. Create your first note!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              {editingNote === note.id ? (
                // Edit mode
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="edit-title-input"
                    placeholder="Title"
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="edit-content-textarea"
                    placeholder="Content"
                    rows={4}
                  />
                  <div className="edit-buttons">
                    <button
                      className="save-btn"
                      onClick={() => note.id && handleSaveEdit(note.id)}
                      disabled={loading || !editForm.title.trim() || !editForm.content.trim()}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="note-header">
                    <h3 className="note-title">{note.title}</h3>
                    <div className="note-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditNote(note)}
                        title="Edit note"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => note.id && handleDeleteNote(note.id)}
                        title="Delete note"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="note-content">{note.content}</p>
                  {note.category && <span className="note-category">{note.category}</span>}
                  {note.createdAt && (
                    <div className="note-date">
                      Created: {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  )}
                  {note.updatedAt && note.updatedAt !== note.createdAt && (
                    <div className="note-date">
                      Updated: {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
