// PUBLIC_INTERFACE
/**
 * Generates a simple unique ID.
 * For a real app, consider a more robust UUID library.
 * @returns {string} A unique ID string.
 */
export function generateUniqueId() {
  return `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Add other utility functions here as needed
