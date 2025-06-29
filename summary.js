/**
 * Fetches all tasks from the backend, calculates summary statistics,
 * identifies the next urgent task due date, and updates the dashboard UI.
 *
 * @async
 * @function sumOfTask
 * @returns {Promise<void>}
 * @throws {Error} If fetching or processing tasks fails.
 */
async function sumOfTask() {
    let url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";
    try {
        let tasks = await fetchTasks(url);
        let counts = countTasks(tasks);
        let nextUrgentDate = findNextUrgentDate(tasks);
        updateDashboard(counts, nextUrgentDate);
    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
    }
}

/**
 * Fetches task data from the given URL and returns the parsed JSON response.
 *
 * @async
 * @function fetchTasks
 * @param {string} url - The endpoint from which to fetch the task data.
 * @returns {Object} The parsed JSON object containing tasks.
 * @throws {Error} If the HTTP response is not OK.
 */
async function fetchTasks(url) {
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
    }
    return await response.json();
}

/**
 * Counts tasks by their status and priority and returns a summary object.
 *
 * @function countTasks
 * @param {Object} tasks - An object containing task entries keyed by ID.
 * @returns {Object} An object containing counts for different task categories.
 */
function countTasks(tasks) {
    let counts = { todo: 0, done: 0, urgent: 0, inProgress: 0, awaiting: 0, total: 0 };
    for (let key in tasks) {
        let task = tasks[key];
        counts.total++;
        updateStatusCount(task.Status, counts);
        if (task.priority === "Urgent") counts.urgent++;
    }
    return counts;
}

/**
 * Increments the corresponding count in the counts object based on the given task status.
 *
 * @function updateStatusCount
 * @param {string} status - The status of the task.
 * @param {Object} counts - An object containing count fields to update.
 */
function updateStatusCount(status, counts) {
    switch (status) {
        case "To-Do": counts.todo++; break;
        case "Done": counts.done++; break;
        case "In Progress": counts.inProgress++; break;
        case "Await Feedback": counts.awaiting++; break;
    }
}

/**
 * Finds the nearest upcoming due date among tasks marked as "Urgent".
 *
 * @function findNextUrgentDate
 * @param {Object} tasks - Task list object.
 * @returns {Date|null} The next urgent task due date or null if none.
 */
function findNextUrgentDate(tasks) {
    let nextDate = null, today = new Date();
    for (let key in tasks) {
        let task = tasks[key];
        if (task.priority !== "Urgent" || !task.dueDate) continue;
        let dueDate = new Date(task.dueDate);
        if (dueDate >= today && (!nextDate || dueDate < nextDate)) nextDate = dueDate;
    }
    return nextDate;
}

/**
 * Updates the dashboard UI elements with task statistics and next urgent due date.
 *
 * @function updateDashboard
 * @param {Object} counts - The task summary counts.
 * @param {Date|null} nextDate - Next urgent due date.
 */
function updateDashboard(counts, nextDate) {
    setText("todo", counts.todo);
    setText("done", counts.done);
    setText("urgent", counts.urgent);
    setText("tasks-in-board", counts.total);
    setText("tasks-in-progress", counts.inProgress);
    setText("awaiting-feedback", counts.awaiting);
    let dateText = nextDate ? formatDate(nextDate) : "";
    setText("urgent-date", dateText);
}

/**
 * Formats a date into a readable string.
 *
 * @function formatDate
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Sets the text content of a DOM element by its ID.
 *
 * @function setText
 * @param {string} id - The ID of the DOM element.
 * @param {string|number} value - The text or number to display.
 */
function setText(id, value) {
    let element = document.getElementById(id);
    if (element) element.textContent = value;
}

/**
 * Updates the greeting message in the UI based on the current user stored in localStorage.
 *
 * @function updateGreetingMessage
 */
function updateGreetingMessage() {
    let el = document.getElementById('greeting-message');
    if (!el) return;
    let storedUser = localStorage.getItem('currentUser');
    let name = getUserName(storedUser);
    el.innerHTML = name ? `Good morning, <br><span class="greeting-name">${name}</span>` : "Good morning";
}

/**
 * Extracts and validates the user's name from a stored JSON string.
 *
 * @function getUserName
 * @param {string|null} storedUser - Stored user JSON from localStorage.
 * @returns {string|null} The user's name or null.
 */
function getUserName(storedUser) {
    if (!storedUser) return null;
    let user = JSON.parse(storedUser);
    let name = user.name?.trim().toLowerCase();
    return name && name !== "guest user" ? user.name : null;
}

/**
 * Displays a full-screen greeting overlay for mobile users upon first login.
 *
 * @function showMobileGreeting
 */
function showMobileGreeting() {
    if (window.innerWidth >= 768 || !sessionStorage.getItem('newLogin')) return;
    createGreetingOverlay();
    let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let nameField = document.getElementById('mobile-greeting-name');
    nameField.textContent = user.isGuest ? '' : user.name || '';
    hideGreetingOverlayAfterDelay();
}

/**
 * Creates and injects the greeting overlay into the DOM.
 *
 * @function createGreetingOverlay
 */
function createGreetingOverlay() {
    if (document.getElementById('mobile-greeting-overlay')) return;
    let overlay = document.createElement('div');
    overlay.id = 'mobile-greeting-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(255, 255, 255, 0.95); z-index: 2000;
        display: flex; flex-direction: column; justify-content: center;
        align-items: center; font-family: Arial, sans-serif;`;
    overlay.innerHTML = `
        <div id="mobile-greeting-text" style="font-size: 32px; color: #2c3e50; margin-bottom: 10px;">Good morning</div>
        <div id="mobile-greeting-name" style="font-size: 48px; font-weight: bold; color: #29abe2;"></div>`;
    document.body.appendChild(overlay);
}

/**
 * Hides the greeting overlay after a short delay and removes the session flag.
 *
 * @function hideGreetingOverlayAfterDelay
 */
function hideGreetingOverlayAfterDelay() {
    setTimeout(() => {
        let overlay = document.getElementById('mobile-greeting-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.5s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                sessionStorage.removeItem('newLogin');
            }, 500);
        }
    }, 3000);
}

/**
 * Executes greeting-related logic after the full page load.
 * Triggers functions to update the greeting message and show it on mobile view.
 */
window.addEventListener('load', () => {
    updateGreetingMessage();
    showMobileGreeting();
});
