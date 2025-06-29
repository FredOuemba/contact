import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { updateUserInitials } from './userInitials.js';

/**
 * Displays an error message in the specified element
 * @param {string} elementId - The ID of the error element to show
 * @param {string} message - The error message to display
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Setze roten Rahmen für das entsprechende Input-Feld
        if (elementId === 'login-email-error') {
            document.getElementById('email').style.border = '1px solid #ff0000';
        } else if (elementId === 'login-password-error') {
            document.getElementById('password').style.border = '1px solid #ff0000';
        }
    }
}

/**
 * Hides the error message in the specified element
 * @param {string} elementId - The ID of the error element to hide
 */
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/**
 * Validates email and password inputs
 * @param {string} email - The email to validate
 * @param {string} password - The password to validate
 * @returns {string} - Empty string if valid, error message otherwise
 */
function validateInputs(email, password) {
    if (!email || !password) return 'Please enter your email and password.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'email';
    if (password.length < 6) return 'password';
    return '';
}

/**
 * Sets the login button state (enabled/disabled) and text
 * @param {boolean} loading - Whether the login is in progress
 */
function setLoginButtonState(loading) {
    const loginButton = document.querySelector('.btn-primary');
    if (loginButton) {
        loginButton.disabled = loading;
        loginButton.textContent = loading ? 'Logging in...' : 'Log in';
    }
}

/**
 * Stores user session data in localStorage
 * @param {Object} user - The Firebase user object
 * @param {Object} userData - Additional user data
 */
function storeUserSession(user, userData) {
    const userDataToStore = { uid: user.uid, ...userData };
    localStorage.setItem('currentUser', JSON.stringify(userDataToStore));
}

/**
 * Updates the user document in Firestore with login timestamp
 * @param {Object} user - The Firebase user object
 * @param {Object} userData - The user data to update
 * @returns {Promise<void>}
 */
async function updateUserDoc(user, userData) {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { ...userData, lastLogin: new Date().toISOString() }, { merge: true });
}

/**
 * Creates a new user document in Firestore
 * @param {Object} user - The Firebase user object
 * @returns {Promise<Object>} - The created user data
 */
async function createUserDoc(user) {
    const userData = {
        name: user.displayName || 'User',
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        tasks: [],
        contacts: []
    };
    await setDoc(doc(db, "users", user.uid), userData);
    return userData;
}

/**
 * Handles login errors and displays appropriate messages
 * @param {Error} error - The Firebase authentication error
 */
function handleLoginError(error) {
    if (error.code === 'auth/invalid-credential') {
        showError('login-general-error', 'Invalid email or password. Please check your login details.');
    } else if (error.code === 'auth/user-not-found') {
        showError('login-email-error', 'No account found with this email address. Please register or check your email address.');
    } else if (error.code === 'auth/wrong-password') {
        showError('login-password-error', 'Wrong password. Please try again or reset your password.');
    } else if (error.code === 'auth/too-many-requests') {
        showError('login-general-error', 'Too many failed attempts. Please try again later or reset your password.');
    } else if (error.code === 'auth/network-request-failed') {
        showError('login-general-error', 'Network error. Please check your internet connection and try again.');
    } else {
        showError('login-general-error', 'An error occurred during login. Please try again later.');
    }
}

/**
 * Handles the login form submission
 * @param {Event} event - The form submission event
 * @returns {Promise<void>}
 */
async function handleLogin(event) {
    event.preventDefault();
    resetLoginErrors();

    let email = document.getElementById('email').value.trim().toLowerCase();
    let password = document.getElementById('password').value;

    let validation = validateInputs(email, password);
    if (handleValidationErrors(validation)) return;

    await attemptLogin(email, password);
}

/**
 * Resets all visible login error messages on the form.
 * This includes email, password, and general login errors.
 */
function resetLoginErrors() {
    hideError('login-email-error');
    hideError('login-password-error');
    hideError('login-general-error');
}

/**
 * Handles validation errors by checking the validation result
 * and showing the appropriate error message.
 *
 * @param {string|boolean} validation - The validation result (e.g. 'email', 'password', or a custom error message).
 * @returns {boolean} True if an error was handled and shown; false if no error was found.
 */
function handleValidationErrors(validation) {
    if (validation === 'email') {
        showError('login-email-error', 'Please enter a valid email address.');
        return true;
    }
    if (validation === 'password') {
        showError('login-password-error', 'The password must be at least 6 characters long.');
        return true;
    }
    if (validation) {
        showError('login-general-error', validation);
        return true;
    }
    return false;
}

/**
 * Attempts to sign in the user with the provided email and password using Firebase Authentication.
 * Updates the login button state during the process and handles any errors.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<void>} A promise that resolves when the login attempt is complete.
 */
async function attemptLogin(email, password) {
    setLoginButtonState(true);
    try {
        let userCredential = await signInWithEmailAndPassword(auth, email, password);
        await processUserLogin(userCredential.user);
    } catch (error) {
        handleLoginError(error);
    } finally {
        setLoginButtonState(false);
    }
}

/**
 * Processes a successful user login
 * @param {Object} user - The Firebase user object
 * @returns {Promise<void>}
 */
async function processUserLogin(user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    let userData;
    if (userDoc.exists()) {
        userData = userDoc.data();
        await updateUserDoc(user, userData);
    } else {
        userData = await createUserDoc(user);
    }
    storeUserSession(user, userData);
    updateUserInitials();

    sessionStorage.setItem('newLogin', 'true');
    
    window.location.href = 'summary.html';
}

/**
 * Handles guest login
 */
function handleGuestLogin() {
    localStorage.setItem('currentUser', JSON.stringify({ isGuest: true, name: 'Guest User' }));

    sessionStorage.setItem('newLogin', 'true');
    
    window.location.href = 'summary.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.querySelector('.btn-primary');
    const guestLoginButton = document.querySelector('.btn-secondary');

    document.getElementById('email').addEventListener('input', function() {
        document.getElementById('login-email-error').style.display = 'none';
        this.style.border = '1px solid #D1D1D1';
    });

    document.getElementById('password').addEventListener('input', function() {
        document.getElementById('login-password-error').style.display = 'none';
        this.style.border = '1px solid #D1D1D1';
    });

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (guestLoginButton) guestLoginButton.addEventListener('click', handleGuestLogin);
});

/**
 * Handles user logout
 * @returns {Promise<void>}
 */
async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        document.querySelectorAll('.user-initial-small').forEach(e => e.textContent = 'G');
        window.location.href = 'Index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
} 
