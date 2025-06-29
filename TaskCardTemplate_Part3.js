  
  
    /**
   * 
   * This function deletes the Subtask in our databank
   * 
   * @param {string} id 
   */

  function deleteSubtask(id) {
    const li = document.getElementById(`subtask-${id}`);
    if (li) li.remove();
  }
  

  /**
 * Highlights the priority button that matches the given priority.
 *
 * - Clears existing active priority classes.
 * - Applies the corresponding active class based on the priority string.
 *
 * @param {string} priority - The priority level to highlight ("Urgent", "Medium", or "Low").
 */
  function highlightPriorityButton(priority) {
    const buttons = document.querySelectorAll(".priority-btn");
    buttons.forEach(btn => btn.classList.remove("active-urgent", "active-medium", "active-low"));
    const match = {
      "urgent": "active-urgent",
      "medium": "active-medium",
      "low": "active-low"
    }[(priority || "").toLowerCase()];
  
    if (match) {
      const button = [...buttons].find(b => b.classList.contains(match.replace("active-", "")));
      if (button) button.classList.add(match);
    }
  }


/**
 * Preselects users in the edit form based on their IDs.
 *
 * - Checks checkboxes of users whose IDs exist in the given assignedTo object.
 * - Visually highlights the selected rows.
 * - Updates the selected avatars display.
 *
 * @param {Object} assignedToObj - An object mapping keys to user IDs (e.g., { person1: "-xyz", person2: "-abc" }).
 */

  function preselectAssignedUsers(assignedToObj) {
    if (!assignedToObj) return;
    const ids = Object.values(assignedToObj); 
    document.querySelectorAll(".assigned-checkbox").forEach(checkbox => {
      if (ids.includes(checkbox.dataset.id)) {
        checkbox.checked = true;
        checkbox.closest(".assigned-row").classList.add("active");
      }
    });
  
    updateSelectedAvatars();
  }
  

  /**
 * Updates the avatar display for all currently selected (checked) assigned users.
 *
 * - Clears the existing avatars.
 * - For each checked checkbox, extracts the user’s name, generates initials and background color.
 * - Inserts a new avatar element into the container.
 */
  function updateSelectedAvatars() {
    const container = document.getElementById("selected-avatars");
    container.innerHTML = "";
  
    document.querySelectorAll(".assigned-checkbox:checked").forEach(box => {
      const name = box.dataset.name;
      const initials = getInitials(name);
      const bg = getColorFromName(name);
      container.innerHTML += `
        <div class="selected-avatar" style="background-color: ${bg}">${initials}</div>`;
    });
  }
  

  /**
 * Returns the inline CSS style string for the task category label.
 *
 * @param {string} category - The category name of the task.
 * @returns {string} A style string to apply background color if category is "technical task", otherwise an empty string.
 */
  function getCategoryLabelStyle(category) {
    return (category || '').toLowerCase() === 'technical task' ? 'background-color: turquoise;' : '';
  }
  
/**
 * Saves the updated changes of a task to the database.
 *
 * @param {string} taskId - The ID of the task to be updated.
 */
  async function saveTaskChanges(taskId) {
    const originalTask = findOriginalTask(taskId);
    if (!originalTask) return;
  
    const updatedTask = buildUpdatedTask(originalTask);
  
    try {
      await saveTaskToDatabase(taskId, updatedTask);
      handleSuccessfulSave();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  }
  
/**
 * Retrieves the original task object from the global task list using the task ID.
 *
 * @param {string} taskId - The ID of the task to find.
 */

  function findOriginalTask(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
    if (!task) {
      console.warn("Task nicht gefunden:", taskId);
    }
    return task;
  }
  
/**
 * Constructs an updated task object based on the form input values and the original task's status.
 *
 * @param {Object} originalTask - The original task object containing at least the Status property.
 */

  function buildUpdatedTask(originalTask) {
    return {
      title: getInputValue("edit-title"),
      description: getInputValue("edit-desc"),
      dueDate: getInputValue("edit-due-date"),
      priority: getSelectedPriorityFromEditForm(),
      category: getInputValue("edit-category"),
      assignedTo: collectAssignedUserIds(),
      subtasks: collectEditedSubtasks(),
      Status: originalTask.Status
    };
  }
  
  function getInputValue(id) {
    return document.getElementById(id)?.value.trim();
  }
  

  /**
 * Sends an updated task object to the Firebase database using a PATCH request.
 *
 * @param {string} taskId - The ID of the task to be updated.
 * @param {Object} data - The task data to be saved.
 */

  async function saveTaskToDatabase(taskId, data) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }
  
/**
 * if the task is succesfully saved the overlay closes and the site reloads
 */

  async function handleSuccessfulSave() {
    closeOverlay();
    await reloadBoard();
  }
  
/**
 * Retrieves the selected priority from the edit form based on which priority button is active.
 *
 * @returns {string} The selected priority: "Urgent", "Medium", "Low", or an empty string if none are selected.
 */

  function getSelectedPriorityFromEditForm() {
    const buttons = document.querySelectorAll(".priority-btn");
    if (buttons[0].classList.contains("active-urgent")) return "Urgent";
    if (buttons[1].classList.contains("active-medium")) return "Medium";
    if (buttons[2].classList.contains("active-low")) return "Low";
    return "";
  }
  
/**
 * Collects the IDs of all checked assigned users from the form and maps them to person keys.
 *
 */

  function collectAssignedUserIds() {
    const assignedTo = {};
    const checkboxes = document.querySelectorAll(".assigned-checkbox:checked");
    checkboxes.forEach((box, i) => {
      const id = box.dataset.id;
      if (id) assignedTo[`person${i + 1}`] = id;
    });
    return assignedTo;
  }

  /**
 * Collects all edited subtasks from the DOM and constructs a subtasks object.
 * It extracts either the edited input value or the displayed title from each subtask item.
 *
 * @returns {Object} An object containing subtask entries keyed by their ID,
 *                   each with a `title` and a default `done: false` status.
 */
  
  function collectEditedSubtasks() {
    const items = document.querySelectorAll("#subtask-list .subtask-item");
    const subtasks = {};
    items.forEach(el => {
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
 * Builds the HTML markup for displaying subtasks with checkboxes.
 * Falls back to a placeholder if no subtasks exist.
 *
 * @param {Object} subtasks - An object where each key maps to a subtask with a `title` and `done` boolean.
 * @param {string} taskId - The ID of the task the subtasks belong to.
 * @returns {string} HTML string representing the subtasks list.
 */
  function buildSubtasks(subtasks, taskId) {
    if (!subtasks || typeof subtasks !== "object") {
      return `<p style="font-style: italic; color: gray;">Keine Subtasks vorhanden</p>`;
    }
  
    if (subtasks.title) {
      return `<label>
        <input style="height: 14px;" type="checkbox" onchange="toggleSubtask('${taskId}', 'sub1', this.checked)">
        ${subtasks.title}
      </label>`;
    }
  
    return Object.entries(subtasks).map(([key, sub]) => {
      return `<label class="subtask-label">
        <input type="checkbox" onchange="toggleSubtask('${taskId}', '${key}', this.checked)" ${sub.done ? "checked" : ""}>
        ${sub.title}
      </label>`;
    }) .join("");
  }
  
/**
 * Toggles the completion status of a subtask both in the database and locally,
 * then updates the DOM to reflect the changes.
 *
 * @param {string} taskId - The ID of the task containing the subtask.
 * @param {string} subtaskKey - The key identifying the subtask.
 * @param {boolean} isChecked - The new completion status of the subtask.
 */
  async function toggleSubtask(taskId, subtaskKey, isChecked) {
    try {
      await updateSubtaskStatusInDB(taskId, subtaskKey, isChecked);
      const task = findTask(taskId);
      if (!task) return;
  
      if (!validateSubtaskExists(task, subtaskKey)) return;
      updateLocalSubtaskStatus(task, subtaskKey, isChecked);
      updateTaskCardDOM(taskId, task);
  
    } catch (error) {
      console.error(" Fehler beim Subtask-Update:", error);
    }
  }
  /**
 * Updates the completion status of a specific subtask in the Firebase database.
 *
 * @param {string} taskId - The ID of the task that contains the subtask.
 * @param {string} subtaskKey - The key of the subtask to update.
 * @param {boolean} isChecked - The new completion status (true or false).
 */

  async function updateSubtaskStatusInDB(taskId, subtaskKey, isChecked) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}/subtasks/${subtaskKey}/done.json`;
  
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isChecked)
    });
  
    return await response.json();
  }
  

/**
 * Finds a task in the global window.allTasks array by its ID.
 *
 * @param {string} taskId - The ID of the task to find.
 */

  function findTask(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
    if (!task) {
      console.warn(" Task nicht in window.allTasks gefunden:", taskId);
    }
    return task;
  }
  
/**
 * Checks whether a specific subtask exists within a task object.
 *
 * @param {object} task - The task object containing subtasks.
 * @param {string} subtaskKey - The key of the subtask to validate.
 * @returns {boolean} True if the subtask exists, false otherwise.
 */

  function validateSubtaskExists(task, subtaskKey) {
    const exists = task.subtasks && task.subtasks[subtaskKey];
    if (!exists) {
      console.warn(" Subtask nicht gefunden im Task-Objekt:", subtaskKey);
    }
    return exists;
  }
  

  /**
 * Updates the local status of a subtask (done/undone) within a given task object.
 *
 * @param {object} task - The task object containing subtasks.
 * @param {string} subtaskKey - The key of the subtask to update.
 * @param {boolean} isChecked - The new completion status of the subtask.
 */
  function updateLocalSubtaskStatus(task, subtaskKey, isChecked) {
    task.subtasks[subtaskKey].done = isChecked;
  }
  
/**
 * Replaces the existing task card in the DOM with an updated version based on the provided task data.
 *
 * @param {string} taskId - The ID of the task whose card should be updated.
 * @param {object} task - The updated task object used to regenerate the card's HTML.
 */

  function updateTaskCardDOM(taskId, task) {
    const card = document.getElementById(`${taskId}`);
    if (!card) {
      console.warn(" Card-Element im DOM nicht gefunden:", taskId);
      return;
    }
  
    const newCardHTML = createTaskCard(task);
    card.outerHTML = newCardHTML;
  }
  
  
  
/**
 * Initializes the application once the DOM is fully loaded.
 * Loads all tasks with their assigned people and stores them globally.
 */

  document.addEventListener("DOMContentLoaded", async () => {
    await getAllTasksWithPeople();     

  });

/**
 * Deletes a task from the Firebase database and updates the UI accordingly.
 *
 * @param {string} taskId - The ID of the task to delete.
 *
 */
  async function deleteTask(taskId) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`;
    try {
      const response = await fetch(url, {
        method: "DELETE"
      });
      if (response.ok) {
        window.allTasks = window.allTasks.filter(task => task.id !== taskId);
        const card = document.getElementById(taskId);
        if (card) {
          card.remove();
        }
        closeOverlay();
      } else {
        console.error("Fehler beim Löschen:", response.statusText);
      }
    } catch (error) {
      console.error("Fehler beim Löschen des Tasks:", error);
    }
    checkEmptySections()
  }
  

  /**
 * Checks all progress sections on the board and toggles the visibility
 * of the "no tasks" message depending on whether any task cards are present.
 */
