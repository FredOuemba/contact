import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let draggedElement;

/**
 * starts dragging element
 * @param {string} event 
 */
window.startDragging = function(event) {
  draggedElement = event.target;
}

/**
 * allows to drop Element 
 * @param {string} event 
 */
window.allowDrop = function(event) {
  event.preventDefault();
}
/**
 * Displays a visual placeholder card ("ghost card") in the given dropzone.
 * Used during drag-and-drop to indicate the target area.
 *
 * @param {HTMLElement} dropzone - The element where the ghost card should be shown.
 */
function showGhostCard(dropzone) {
  removeGhostCard();

  const ghost = document.createElement("div");
  ghost.className = "card ghost-card";
  ghost.id = "ghost-preview";
  dropzone.appendChild(ghost);
}

/**
 * Removes the ghost card from the DOM if it exists.
 * Ensures only one ghost card is shown at a time.
 */
function removeGhostCard() {
  const existing = document.getElementById("ghost-preview");
  if (existing) existing.remove();
}

/**
 * Handles the dragover event on a dropzone.
 * Prevents default behavior and shows a ghost card to indicate drop target.
 *
 * @param {DragEvent} event - The dragover event object.
 */
window.handleDragOver = function(event) {
  event.preventDefault();
  const dropzone = event.currentTarget;

  showGhostCard(dropzone);
};

/**
 * Handles the dragleave event on a dropzone.
 * Removes the ghost card when the dragged item leaves the dropzone.
 *
 * @param {DragEvent} event - The dragleave event object.
 */
window.handleDragLeave = function(event) {
  const dropzone = event.currentTarget;

  removeGhostCard();
};

/**
 * Handles the drop event during a drag-and-drop operation on a task card.
 * Moves the dragged task to the dropzone, updates the UI accordingly,
 * and sends the new status to the database.
 *
 * @param {DragEvent} event - The drag-and-drop event triggered when a task card is dropped.
 * 
 */
window.drop = async function handleDrop(event) {
  event.preventDefault();
  const dropzone = event.currentTarget;

  if (!draggedElement || !dropzone.classList.contains('dropzone')) return;

  moveTaskCardToDropzone(draggedElement, dropzone);
  hideNoTasksMessage(dropzone);
  checkEmptySections();
  removeGhostCard();

  const taskId = extractTaskId(draggedElement.id);
  const newStatus = getStatusFromDropzone(dropzone);
  if (taskId && newStatus) {
    await updateTaskStatus(taskId, newStatus);
  }
};

/**
 * Moves a task card element into a given dropzone.
 * If the dropzone does not yet contain a `.card-bucket` container,
 * it creates one and appends the card into it.
 *
 * @param {HTMLElement} cardElement - The task card element being moved.
 * @param {HTMLElement} dropzone - The target container where the card should be dropped.
 */
function moveTaskCardToDropzone(cardElement, dropzone) {
  let bucket = dropzone.querySelector('.card-bucket');

  if (!bucket) {
    bucket = document.createElement('div');
    bucket.classList.add('card-bucket');
    dropzone.appendChild(bucket);
  }

  bucket.appendChild(cardElement);
}


/**
 * checks if the sections are empty and toggles D:none on the div NO Tasks To Do
 */
function hideNoTasksMessage(dropzone) {
  const noTasksMessage = dropzone.querySelector('.no-tasks');
  if (noTasksMessage) {
    noTasksMessage.classList.add('d-none');
  }
}

/**
 * 
 * builds the correct Task Id 
 * 
 * @param {string} cardId 
 * @returns 
 */
function extractTaskId(cardId) {
  return cardId.replace("task-", "");
}

/**
 * returns in wich dropzone the element is currently in
 * @param {string} dropzone 
 * @returns 
 */
function getStatusFromDropzone(dropzone) {
  const title = dropzone.querySelector(".to-do-header p")?.innerText.toLowerCase();

  if (title.includes("to do")) return "To-Do";
  if (title.includes("in progress")) return "In Progress";
  if (title.includes("await feedback")) return "Await Feedback";
  if (title.includes("done")) return "Done";

  return null;
}

/**
 * Updates current Status of task in databank
 * @param {string} taskId 
 * @param {string} newStatus 
 */
async function updateTaskStatus(taskId, newStatus) {
  try {
    await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ Status: newStatus })
    });
  } catch (error) {
    console.error("Fehler beim Status-Update:", error);
  }
}

/**
 * toggles the dropdown menu
 */
window.toggleMenu = function() {
    const menu = document.getElementById("dropdownMenu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

/**
 * Toggles the visibility of the user dropdown menu.
 * Adds or removes the "show" class on the element with ID "userDropdown".
 *
 */
window.toggleDropdown = function() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

/**
 * Global click event listener that closes the dropdown menu
 * if a click occurs outside the profile wrapper element.
 *
 * @param {MouseEvent} e - The click event object.
 * 
 */
document.addEventListener("click", function (e) {
    const profile = document.querySelector(".profile-wrapper");
    const menu = document.getElementById("dropdownMenu");
    if (profile && menu && !profile.contains(e.target)) {
        menu.classList.remove("show");
    }
});


/**
 * Logout for current user
 */
async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.href = 'Index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

/**
 * Sets up the logout button behavior after the DOM has fully loaded.
 * Attaches a click event to the logout link inside the dropdown menu,
 * preventing default navigation and triggering the logout logic.
 *
 */
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#dropdownMenu a[href="Index.html"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});

/**
 * Opens the task move menu or overlay depending on screen size.
 * @param {string} taskId - The ID of the task to be moved.
 */
window.openTaskMoveMenu = function (taskId) {
  if (window.innerWidth >= 990) {
    openOverlayFromCard(taskId);
    return;
  }

  const task = window.allTasks.find(t => t.id === taskId);
  if (!task) return;

  const options = getMoveOptions(task.Status);
  const menuHtml = generateMoveMenuHTML(taskId, options);
  showMoveMenu(menuHtml);
};

/**
 * Generates the HTML markup for the move menu based on options.
 * @param {string} taskId - The ID of the task.
 * @param {Array<{status: string, label: string, icon: string}>} options - Move options.
 * @returns {string} - HTML string for the move menu.
 */
function generateMoveMenuHTML(taskId, options) {
  return `
    <div class="task-move-popup">
      <div class="move-title">Move to</div>
      ${options.map(opt => `
        <button class="move-option" onclick="moveTaskTo('${taskId}', '${opt.status}')">
          ${opt.icon} ${opt.label}
        </button>
      `).join("")}
    </div>
  `;
}

/**
 * Appends the generated move menu to the DOM and sets up outside click to close.
 * @param {string} html - The HTML string to insert.
 */
function showMoveMenu(html) {
  const container = document.createElement("div");
  container.className = "move-popup-container";
  container.innerHTML = html;
  document.body.appendChild(container);
  setupOutsideClickToRemove(container);
}

/**
 * Closes the menu if a user clicks outside of it.
 * @param {HTMLElement} container - The popup container element.
 */
function setupOutsideClickToRemove(container) {
  document.addEventListener("click", function closeMenu(e) {
    if (!container.contains(e.target)) {
      container.remove();
      document.removeEventListener("click", closeMenu);
    }
  }, { once: true });
}

/**
 * Returns an array of move-to options based on the current task status.
 * Excludes the current status and maps remaining statuses to labels and icons.
 *
 * @param {string} currentStatus - The current status of the task.
 * @returns {Array<{status: string, label: string, icon: string}>} - The move options.
 */
window.getMoveOptions = function(currentStatus) {
  const all = ["To-Do", "In Progress", "Await Feedback", "Done"];
  const icons = { "To-Do": "↑", "In Progress": "→", "Await Feedback": "↓", "Done": "✓" };

  return all
    .filter(status => status !== currentStatus)
    .map(status => ({
      status,
      label: status,
      icon: icons[status] || ""
    }));
};

let longPressTriggered = false;
let longPressTimer = null;
const LONG_PRESS_DURATION = 500; // adjust as needed

/**
 * Sets up long-press interaction on a given task card.
 * Binds mouse events to distinguish between long-press and normal clicks.
 *
 * @param {HTMLElement} cardElement - The task card element.
 * @param {string} taskId - Unique task identifier.
 */
export function setupLongPress(cardElement, taskId) {
  cardElement.addEventListener("mousedown", () => startLongPress(taskId));
  cardElement.addEventListener("mouseup", cancelLongPress);
  cardElement.addEventListener("mouseleave", cancelLongPress);
  cardElement.addEventListener("click", (e) => handleClick(e, taskId));
}

/**
 * Initiates the long press timer.
 * Triggers long-press action if duration is reached.
 *
 * @param {string} taskId - Task identifier to move.
 */
function startLongPress(taskId) {
  longPressTriggered = false;
  longPressTimer = setTimeout(() => {
    longPressTriggered = true;
    openTaskMoveMenu(taskId);
  }, LONG_PRESS_DURATION);
}

/**
 * Cancels the long press if user releases or moves away.
 */
function cancelLongPress() {
  clearTimeout(longPressTimer);
}

/**
 * Handles regular click or suppresses it if long-press was triggered.
 *
 * @param {MouseEvent} e - The click event.
 * @param {string} taskId - Task identifier to open.
 */
function handleClick(e, taskId) {
  if (longPressTriggered) {
    e.preventDefault();
    return;
  }
  openOverlayFromCard(taskId);
}
