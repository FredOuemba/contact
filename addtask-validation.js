document.addEventListener('DOMContentLoaded', function () {
  // Title Validation
  const titleInput = document.getElementById('title');
  const titleError = document.getElementById('title-error');
  function showTitleError() {
    titleInput.classList.add('input-error');
    titleError.textContent = 'This field is required';
  }
  function clearTitleError() {
    titleInput.classList.remove('input-error');
    titleError.textContent = '';
  }
  titleInput.addEventListener('focus', function () {
    if (!titleInput.value.trim()) showTitleError();
  });
  titleInput.addEventListener('input', function () {
    if (titleInput.value.trim()) clearTitleError();
  });
  titleInput.addEventListener('blur', function () {
    if (!titleInput.value.trim()) showTitleError();
    else clearTitleError();
  });

  // Due Date Validation (manual input, no calendar opens)
  const dueDateInput = document.getElementById('due-date-custom');
  const dueDateRow = dueDateInput.closest('.custom-date-row');
  const calendarBtn = document.getElementById('calendarBtn');
  const dueDateError = document.getElementById('due-date-error');
  function showDueDateError() {
    dueDateRow.classList.add('input-error');
    dueDateError.textContent = 'This field is required';
  }
  function clearDueDateError() {
    dueDateRow.classList.remove('input-error');
    dueDateError.textContent = '';
  }
  dueDateInput.addEventListener('focus', function () {
    if (!dueDateInput.value.trim()) showDueDateError();
  });
  dueDateInput.addEventListener('input', function () {
    if (dueDateInput.value.trim()) clearDueDateError();
  });
  dueDateInput.addEventListener('blur', function () {
    if (!dueDateInput.value.trim()) showDueDateError();
    else clearDueDateError();
  });

  // Prevent opening any calendar on input or icon
  calendarBtn.addEventListener('mousedown', function(e) {
    e.preventDefault();
    dueDateInput.focus();
  });
});