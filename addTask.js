function clearForm() {
    // Titel, Beschreibung und Datum leeren
    document.getElementById('title').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('due-date-custom').value = '';

    // Priority auf Medium zurücksetzen
    document.getElementById('priority-urgent').classList.remove('active-urgent');
    document.getElementById('priority-low').classList.remove('active-low');
    document.getElementById('priority-medium').classList.add('active-medium');

    // Category-Auswahl zurücksetzen
    document.getElementById('category-selected-label').innerText = 'Select task category';
    document.getElementById('category-select').classList.remove('has-value');

    // Assigned-To-Feld leeren
    document.getElementById('assigned-search').value = '';
    document.getElementById('selected-avatars').innerHTML = '';

    // Subtasks leeren
    const subtaskList = document.getElementById('subtask-list');
    if (subtaskList) subtaskList.innerHTML = '';

    // Fehlermeldungen entfernen (optional)
    const titleError = document.getElementById('title-error');
    if (titleError) titleError.innerText = '';
    const dueDateError = document.getElementById('due-date-error');
    if (dueDateError) dueDateError.innerText = '';
}

// Damit der Button im HTML funktioniert:
window.clearForm = clearForm;