/**
 * Opens the "Add Task" modal and sets the current task status.
 * Adds a class to the body to disable background scrolling.
 *
 * @param {string} [status="To-Do"] - The task status to pre-fill in the form.
 */
function openAddTaskModal(status = "To-Do") {
  const modal = document.getElementById('addTaskModal');
  if (modal) {
    modal.classList.remove('d-none');
    document.body.classList.add('modal-open');
    window.currentTaskStatus = status;
  }
}

/**
 * Closes the "Add Task" modal and restores body scroll behavior.
 */
function closeAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) {
    modal.classList.add('d-none');
    document.body.classList.remove('modal-open');
  }
}

/**
 * Registers click handlers on task-adding buttons.
 * On click, determines task status and either opens a modal or redirects.
 */
function registerModalOpeners() {
  document.querySelectorAll('.add-task-btn, .icon-btn')
    .forEach(btn => btn.addEventListener('click', e => handleAddTaskClick(e, btn)));
}

/**
 * Handles click on task add buttons.
 * Decides whether to open modal or redirect to form.
 * 
 * @param {MouseEvent} e - The click event.
 * @param {HTMLElement} btn - The button that was clicked.
 */
function handleAddTaskClick(e, btn) {
  e.preventDefault();
  let status = resolveStatusFromSection(btn);

  if (window.innerWidth < 768) {
    window.location.href = `addTask.html?status=${encodeURIComponent(status)}`;
  } else {
    openAddTaskModal(status);
  }
}

/**
 * Resolves the status based on the section the button is in.
 * 
 * @param {HTMLElement} btn - The button within a section.
 * @returns {string} - Task status: "To-Do", "In Progress", etc.
 */
function resolveStatusFromSection(btn) {
  const section = btn.closest('.progress-section');
  const header = section?.querySelector('.to-do-header p')?.textContent.trim().toLowerCase();

  switch (header) {
    case "in progress": return "In Progress";
    case "await feedback": return "Await Feedback";
    case "done": return "Done";
    case "to do": return "To-Do";
    default: return "To-Do";
  }
}


/**
 * Closes the modal when clicking outside of the modal content area.
 */
function registerModalCloseOnClick() {
  document.addEventListener('click', e => {
    const modal = document.getElementById('addTaskModal');
    const content = modal?.querySelector('.modal-content');
    const isVisible = modal && !modal.classList.contains('d-none');

    if (isVisible &&
        !content.contains(e.target) &&
        !e.target.closest('.add-task-btn') &&
        !e.target.closest('.icon-btn')) {
      closeAddTaskModal();
    }
  });
}

/**
 * Closes the modal when the Escape key is pressed.
 */
function registerModalCloseOnEscape() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAddTaskModal();
  });
}

/**
 * Initializes modal functionality once the DOM is fully loaded.
 * Includes open/close listeners for clicks and keyboard events.
 */
document.addEventListener('DOMContentLoaded', () => {
  registerModalOpeners();
  registerModalCloseOnClick();
  registerModalCloseOnEscape();
});

/**
 * Exposes modal control functions globally for use in HTML.
 */
window.openAddTaskModal = openAddTaskModal;
window.closeAddTaskModal = closeAddTaskModal;
