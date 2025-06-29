/**
 * Clears the entire task creation form and resets UI components.
 */
export function clearForm() {
  clearTextFields();
  resetCategorySelection();
  resetPriorityButtons();
  clearAssignedUsers();
  clearSubtaskList();
  resetAssignedDropdown();
  setDefaultPriority();
}

/**
 * Clears the input values for the title, description, and due date fields.
 */
export function clearTextFields() {
  ["title", "desc", "due-date"].forEach(id => {
    let input = document.getElementById(id);
    if (input) input.value = "";
  });
}

/**
 * Resets the task category selection to its default placeholder.
 */
export function resetCategorySelection() {
  let category = document.getElementById("selected-category");
  if (category) {
    category.textContent = "Select task category";
    category.classList.add("category-placeholder");
  }
}

/**
 * Resets all priority buttons to their default (inactive) state and icons.
 */
export function resetPriorityButtons() {
  document.querySelectorAll(".priority-btn").forEach(btn => {
    btn.classList.remove("active-urgent", "active-medium", "active-low");
    let img = btn.querySelector("img");
    if (btn.classList.contains("urgent")) img.src = "svg/urgent.svg";
    if (btn.classList.contains("medium")) img.src = "svg/medium.svg";
    if (btn.classList.contains("low")) img.src = "svg/low.svg";
  });
}

/**
 * Unchecks all assigned user checkboxes and clears the avatar display.
 */
export function clearAssignedUsers() {
  document.querySelectorAll(".assigned-checkbox").forEach(box => {
    box.checked = false;
    box.closest(".assigned-row")?.classList.remove("active");
  });
  document.getElementById("selected-avatars").innerHTML = "";
}

/**
 * Clears the list of subtasks and resets the subtasks display container.
 */
export function clearSubtaskList() {
  window.subtasks = [];
  document.getElementById("subtask-list").innerHTML = "";
}

/**
 * Resets the assigned user dropdown to its initial closed state and clears the search field.
 */
export function resetAssignedDropdown() {
  document.getElementById("assigned-search").value = "";
  document.querySelector(".assigned-dropdown")?.classList.remove("open");
  document.getElementById("assigned-list")?.classList.add("d-none");
}


/**
 * Activates the medium priority button by default and sets its icon to the highlighted version.
 */
export function setDefaultPriority() {
  let mediumBtn = document.querySelector(".priority-btn.medium");
  if (mediumBtn) {
    mediumBtn.classList.add("active-medium");
    let img = mediumBtn.querySelector("img");
    if (img) img.src = "svg/mediumwhite.svg";
  }
}
