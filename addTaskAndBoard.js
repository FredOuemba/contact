const TASKS_URL = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";

/**
 * Handles task creation: validates input, saves to Firebase, clears form,
 * shows a success message, and redirects to the board after a delay.
 * 
 */
async function handleCreateTask() {
  if (!validateForm()) return;
  let task = collectFormData();
  await saveTaskToFirebase(task);
  clearForm();
  showSuccessMessage();
  setTimeout(() => {
    window.location.href = 'boardsection.html';
  }, 1500);
}

/**
 * Displays a validation error by styling the input field and showing the error message.
 *
 * @param {HTMLElement} input - The input field to highlight with an error.
 * @param {HTMLElement} errorElement - The element that displays the error message.
 */
function showFieldError(input, errorElement) {
  input.classList.add("input-error");
  errorElement.classList.remove("d-none");
}

/**
 * Hides the validation error by removing the error styling and hiding the error message.
 *
 * @param {HTMLElement} input - The input field to remove error styling from.
 * @param {HTMLElement} errorElement - The element that contains the error message to hide.
 */
function hideFieldError(input, errorElement) {
  input.classList.remove("input-error");
  errorElement.classList.add("d-none");
}


/**
 * Displays an error message by showing the element with the given ID.
 * 
 * @param {string} id - The ID of the element to display.
 */
function showError(id) {
  let el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

/**
 * Hides an error message by hiding the element with the given ID.
 * 
 * @param {string} id - The ID of the element to hide.
 */
function hideError(id) {
  let el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

/**
 * Collects data from the form fields and structures it into a task object.
 * 
 * @returns {Object} - The task object with title, description, date, category, and default status.
 */
function collectFormData() {
  return {
    title: document.getElementById('title').value,
    description: document.getElementById('desc').value,
    dueDate: document.getElementById('due-date').value,
    category: document.getElementById('category').value,
    status: 'To-Do'
  };
}

/**
 * Saves the given task object to Firebase via POST request.
 * 
 * @param {Object} task - The task object to save.
 * 
 */
async function saveTaskToFirebase(task) {
  try {
    let response = await fetch(TASKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    let result = await response.json();
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
  }
}


/**
 * Clears the entire task form and resets UI elements.
 * 
 */
function clearForm() {
  resetFieldValues();
  resetPriorityButtons();
  clearSubtaskInput();
}

/**
 * Resets all standard input fields to their default state.
 * 
 */
function resetFieldValues() {
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('category').selectedIndex = 0;
}

/**
 * Removes all active classes from priority buttons.
 * 
 */
function resetPriorityButtons() {
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });
}

/**
 * Clears the subtask input field value.
 * 
 */
function clearSubtaskInput() {
  let input = document.querySelector('.subtask-input');
  if (input) input.value = '';
}

/**
 * Displays a task-created success message for a short duration.
 * 
 */
function showSuccessMessage() {
  let message = document.getElementById('task-success-message');
  if (!message) return;
  message.classList.remove('d-none');
  message.classList.add('show');
  setTimeout(() => {
    message.classList.remove('show');
    message.classList.add('d-none');
  }, 1200);
}

/**
 * Updates the status of an existing task in Firebase.
 * 
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status to set for the task.
 */
async function updateTaskStatus(taskId, newStatus) {
  try {
    await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (error) {
    console.error('Fehler beim Status-Update:', error);
  }
}
