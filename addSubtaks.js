let subtasks = [];

// Add a new subtask
function addSubtask() {
  let input = document.querySelector('.subtask-input');
  let title = input.value.trim();
  if (!title) return;

  let subtaskId = `sub${Date.now()}`;
  subtasks.push({ id: subtaskId, title, done: false });

  renderSubtaskList();
  input.value = "";
}

// Render all subtasks
function renderSubtaskList() {
  const list = document.getElementById('subtask-list');
  list.innerHTML = '';
  subtasks.forEach(subtask => {
    let row = document.createElement('div');
    row.className = 'subtask-item';
    row.id = `subtask-${subtask.id}`;

    // Bullet + Text
    let text = document.createElement('span');
    text.className = 'subtask-title';
    text.textContent = `• ${subtask.title}`;
    row.appendChild(text);

    // Edit/Delete Actions
    let actions = document.createElement('span');
    actions.className = 'subtask-actions';

    // Edit icon
    let editBtn = document.createElement('img');
    editBtn.src = 'assets/Property 1=edit.png';
    editBtn.className = 'subtask-icon edit-icon';
    editBtn.title = 'Edit subtask';
    editBtn.alt = 'Edit';
    editBtn.onclick = function() {
      startEditSubtask(subtask.id);
    };
    actions.appendChild(editBtn);

    // Delete icon
    let deleteBtn = document.createElement('img');
    deleteBtn.src = 'assets/Property 1=delete.png';
    deleteBtn.className = 'subtask-icon delete-icon';
    deleteBtn.title = 'Delete subtask';
    deleteBtn.alt = 'Delete';
    deleteBtn.onclick = function() {
      deleteSubtask(subtask.id);
    };
    actions.appendChild(deleteBtn);

    row.appendChild(actions);

    // Hover effect for actions
    row.onmouseenter = () => row.classList.add('hover');
    row.onmouseleave = () => row.classList.remove('hover');

    list.appendChild(row);
  });
}

// Delete a subtask
function deleteSubtask(subtaskId) {
  subtasks = subtasks.filter(s => s.id !== subtaskId);
  renderSubtaskList();
}

// Start editing a subtask (with Check+Delete, Divider, blue underline)
function startEditSubtask(subtaskId) {
  const subtask = subtasks.find(s => s.id === subtaskId);
  const row = document.getElementById(`subtask-${subtaskId}`);
  if (!row) return;
  row.innerHTML = '';
  row.className = 'edit-subtask-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = subtask.title;
  input.className = 'edit-subtask-input';

  // Icons & Divider
  const icons = document.createElement('span');
  icons.className = 'edit-subtask-icons';

  // Delete (cancel) button
  const deleteBtn = document.createElement('img');
  deleteBtn.src = 'assets/Property 1=delete.png';
  deleteBtn.className = 'subtask-icon delete-icon';
  deleteBtn.title = 'Cancel';
  deleteBtn.alt = 'Cancel';
  deleteBtn.onclick = function() { renderSubtaskList(); };

  // Divider
  const divider = document.createElement('div');
  divider.className = 'edit-subtask-divider';

  // Check (save) button
  const checkBtn = document.createElement('img');
  checkBtn.src = 'assets/Property 1=check.png';
  checkBtn.className = 'subtask-icon check-icon';
  checkBtn.title = 'Save';
  checkBtn.alt = 'Save';
  checkBtn.onclick = function() { confirmEditSubtask(subtaskId, input.value); };

  icons.appendChild(deleteBtn);
  icons.appendChild(divider);
  icons.appendChild(checkBtn);

  row.appendChild(input);
  row.appendChild(icons);

  input.focus();
  input.onkeydown = function(e) {
    if (e.key === 'Enter') confirmEditSubtask(subtaskId, input.value);
    if (e.key === 'Escape') renderSubtaskList();
  };
}

// Confirm edit of a subtask
function confirmEditSubtask(subtaskId, newTitle) {
  newTitle = newTitle.trim();
  if (!newTitle) return;
  const subtask = subtasks.find(s => s.id === subtaskId);
  if (subtask) subtask.title = newTitle;
  renderSubtaskList();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.add-subtask-button').addEventListener('click', addSubtask);
  document.querySelector('.subtask-input').addEventListener('keydown', function(e) {
    if(e.key === 'Enter') addSubtask();
  });
});