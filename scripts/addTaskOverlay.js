/**
 * Clears the task creation form by resetting inputs, hiding error messages,
 * and removing any active priority button classes.
 * 
 */
function clearForm() {
  resetInputs();
  hideErrors();
  removePriorityClasses();
}

/**
 * Resets all form input fields to their default values,
 * including title, description, due date, category, and subtasks.
 * 
 */
function resetInputs() {
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('assigned').selectedIndex = 0;
  document.getElementById('category').selectedIndex = 0;

  const subtask = document.querySelector('.subtask-input');
  if (subtask) subtask.value = '';
}

/**
 * Hides all error message elements by adding the 'd-none' class.
 * Currently targets title and category error elements.
 * 
 */
function hideErrors() {
  ['title-error', 'category-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
  });
}

