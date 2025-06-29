
/**
 * if there is a task in the sector the NoTask Message dissapears 
 * @param {string} selector 
 */

  function hideNoTasksMessage(selector) {
    const container = document.querySelector(`${selector} .no-tasks`);
    if (container) container.classList.add("d-none");
  }
  
/**
 * Inserts a task card into the specified board column.
 * Ensures that a container with class `.card-bucket` exists within the column.
 * If the bucket is missing, it creates and appends it before adding the task card.
 *
 * @param {string} selector - CSS selector for the target column (e.g., ".board-cards .progress-section:nth-child(1)").
 * @param {Object} task - Task object used to render the task card.
 */

  function insertTaskCard(selector, task) {
    const column = document.querySelector(selector);
    let bucket = column.querySelector('.card-bucket');
  
    if (!bucket) {
      bucket = document.createElement('div');
      bucket.classList.add('card-bucket');
      column.appendChild(bucket);
    }
  
    bucket.insertAdjacentHTML("beforeend", createTaskCard(task));
  }
  
  
  /**
 * Initializes the board by loading tasks once the DOM is fully loaded.
 * Ensures that tasks are fetched and rendered into the correct board columns.
 *
 * @event DOMContentLoaded
 */

  document.addEventListener("DOMContentLoaded", () => {
    loadBoardTasks();
  });


/**
 * Opens the task detail overlay for the given task ID.
 * Searches for the task in the globally stored task list and renders the overlay.
 * Logs a warning if the task cannot be found.
 *
 * @param {string} taskId - The unique ID of the task to display in the overlay.
 */

  window.openOverlayFromCard = function(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
  
    if (!task) {
      console.warn(" Task nicht gefunden!");
      return;
    }
    showTaskOverlay(task);
  };
  
  
  /**
 * Displays the task detail overlay for the provided task.
 * Injects the HTML markup into the overlay container and applies an animation class.
 *
 * @param {Object} task - The task object to display in the overlay.
 */
  function showTaskOverlay(task) {
    const overlayContainer = document.getElementById("overlay-container");
    overlayContainer.innerHTML = buildOverlayHTML(task);
    overlayContainer.style.display = "flex";
  
    const overlay = overlayContainer.querySelector('.task-card-overlay');
    if (overlay) {
      overlay.classList.add('animate-in');
    }
  }
  
  /**
   * close the Overlay
   */
  function closeOverlay() {
    const overlay = document.getElementById("overlay-container");
    overlay.innerHTML = "";
    overlay.style.display = "none";
  }
  

/**
 * Builds and returns the HTML markup for the task overlay.
 * Includes task details such as title, description, due date, priority icon, assigned people, and subtasks.
 *
 * @param {Object} task - The task object containing all necessary task data.
 * @returns {string} - HTML string representing the full overlay view.
 */

  function buildOverlayHTML(task) {
    const priorityIcon = (() => {
      switch ((task.priority || "").toLowerCase()) {
        case "urgent":
          return `<img src="svg/urgent.svg" alt="Urgent Icon" style="height: 16px; vertical-align: middle; margin-left: 6px;">`;
        case "medium":
          return `<img src="svg/medium.svg" alt="Medium Icon" style="height: 16px; vertical-align: middle; margin-left: 6px;">`;
        case "low":
          return `<img src="svg/low.svg" alt="Low Icon" style="height: 16px; vertical-align: middle; margin-left: 6px;">`;
        default:
          return "";
      }
    })();
    let categoryLabelStyle = "";

if ((task.category || "").toLowerCase() === "technical task") {
  categoryLabelStyle = "background-color: turquoise;";
}

    const subtasksHtml = buildSubtasks(task.subtasks, task.id);
    const peopleHtml = task.assignedPeople.map(person => {
      const initials = getInitials(person.name);
      const bg = getColorForName(person.name);


      return `
        <div class="task-card-person">
          <div class="task-card-avatar" style="background-color:${bg};">${initials}</div>
          <span class="task-card-name">${person.name}</span>
        </div>`;
    }).join("");
  
    return `
      <div class="task-card-overlay">
      <div class="task-card-label" style="${categoryLabelStyle}">${task.category || "Kategorie"}</div>
        <div class="task-card-close-btn" onclick="closeOverlay()">&times;</div>
  
        <div class="task-card-title">${task.title || "Kein Titel"}</div>
        <div class="task-card-description">${task.description || ""}</div>
  
        <div class="task-card-info"><strong>Due date:</strong> ${task.dueDate || "-"}</div>
        <div class="task-card-info ">
          <strong>Priority:</strong>   <span>
          ${task.priority || "-"}
          ${priorityIcon}
        </span>
        </div>
  
        <div class="task-card-info"><strong>Assigned To:</strong></div>
        <div class="task-card-assigned">${peopleHtml}</div>
  
        <div class="task-card-subtasks">
          <strong>Subtasks</strong>
          <div style="max-height:72px; overflow-y:auto;">
          ${subtasksHtml}
          </div>
        </div>
  
        <div class="task-card-actions">
          <button class="task-card-delete-btn hover-blue" onclick="deleteTask('${task.id}')"><img src="svg/delete.svg" alt="" style="margin-right: 8px; position: relative; top: -1px;">Delete</button>
          <button class="task-card-edit-btn hover-blue" onclick="switchToEditMode('${task.id}')"><img src="svg/edit-black.svg" style="margin-right: 8px; position: relative; top: -1px;" alt="" srcset="">Edit</button>
        </div>
      </div>`;
  }
  



/**
 * Global click event listener to close the task overlay.
 *
 * Closes the overlay if the user clicks outside the visible overlay card content.
 * This ensures the overlay is dismissed when clicking on the backdrop area.
 *
 * Conditions:
 * - The overlay must be visible (`display: flex`).
 * - The click must occur inside the overlay container.
 * - The click must NOT be within the task card element itself.
 *
 * @event click
 * @param {MouseEvent} event - The triggered click event.
 */
document.addEventListener("click", function (event) {
  const overlay = document.getElementById("overlay-container");
  const card = document.querySelector(".task-card-overlay");

  if (
    overlay.style.display === "flex" &&
    overlay.contains(event.target) &&
    card &&
    !card.contains(event.target)
  ) {
    closeOverlay();
  }
});

  


  
/**
 * Switches the task overlay to edit mode for the given task ID.
 * Renders the edit form, shows the overlay, and initializes interactive elements such as priority buttons and assigned contacts.
 *
 * @async
 * @param {string} taskId - The ID of the task to be edited.
 */

  async function switchToEditMode(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
    if (!task) return;
    const overlay = document.getElementById("overlay-container");
    overlay.innerHTML = buildEditTaskForm(task);
    overlay.style.display = "flex";
    setTimeout(async () => {
      setupPriorityButtons();                    // Priority Buttons aktivieren
      await assignedToInput();                   // Kontakte laden
      preselectAssignedUsers(task.assignedTo);   // Haken setzen
      highlightPriorityButton(task.priority);    // Priority selektieren
    }, 0);
  }
  
  /**
 * Initializes click event listeners on priority buttons.
 * Ensures only one priority (urgent, medium, or low) is active at a time
 * by applying the appropriate CSS class to the selected button.
 */
  function setupPriorityButtons() {
    const buttons = document.querySelectorAll(".priority-btn");
  
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active-urgent", "active-medium", "active-low"));
  
        if (button.classList.contains("urgent")) button.classList.add("active-urgent");
        if (button.classList.contains("medium")) button.classList.add("active-medium");
        if (button.classList.contains("low")) button.classList.add("active-low");
      });
    });
  }
  

  /**
 * Builds and returns the HTML markup for the edit task form overlay.
 * 
 * @param {Object} task - The task object containing data to populate the form.
 * 
 * @returns {string} HTML string representing the complete editable task form.
 */
  
  function buildEditTaskForm(task) {
    return `
      <div class="task-card-overlay" style="max-height: 70vh; overflow-y: auto; gap:4px">
        <div class="task-card-close-btn" onclick="closeOverlay()">&times;</div>
  
        <label style="margin-bottom: 0;">Title</label>
        <input type="text" id="edit-title" value="${task.title}" />
  
        <label style="margin-bottom: 0; margin-top: 8px;">Description</label>
        <textarea id="edit-desc" style="min-height: 70px;">${task.description}</textarea>
  
        <label style="margin-bottom: 0; margin-top: 8px;">Due Date</label>
        <input type="date" id="edit-due-date" value="${task.dueDate}" />
  
        <label style="margin-bottom: 0; margin-top: 8px;">Priority</label>
        <div class="priority-buttons">
          <button type="button" class="priority-btn urgent">Urgent <img src="svg/urgent.svg"></button>
          <button type="button" class="priority-btn medium">Medium <img src="svg/medium.svg"></button>
          <button type="button" class="priority-btn low">Low <img src="svg/low.svg"></button>
        </div>
  
        <label for="assigned" style="margin-bottom: 0; margin-top: 8px;">Assigned to</label>
        <div class="assigned-dropdown" style="margin-bottom: 15px;">
          <div class="assigned-select" onclick="toggleAssignedDropdown(event)">
            <input
              type="text"
              id="assigned-search"
              class="assigned-search-input"
              placeholder="Select contacts to assign"
              oninput="filterAssignedList()"
            />
            <span class="dropdown-arrow">▼</span>
          </div>
          <div class="assigned-options d-none" id="assigned-list"></div>
        </div>
        <div id="selected-avatars" style="margin-bottom: 15px; margin-top: 0px;" class="selected-avatars"></div>
  
        <label style="margin-bottom: 0; margin-top: 8px;">Category</label>
        <select id="edit-category"  style="height: 50px;" >
          <option value="Technical Task" ${task.category === "Technical Task" ? "selected" : ""}>Technical Task</option>
          <option value="User Story" ${task.category === "User Story" ? "selected" : ""}>User Story</option>
        </select>
  
        <label style="margin-bottom: 0; margin-top: 8px;">Subtasks</label>
        <div class="subtasks-section">
        <div class="subtask-input-wrapper">
        <input type="text" id="edit-subtask-input" class="subtask-input" placeholder="Add new subtask" />
        <button type="button" class="subtask-add-btn" onclick="addSubtaskInEditForm()">+</button>
      </div>
      
          <ul id="subtask-list" style="padding-left:0; max-height:72px; overflow-y:auto;">
            ${Object.entries(task.subtasks || {}).map(([id, sub]) => `
              <li class="subtask-item" id="subtask-${id}" ondblclick="editSubtask('${id}')">
                <span class="subtask-title">${sub.title}</span>
                <div class="subtask-actions">
                  <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
                  <span class="divider"></span>
                  <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
                </div>
              </li>
            `).join("")}
          </ul>
        </div>
  
        <div class="task-card-actions">
          <button class="task-card-edit-save-btn" onclick="saveTaskChanges('${task.id}')">Save <img src="svg/check.svg" alt="" srcset=""></button>
        </div>
      </div>
    `;
  }
  

  /**
 * Adds a new subtask entry to the subtask list in the edit task form.
 * 
 * - Reads the input field for a new subtask title.
 * - If valid, generates a unique ID using the current timestamp.
 * - Creates a new list item with appropriate HTML structure.
 * - Appends it to the subtask list in the DOM.
 * - Clears the input field afterward.
 * 
 * Does nothing if the input field is empty.
 */
  function addSubtaskInEditForm() {
    const input = document.getElementById('edit-subtask-input');
    const title = input.value.trim();
    if (!title) return;
    const id = `sub${Date.now()}`; 
    const ul = document.getElementById('subtask-list');
    const li = document.createElement('li');

    li.className = 'subtask-item';
    li.id = `subtask-${id}`;
    li.innerHTML = `
      <span class="subtask-title">${title}</span>
      <div class="subtask-actions">
        <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
        <span class="divider"></span>
        <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
      </div>
    `;
    ul.appendChild(li);
    input.value = '';
  }
  


  /**
 * Switches a subtask list item into edit mode.
 * 
 * - Replaces the static subtask title with an input field.
 * - Provides action icons for saving or deleting the subtask.
 * 
 * @param {string} id - The unique identifier of the subtask to be edited.
 */
  function editSubtask(id) {
    const li = document.getElementById(`subtask-${id}`);
    const title = li.querySelector('.subtask-title').textContent;
    li.innerHTML = `
      <input type="text" class="edit-subtask-input" value="${title}" />
      <div class="subtask-actions">
        <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
        <span class="divider"></span>
        <span class="subtask-icon" onclick="saveSubtask('${id}')">✔</span>
      </div>
    `;
  }
  

  /**
 * Saves the edited subtask title and exits edit mode.
 * 
 * - Retrieves the new title from the input field.
 * - Replaces the input with the updated static subtask title.
 * - Restores edit and delete icons.
 * 
 * @param {string} id - The unique identifier of the subtask being saved.
 */
  function saveSubtask(id) {
    const li = document.getElementById(`subtask-${id}`);
    const newTitle = li.querySelector('.edit-subtask-input').value.trim();
    if (!newTitle) return;
  
    li.innerHTML = `
      <span class="subtask-title">${newTitle}</span>
      <div class="subtask-actions">
        <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
        <span class="divider"></span>
        <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
      </div>
    `;
  }

