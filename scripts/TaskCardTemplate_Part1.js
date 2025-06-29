

const avatarColors = ["#FF7A00", "#FF5C01", "#FFBB2E", "#0095FF", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF4646", "#FFC700", "#BEE800"];
/**
 * Generates a consistent avatar background color based on a user's name.
 * Hashes the name string and maps it to one of the predefined colors.
 *
 * @param {string} name - The user's full name.
 * @returns {string} A hex color code from the avatarColors array.
 */
function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash % avatarColors.length)];
}

/**
 * Generates a consistent avatar Initials  based on a user's name.
 *
 * @param {string} name - The user's full name.
 */

function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  let initials = parts[0][0];
  if (parts.length > 1) initials += parts[1][0];
  return initials.toUpperCase();
}

/**
 * Returns a deterministic background color based on a given name.
 * This is used to generate visually distinct avatar colors.
 *
 * @param {string} name - The name used to generate a color hash.
 * @returns {string} A hex color code selected from a predefined palette.
 */

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#00BEE8", "#1FD7C1", "#0038FF"];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Creates an HTML string representing a task card for the Kanban board.
 * The card includes title, description, priority icon, category styling,
 * assigned users, and subtask progress. It is also draggable and clickable.
 *
 * @param {Object} task - The task object containing all relevant data.
 * @returns {string} HTML string representing the rendered task card.
 */

function createTaskCard(task) {
  const assignedHTML = renderAssignedPeople(task.assignedPeople || []);

  
  const { total, done } = calculateSubtaskProgress(task.subtasks || {});
  const priorityIcon = getPriorityIcon(task.priority);
  const typeStyle = getCategoryStyle(task.category);
  const progressPercent = (done / total) * 100;

  return `


    <div class="card" draggable="true" id="${task.id}" onclick="openOverlayFromCard('${task.id}')"
         ondragstart="startDragging(event)" id="${task.id}">
      <div class="responsive-swap">
      <div class="card-type" style="${typeStyle}">${task.category || "Task"}</div>
      <img src="svg/swap_horiz.svg" alt="" class="swap-icon" srcset="" onclick="openMoveOverlay(event, '${task.id}')">
      </div>
      <div class="card-title">${task.title}</div>
      <div class="card-description">${task.description || ""}</div>
  

      ${total > 0 ? `
        <div class="card-footer">
          <div class="progress">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <span class="subtasks">${done}/${total} Subtasks</span>
        </div>` : ""}

      <div class="card-bottom">
        <div class="avatars">${assignedHTML}</div>
        <div class="menu-icon">${priorityIcon}</div>
      </div>
    </div>
 
  `;
}

window.openMoveOverlay = function(event, taskId) {
  event.stopPropagation();

  closeMoveOverlays();

  const icon = event.target;
  const currentTask = allTasks.find(t => t.id === taskId);
  const currentStatus = currentTask?.Status;

  const statuses = ["To-Do", "In Progress", "Await Feedback", "Done"];

  const overlay = document.createElement("div");
  overlay.className = "move-overlay";
  overlay.innerHTML = `<strong>Move to</strong>`;

  statuses.forEach(status => {
    if (status === currentStatus) return; 

    const button = document.createElement("button");
    button.textContent = status;
    button.type = "button"; // Verhindert reload!
    button.onclick = (e) => handleMoveClick(e, taskId, status);
    
    overlay.appendChild(button);
  });

  icon.parentElement.appendChild(overlay);
};

/**
 * Handles the click on a "Move to" button inside the popup overlay.
 * Prevents parent onclicks, updates the status and closes the overlay.
 * 
 * @param {MouseEvent} event 
 * @param {string} taskId - The ID of the task being moved
 * @param {string} newStatus - The target status (e.g., "To-Do", "In Progress", etc.)
 */
window.handleMoveClick = async function(event, taskId, newStatus) {
  event.stopPropagation(); // Verhindert das Öffnen des großen Overlays
  event.preventDefault(); // ⬅️ DAS hinzufügen!

  await moveTaskTo(taskId, newStatus);
  closeMoveOverlays();
};

/**
 * Moves the task to a new status and updates the backend.
 * 
 * @param {string} taskId 
 * @param {string} newStatus 
 */
async function moveTaskTo(taskId, newStatus) {
  try {
    // Backend aktualisieren
    await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ Status: newStatus })
    });
    updateTaskStatusInDOM(taskId, newStatus);
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks:", error);
  }
}

/**
 * Closes all currently open "Move to" overlay menus on task cards.
 *
 * Selects all elements with the class `.move-overlay` and removes them from the DOM.
 * This is typically used to clean up any open move option popups when the user clicks elsewhere.
 */
function closeMoveOverlays() {
  document.querySelectorAll(".move-overlay").forEach(el => el.remove());
}

document.addEventListener("click", (e) => {
  const isOverlay = e.target.closest(".move-overlay");
  const isTrigger = e.target.closest(".swap-icon");
  if (!isOverlay && !isTrigger) closeMoveOverlays();
});

/**
 * Generates HTML for displaying avatars of assigned people.
 * Each avatar shows the initials of the person's name and a background color
 *
 * @param {Array<Object>} people - Array of person objects.
 * @returns {string} HTML string containing styled avatar elements.
 */

function renderAssignedPeople(people) {
  if (!people || people.length === 0) return "";
  let displayLimit = 3;
  let avatars = people.slice(0, displayLimit).map(person => {
    const initials = getInitials(person.name);
    const color = getColorForName(person.name);
    return `<div class="avatar" style="background-color:${color}">${initials}</div>`;
  }).join("");

  if (people.length > displayLimit) {
    const remaining = people.length - displayLimit;
    avatars += `<div class="avatar avatar-counter">+${remaining}</div>`;
  }
  return avatars;
}

/**
 * calculates the progress on subtasks 
 * 
 * 
 * @param {string} subtasks 
 * @returns total amount of subtasks and finished amount of subtasks
 */
function calculateSubtaskProgress(subtasks) {
  let total = 0, done = 0;
  for (const key in subtasks) {
    total++;
    if (subtasks[key].done) done++;
  }
  return { total, done };
}

/**
 * Returns an HTML string for the corresponding priority icon.
 * Converts the priority string to lowercase and maps it to an SVG file.
 *
 * @param {string} priority - The priority level ("Urgent", "Medium", or "Low").
 * @returns {string} An HTML <img> element as a string, or an empty string if unknown.
 */
function getPriorityIcon(priority) {
  const icons = {
    urgent: "urgent.svg",
    medium: "medium.svg",
    low: "low.svg"
  };
  const key = (priority || "").toLowerCase();
  return icons[key] ? `<img src="svg/${icons[key]}" alt="${key} icon" />` : "";
}

/**
 * checks if category is technical task if true 
 * @param {string} category 
 * @returns backround colour tourquise
 */
function getCategoryStyle(category) {
  return (category || "").toLowerCase() === "technical task"
    ? "background-color: turquoise;"
    : "";
}


  /**
 * Loads all tasks and people data from the backend and renders the tasks onto the board.
 * Each task is enriched with assigned people data before being inserted into its column.
 *
 * Fetches:
 * - Task data from the "Tasks" endpoint
 * - Person data from the "person" endpoint
 *
 * Calls `insertTaskIntoColumn` for each task with resolved person assignments.
 *
 * @function loadBoardTasks
 * @returns 
 */

  async function loadBoardTasks() {
    const [tasksRes, peopleRes] = await Promise.all([
      fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"),
      fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json")
    ]);
    const tasksData = await tasksRes.json();
    const peopleData = await peopleRes.json();
    for (const [id, task] of Object.entries(tasksData)) {
      const personIds = Object.values(task.assignedTo || {});
      const currentUser = getCurrentUser();
      const assignedPeople = personIds.map(pid => peopleData[pid] || (currentUser && pid === currentUser.id ? currentUser : null)).filter(Boolean);
      const fullTask = { id, ...task, assignedPeople };
      insertTaskIntoColumn(fullTask);
    }
  }


/**
 * Reloads all tasks from the backend and re-renders the task board.
 * Fetches updated task and person data, assigns people to tasks, clears the board,
 * reinserts tasks, updates global task state, and checks for empty sections.
 */
async function reloadBoard() {
  try {
    const [tasksData, peopleData] = await fetchTasksAndPeople();
    const newTasks = buildFullTasks(tasksData, peopleData);
    renderTasksToBoard(newTasks);
  } catch (error) {
    console.error("Error while reloading the board:", error);
  }
}

/**
 * Fetches task and person data from the backend.
 *
 * @returns {Promise<[Object, Object]>} A Promise resolving to an array containing task data and people data.
 */
async function fetchTasksAndPeople() {
  const [tasksRes, peopleRes] = await Promise.all([
    fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"),
    fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json")
  ]);
  const tasksData = await tasksRes.json();
  const peopleData = await peopleRes.json();
  return [tasksData, peopleData];
}

/**
 * Builds an array of enriched task objects with assigned people included.
 *
 * @param {Object} tasksData - Raw task data from the backend.
 * @param {Object} peopleData - Raw person data from the backend.
 * @returns {Array<Object>} An array of task objects with full person data.
 */
function buildFullTasks(tasksData, peopleData) {
  const newTasks = [];
  for (const [id, task] of Object.entries(tasksData)) {
    const personIds = Object.values(task.assignedTo || {});
    const currentUser = getCurrentUser();
    const assignedPeople = personIds
      .map(pid => peopleData[pid] || (currentUser && pid === currentUser.id ? currentUser : null))
      .filter(Boolean);

    const fullTask = { id, ...task, assignedPeople };
    newTasks.push(fullTask);
  }

  return newTasks;
}

/**
 * Clears the current board, renders new task cards, updates global state,
 * and checks for empty task sections.
 *
 * @param {Array<Object>} tasks - An array of full task objects to render.
 */
function renderTasksToBoard(tasks) {
  clearAllTaskBuckets();
  tasks.forEach(insertTaskIntoColumn);
  window.allTasks = tasks;
  checkEmptySections();
}

/**
 * Clears all task containers (buckets) on the board.
 *
 * Selects all elements with the class `.card-bucket` and removes their inner HTML content.
 * This is typically used before re-rendering tasks to ensure the board is empty.
 */
function clearAllTaskBuckets() {
  const buckets = document.querySelectorAll('.card-bucket');
  buckets.forEach(bucket => bucket.innerHTML = '');
}

  function updateTaskStatusInDOM(taskId, newStatus) {
    const card = document.getElementById(taskId);
    if (!card) return;
    const oldColumn = card.closest(".card-bucket");
    if (oldColumn) card.remove();
    const columnSelector = getColumnSelector({ Status: newStatus });
    const newColumn = document.querySelector(`${columnSelector} .card-bucket`);
    if (newColumn) {
      newColumn.appendChild(card);
    }
    const task = window.allTasks.find(t => t.id === taskId);
    if (task) {
      task.Status = newStatus;
    }
    checkEmptySections();
  }
  
  
/**
 * Inserts a task card into the appropriate board column based on its status.
 * If the column doesn't exist or the status is unknown, the function exits early.
 * Hides the "no tasks" placeholder and appends the task card to a bucket container.
 *
 * @param {Object} task - The task object to insert.
 */
  function insertTaskIntoColumn(task) {
    const columnSelector = getColumnSelector(task);
    if (!columnSelector) return;
  
    hideNoTasksMessage(columnSelector);
    insertTaskCard(columnSelector, task);
  }

  /**
 * Returns the CSS selector string for the board column corresponding to the task's status.
 * Normalizes the status to lowercase and maps it to a column index using a predefined map.
 * If the status is unknown, logs a warning and returns null.
 *
 * @param {Object} task - The task object containing status information.
 */
  function getColumnSelector(task) {
    const status = (task.Status || task.status || "").toLowerCase();
    const map = {
      "to-do": 1,
      "in progress": 2,
      "await feedback": 3,
      "done": 4
    };
  
    const index = map[status];
    if (!index) {      console.warn("Unbekannter Status:", status);
    return null;
  } 
  return `.board-cards .progress-section:nth-child(${index})`;
}

