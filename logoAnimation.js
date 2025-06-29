
/**
 * Handles the initialization of the page when the DOM content is fully loaded.
 * 
 * - If the current page is the index (login) page, it applies a loading behavior
 *   using the splash screen before revealing the main content.
 * - Otherwise, the main content is shown immediately without any splash delay.
 * 
 * Elements affected:
 * - `.main-content`: the primary container for visible content
 * - `.splash-screen`: the animated or delayed splash screen
 */
document.addEventListener('DOMContentLoaded', function() {
    const isIndexPage = checkIfIndexPage();
    const mainContent = document.querySelector('.main-content');
    const splashScreen = document.querySelector('.splash-screen');
    
    if (isIndexPage) {
        handleIndexPageLoading(mainContent, splashScreen);
    } else {
        showContentImmediately(mainContent, splashScreen);
    }
});

/**
 * checks if current page is index.html
 * @returns 
 */
function checkIfIndexPage() {
    return window.location.pathname.includes('Index.html') || 
           window.location.pathname === '/' || 
           window.location.pathname.endsWith('/');
}

/**
 * Checks whether the current page was navigated to from within the same website.
 *
 * @returns {boolean} True if the referrer is from the same origin (internal navigation), false otherwise.
 */

function isInternalNavigation() {
    const referrer = document.referrer;
    const currentDomain = window.location.origin;
    return referrer.startsWith(currentDomain) && referrer !== '';
}

/**
 * Handles the loading behavior of the index page depending on navigation type.
 * If the user navigated from within the site, content is shown immediately.
 * Otherwise, a splash screen animation is shown.
 *
 * @param {string} mainContent - The main content container element.
 * @param {string} splashScreen - The splash screen element.
 */
function handleIndexPageLoading(mainContent, splashScreen) {
    if (isInternalNavigation()) {
        showContentImmediately(mainContent, splashScreen);
    } else {
        showSplashAnimation(mainContent, splashScreen);
    }
}

/**
 * Displays a splash screen animation before revealing the main content.
 * The splash screen fades out after 1 second, and is hidden after an additional 0.5 seconds.
 *
 * @param {HTMLElement} mainContent - The main content container to reveal.
 * @param {HTMLElement} splashScreen - The splash screen element to hide.
 */

function showSplashAnimation(mainContent, splashScreen) {
    setTimeout(() => {
        if (splashScreen) splashScreen.style.opacity = '0';
        
        setTimeout(() => {
            if (splashScreen) splashScreen.style.display = 'none';
            if (mainContent) mainContent.classList.add('visible');
        }, 500);
    }, 1000);
}

/**
 * Immediately hides the splash screen and displays the main content.
 * Used when the splash animation is not needed (e.g., during internal navigation).
 *
 * @param {HTMLElement} mainContent - The main content element to make visible.
 * @param {HTMLElement} splashScreen - The splash screen element to hide.
 */
function showContentImmediately(mainContent, splashScreen) {
    if (splashScreen) splashScreen.style.display = 'none';
    if (mainContent) mainContent.classList.add('visible');
}