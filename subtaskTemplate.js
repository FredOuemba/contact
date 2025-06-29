/**
 * Returns the HTML markup for a subtask in view mode.
 * @param {string} id - Subtask ID.
 * @param {string} title - Subtask title.
 * @returns {string} - HTML string.
 */
function getSubtaskViewTemplate(id, title) {
  return `
    <span class="bullet">&bull;&nbsp;</span>
    <span class="subtask-title" onclick="editSubtask('${id}')">${title}</span>
    <div class="subtask-actions">
      <img 
        src="svg/edit-black.svg" 
        class="subtask-icon" 
        tabindex="0"
        onclick="editSubtask('${id}')" 
        onfocus="editSubtask('${id}')" 
        alt="Edit Subtask"
      >
      <span class="divider"></span>
      <img 
        src="svg/delete.svg" 
        class="subtask-icon" 
        onclick="deleteSubtask('${id}')" 
        alt="Delete Subtask"
      >
    </div>
  `;
}

/**
 * Returns the HTML markup for a subtask in edit mode.
 * @param {string} id - Subtask ID.
 * @param {string} title - Subtask title.
 * @returns {string} - HTML string.
 */
function getSubtaskEditTemplate(id, title) {
  return `
    <div class="edit-subtask-container">
      <input 
        type="text" 
        class="edit-subtask-input" 
        value="${title}" 
        onblur="exitSubtaskEdit('${id}')" 
      />
      <div class="edit-subtask-icons">
        <img 
          src="svg/delete.svg" 
          alt="Delete" 
          class="edit-subtask-icon" 
          onclick="deleteSubtask('${id}')" 
        />
        <img 
          src="svg/checkButton.svg" 
          alt="Save" 
          class="edit-subtask-icon" 
          onclick="exitSubtaskEdit('${id}')" 
        />
      </div>
    </div>
  `;
}
