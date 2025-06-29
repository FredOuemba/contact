/**
 * Initializes the navigation when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initHelpNavigation();
});

/**
 * Initializes the help icon navigation
 */
function initHelpNavigation() {
    const helpIcon = document.getElementById('helpIcon');
    if (helpIcon) {
        helpIcon.addEventListener('click', navigateToHelp);
    }
}

/**
 * Navigates to the help page
 */
function navigateToHelp() {
    window.location.href = 'help.html';
}

/**
 * Toggles the dropdown menu visibility
 */
function toggleMenu() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
    }
}
