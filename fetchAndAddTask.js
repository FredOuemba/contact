window.allTasks = []; 

/**
 * Determines the task status based on the URL or parent window context.
 * 
 * @returns {string} - The current task status (default: "To-Do")
 */
function getTaskStatus() {
  const fromURL = new URLSearchParams(window.location.search).get("status");
  return fromURL || window.parent?.currentTaskStatus || "To-Do";
}

let newTask = {
  title: "",
  description: "",
  dueDate: "",
  priority: "",
  category: "",
  Status: "To-Do",
  assignedTo: {},
  subtasks: {}
};

/**
 * Fetches tasks from Firebase and stores them in the global `allTasks` array.
 * 
 * @async
 */
async function fetchDataTasks() {
  let response = await fetch(
    "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"
  );
  if (!response.ok) {
    console.error("Fehler beim Abrufen der Daten");
    return;
  }
  let data = await response.json(); 
  if (data) {
    let tasks = Object.values(data); 
    allTasks = tasks;
  } else {
    console.log("Keine Aufgaben gefunden.");
  }
}

/**
 * Fetches all tasks and enriches them with user data.
 * 
 * @returns {Promise<Array>} - List of enriched task objects
 */
async function getAllTasksWithPeople() {
  try {
    const tasksData = await fetchTasks();
    const peopleData = await fetchPeople();
    if (!tasksData) {
      console.log("📭 Keine Tasks gefunden.");
      return [];
    }
    const tasksArray = enrichTasksWithPeople(tasksData, peopleData);
    window.allTasks = tasksArray;
    return tasksArray;
  } catch (error) {
    console.error(" Fehler beim Abrufen der Tasks mit Personen:", error);
    return [];
  }
}

/**
 * Fetches task data from Firebase.
 * 
 * @returns {Promise<Object>} - Raw tasks data
 */
async function fetchTasks() {
  const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json");
  return await response.json();
}

/**
 * Fetches user data from Firebase.
 * 
 * @returns {Promise<Object>} - Raw people data
 */
async function fetchPeople() {
  const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  return await response.json();
}

/**
 * Enriches tasks with corresponding user data.
 * 
 * @param {Object} tasksData - Task data from Firebase
 * @param {Object} peopleData - People data from Firebase
 * @returns {Array} - Array of tasks with assignedPeople info
 */
function enrichTasksWithPeople(tasksData, peopleData) {
  return Object.entries(tasksData).map(([id, task]) => {
    const assignedTo = task.assignedTo || {};

    const assignedPeople = Object.values(assignedTo).map(personId => {
      const person = peopleData?.[personId];
      return person ? { id: personId, ...person } : { id: personId, name: "Unbekannt" };
    });

    return { id, ...task, assignedPeople };
  });
}

/**
 * Validates form fields, builds task, submits it and redirects.
 * 
 */
function createTaskFromForm() {
  if (!validateRequiredFields()) return;
  const newTask = buildNewTask();
  addNewTask(newTask);
  showSuccessMessage();
  redirectToBoard();
}

/**
 * Validates required input fields.
 * 
 * @returns {boolean} - True if all required fields are valid
 */
function validateRequiredFields() {
  let isValid = true;

  if (!validateFieldWithHighlight("title", "title-error")) isValid = false;
  if (!validateDueDate()) isValid = false;
  if (!validateCategoryField()) isValid = false;
  if (!validatePrioritySelection()) isValid = false;
  return isValid;
}

function validateCategoryField() {
  const categoryElement = document.getElementById("selected-category");
  const wrapper = document.querySelector(".category-select");
  const error = document.getElementById("category-error");
  const categoryText = categoryElement.textContent.trim();
  const isValid = categoryText !== "Select task category";
  if (!isValid) {
    wrapper.classList.add("input-error");
    error.classList.remove("invisible");
    setTimeout(() => {
      wrapper.classList.remove("input-error");
      error.classList.add("invisible");
    }, 3000);
    return false;
  }
  wrapper.classList.remove("input-error");
  error.classList.add("invisible");
  return true;
}

/**
 * Validates a single input field and shows a temporary error highlight if invalid.
 * 
 * @param {string} inputId - The ID of the input element to validate.
 * @param {string} errorId - The ID of the associated error message element.
 * @returns {boolean} - Returns true if the input is valid, false otherwise.
 */
function validateFieldWithHighlight(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (!input || !error) return false;

  const value = input.value.trim();
  if (!value) {
    showTemporaryError(input, error);
    return false;
  }

  input.classList.remove("input-error");
  error.classList.add("invisible");
  return true;
}

/**
 * Applies error styling and shows an error message for a limited time.
 * 
 * @param {HTMLElement} input - The input element to highlight.
 * @param {HTMLElement} error - The error message element to display.
 */
function showTemporaryError(input, error) {
  input.classList.add("input-error");
  error.classList.remove("invisible");
  setTimeout(() => {
    input.classList.remove("input-error");
    error.classList.add("invisible");
  }, 3000);
}

/**
 * Validates the due date input field.
 * Ensures the date is set and not in the past.
 * 
 * @returns {boolean} - True if the date is valid, false otherwise.
 */
function validateDueDate() {
  const input = document.getElementById("due-date");
  const error = document.getElementById("date-error");
  const value = input.value;

  if (!input || !error || !value) return showDateError(input, error);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(value);

  if (inputDate < today) return showDateError(input, error);

  input.classList.remove("input-error");
  error.classList.add("invisible");
  return true;
}

/**
 * Displays an error for an invalid date input field for a short duration.
 * 
 * @param {HTMLElement} input - The date input element.
 * @param {HTMLElement} error - The error message element.
 * @returns {boolean} - Always returns false.
 */
function showDateError(input, error) {
  input.classList.add("input-error");
  error.textContent = "Date must be today or in the future";
  error.classList.remove("invisible");

  setTimeout(() => {
    input.classList.remove("input-error");
    error.classList.add("invisible");
  }, 3000);

  return false;
}

/**
 * Validates that one of the priority buttons is selected.
 * If none is selected, displays a temporary error message.
 * 
 * @returns {boolean} - True if a priority is selected, otherwise false.
 */
function validatePrioritySelection() {
  const buttons = document.querySelectorAll(".priority-btn");
  const isSelected = Array.from(buttons).some(btn =>
    btn.classList.contains("active-urgent") ||
    btn.classList.contains("active-medium") ||
    btn.classList.contains("active-low")
  );

  const priorityError = document.getElementById("priority-error");
  if (!isSelected) return showPriorityError(priorityError);

  priorityError.classList.add("invisible");
  return true;
}

/**
 * Displays the priority error message for a short duration.
 * 
 * @param {HTMLElement} errorElement - The element displaying the error.
 * @returns {boolean} - Always returns false.
 */
function showPriorityError(errorElement) {
  errorElement.classList.remove("invisible");
  setTimeout(() => {
    errorElement.classList.add("invisible");
  }, 3000);
  return false;
}

/**
 * Temporarily displays an error element.
 * 
 * @param {HTMLElement} errorElement - Element to show
 */
function showTemporaryError(errorElement) {
  errorElement.classList.remove("d-none");
  setTimeout(() => errorElement.classList.add("d-none"), 3000);
}

/**
 * Form handler for modal-based task creation.
 * 
 */
async function createTaskFromFormOverlay() {
  if (!validateTitle() || !validateCategory()) return;
  const newTask = buildNewTask();

  try {
    await addNewTask(newTask); 
    window.parent.handleTaskCreated();
  } catch (error) {
    console.error(" Fehler beim Speichern des Tasks:", error);
    alert("Task konnte nicht gespeichert werden.");
  }
}

/**
 * Closes the task creation modal and clears its contents.
 * 
 */
function closeAddTaskModal() {
  document.getElementById("addTaskModal").classList.add("d-none");
  document.getElementById("addTaskIframe").src = "about:blank";
}

/**
 * Called after a task is created from within an iframe/modal.
 * 
 */
function handleTaskCreated() {
  closeAddTaskModal();
  location.reload(); 
}

/**
 * Validates task title.
 * 
 * @returns {boolean} - True if valid
 */
function validateTitle() {
  const title = document.getElementById("title").value.trim();
  const error = document.getElementById("title-error");
  const isValid = !!title;
  error.classList.toggle(isValid);
  return isValid;
}

/**
 * Validates task category.
 * 
 * @returns {boolean} - True if valid
 */
function validateCategory() {
  const category = document.getElementById("selected-category")?.textContent.trim();
  const error = document.getElementById("category-error");
  const isValid = category && category !== "Select task category";

  if (!isValid) {
    error.classList.remove("invisible");
    setTimeout(() => error.classList.add("invisible"), 3000);
  } else {
    error.classList.add("invisible");
  }

  return isValid;
}


/**
 * Builds a new task object based on form inputs.
 * 
 * @returns {Object} - Task object
 */
function buildNewTask() {
  const selectedCategory = document.getElementById("selected-category")?.textContent.trim();

  return {
    title: getValue("title"),
    description: getValue("desc"),
    dueDate: getValue("due-date"),
    priority: getSelectedPriority(),
    category: selectedCategory === "Select task category" ? "" : selectedCategory,
    Status: getTaskStatus(),
    assignedTo: collectAssignedUserIds(),
    subtasks: collectSubtasks()
  };
}


/**
 * Gets the trimmed value of an input field by ID.
 * 
 * @param {string} id - Input element ID
 * @returns {string}
 */
function getValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Determines which priority button is currently selected.
 * 
 * @returns {string} - Priority string (Urgent, Medium, Low, or empty)
 */
function getSelectedPriority() {
  const buttons = document.querySelectorAll(".priority-btn");
  for (let btn of buttons) {
    if (btn.classList.contains("active-urgent")) return "Urgent";
    if (btn.classList.contains("active-medium")) return "Medium";
    if (btn.classList.contains("active-low")) return "Low";
  }
  return "";
}

/**
 * Collects subtasks from the DOM and builds a subtasks object.
 * 
 * @returns {Object} - Subtask entries by ID
 */
function collectSubtasks() {
  const elements = document.querySelectorAll("#subtask-list .subtask-item");
  const subtasks = {};
  elements.forEach(el => {
    const id = el.id.replace("subtask-", "");
    const input = el.querySelector(".edit-subtask-input");
    const title = input
      ? input.value.trim()
      : el.querySelector(".subtask-title")?.textContent.trim();
    if (title) {
      subtasks[id] = { title, done: false };
    }
  });
  return subtasks;
}

/**
 * Collects checked user IDs from assigned checkboxes.
 * 
 * @returns {Object} - Assigned users keyed by personX
 */
function collectAssignedUserIds() {
  const boxes = document.querySelectorAll(".assigned-checkbox:checked");
  const assigned = {};
  boxes.forEach((box, i) => {
    const id = box.dataset.id;
    if (id) assigned[`person${i + 1}`] = id;
  });
  return assigned;
}

/**
 * Redirects the user to the board page after task creation.
 * 
 */
function redirectToBoard() {
  setTimeout(() => {
    window.location.href = "boardsection.html";
  }, 1000);
}


/**
 * Displays the "Task created" success message briefly.
 * 
 */
function showSuccessMessage() {
  const message = document.getElementById('task-success-message');
  if (!message) return;

  message.classList.remove('d-none');
  message.classList.add('show');

  setTimeout(() => {
    message.classList.remove('show');
    message.classList.add('d-none');
  }, 1200);
}

/**
 * Sends a new task to Firebase for saving.
 * 
 * @param {Object} taskData - The task object to store
 * @returns {Promise<Object>} - Firebase response
 */
async function addNewTask(taskData) {
  try {
    const response = await fetch(
      "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      }
    );
    const result = await response.json();
    return result; 
  } catch (error) {
    console.error(" Fehler beim Hinzufügen des Tasks:", error);
  }
}

/**
 * Displays a validation error message temporarily.
 *
 * @param {string} id - The ID of the HTML element to show as an error.
 */
function showValidationError(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove("invisible");

  setTimeout(() => {
    el.classList.add("invisible");
  }, 3000);
}

