/**
 * Extracts initials from a user's full name
 * @param {string} fullName - The user's full name
 * @returns {string} - The user's initials (first letter of first and last name)
 */
export function getInitialsFromName(fullName) {
    if (!fullName || !fullName.includes(' ')) {
        return 'G'; 
    }
    
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName.charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Updates user initials in the UI based on localStorage data
 */
export function updateUserInitials() {
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        if (!userData.name) {
            return;
        }
        
        const initials = getInitialsFromName(userData.name);
        const initialElements = document.querySelectorAll('.user-initial-small');
        
        initialElements.forEach(element => {
            element.textContent = initials;
            element.style.color = '#29ABE2';
            element.style.display = 'flex';
            element.style.justifyContent = 'center';
            element.style.alignItems = 'center';
        });
    }
}

/**
 * Initializes user initials once the DOM content is loaded.
 * Delays execution slightly to ensure all elements are rendered.
 */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateUserInitials();
    }, 100);
});

/**
 * Ensures user initials are updated after the entire page is fully loaded,
 * including all dependent resources like images and styles.
 */
window.addEventListener('load', () => {
    updateUserInitials();
});

/**
 * Exposes a function to manually trigger user initials initialization.
 * Can be called programmatically if needed after dynamic content updates.
 */
export function initializeUserInitials() {
    updateUserInitials();
}
